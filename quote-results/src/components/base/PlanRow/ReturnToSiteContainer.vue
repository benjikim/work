<script setup lang="ts">
  import { useApiStore } from '@/store/api';
  import { useContentStore } from '@/store/content';
  import { useThemeStore } from '@/store/theme';
  import { computed } from 'vue';
  import { event } from 'vue-gtag';

  const apiStore = useApiStore();
  const contentStore = useContentStore();
  const themeStore = useThemeStore();

  const handleExploreClick = async () => {
    if (isModeEdu.value) {
      event('edu_plan_cta', {
        hierarchical_layer_1: 'EDU Plan CTA',
        hierarchical_layer_2: 'Click to see more plans',
      });
      window.location.href = import.meta.env.VITE_INSUREMYTRIP_URL;
    } else if (isAnnual.value) {
      event('annual_plan_cta', {
        hierarchical_layer_1: 'Annual Plan CTA',
        hierarchical_layer_2: 'Click to see more plans',
      });
      window.location.href = import.meta.env.VITE_INSUREMYTRIP_URL;
    } else {
      event('soventure_plan_cta', {
        hierarchical_layer_1: 'Soventure Plan CTA',
        hierarchical_layer_2: 'Click to see more plans on IMT from Soventure',
      });
      const quoteId = await apiStore.createQuote(true);
      apiStore.setLoaderState(false);
      window.open(
        `${import.meta.env.VITE_INSUREMYTRIP_URL}/results/?_qid=${quoteId}&utm_source=soventure&utm_medium=referral&utm_campaign=qr_cta`,
        '_blank'
      );
    }
  };

  const redirectToIMTContent = computed(
    () => contentStore.getRedirectToIMTContent
  );
  const isModeEdu = computed(() => themeStore.isModeEdu);
  const isAnnual = computed(() => themeStore.isModeAnnual);
</script>

<template>
  <div
    class="w-full mt-8 md:block cursor-pointer"
    @click="handleExploreClick()"
  >
    <div
      v-if="redirectToIMTContent"
      class="text-center font-semibold text-[16px] leading-none text-[#526975]"
      :class="{ 'md:text-[28px]': !isModeEdu && !isAnnual }"
    >
      {{ redirectToIMTContent.header }}
    </div>
    <div v-if="!isAnnual" class="flex justify-center gap-16 my-8">
      <template v-for="i in 3" :key="i">
        <img
          :src="
            redirectToIMTContent?.images[`redirectToMainSiteImage-${i}`]?.url
          "
          :alt="
            redirectToIMTContent?.images[`redirectToMainSiteImage-${i}`]?.alt
          "
          class="w-12 h-12"
          :class="{ 'md:w-16 md:h-16': !isModeEdu && !isAnnual }"
        />
      </template>
    </div>
    <div
      v-if="isModeEdu || isAnnual"
      class="w-full bg-white text-[#274452] text-center rounded"
    >
      <span class="inline-flex items-center gap-1 font-semibold text-[#526975]">
        {{ redirectToIMTContent?.subheading }}
      </span>
    </div>
    <div
      v-else
      class="w-full bg-white text-[#274452] text-center py-2.5 rounded"
    >
      <span class="inline-flex items-center gap-1 text-[#274452]">
        Explore
        <img
          src="@/assets/images/logo.svg"
          alt="IMT Logo"
          class="h-5 w-auto mx-1"
        />
        to see even more plans
      </span>
    </div>
  </div>
</template>
