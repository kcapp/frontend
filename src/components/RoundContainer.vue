<template>
  <div class="roundContainer">
    <slot />
  </div>
</template>

<style>
.roundContainer {
  /*background-color: #2c3e50;*/
  background-image: linear-gradient(#fff, #f5f5f5);
  box-shadow: 0px 0px 6px #bababa;
  border-radius: 10px;
  padding: 20px;
}
</style>
