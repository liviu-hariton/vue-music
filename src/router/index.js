import { createRouter, createWebHistory } from 'vue-router'
import useUserStore from "@/stores/user";

const Home = () => import('@/views/Home.vue');
const About = () => import('@/views/About.vue');
const Manage = () => import('@/views/Manage.vue');
const Song = () => import('@/views/Song.vue');
const NotFound = () => import('@/views/404.vue');

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
