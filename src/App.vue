<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <div class="content-wrapper">
    <nav>
      <RouterLink to="/"> kcapp</RouterLink>
      <RouterLink to="/players">players</RouterLink>
      <RouterLink to="/players">matches</RouterLink>
      <RouterLink to="/tournaments">tournaments</RouterLink>
      <RouterLink to="/players">statistics</RouterLink>
      <RouterLink to="/players">elo</RouterLink>
      <RouterLink to="/players">practice</RouterLink>
    </nav>
  </div>

  <div class="content-wrapper">
    <RouterView />
  </div>
</template>

<style>
@import "assets/base.css";
@import "assets/spaces.css";
</style>
