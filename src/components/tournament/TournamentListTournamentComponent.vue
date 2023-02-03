<template>
  <tr class="tr-row">
    <td class="player-name">
      <router-link
        :to="{ name: 'playerProfile', params: { id: this.tournament.id } }"
      >
        <slot name="tournamentName" />
      </router-link>
    </td>
    <td class="col-data txtl">
      <slot name="tournamentShortName" />
    </td>
    <td class="col-data">
      <slot name="officeName" />
    </td>
    <td class="col-data">
      <slot name="tournamentStartTime" />
    </td>
    <td class="col-data">
      <slot name="tournamentEndTime" />
    </td>
    <td class="col-data txtc">view</td>
  </tr>
</template>

<script>
export default {
  props: ["tournament"],
};
</script>

<style>
.tr-row {
  border-top: 1px solid #343434;
  height: 2em;
  line-height: 2em;
}

.player-name {
  color: #9e9e9e;
  font-weight: 600;
}

.col-data {
  color: #868483;
}
</style>
