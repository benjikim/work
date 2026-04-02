import { useUserSessionStore } from '@/store/userSession';
import { createRouter, createWebHistory } from 'vue-router';
import { previousRoute } from './previousRoute';

const routes = [
  {
    path: '/',
    name: 'Results',
    component: () => import('@/views/Results.vue'),
  },
  {
    path: '/compare',
    name: 'Compare',
    component: () => import('@/views/Compare.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(
    import.meta.env.DEV ? '/' : '/travel-insurance/quote/results'
  ),
  routes,
});

router.beforeEach(function(_to, from, next) {
  const sessionStore = useUserSessionStore();
  window.scrollTo(0, 0);
  previousRoute.value = from;
  if (from?.name === 'Compare') {
    sessionStore.clearPlansToCompare();
  }
  next();
})

export default router;
