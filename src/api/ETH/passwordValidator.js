var PasswordValidator = function(){}

const patrnStu = /^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&*]+$)(?![a-zA-z\d]+$)(?![a-zA-z!@#$%^&*]+$)(?![\d!@#$%^&*]+$)[a-zA-Z\d!@#$%^&*]+$/;
const patrnGeneral = /^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&*]+$)[a-zA-Z\d!@#$%^&*]+$/;
const patrnWeak = /^(?:\d+|[a-zA-Z]+|[!@#$%^&*]+)$/;

const pwd_length = 8;

PasswordValidator.validatePassword = function(password) {
	if(password === undefined || password == null || password.length < pwd_length){
		return {
			err: 'Please enter the password length DaYu eight',
			result: null
		}
	}

	var result = {err:null}

	if (patrnStu.exec(password)) {
		result.result = '强'
	} else if (patrnGeneral.exec(password)) {
		result.result = '中'
	} else {
		result.result = '弱'
	}

	return result;
}

export default {PasswordValidator};