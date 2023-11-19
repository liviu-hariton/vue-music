import { createRouter, createWebHistory } from 'vue-router'
import useUserStore from "@/stores/user";

import Home from '@/views/Home.vue'
import About from '@/views/About.vue'
import Manage from "@/views/Manage.vue";
import Song from "@/views/Song.vue";
import NotFound from "@/views/404.vue";

const routes = [
  {
    name: 'home',
    path: '/',
    component: Home,

  },
  {
    name: 'about',
    path: '/about',
    component: About
  },
  {
    name: 'manage',
    /*alias: '/manage', // load same thing from two different paths (instead of redirecting the user) */
    path: '/manage-music',
    component: Manage,
    beforeEnter: (to, from, next) => {
      next();
    },
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/manage',
    redirect: {
      name: 'manage'
    }
  },
  {
    name: 'song',
    path: '/song/:id',
    component: Song,
  },
  {
    name: 'not-found',
    path: '/:catchAll(.*)*',
    component: NotFound
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  linkExactActiveClass: 'text-yellow-500'
})

// guarding routes
router.beforeEach((to, from, next) => {
  if(!to.meta.requiresAuth) {
    next();
    return;
  }

  const store = useUserStore();

  if(store.userLoggedIn) {
    next();
  } else {
    next({
      name: 'home'
    });
  }
});

export default router
