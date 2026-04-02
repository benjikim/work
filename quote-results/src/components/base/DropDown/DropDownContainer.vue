<script setup lang="ts">
  import { computed } from 'vue';
  import { useUserSessionStore } from '@/store/userSession';
  import { useThemeStore } from '@/store/theme';
  import SortBy from './SortBy.vue';
  import Filter from './Filter.vue';
  import Share from './Share.vue';

  const sessionStore = useUserSessionStore();
  const themeStore = useThemeStore();

  const isViewLG = computed(() => sessionStore.isViewLG);
  const isModeEdu = computed(() => themeStore.isModeEdu);
  const isModeAnnual = computed(() => themeStore.isModeAnnual);
</script>
<template>
  <section
    class="max-w-screen-md w-full flex justify-center lg:justify-between md:max-w-[98%] mt-1 md:mt-4 lg:mt-0"
  >
    <Filter v-if="!isViewLG && !isModeEdu && !isModeAnnual" class="max-w-fit" />
    <SortBy v-if="!isModeAnnual" class="max-w-fit" />
    <div v-if="isModeAnnual" class="max-w-fit"></div>
    <Share class="max-w-fit" />
  </section>
</template>
