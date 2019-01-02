<template>
    <div class="modal" :id="id" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <!--modal fade 淡入淡出-->
        <div class="modal-dialog" role="document">
            <div class="modal-content m_divc">
                <div class="modal-header div_t">
                    <h5 class="modal-title">
                        <slot name="title"></slot>
                    </h5>
                </div>
                <div class="modal-body">
                    <slot name="content"></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  export default {
    props: {
      'id': {
        type: String,
      },
    },
    methods: {
      bb() {
        if (!this.a) {
          $('#aboutModal').css('opacity', '0');
        }
      },

    },
    watch: {
      a() {
        if (this.a) {
          $('#aboutModal').css('opacity', '1');
          this.a == false;
        } else {
          $('#aboutModal').css('opacity', '0');
        }
      },
    },
    computed: {
      a() {
        return this.$store.state.a;
      },
    },
    mounted() {
      this.bb();
    },
  };
</script>

<style scoped>
    .m_divc {
        background: rgba(255, 255, 255, 1);
        border-radius: 0.14rem;
    }

    .div_t {
        border: none;
    }

    .modal.in .modal-dialog {
        position: absolute;
        bottom: 1rem;
    }

</style>
