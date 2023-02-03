<template>
  <select class="selectInput" v-model="selectModel" :disabled="isDisabled">
    <option v-if="withPlaceholder" disabled selected value="">
      Please select one
    </option>
    <option v-if="withZeroOption" selected value="0">-</option>
    <template v-for="option in this.options">
      <option :value="option.id" v-bind:key="option.id" v-if="option">
        {{ option.name }}
      </option>
    </template>
  </select>
</template>

<script>
export default {
  props: [
    "options",
    "withPlaceholder",
    "withZeroOption",
    "selectModel",
    "isDisabled",
  ],
  data() {
    return {};
  },
};
</script>

<style lang="less">
.selectInput {
  display: table;
  font-family: inherit;
  width: 100%;
  border: 1px solid var(--col-description);
  border-radius: 10px;
  padding: 10px 8px;
  color: var(--color-white);
  font-size: 15px;
  background: #0f1017;
  border-image: none;
}

.selectInput:focus {
  border: 1px solid rgba(200, 200, 200, 1);
  outline: rgba(200, 200, 200, 1);
}

select:disabled {
  background: #2e2e2e;
}
</style>
