<template>
  <RoundContainer>
    <table v-if="this.offices.length > 0">
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
  props: ["offices"],
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
