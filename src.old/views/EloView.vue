<template>
  <div class="mt20" v-if="this.tournaments && this.offices">
    <EloComponent :tournaments="this.tournaments" :offices="this.offices" />
  </div>
</template>
<script>
import axios from "axios";
import _ from "underscore";
import debug from "debug";
import EloComponent from "@/components/EloComponent.vue";

export default {
  components: { EloComponent },
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
