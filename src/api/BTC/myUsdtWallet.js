const bitcoin = require('bitcoinjs-lib'); // version @3.3.2, ver4 won't work
const request = require('request-promise-native');

const network = process.env.BTC_NET ||"testnet";
const net = network === 'testnet'
  ? bitcoin.networks.testnet
  : bitcoin.networks.bitcoin;

const USDTOMNI = '6f6d6e69';
const USDTVERSION = '0000';
const USDTITYPE = '0000';
const USDTIDENTIFY = network === 'testnet'
  ? '00000002'
  : '0000001f';

const API = net === bitcoin.networks.testnet
  ? `https://test-insight.swap.online/insight-api`
  : `https://insight.bitpay.com/api`;

const fetchUnspents = (address) =>
  request(`${API}/addr/${address}/utxo/`).then(JSON.parse);

const broadcastTx = (txRaw,success) =>
  request.post(`${API}/tx/send`, {
    json: true,
    body: {
      rawtx: txRaw,
    },
  }).then(function (res) {
    //TODO:
    console.log('success: ',res); // 提供txid
    if (success) success(res);

  });

const createSimpleSend = async (fetchUnspents, alice_pair, recipient_address, transactionValue, transactionFee) => {

  const tx = new bitcoin.TransactionBuilder(net);
  const p2pkh = bitcoin.payments.p2pkh({pubkey: alice_pair.publicKey, network:net});
  const alice_p2pkh = p2pkh.address;
  const unspents = await fetchUnspents(alice_p2pkh);

  const fundValue     = 546; // dust
  const feeValue      = transactionFee || 5000;
  const totalUnspent  = unspents.reduce((summ, { satoshis }) => summ + satoshis, 0);
  const skipValue     = totalUnspent - fundValue - feeValue;

  console.log('totalUnspent:___',totalUnspent); // 33229088
  console.log('fundValue:___',fundValue);
  console.log('feeValue :___',feeValue );

  if (new Decimal(totalUnspent).toNumber() < new Decimal(feeValue).add(new Decimal(fundValue)).toNumber()) {
    throw new Error(`Total less than fee: ${totalUnspent} < ${feeValue} + ${fundValue}`)
  }

  unspents.forEach(({ txid, vout }) => tx.addInput(txid, vout, 0xfffffffe));

  let _value = new Decimal(transactionValue).mul(new Decimal(100000000)).toNumber().toString(16);
  while (_value.length < 16) { _value = '0' + _value; };

    /*
       * op_return的id 6a
       * 标识：0x6f6d6e69(omni) 固定值
       *
       * omniversion: 0x0000 (0)  交易版本
       * txtype: 0x0000(0)  交易类型
       * id: 0x00000001(1) 现网环境中只处理31的交易，31代表usdt. 测试环境一般是2  代表测试币  货币标识符
       * amount: 0x0000000000989680(10000000 = 0.1USDT)
       *
       * 6f6d6e69 0000 0000 00000002 0000000000989680
       *
       * */


  const simple_send = [
    USDTOMNI, // omni 标识
    USDTVERSION,     // version 交易版本
    USDTITYPE,  // type 交易类型
    USDTIDENTIFY, // 31 for Tether
    _value // amount = 10 * 100 000 000 in HEX
  ].join('');

  console.log('simple_send_obj==========',simple_send);


  const data = Buffer.from(simple_send, "hex");

  console.log('bitcoin.opcodes.OP_RETURN______:',bitcoin.opcodes.OP_RETURN);
  const omniOutput = bitcoin.script.compile([
    bitcoin.opcodes.OP_RETURN,  // 106
    data
  ]);

  tx.addOutput(recipient_address, fundValue); // should be first!
  tx.addOutput(omniOutput, 0);
  tx.addOutput(alice_p2pkh, skipValue);

  console.log('tx:------',tx);

  tx.__inputs.forEach((input, index) => {
    tx.sign(index, alice_pair)
  });

  return tx
};

// Construct tx

const usdtTransactionSend = function (privateKey,transactionObjBtc,callback) {
  console.log('siyao_',privateKey);
  console.log('net___',net);
  const _alice = bitcoin.ECPair.fromWIF(privateKey, net);
  // const bobby = bitcoin.ECPair.makeRandom({ network: net });  //

  let transtionAddress = transactionObjBtc.to;
  let transtionValue = transactionObjBtc.value;
  let transtionGasFee = transactionObjBtc.gasFee;
  console.log('_alice: ',_alice);
  console.log('_toAddress: ',transtionAddress);

  const omni_tx = createSimpleSend(fetchUnspents, _alice, transtionAddress, transtionValue, transtionGasFee);

  const auto_send = false;

  omni_tx.then(tx => {
    const txRaw = tx.buildIncomplete();
    console.log('omni_tx_hash_______', txRaw.getId());
    console.log('txRaw.toHex________',`"${txRaw.toHex()}"`);
    console.log('txRaw:_______',txRaw);

    if (true) {
      broadcastTx(txRaw.toHex(),function (res) {
        if (callback) callback(res);
      })
    }
  });

};

export default usdtTransactionSend
