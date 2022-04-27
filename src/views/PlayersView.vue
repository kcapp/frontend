<template>
  <div>
    <table style="margin-top: -20px">
      <tr>
        <td class="txtl font30">
          <CirclePlayers
            style="
              color: rgb(38, 124, 255);
              font-size: 41px;
              text-shadow: rgb(0 0 0 / 69%) 1px 2px 5px;
              position: relative;
              top: 35px;
            "
          />
          <span style="position: relative; left: 10px; top: 35px">Players</span>
        </td>
        <td class="txtr" style="vertical-align: bottom">
          <router-link to="/">
            <i class="fa-solid fa-circle-plus"></i> add player
          </router-link>
          <router-link to="/">
            <i class="pl20 fa-solid fa-code-compare"></i> compare players
          </router-link>
        </td>
      </tr>
    </table>
  </div>
  <div class="mt20" v-if="this.players && this.offices">
    <PlayersComponent
      :players="this.players"
      :offices="this.offices"
      @sortBy="sortBy"
    />
  </div>
</template>
<script>
import axios from "axios";
import _ from "underscore";
import debug from "debug";
import PlayersComponent from "@/components/PlayersComponent.vue";
import CirclePlayers from "@/components/icons/CirclePlayers.vue";

export default {
  components: { CirclePlayers, PlayersComponent },
  data() {
    return {
      players: [],
      offices: [],
      sortDirection: -1,
    };
  },
  mounted() {
    this.loadPlayers();
  },
  methods: {
    sortBy(atr) {
      console.log(atr);
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
    loadPlayers() {
      axios
        .all([axios.get(`/api/player/active`), axios.get(`/api/office`)])
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
