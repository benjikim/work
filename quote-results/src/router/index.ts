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
    path: '/QRPOC',
    name: 'ResultsPOC',
    component: () => import('@/views/Results.vue'),
  },
  {
    path: '/QRPOCCopy',
    name: 'ResultsPOCCopy',
    component: () => import('@/views/ResultsCopy.vue'),
  },
  {
    path: '/QRPOCSeparate',
    name: 'ResultsPOCSeparate',
    component: () => import('@/views/ResultsCopy.vue'),
  },
  {
    path: '/annual-results-copy',
    name: 'AnnualResultsCopy',
    component: () => import('@/views/AnnualResultsCopy.vue'),
  },
  {
    path: '/style-guide-library',
    name: 'StyleGuideLibrary',
    component: () => import('@/views/StyleGuideLibrary.vue'),
  },
  {
    path: '/QRPlanDetailsPOC',
    name: 'ResultsPlanDetailsPOC',
    component: () => import('@/views/Results.vue'),
  },
  {
    path: '/compare',
    name: 'Compare',
    component: () => import('@/views/Compare.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(function(to, from, next) {
  const sessionStore = useUserSessionStore();
  const isCompareQueryUpdate =
    from?.name === 'Compare' && to?.name === 'Compare';

  if (!isCompareQueryUpdate) {
    window.scrollTo(0, 0);
  }

  previousRoute.value = from;

  if (from?.name === 'Compare' && to?.name !== 'Compare') {
    sessionStore.clearPlansToCompare();
  }

  next();
});

export default router;
