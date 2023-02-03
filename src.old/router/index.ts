import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import PlayersListView from "../views/Player/PlayersList.vue";
import TournamentsView from "../views/TournamentsView.vue";
import EloView from "../views/EloView.vue";
import PlayerEditView from "../views/PlayerEditView.vue";
import PlayerAddView from "../views/PlayerAddView.vue";

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
      component: PlayersListView,
    },
    {
      path: "/players/add",
      name: "playerAdd",
      component: PlayerAddView,
    },
    {
      path: "/player/:id/edit",
      name: "playerEdit",
      component: PlayerEditView,
    },
    {
      path: "/tournaments",
      name: "tournaments",
      component: TournamentsView,
    },
    {
      path: "/elo",
      name: "elo",
      component: EloView,
    },
  ],
});

export default router;
