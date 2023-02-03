import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import PlayerListView from "@/views/player/PlayerList.vue";
import PlayerProfileView from "@/views/player/PlayerProfile.vue";
import TournamentListView from "@/views/tournament/TournamentList.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/players",
      name: "players",
      component: PlayerListView,
    },
    {
      path: "/tournaments",
      name: "tournaments",
      component: TournamentListView,
    },
    {
      path: "/player/:id/profile",
      name: "playerProfile",
      component: PlayerProfileView,
    },
  ],
});

export default router;
