<template>
  <RoundContainer>
    <table v-if="this.tournaments.length > 0">
      <tr>
        <td colspan="10" style="font-size: 25px; padding-bottom: 15px">
          <div>
            <table>
              <tr>
                <td class="txtl font30">
                  <i
                    class="fa-solid fa-ranking-star"
                    style="font-size: 25px; left: 4px"
                  ></i>
                  Elo
                </td>
              </tr>
            </table>
          </div>
        </td>
      </tr>
      <tr>
        <td colspan="10" class="txtr roundHeaderOptions">
          <button class="officeLabel" @click="this.setOffice(0)">All</button>
          <span v-for="(office, index) in this.offices" v-bind:key="index">
            <button class="officeLabel" @click="this.setOffice(office.id)">
              {{ office.name }}
            </button>
          </span>
        </td>
      </tr>
      <tr>
        <td colspan="6">&nbsp;</td>
      </tr>
      <tr style="font-weight: 900; color: #64b1c4">
        <td>name</td>
        <td class="txtl">office</td>
        <td class="txtc">short name</td>
        <td class="txtc">start time</td>
        <td class="txtc">end time</td>
        <td class="txtc">details</td>
      </tr>
      <template
        v-for="tournament in this.tournaments"
        v-bind:key="tournament.id"
      >
        <tr v-if="showOfficeTournament(tournament)">
          <td>{{ tournament.name }}</td>
          <td>
            {{ offices[tournament.office_id].name }}
          </td>
          <td class="txtc">
            {{ tournament.short_name }}
          </td>
          <td class="txtc">
            {{ new Date(tournament.start_time).toLocaleDateString("en-ca") }}
            {{
              new Date(tournament.start_time).toLocaleTimeString("en-gb", {
                hour: "2-digit",
                minute: "2-digit",
              })
            }}
          </td>
          <td class="txtc">
            {{ new Date(tournament.end_time).toLocaleDateString("en-ca") }}
            {{
              new Date(tournament.end_time).toLocaleTimeString("en-gb", {
                hour: "2-digit",
                minute: "2-digit",
              })
            }}
          </td>
          <td class="txtc">
            <router-link to="/">view</router-link>
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
  props: ["tournaments", "offices"],
  data() {
    return {
      selectedOffice: 0,
    };
  },
  methods: {
    setOffice(id) {
      this.selectedOffice = id;
    },
    showOfficeTournament(tournament) {
      return this.selectedOffice === 0
        ? true
        : tournament.office_id === this.selectedOffice;
    },
  },
};
</script>

<style>
.commonHeader {
  padding-top: 10px;
  border-bottom: 1px solid #dddddd;
}
</style>
