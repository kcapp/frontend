<template>
  <RoundContainer>
    <div>
      <table>
        <tr>
          <td>
            <div style="width: 130px; height: 130px">PIC</div>
          </td>
          <td>
            <div>First name</div>
            <div>
              <input type="text" class="textInput" />
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div>Profile picture URL</div>
            <div>
              <input type="text" class="textInput" />
            </div>
          </td>
          <td>
            <div>Last name</div>
            <div>
              <input type="text" class="textInput" />
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div>Color</div>
            <div>
              <input type="text" class="textInput" />
            </div>
          </td>
          <td>
            <div>Nickname</div>
            <div>
              <input type="text" class="textInput" />
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div>Office</div>
            <div>
              <input type="text" class="textInput" />
            </div>
          </td>
          <td>
            <div>Vocal name</div>
            <div>
              <input type="text" class="textInput" />
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <div>Slack handle</div>
            <div>
              <input type="text" class="textInput" />
            </div>
          </td>
          <td>
            <div>Smartcard UID</div>
            <div>
              <input type="text" class="textInput" />
            </div>
          </td>
        </tr>
      </table>
    </div>
  </RoundContainer>
</template>

<script>
import RoundContainer from "@/components/RoundContainer.vue";

export default {
  components: { RoundContainer },
  props: ["player"],
  data() {
    return {};
  },
  methods: {},
};
</script>

<style>
table > tr > td > input {
  min-width: 300px;
}
</style>
