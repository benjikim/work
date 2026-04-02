import { createRouter, createWebHistory } from 'vue-router';
import Purchase from '/src/views/Purchase.vue';
import Confirmation from '/src/views/Confirmation.vue';

const routes = [
  {
    path: '/',
    name: 'Purchase',
    component: Purchase,
  },
  {
    path: '/confirmation',
    name: 'Confirmation',
    component: Confirmation,
  }
];

if (import.meta.env.VITE_DEV_MODE === 'true') {
  routes.push({
    path: '/docs',
    component: () => import('/src/views/Docs.vue'),
  });
}

const router = createRouter({
  history: createWebHistory('/travel-insurance/quote/buy'),
  routes,
});

export default router;
