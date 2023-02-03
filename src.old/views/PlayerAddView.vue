<template>
  <div class="mt20">
    <PlayerAddComponent :offices="this.offices" />
  </div>
</template>

<script>
import PlayerAddComponent from "@/components/PlayerAddComponent.vue";
import axios from "axios";
import debug from "debug";

export default {
  components: { PlayerAddComponent },
  data() {
    return {
      player: null,
      offices: [],
    };
  },
  mounted() {
    this.loadOffices();
  },
  methods: {
    loadOffices() {
      axios
        .get(`/api/office`)
        .then((officesResponse) => {
          this.offices = officesResponse.data;
        })
        .catch((error) => {
          debug(`Error when getting players: ${error}`);
        });
    },
  },
};
</script>
