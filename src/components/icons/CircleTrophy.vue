<template>
  <span :style="this.style" class="fa-stack fa-2x">
    <i class="fa-solid fa-circle fa-stack-2x"></i>
    <i
      class="fab fa-solid fa-trophy fa-stack-1x fa-inverse"
      style="font-size: 25px"
    ></i>
  </span>
</template>

<script>
export default {
  props: ["style"],
};
</script>
