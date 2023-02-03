<template>
  <div class="round-container">
    <div class="round-container-header padb10">Players list</div>
    <div class="mt20" v-if="this.players && this.offices">
      <div class="round-container-dark-small flex marb10">
        <div
          v-bind:class="
            parseInt(this.selectedOffice) === 0
              ? 'round-container-dgreen'
              : 'round-container-dark-empty'
          "
          class="marr10 cursor-click"
        >
          <span class="officeLabel" @click="this.setOffice(0)"> All </span>
        </div>
        <template v-for="(office, index) in this.offices" v-bind:key="index">
          <div
            v-bind:class="
              parseInt(office.id) === parseInt(this.selectedOffice)
                ? 'round-container-dgreen'
                : 'round-container-dark-empty'
            "
            class="marr10 cursor-click"
            @click="this.setOffice(office.id)"
          >
            {{ office.name }}
          </div>
        </template>
      </div>
    </div>
    <div>
      <div v-if="players.length > 0">
        <table>
          <tr class="table-th">
            <td>&nbsp;</td>
            <td>&nbsp;</td>
            <td colspan="3" class="txtc">
              <div class="common-header">matches</div>
            </td>
            <td colspan="3" class="txtc">
              <div class="common-header">legs</div>
            </td>
            <td colspan="2">&nbsp;</td>
          </tr>
          <tr class="table-th">
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
          <template v-for="(player, index) in this.players" v-bind:key="index">
            <PlayerListPlayerComponent
              v-if="showOfficePlayer(player)"
              :player="player"
            >
              <template #playerName>
                {{ player.name }}
              </template>
              <template #officeName>
                {{ offices[player.office_id].name }}
              </template>
              <template #playerMatchesPlayed
                >{{ player.matches_played }}
              </template>
              <template #playerMatchesWon>{{ player.matches_won }}</template>
              <template #playerMatchesWinPercentage>
                {{
                  player.matches_played === 0
                    ? "0.00"
                    : (
                        (player.matches_won * 100) /
                        player.matches_played
                      ).toFixed(2)
                }}%
              </template>
              <template #playerLegsPlayed>{{ player.legs_played }}</template>
              <template #playerLegsWon>{{ player.legs_won }}</template>
              <template #playerLegsWinPercentage>
                {{
                  player.legs_played == 0
                    ? "0.00"
                    : ((player.legs_won * 100) / player.legs_played).toFixed(2)
                }}%
              </template>
            </PlayerListPlayerComponent>
          </template>
        </table>
      </div>
      <div v-else class="loader">
        <i class="fas fa-sync fa-spin"></i>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import _ from "underscore";
import debug from "debug";
import PlayerListPlayerComponent from "@/components/player/PlayerListPlayerComponent.vue";

export default {
  components: { PlayerListPlayerComponent },
  data() {
    return {
      players: [],
      offices: [],
      sortDirection: -1,
      selectedOffice: 0,
    };
  },
  mounted() {
    this.loadPlayers();
  },
  methods: {
    sortBy(atr) {
      if (this.sortDirection === 1) {
        this.players = _.sortBy(this.players, (player) => player[atr]);
        this.sortDirection = -1;
      } else {
        this.players = _.sortBy(
          this.players,
          (player) => player[atr]
        ).reverse();
        this.sortDirection = 1;
      }
    },
    setOffice(id) {
      this.selectedOffice = id;
    },
    showOfficePlayer(player) {
      return this.selectedOffice === 0
        ? true
        : player.office_id === this.selectedOffice;
    },
    loadPlayers() {
      axios
        .all([axios.get(`/api/players/active`), axios.get(`/api/offices`)])
        .then(
          axios.spread((playersResponse, officesResponse) => {
            this.players = playersResponse.data;
            this.players = _.sortBy(this.players, (player) => player.name);
            this.offices = officesResponse.data;
          })
        )
        .catch((error) => {
          debug(`Error when getting players: ${error}`);
        });
    },
  },
};
</script>

<style scoped lang="less">
.table-th {
  font-weight: 900;
  color: white;
  height: 2em;
  line-height: 2em;
}

.common-header {
  border-bottom: 1px solid #343434;
  margin: 0 auto;
}
</style>
