<template>
  <div class="round-container">
    <div v-if="this.player">
      <div class="flex">
        <div class="player-pic-cutout">
          <img
            v-if="player.profile_pic_url"
            v-bind:src="player.profile_pic_url"
          />
        </div>
        <div class="padl20">
          <div class="round-container-header-cut txt-col-player">
            {{ player.name }}
          </div>
          <div class="txt-desc">{{ player.nickname }}</div>
          <div>
            <span
              class="player-color"
              v-bind:style="'background:' + player.color"
              >&nbsp;</span
            >
          </div>
        </div>
      </div>
      <div class="mart20">
        <table>
          <tr>
            <td class="pad20 profile-menu">
              <div class="block-container player-profile-menu">
                <div class="player-profile-menu-item">
                  <span
                    ><a href="#overview" data-toggle="tab">Overview</a></span
                  >
                </div>
                <div class="player-profile-menu-item">
                  <span
                    ><a href="#highscores" data-toggle="tab"
                      >High scores</a
                    ></span
                  >
                </div>
                <div class="player-profile-menu-item">
                  <span
                    ><a href="#statistics" data-toggle="tab"
                      >Statistics</a
                    ></span
                  >
                </div>
                <div class="player-profile-menu-item">
                  <span><a href="#hits" data-toggle="tab">Hits</a></span>
                </div>
                <div class="player-profile-menu-item">
                  <span
                    ><a href="#checkouts" data-toggle="tab">Checkouts</a></span
                  >
                </div>
                <div class="player-profile-menu-item">
                  <span
                    ><a href="#progression" data-toggle="tab"
                      >Progression</a
                    ></span
                  >
                </div>
                <div class="player-profile-menu-item">
                  <span
                    ><a href="#tournament" data-toggle="tab"
                      >Tournaments</a
                    ></span
                  >
                </div>
                <div class="player-profile-menu-item">
                  <span><a href="#elo" data-toggle="tab">Elo</a></span>
                </div>
              </div>
            </td>
            <td class="profile-content padt20">
              <table v-if="statistics['x01']">
                <tr>
                  <td>
                    <span class="num-big">
                      {{
                        this.statistics["x01"][
                          "current"
                        ].three_dart_avg.toFixed(2)
                      }}
                    </span>
                  </td>
                  <td class="num-big">
                    <span class="num-big">
                      {{
                        this.statistics["x01"][
                          "current"
                        ].first_nine_three_dart_avg.toFixed(2)
                      }}
                    </span>
                  </td>
                  <td class="num-big">
                    <span class="num-big">
                      {{
                        this.statistics["x01"][
                          "current"
                        ].checkout_percentage.toFixed(2)
                      }}%
                    </span>
                  </td>
                  <td class="num-big">
                    <span class="num-big"> 160 </span>
                  </td>
                </tr>
                <tr>
                  <td class="txt-col-player">
                    <div class="txt-bold">Overall average</div>
                    <div class="txt-desc">
                      <span v-if="totalsProgression['three_dart_avg_prog'] > 0"
                        >+</span
                      >{{
                        this.totalsProgression["three_dart_avg_prog"].toFixed(3)
                      }}
                      since last week
                    </div>
                  </td>
                  <td class="txt-col-player">
                    <div class="txt-bold">First 9 average</div>
                    <div class="txt-desc">
                      <span
                        v-if="
                          totalsProgression['first_nine_three_dart_avg'] > 0
                        "
                        >+</span
                      >{{
                        this.totalsProgression[
                          "first_nine_three_dart_avg"
                        ].toFixed(3)
                      }}
                      since last week
                    </div>
                  </td>
                  <td class="txt-col-player">
                    <div class="txt-bold">Checkout_percentage</div>
                    <div class="txt-desc">
                      <span v-if="totalsProgression['checkout_percentage'] > 0"
                        >+</span
                      >{{
                        this.totalsProgression["checkout_percentage"].toFixed(3)
                      }}
                      since last week
                    </div>
                  </td>
                  <td class="txt-col-player">Highest checkout</td>
                </tr>
                <tr class="separator">
                  <td colspan="4">&nbsp;</td>
                </tr>
                <tr>
                  <td>
                    <span class="num-big">
                      {{ this.accuracyValues["total"].toFixed(2) }}
                    </span>
                  </td>
                  <td>
                    <span class="num-big">
                      {{ this.accuracyValues["20"].toFixed(2) }}
                    </span>
                  </td>
                  <td>
                    <span class="num-big">
                      {{ this.accuracyValues["19"].toFixed(2) }}
                    </span>
                  </td>
                  <td>&nbsp;</td>
                </tr>
                <tr>
                  <td class="txt-col-player">
                    <div class="txt-bold">Accuracy overall</div>
                    <div class="accuracy-bar-wrapper mart10">
                      <span
                        class="accuracy-bar"
                        v-bind:style="
                          'width:' +
                          (
                            (this.accuracyValues['total'] *
                              this.accuracyBarWidth) /
                            100
                          ).toFixed(0) +
                          'px'
                        "
                        >&nbsp;</span
                      >
                    </div>
                  </td>
                  <td class="txt-col-player">
                    <div class="txt-bold">Accuracy 20s</div>
                    <div class="accuracy-bar-wrapper mart10">
                      <span
                        class="accuracy-bar"
                        v-bind:style="
                          'width:' +
                          (
                            (this.accuracyValues['20'] *
                              this.accuracyBarWidth) /
                            100
                          ).toFixed(0) +
                          'px'
                        "
                        >&nbsp;</span
                      >
                    </div>
                  </td>
                  <td class="txt-col-player">
                    <div class="txt-bold">Accuracy 19s</div>
                    <div class="accuracy-bar-wrapper mart10">
                      <span
                        class="accuracy-bar"
                        v-bind:style="
                          'width:' +
                          (
                            (this.accuracyValues['19'] *
                              this.accuracyBarWidth) /
                            100
                          ).toFixed(0) +
                          'px'
                        "
                        >&nbsp;</span
                      >
                    </div>
                  </td>
                  <td></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </div>
    <div v-else class="loader">
      <i class="fas fa-sync fa-spin"></i>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import debug from "debug";

export default {
  data() {
    return {
      player: {},
      statistics: {},
      progression: {},
      totalsProgression: [],
      accuracyBarWidth: 150,
      accuracyValues: [],
    };
  },
  mounted() {
    this.loadPlayer();
  },
  methods: {
    setTotalsProgression() {
      this.totalsProgression["three_dart_avg_prog"] =
        parseFloat(this.statistics["x01"]["current"].three_dart_avg) -
        parseFloat(this.statistics["x01"]["previous"].three_dart_avg);
      this.totalsProgression["first_nine_three_dart_avg"] =
        parseFloat(
          this.statistics["x01"]["current"].first_nine_three_dart_avg
        ) -
        parseFloat(
          this.statistics["x01"]["previous"].first_nine_three_dart_avg
        );
      this.totalsProgression["checkout_percentage"] =
        parseFloat(this.statistics["x01"]["current"].checkout_percentage) -
        parseFloat(this.statistics["x01"]["previous"].checkout_percentage);
    },
    setAccuracyValues() {
      this.accuracyValues["total"] =
        this.statistics["x01"]["current"].accuracy_overall;
      this.accuracyValues["20"] = this.statistics["x01"]["current"].accuracy_20;
      this.accuracyValues["19"] = this.statistics["x01"]["current"].accuracy_19;
    },
    loadPlayer() {
      axios
        .all([
          axios.get(`/api/players/` + this.$route.params.id),
          axios.get(`/api/players/` + this.$route.params.id + `/progression`),
          axios.get(`/api/players/` + this.$route.params.id + `/statistics`),
        ])
        .then(
          axios.spread(
            (playerResponse, progressionResponse, statisticsResponse) => {
              this.player = playerResponse.data;
              this.progression = progressionResponse.data;
              this.statistics = statisticsResponse.data;

              this.setTotalsProgression();
              this.setAccuracyValues();
            }
          )
        )
        .catch((error) => {
          debug(`Error when getting player data: ${error}`);
        });
    },
  },
};
</script>

<style>
.txt-col-player {
  color: var(--col-player-name);
}

.txt-desc {
  color: var(--col-description);
}

.player-color {
  min-width: 200px;
  height: 15px;
  display: block;
  border-radius: 10px;
  margin-top: 10px;
}

.player-profile-menu-item {
  padding: 5px 0px;
}

td.profile-menu {
  width: 200px;
}

td.profile-content {
  vertical-align: top;
}

.num-big {
  font-size: 40px;
  font-weight: 900;
}

.accuracy-bar {
  display: block;
  border-radius: 10px 0 0 10px;
  height: 15px;
  background: var(--color-green);
}

.accuracy-bar-wrapper {
  width: 150px;
  border-radius: 10px;
  height: 15px;
  background: #303030;
}
</style>
