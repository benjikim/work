import { ref } from 'vue';
import type { RouteLocationNormalized } from 'vue-router';

export const previousRoute = ref<RouteLocationNormalized | null>(null);
