<template>
  <div class="round-container">
    <div class="mt20" v-if="this.players && this.offices">
      <div class="round-container-dark-small flex">
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
      <table class="tbl-fixed">
        <tr>
          <td class="padr20">
            <div class="round-container-header padb10 padt10">
              Selected players
            </div>
            <div
              v-if="this.selectedPlayers.length > 0"
              class="round-container-dark-small flex col-data"
            >
              <div class="flex-wrap">
                <template
                  v-for="(player, index) in this.selectedPlayers"
                  v-bind:key="index"
                >
                  <PlayerLabel
                    :player="player"
                    v-on:click="selectPlayer(player.id)"
                  >
                    <template #playerName>
                      {{ player.name }}
                    </template>
                  </PlayerLabel>
                </template>
              </div>
            </div>
            <div v-else class="round-container-dark-small flex col-data">
              Pick players
            </div>
            <div class="round-container-header padt20">Game Settings</div>
            <div class="mart10">
              <form @submit.prevent="handleNewGame">
                <div class="round-container-form col-data">
                  <div class="padb10 col-data txt-bold">Type</div>
                  <NewGameSelectInput
                    :options="matchTypes"
                    :with-placeholder="false"
                    :select-model="this.selectedMatchType"
                    ref="matchTypes"
                    @input="this.onChangeMatchType($event)"
                  />
                  <div class="padb10 padt10 col-data txt-bold">
                    Starting score
                  </div>
                  <NewGameSelectInput
                    :options="startingScores"
                    :select-model="this.selectedStartingScore"
                    :with-placeholder="false"
                    :with-zero-option="false"
                    :is-disabled="this.startingScoresDisabled"
                    ref="startingScores"
                  />
                  <div v-show="parseInt(selectedMatchType) === mt.TIC_TAC_TOE">
                    <div class="padb10 padt10 col-data txt-bold">
                      Outshot type
                    </div>
                    <NewGameSelectInput
                      :options="mt.outshotTypes"
                      :select-model="this.selectedOutshotType"
                      :with-placeholder="false"
                      :with-zero-option="false"
                    />
                  </div>
                  <div v-show="parseInt(selectedMatchType) === mt.KNOCKOUT">
                    <div class="padb10 padt10 col-data txt-bold">
                      Starting lives
                    </div>
                    <NewGameSelectInput
                      :options="mt.knockoutLives"
                      :select-model="this.selectedKnockoutLives"
                      :with-placeholder="false"
                      :with-zero-option="false"
                    />
                  </div>
                  <div class="padb10 padt10 col-data txt-bold">Mode</div>
                  <NewGameSelectInput
                    :options="matchModes"
                    :select-model="this.selectedMode"
                    :with-placeholder="false"
                    :with-zero-option="false"
                  />
                  <div class="padb10 padt10 col-data txt-bold">Stake</div>
                  <NewGameSelectInput
                    :options="oweTypes"
                    :select-model="this.selectedStake"
                    :with-placeholder="false"
                    :with-zero-option="true"
                    ref="stake"
                  />
                  <div class="padb10 padt10 col-data txt-bold">Venue</div>
                  <NewGameSelectInput
                    :options="venues"
                    :select-model="this.selectedVenue"
                    :with-placeholder="false"
                    :with-zero-option="true"
                    ref="venues"
                  />
                </div>
                <div>
                  <button type="submit">Start</button>
                </div>
              </form>
            </div>
          </td>
          <td class="padl20">
            <div class="round-container-header padb10 padt10">Players list</div>
            <div class="flex-wrap">
              <template v-for="(player, idx) in this.players" v-bind:key="idx">
                <PlayerLabel
                  v-if="showOfficePlayer(player)"
                  :player="player"
                  v-on:click="selectPlayer(player.id)"
                >
                  <template #playerName>
                    {{ player.name }}
                  </template>
                </PlayerLabel>
              </template>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import _ from "underscore";
import axios from "axios";
import debug from "debug";
import PlayerLabel from "@/components/player/PlayerLabel.vue";
import NewGameSelectInput from "@/components/forms/NewGameSelectInput.vue";
import { MatchTypes } from "@/models/match/types/MatchTypes";

export default {
  computed: {
    MatchTypes() {
      return MatchTypes;
    },
  },
  components: {
    NewGameSelectInput,
    PlayerLabel,
  },
  data() {
    return {
      candidatePlayerId: [],
      selectedPlayers: [],
      players: [],
      offices: [],
      matchTypes: [],
      matchModes: [],
      oweTypes: [],
      venues: [],
      selectedMode: 1,
      selectedStake: 0,
      selectedVenue: 0,
      selectedMatchType: 1,
      selectedStartingScore: 0,
      selectedOutshotType: 1,
      selectedKnockoutLives: 5,
      startingScores: [],
      startingScoresDisabled: true,
      selectedOffice: 0,
      mt: new MatchTypes(),
    };
  },
  created() {
    window.addEventListener("keypress", this.keyPressHandler);
    window.addEventListener("keydown", this.keyDownHandler);
  },
  mounted() {
    this.loadData();
  },
  methods: {
    handleNewGame() {
      console.log("starting new game");
      const body = {
        starting_score: this.state.options.starting_score,
        match_type: this.state.options.game_type,
        match_mode: this.state.options.game_mode,
        match_stake: this.state.options.stake,
        outshot_type: this.state.options.outshot_type,
        starting_lives: this.state.options.starting_lives,
        venue: venueId,
        players: this.state.selected.map((player) => player.id),
        office_id: officeId,
        player_handicaps: handicaps,
      };
    },
    onChangeMatchType(event) {
      // In case of manual selection
      if (event !== undefined) {
        this.selectedMatchType = event.target.value;
      }
      this.startingScores = [];
      this.startingScoresDisabled = true;
      switch (parseInt(this.selectedMatchType)) {
        case this.mt.X01:
        case this.mt.X01HANDICAP:
          this.startingScoresDisabled = false;
          this.startingScores = this.mt.startingScoresX01;
          break;
        case this.mt.TIC_TAC_TOE:
          this.startingScoresDisabled = false;
          this.startingScores = this.mt.startingScoresTicTacToe;
          break;
        case this.mt.DARTS_AT_X:
          this.startingScoresDisabled = false;
          this.startingScores = this.mt.startingScoresDartsAtX;
          break;
        case this.mt.FOUR_TWENTY:
          this.startingScoresDisabled = false;
          this.startingScores = this.mt.startingScoresFourTwenty;
          break;
        case this.mt.GOTCHA:
          this.startingScoresDisabled = false;
          this.startingScores = this.mt.startingScoresGotcha;
          break;
        case this.mt.KILL_BULL:
          this.startingScoresDisabled = false;
          this.startingScores = this.mt.startingScoresKillBull;
          break;
      }
      if (!this.startingScoresDisabled) {
        this.selectDefaultStartingScore();
      }
    },
    selectDefaultStartingScore() {
      this.selectedStartingScore = _.find(
        this.startingScores,
        (s) => s.default !== undefined && s.default === true
      ).id;
    },
    isSelectedPlayer(pid) {
      return _.find(
        this.selectedPlayers,
        (p) => parseInt(p.id) === parseInt(pid)
      );
    },
    isListedPlayer(pid) {
      return _.find(this.players, (p) => parseInt(p.id) === parseInt(pid));
    },
    selectPlayer(pid) {
      if (this.isListedPlayer(pid)) {
        // add to selected players
        const player = this.isListedPlayer(pid);
        this.selectedPlayers.push(player);
        this.players = _.reject(this.players, (p) => p.id === player.id);
        this.candidatePlayerId = [];
      } else if (this.isSelectedPlayer(pid)) {
        // remove from selected
        let player = this.isSelectedPlayer(pid);
        this.players.push(player);
        this.selectedPlayers = _.reject(
          this.selectedPlayers,
          (p) => p.id === pid
        );
        this.players = _.sortBy(this.players, "name");
      }
    },
    keyDownHandler(e) {
      if (e.key === "Backspace" || e.key === ",") {
        if (this.selectedPlayers.length > 0) {
          let player = this.selectedPlayers.pop();
          if (player !== undefined) {
            this.players.push(player);
            this.selectedPlayers = _.reject(
              this.selectedPlayers,
              (p) => p.id === player.id
            );
            this.players = _.sortBy(this.players, "name");
          }
        }
        e.preventDefault();
      }
    },
    keyPressHandler(e) {
      switch (e.key) {
        case "1":
          this.candidatePlayerId += "1";
          break;
        case "2":
          this.candidatePlayerId += "2";
          break;
        case "3":
          this.candidatePlayerId += "3";
          break;
        case "4":
          this.candidatePlayerId += "4";
          break;
        case "5":
          this.candidatePlayerId += "5";
          break;
        case "6":
          this.candidatePlayerId += "6";
          break;
        case "7":
          this.candidatePlayerId += "7";
          break;
        case "8":
          this.candidatePlayerId += "8";
          break;
        case "9":
          this.candidatePlayerId += "9";
          break;
        case "0":
          this.candidatePlayerId += "0";
          break;
        case "Enter":
          if (this.candidatePlayerId.length > 0) {
            this.selectPlayer(parseInt(this.candidatePlayerId));
          }
          break;
        case "/":
          this.selectedMatchType = this.cycleValues(
            _.keys(this.$refs["matchTypes"].options),
            this.selectedMatchType
          );
          this.onChangeMatchType();
          break;
      }
    },
    cycleValues(values, current) {
      if (values.length > 0) {
        const index = _.findIndex(values, (value) => {
          return parseInt(value) === parseInt(current);
        });
        return values[(index + 1) % values.length];
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
    loadData() {
      axios
        .all([
          axios.get(`/api/players/active`),
          axios.get(`/api/offices`),
          axios.get(`/api/matches/types`),
          axios.get(`/api/owes/types`),
          axios.get(`/api/venues`),
          axios.get(`/api/matches/modes`),
        ])
        .then(
          axios.spread(
            (
              playersResponse,
              officesResponse,
              matchTypesResponse,
              oweTypesResponse,
              venuesResponse,
              matchModesResponse
            ) => {
              this.offices = officesResponse.data;
              this.matchTypes = matchTypesResponse.data;
              this.oweTypes = oweTypesResponse.data;
              this.venues = venuesResponse.data;
              this.matchModes = matchModesResponse.data;
              this.players = _.sortBy(playersResponse.data, "name");
            }
          )
        )
        .catch((error) => {
          debug(`Error when getting players: ${error}`);
        });
      this.onChangeMatchType();
    },
  },
};
</script>

<style lang="less">
.round-container-form {
  border-radius: 10px;
  padding: 10px;
}

.flex-wrap {
  display: flex;
  flex-wrap: wrap;

  div {
    margin: 2px;
  }
}

.selectInput {
  font-family: inherit;
  width: 100%;
  border: 1px solid var(--col-description);
  border-radius: 10px;
  padding: 10px 8px;
  color: var(--color-white);
  font-size: 15px;
  background: #0f1017;
  border-image: none;
}

.selectInput:focus {
  border: 1px solid rgba(200, 200, 200, 1);
  outline: rgba(200, 200, 200, 1);
}
</style>
