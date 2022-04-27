<template>
  <RoundContainer>
    <table v-if="this.players.length > 0">
      <tr>
        <td
          colspan="10"
          class="txtr"
          style="padding-bottom: 20px; border-bottom: 1px solid #b4b8b9"
        >
          <button class="officeLabel" @click="this.setOffice(0)">All</button>
          <span v-for="(office, index) in this.offices" v-bind:key="index">
            <button class="officeLabel" @click="this.setOffice(office.id)">
              {{ office.name }}
            </button>
          </span>
        </td>
      </tr>
      <tr style="font-weight: 900">
        <td>&nbsp;</td>
        <td>&nbsp;</td>
        <td colspan="3" class="txtc commonHeader">matches</td>
        <td colspan="3" class="txtc commonHeader">legs</td>
        <td colspan="2">&nbsp;</td>
      </tr>
      <tr style="font-weight: 900">
        <td>name</td>
        <td>office</td>
        <td class="txtr" @click="this.sortBy(`matches_played`)">played</td>
        <td class="txtr" @click="this.sortBy(`matches_won`)">won</td>
        <td class="txtr">win %</td>
        <td class="txtr" @click="this.sortBy(`legs_played`)">played</td>
        <td class="txtr" @click="this.sortBy(`legs_won`)">won</td>
        <td class="txtr">win %</td>
        <td class="txtc">statistics</td>
        <td class="txtc">options</td>
      </tr>
      <template v-for="player in this.players" v-bind:key="player.id">
        <tr v-if="showOfficePlayer(player)">
          <td>{{ player.name }}</td>
          <td>
            {{ offices[player.office_id].name }}
          </td>
          <td class="txtr">
            {{ player.matches_played }}
          </td>
          <td class="txtr">
            {{ player.matches_won }}
          </td>
          <td class="txtr">
            {{
              player.matches_played == 0
                ? "0.00"
                : ((player.matches_won * 100) / player.matches_played).toFixed(
                    2
                  )
            }}%
          </td>
          <td class="txtr">
            {{ player.legs_played }}
          </td>
          <td class="txtr">
            {{ player.legs_won }}
          </td>
          <td class="txtr">
            {{
              player.legs_played == 0
                ? "0.00"
                : ((player.legs_won * 100) / player.legs_played).toFixed(2)
            }}%
          </td>
          <td class="txtc">
            <router-link to="/">view</router-link>
          </td>
          <td class="txtc">
            <router-link to="/">edit</router-link>
          </td>
        </tr>
      </template>
    </table>
    <div v-else class="loader">
      <i class="fas fa-sync fa-spin"></i>
    </div>
  </RoundContainer>
</template>

<script>
import RoundContainer from "@/components/RoundContainer.vue";

export default {
  components: { RoundContainer },
  props: ["players", "offices"],
  data() {
    return {
      selectedOffice: 0,
    };
  },
  methods: {
    sortBy(atr) {
      this.$emit("sortBy", atr);
    },
    setOffice(id) {
      this.selectedOffice = id;
    },
    showOfficePlayer(player) {
      return this.selectedOffice === 0
        ? true
        : player.office_id === this.selectedOffice;
    },
  },
};
</script>

<style>
.commonHeader {
  padding-top: 10px;
  border-bottom: 1px solid #dddddd;
}

.officeLabel {
  border-radius: 5px;
  border: 1px solid #dddddd;
  padding: 5px 10px;
  margin-left: 10px;
  background-color: aliceblue;
}
</style>
