<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <div class="wrapper">
    <nav>
      <RouterLink to="/">kcapp</RouterLink>
      <RouterLink to="/players">players</RouterLink>
      <RouterLink to="/about">practice</RouterLink>
      <RouterLink to="/about">statistics</RouterLink>
      <RouterLink to="/tournaments">tournaments</RouterLink>
      <RouterLink to="/about">elo</RouterLink>
      <RouterLink to="/about">matches</RouterLink>
    </nav>
  </div>

  <div class="contentWrapper">
    <RouterView />
  </div>
</template>

<style>
@import "assets/base.css";

.contentWrapper {
  max-width: 1200px;
  margin: 20px auto;
}

nav {
  padding: 20px 0px;
  max-width: 1200px;
  margin: 0 auto;
  border-bottom: 1px solid #b4b4b4;
}

nav > a {
  display: inline-block;
  margin-right: 10px;
  font-weight: 600;
}
</style>
