<template>
  <div>
    <table style="margin-top: -20px">
      <tr>
        <td class="txtl font30">
          <CircleTrophy
            style="
              color: rgb(38, 124, 255);
              font-size: 41px;
              text-shadow: rgb(0 0 0 / 69%) 1px 2px 5px;
              position: relative;
              top: 35px;
            "
          />
          <span style="position: relative; left: 10px; top: 35px"
            >Tournaments</span
          >
        </td>
      </tr>
    </table>
  </div>
  <div class="mt20" v-if="this.tournaments && this.offices">
    <TournamentsComponent
      :tournaments="this.tournaments"
      :offices="this.offices"
    />
  </div>
</template>
<script>
import axios from "axios";
import _ from "underscore";
import debug from "debug";
import TournamentsComponent from "@/components/TournamentsComponent.vue";
import CircleTrophy from "@/components/icons/CircleTrophy.vue";

export default {
  components: { CircleTrophy, TournamentsComponent },
  data() {
    return {
      tournaments: [],
      offices: [],
      sortDirection: -1,
    };
  },
  mounted() {
    this.loadTournaments();
  },
  methods: {
    loadTournaments() {
      axios
        .all([axios.get(`/api/tournament`), axios.get(`/api/office`)])
        .then(
          axios.spread((tournamentsResponse, officesResponse) => {
            this.tournaments = tournamentsResponse.data;
            this.tournaments = _.sortBy(
              this.tournaments,
              (tournament) => tournament.id
            ).reverse();
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
