<template>
  <div :class="containerClass">
    <div :class="{modal: true, in: showModal}" :style="{ display: showModal ? 'block' : 'none' }">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button class="close" @click="close">x</button>
            <h1>Input Current Estimated Value</h1>
          </div>
          <div class="modal-body">
            <input type="text" v-model="estimatedPayout"/>
            <input type="checkbox" v-model="subtractPrevious"/>
          </div>
          <div class="modal-footer">
            <button class="close" @click="submit">Submit</button>
          </div>
        </div>
      </div>
    </div>
    <div :class="{'modal-backdrop': showModal, in: showModal}"></div>
  </div>
</template>

<script>
export default {
  props: {
    showModal: Boolean,
    containerClass: String,
    value: [String, Number, Object]
  },
  data(){
    return {
      estimatedPayout: 0,
      subtractPrevious: true
    }
  },
  watch:{
    'value': function(newVal, oldVal){
      this.estimatedPayout = newVal.estimatedPayout;
    }
  },
  methods: {
    submit: function(){
      this.$emit('submit', {
        estimatedPayout: this.estimatedPayout,
        subtractPrevious: this.subtractPrevious
      });
    },
    close: function(){
      this.$emit('close');
    }
  }
}
</script>

<style scoped>
</style>
