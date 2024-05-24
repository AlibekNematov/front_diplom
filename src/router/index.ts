import { createRouter, createWebHistory } from 'vue-router'
import HomeView from "/src/views/HomeView.vue";
import SubscriptionsView from "@/views/SubscriptionsView.vue";
import ClubDetailView from "@/views/ClubDetailView.vue";
import AuthView from "@/views/AuthView.vue";
import ProfileView from "@/views/ProfileView.vue";
import {useUser} from "../../utils/globals";
import ServicesView from "@/views/ServicesView.vue";


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/subscriptions',
      name: 'subscriptions',
      component: SubscriptionsView,
    },
    {
      path: '/club/:id',
      name: 'clubDetail',
      component: ClubDetailView,
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/services',
      name: 'services',
      component: ServicesView,
    }
  ]
});

router.beforeEach((to, from) => {
  if (to.name !== 'auth' && !useUser().currentUser()) return { name: 'auth' };
})

export default router
