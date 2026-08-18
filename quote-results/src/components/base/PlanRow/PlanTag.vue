<script setup lang="ts">
  import { PlanType } from '@/types/index';
  import { PropType, computed } from 'vue';
  import { useUserSessionStore } from '@/store/userSession';
  import { useThemeStore } from '@/store/theme';
  import { useApiStore } from '@/store/api';
  import { useContentStore } from '@/store/content';
  import {
    isInternal,
    formatCurrency,
    getOptionKeyFromCoverageMap,
  } from '@/utility';

  const apiStore = useApiStore();
  const themeStore = useThemeStore();
  const sessionStore = useUserSessionStore();
  const contentStore = useContentStore();
  const isModeEdu = computed(() => themeStore.isModeEdu);

  const props = defineProps({
    type: {
      type: String as PropType<PlanType>,
      required: false,
    },
    planCode: {
      type: String,
      required: false,
    },
    planName: {
      type: String,
      required: false,
    },
  });

  const customPlanLabels: Record<string, string> = {
    'explore elite': 'Best Value for Families',
    'international choice': 'Comprehensive',
    essential: 'Popular Cruise Plan Option',
    'go ready choice': 'Comprehensive',
    'exactcare value': 'Comprehensive',
    'atlas journey elevate': 'Great Value Plan Option',
    exactcare: 'Comprehensive',
    ultimate: 'Great Value for Cruise Coverage',
    'atlas journey escape': 'Comprehensive',
    'international travel se': 'Comprehensive',
    'international choice cruise': 'Comprehensive',
    'atlas journey explore': 'Popular Cruise Plan Option',
    'explore secure': 'Comprehensive',
    classic: 'Comprehensive',
    'patriot international lite': 'Comprehensive',
    'single-trip prime': 'Comprehensive',
    aegis: 'Comprehensive',
    'international travel lx': 'Comprehensive',
    advantage: 'Comprehensive',
    gold: 'Comprehensive',
    bronze: 'Comprehensive',
    'single-trip gold': 'Comprehensive',
    'multi-trip gold': 'Comprehensive',
    'international travel select cve': 'Comprehensive',
    'multi-trip preferred': 'Comprehensive',
    'medicare plus': 'International Medical',
    'medicare xl': 'International Medical',
    'medicare start': 'International Medical',
    'medicare complete': 'International Medical',
    'medicare premier': 'International Medical',
    'medicare executive': 'International Medical',
  };
  const displayName = {
    Evacuation: 'Medical Evacuation',
    Comprehensive: 'Comprehensive',
    'Vacation Rental': 'Comprehensive',
    'Accidental Death': 'Accidental Death',
    'Travel Visa': 'Embassy Visa',
    'Travel Medical': 'International Medical',
    'Adventure Sports': 'For Adventure Travelers',
    Hidden: '',
    EDU: 'Cancel For Any Reason Option',
  };

  const areLuxuryPlansHighlighted = computed(() => {
    return (
      apiStore.getFFValue(
        'sb_20250805_insuremytrip_luxury_plans_ab_test_us_release'
      ) &&
      !isInternal() &&
      themeStore.isThemeIMT
    );
  });

  const isLuxuryPlan = computed(() => {
    const luxuryPlanCodes = apiStore.getFFValue(
      'sb_20250805_insuremytrip_luxury_plan_codes_us_release'
    );
    if (
      luxuryPlanCodes &&
      typeof luxuryPlanCodes === 'string' &&
      props.planCode
    ) {
      const planCodes = luxuryPlanCodes.trim().split(',');
      return planCodes.includes(props.planCode);
    }
    return false;
  });

  const luxuryBannerTextReservePlan = computed(() => {
    const text = apiStore.getFFValue(
      'sb_20250808_insuremytrip_luxury_banner_text_us_release'
    );
    if (text && typeof text === 'string') {
      return text;
    }
    return '';
  });

  const luxuryBannerTextEpicPlan = computed(() => {
    const text = apiStore.getFFValue(
      'sb_20250826_insuremytrip_epic_luxury_banner_text_us_release'
    );
    if (text && typeof text === 'string') {
      return text;
    }
    return '';
  });

  /**
   * Sets plan tag id in session store.
   */
  const handleClick = (type: string) => {
    sessionStore.setPlanTagId(type);
    sessionStore.setPlanTagModalOpen(true);
  };

  const displayAdditionalText = computed(() => {
    const isCFARSelected = sessionStore.getSelectedFilters.includes(
      'cancelForAnyReasonOption-0'
    );

    if (!isCFARSelected || !props.planCode) {
      return '';
    }

    const currentCost = sessionStore.getCurrentPlanCostUnformatted(
      props.planCode
    );
    const currentOptions = sessionStore.getOptionsOfSelectedPlan(
      props.planCode
    );
    const optionKey = getOptionKeyFromCoverageMap(
      'cancelForAnyReasonOption',
      currentOptions
    );

    // To handle the case where the user has selected the CFAR Filter but has removed the option,
    // we want to hide the additional text.
    if (optionKey) {
      const selectedCFAROption = sessionStore.getSelectedCFAROption(
        props.planCode
      );

      // We check if the cfar option is 'on' in the case of it being boolean,
      // or if the option is not 'off' in the case of it being multiple choice, (e.g. 'off', '50%', '75%').
      if (
        selectedCFAROption &&
        (currentOptions[optionKey].values?.on?.selected ||
          !currentOptions[optionKey].values?.off?.selected)
      ) {
        return `(${formatCurrency(currentCost - selectedCFAROption.cost, 2)} without cancel for any reason)`;
      }
    }

    return '';
  });

  const planLabelContent = computed(() => {
    const normalizedPlanName = props.planName?.trim().toLowerCase();

    if (normalizedPlanName && normalizedPlanName in customPlanLabels) {
      return customPlanLabels[normalizedPlanName];
    }

    return contentStore.getPlanLabelsByKey(props.planCode || '');
  });

  const usesDefaultPlanLabelStyle = computed(() => {
    return ['Comprehensive', 'International Medical'].includes(
      planLabelContent.value || ''
    );
  });
</script>

<template>
  <div class="flex items-center"v-if="planLabelContent && planLabelContent.length > 0">
    <p
      :class="[
        'mt-1 md:mt-0 rounded py-[0.125rem] text-center md:block uppercase text-[0.6875rem] tracking-wide',
        usesDefaultPlanLabelStyle
          ? 'text-[#878787] font-normal'
          : 'text-[#e68a00] font-medium',
      ]"
    >
      {{ planLabelContent }}
    </p>
  </div>
  <div class="flex items-center" v-else-if="areLuxuryPlansHighlighted && isLuxuryPlan && type">
    <p
      class="mt-1 md:mt-0 px-[0.375rem] py-[0.125rem] md:block w-fit uppercase text-[0.6875rem] font-bold bg-gradient-to-b rounded-[5px] text-[#999999]"
    >
      {{
        isLuxuryPlan && planCode === 'ITELI'
          ? luxuryBannerTextEpicPlan
          : luxuryBannerTextReservePlan
      }}
      <span v-if="displayAdditionalText.length > 0" class="md:display-none">{{
        displayAdditionalText
      }}</span>
    </p>
  </div>
  <div v-else-if="type" class="flex items-center">
    <p
      v-if="isModeEdu"
      class="mt-1 md:mt-0 rounded px-[0.375rem] md:block text-[#999999] uppercase text-[0.5rem] md:text-[0.6rem] font-bold"
    >
      {{ displayName[type] }}
      <span v-if="displayAdditionalText.length > 0" class="md:display-none">{{
        displayAdditionalText
      }}</span>
    </p>
    <p
      v-else-if="type === 'Evacuation'"
      class="mt-1 md:mt-0 rounded px-[0.375rem] py-[0.125rem] md:block text-[#e68a00] text-center uppercase text-[0.6875rem] font-bold"
    >
      This is a Medical Evacuation plan and has limited coverage in other areas.
    </p>
    <p
      v-else-if="
        ![
          'Comprehensive',
          'Vacation Rental',
          'Adventure Sports',
          'Hidden',
        ].includes(type)
      "
      class="mt-1 md:mt-0 rounded py-[0.125rem] md:block text-[#878787] uppercase text-[0.6875rem] font-normal tracking-wide"
    >
      {{ displayName[type] }}
      <span v-if="displayAdditionalText.length > 0" class="md:display-none">{{
        displayAdditionalText
      }}</span>
    </p>
    <p
      v-else-if="['Adventure Sports'].includes(type)"
      class="mt-1 md:mt-0 rounded px-[0.375rem] py-[0.125rem] md:block text-[#999999] uppercase text-[0.6875rem] cursor-pointer font-bold"
      @click="handleClick(type)"
    >
      {{ displayName[type] }}
    </p>
    <p
      v-else
      class="mt-1 md:mt-0 rounded py-[0.125rem] md:block text-[#878787] uppercase text-[0.6875rem] font-normal tracking-wide"
    >
      {{ displayName[type] }}
      <span v-if="displayAdditionalText.length > 0" class="md:display-none">{{
        displayAdditionalText
      }}</span>
    </p>
  </div>
</template>
