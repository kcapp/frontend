<template>
  <tr class="tr-row">
    <td class="player-name">
      <router-link
        :to="{ name: 'playerProfile', params: { id: this.player.id } }"
      >
        <slot name="playerName" />
      </router-link>
    </td>
    <td class="player-data">
      <slot name="officeName" />
    </td>
    <td class="player-data txtr">
      <slot name="playerMatchesPlayed" />
    </td>
    <td class="player-data txtr">
      <slot name="playerMatchesWon" />
    </td>
    <td class="player-data txtr">
      <slot name="playerMatchesWinPercentage" />
    </td>
    <td class="player-data txtr">
      <slot name="playerLegsPlayed" />
    </td>
    <td class="player-data txtr">
      <slot name="playerLegsWon" />
    </td>
    <td class="player-data txtr">
      <slot name="playerLegsWinPercentage" />
    </td>
    <td class="txtc">
      <router-link to="/">view</router-link>
    </td>
    <td class="txtc">
      <router-link to="/">edit</router-link>
    </td>
  </tr>
</template>

<script>
export default {
  props: ["player"],
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

.player-data {
  color: #868483;
}
</style>
