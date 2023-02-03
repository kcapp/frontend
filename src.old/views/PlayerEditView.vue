<template>
  <div>
    <table style="margin-top: -20px">
      <tr>
        <td class="txtl font30">
          <CirclePlayerEdit
            style="
              color: rgb(38, 124, 255);
              font-size: 41px;
              text-shadow: rgb(0 0 0 / 69%) 1px 2px 5px;
              position: relative;
              top: 35px;
            "
          />
          <span style="position: relative; left: 10px; top: 35px"
            >Edit player</span
          >
        </td>
      </tr>
    </table>
  </div>
  <div class="mt20">
    <PlayerEditComponent :player="this.player" />
  </div>
</template>

<script>
import CirclePlayerEdit from "@/components/icons/CirclePlayerEdit.vue";
import PlayerEditComponent from "@/components/PlayerEditComponent.vue";
import axios from "axios";
import debug from "debug";

export default {
  components: { PlayerEditComponent, CirclePlayerEdit },
  data() {
    return {
      player: null,
    };
  },
  mounted() {
    this.loadPlayer();
  },
  methods: {
    loadPlayer() {
      axios
        .all([axios.get(`/api/player/` + this.$route.params.id)])
        .then(
          axios.spread((playerResponse) => {
            this.player = playerResponse.data;
          })
        )
        .catch((error) => {
          debug(`Error when getting players: ${error}`);
        });
    },
  },
};
</script>
