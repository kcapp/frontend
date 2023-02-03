<template>
  <div class="player-name-container">
    {{ player.name }}
  </div>
</template>

<script>
export default {
  props: ["player"],
};
</script>

<style lang="less">
.player-name-container {
  cursor: pointer;
  padding: 3px 10px;
  background: #4e4e4e;
  border-radius: 5px;
  color: white;
  width: 150px;
  height: 23px;
  line-height: 23px;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
}
</style>
