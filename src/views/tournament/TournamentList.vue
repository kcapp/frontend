<template>
  <div class="round-container">
    <div class="round-container-header padb10">Tornaments list</div>
    <div class="mt20" v-if="this.tournaments && this.offices">
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
      <div v-if="tournaments.length > 0">
        <table>
          <tr class="table-th">
            <td @click="this.sortBy(`name`)">name</td>
            <td @click="this.sortBy(`short_name`)">short name</td>
            <td @click="this.sortBy(`office_id`)">office</td>
            <td @click="this.sortBy(`start_time`)">start</td>
            <td @click="this.sortBy(`end_time`)">end</td>
            <td class="txtc">options</td>
          </tr>
          <template
            v-for="(tournament, index) in this.tournaments"
            v-bind:key="index"
          >
            <TournamentListTournamentComponent
              v-if="showOfficeTournament(tournament)"
              :tournament="tournament"
            >
              <template #tournamentName>
                {{ tournament.name }}
              </template>
              <template #tournamentShortName>
                {{ tournament.short_name }}
              </template>
              <template #officeName>
                {{ offices[tournament.office_id].name }}
              </template>
              <template #tournamentStartTime>
                {{
                  new Date(tournament.start_time).toLocaleDateString("en-ca")
                }}
              </template>
              <template #tournamentEndTime>
                {{ new Date(tournament.end_time).toLocaleDateString("en-ca") }}
              </template>
            </TournamentListTournamentComponent>
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
import TournamentListTournamentComponent from "@/components/tournament/TournamentListTournamentComponent.vue";

export default {
  components: { TournamentListTournamentComponent },
  data() {
    return {
      tournaments: [],
      offices: [],
      sortDirection: -1,
      selectedOffice: 0,
    };
  },
  mounted() {
    this.loadTournaments();
  },
  methods: {
    sortBy(atr) {
      console.log("sorting", atr, this.sortDirection);
      if (this.sortDirection === 1) {
        this.tournaments = _.sortBy(
          this.tournaments,
          (tournament) => tournament[atr]
        );
        this.sortDirection = -1;
      } else {
        this.tournaments = _.sortBy(
          this.tournaments,
          (tournament) => tournament[atr]
        ).reverse();
        this.sortDirection = 1;
      }
    },
    setOffice(id) {
      this.selectedOffice = id;
    },
    showOfficeTournament(tournament) {
      return this.selectedOffice === 0
        ? true
        : tournament.office_id === this.selectedOffice;
    },
    loadTournaments() {
      axios
        .all([axios.get(`/api/tournaments`), axios.get(`/api/offices`)])
        .then(
          axios.spread((tournamentsResponse, officesResponse) => {
            this.tournaments = tournamentsResponse.data;
            this.tournaments = _.sortBy(
              this.tournaments,
              (tournament) => tournament.start_time
            ).reverse();
            this.offices = officesResponse.data;
          })
        )
        .catch((error) => {
          debug(`Error when getting tournaments: ${error}`);
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
