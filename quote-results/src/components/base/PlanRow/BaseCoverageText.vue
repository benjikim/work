<script setup lang="ts">
  import { CoverageText } from '@/types/index';
  import Secondary from '@/components/shared/Secondary.vue';
  import { computed, PropType, ref } from 'vue';
  import { useApiStore } from '@/store/api';
  import { useUserSessionStore } from '@/store/userSession';
  import { useThemeStore } from '@/store/theme';
  import {
    formatCurrency,
    getCoverageData,
    getCoverageLTCMessage,
    getCoverageDataDetails,
    getPlanRowCoverageDisplay,
    areThereMultipleMedicalOptions,
    getCoverageDetails,
    isPlanFlightOnly,
    areADDOptionsAvailable,
  } from '@/utility';
  import { useContentStore } from '@/store/content';
  import UtilityHTMLRenderer from '@/components/utility/UtilityHTMLRenderer.vue';
  import BaseCoverageMarker from '@/components/base/PlanRow/BaseCoverageMarker.vue';

  const props = defineProps({
    coverage: {
      type: Object as PropType<CoverageText>,
      required: true,
    },
    planCode: {
      type: String,
      required: false,
    },
    displayLabel: {
      type: Boolean,
      required: false,
      default: true,
    },
  });

  const apiStore = useApiStore();
  const sessionStore = useUserSessionStore();
  const contentStore = useContentStore();
  const themeStore = useThemeStore();
  const isThemeSoventure = computed(() => themeStore.isThemeSoventure);

  const showPlanDetailCoveredActivities = computed(() =>
    apiStore.getFFValue('cms_20250522_soventure_covered_activities')
  );

  const isCoverageAvailable = (planCode: string, coverage: string) => {
    return sessionStore.getCoveragesOfSelectedPlan(planCode)?.[coverage];
  };

  const getCurrentSelectedMedicalValue = (planCode: string) => {
    const planOptions = sessionStore.getOptionsOfSelectedPlan(planCode);
    const medicalOptions = planOptions?.medical;

    if (!medicalOptions) {
      return '';
    }

    for (const [optionKey, optionVal] of Object.entries(
      medicalOptions.values
    )) {
      if (optionVal.selected) {
        return formatCurrency(optionKey, 0);
      }
    }
  };

  const plan = computed(() => {
    if (props.planCode) return apiStore.getPlanByPlanCode(props.planCode);
  });

  const coverageKey = computed(() =>
    contentStore.getCoverageKeyByLabel(props.coverage.label)
  );

  const evacuationSpecificCoverageKeys = [
    'Duration',
    'Evacuation To',
    'Evacuation From',
    'Evacuation Criteria',
  ];

  const displayMedicalEvacuationMarker = computed(() => {
    if (plan.value) {
      const coverageDetails = getCoverageDetails(
        plan.value,
        'emergencyMedicalEvacuation'
      );

      if (coverageDetails.length > 0 && coverageDetails[0].description) {
        return true;
      }

      const labels = getCoverageDataDetails(
        plan.value,
        'emergencyMedicalEvacuation'
      );
      return labels.length > 1;
    }
    return false;
  });

  const displayADMarker = computed(() => {
    if (props.planCode && plan.value) {
      const planFlightOnly = isPlanFlightOnly(props.planCode);
      const labels = getCoverageDataDetails(
        plan.value,
        planFlightOnly ? 'accidentalDeathFlight' : 'accidentalDeath24Hour'
      );

      return labels.length > 1;
    }
    return false;
  });
  const ADDDisplayHaveAlpha = ref(false);
  const doesADDHaveValue = computed(() => {
    if (
      props.coverage.label === 'Accidental Death' &&
      plan.value &&
      coverageKey.value
    ) {
      const display = getPlanRowCoverageDisplay(
        plan.value,
        isPlanFlightOnly(plan.value.code)
          ? 'accidentalDeathFlight'
          : coverageKey.value
      );
      // Determining if ADD has any alpha characters.
      ADDDisplayHaveAlpha.value = /[a-zA-Z]/.test(display);
      return Boolean(display && display.length > 0);
    }
    return false;
  });

  const displayValue = ref<HTMLDivElement | null>(null)
  const emit = defineEmits(['select']);
  const handleClick = () => {
    if (displayValue.value !== null ) {
      emit ('select', displayValue.value.innerText);
    }
  }
</script>

<template>
  <div @click="handleClick" :data-cy="`${planCode}-planRow-${coverageKey}`">
    <p
      v-if="displayLabel === true"
      class="text-[0.6875rem] uppercase font-normal text-[#878787] tracking-wide"
      :class="[isThemeSoventure ? 'group-hover:text-black' : '']"
    >
      {{ coverage.label }}
    </p>

    <div ref="displayValue" v-if="planCode">
      <!-- Medical Limit with multiple medical options -->
      <template
        v-if="
          coverage.label === 'Medical Limits' &&
          plan &&
          plan.type === 'Travel Medical' &&
          areThereMultipleMedicalOptions(planCode)
        "
      >
        <div class="text-sm font-semibold capitalized flex items-center min-h-6">
          <p>{{ getCurrentSelectedMedicalValue(planCode) }}</p>
          <div class="ml-1 flex flex-col items-center">
            <BaseCoverageMarker
              v-if="coverage.secondary"
              marker-type="Secondary"
            />
            <BaseCoverageMarker marker-type="OptionAvailable" />
          </div>
        </div>
      </template>
      <!-- Trip Interruption -->
      <template
        v-else-if="
          coverage.label === 'Trip Interruption' &&
          plan &&
          isCoverageAvailable(planCode, coverageKey) &&
          plan.type === 'Travel Medical'
        "
      >
        <!-- Medical plans' Interruption benefit is a wild card of information -->
        <!-- Let's just inform that user to go look at the details for more -->
        <div
          class="flex flex-row text-sm capitalized items-center font-semibold min-h-6"
        >
          <p>See details</p>
          <div class="ml-1">
            <BaseCoverageMarker marker-type="TripInterruption" />
          </div>
        </div>
      </template>
      <!-- Medical Evacuation -->
      <template
        v-else-if="
          coverage.label === 'Evacuation' &&
          plan &&
          isCoverageAvailable(planCode, 'emergencyMedicalEvacuation')
        "
      >
        <!-- emergencyMedicalEvacuation and evacuation are very different -->
        <!-- For Evacuation Plans, this is emergencyMedicalEvacuation is -->
        <!-- the expected grid data.-->
        <div
          class="flex flex-row text-sm capitalized items-center font-semibold min-h-6"
        >
          <p>{{ getPlanRowCoverageDisplay(plan, coverageKey) }}</p>
          <div class="ml-1 flex flex-col items-center">
            <BaseCoverageMarker
              v-if="coverage.secondary"
              marker-type="Secondary"
            />
            <BaseCoverageMarker
              v-if="displayMedicalEvacuationMarker"
              marker-type="AdditionalInfo"
            />
          </div>
        </div>
      </template>
      <!-- Duration, Evacuation To, Evacuation From, Evacuation Criteria should only be displayed on Evacuation plans -->
      <template
        v-else-if="
          evacuationSpecificCoverageKeys.includes(coverage.label) &&
          plan &&
          plan.type === 'Evacuation'
        "
      >
        <div class="text-sm capitalized lg:flex min-h-6">
          <UtilityHTMLRenderer
            is="p"
            class="utility-html-renderer text-sm capitalized inline"
            :content="getCoverageData(plan, coverageKey)"
          ></UtilityHTMLRenderer>
          <Secondary
            class="font-semibold capitalized inline"
            v-if="coverage.secondary"
          />
        </div>
      </template>
      <!-- Pre-Ex Waiver -->
      <template
        v-else-if="
          coverage.label === 'Pre-Ex Waiver' &&
          isCoverageAvailable(planCode, coverageKey)
        "
      >
        <!-- Pre-Ex Waiver is tricky. We don't want the user to believe it is just included -->
        <div
          v-if="plan && isCoverageAvailable(planCode, coverageKey)"
          class="flex flex-row text-sm capitalized items-center font-semibold min-h-6"
        >
          <p>See details</p>
          <div class="ml-1 flex flex-col items-center">
            <BaseCoverageMarker marker-type="PreEx" />
          </div>
        </div>

        <!-- If this plan does not have the coverage and an LTC exist for it, let's present it -->
        <div
          v-else-if="
            plan &&
            getCoverageLTCMessage(
              contentStore.getLTCSearchTerms(coverageKey),
              plan
            )
          "
          class="daisy-tooltip"
          :data-tip="
            getCoverageLTCMessage(
              contentStore.getLTCSearchTerms(coverageKey),
              plan
            )?.message
          "
        >
          <a class="text-xs text-color-action-alt-primary"
            >N/A*</a
          >
        </div>
      </template>
      <!-- Included Benefits -->
      <!-- We only want to display this when it is evacuation -->
      <div
        v-else-if="
          coverage.label === 'Included Benefits' &&
          plan &&
          (plan?.type === 'Evacuation' ||
            (isThemeSoventure && !showPlanDetailCoveredActivities))
        "
        class="min-h-6"
        :class="{
          'columns-1 max-h-80': isThemeSoventure,
        }"
      >
        <div
          :class="{
            'text-sm font-semibold capitalized': !isThemeSoventure,
            'text-xs font-semibold capitalized': isThemeSoventure,
          }"
        >
          <div class="text-sm font-semibold capitalized">
            {{ plan.includedBenefits?.length }}
            <span class="text-action-alt-primary">See List</span>
          </div>
        </div>
      </div>

      <!-- Included Benefits for SoVenture Theme only -->
      <div
        v-else-if="
          coverage.label === 'Included Benefits' &&
          plan &&
          isThemeSoventure &&
          plan.includedBenefits?.length > 0 &&
          showPlanDetailCoveredActivities
        "
        class="min-h-6"
        :class="{
          'columns-2 gap-5 max-h-80':
            plan.includedBenefits?.length > 4 && !isThemeSoventure,
          'columns-1 max-h-80': isThemeSoventure,
        }"
      >
        <div
          :class="{
            'text-sm font-semibold capitalized': !isThemeSoventure,
            'text-xs font-semibold capitalized': isThemeSoventure,
          }"
        >
          <div class="text-sm font-semibold capitalized">
            {{ plan.includedBenefits?.length }}
            <span class="qr-text-info">See List</span>
          </div>
        </div>
      </div>

      <!-- Covered Activities -->
      <div
        v-else-if="
          coverage.label === 'Covered Activities' &&
          plan &&
          isThemeSoventure &&
          plan.coveredActivities?.length > 0 &&
          showPlanDetailCoveredActivities
        "
        class="min-h-6"
        :class="{
          'columns-2 gap-5 max-h-80':
            plan.includedBenefits?.length > 4 && !isThemeSoventure,
          'columns-1 max-h-80': isThemeSoventure,
        }"
      >
        <div class="text-sm font-semibold capitalized">
          {{ plan.coveredActivities?.length }}
          <span class="qr-text-info">See List</span>
        </div>
      </div>

      <!-- Accidental Death -->
      <template
        v-else-if="
          coverage.label === 'Accidental Death' &&
          plan &&
          (isCoverageAvailable(planCode, coverageKey) ||
            isPlanFlightOnly(planCode)) &&
          doesADDHaveValue
        "
      >
        <div
          v-if="!areADDOptionsAvailable(planCode)"
          class="text-xs capitalized lg:flex relative min-h-6"
        >
          <div
            class="flex flex-row text-sm capitalized items-center font-semibold capitalized"
          >
            <p v-if="ADDDisplayHaveAlpha">See details</p>
            <p v-else>
              {{
                getPlanRowCoverageDisplay(
                  plan,
                  isPlanFlightOnly(planCode)
                    ? 'accidentalDeathFlight'
                    : coverageKey
                )
              }}
            </p>
            <div class="ml-1 flex flex-col items-center">
              <BaseCoverageMarker v-if="displayADMarker" marker-type="AD&D" />
              <BaseCoverageMarker
                v-if="isPlanFlightOnly(planCode)"
                marker-type="FlightOnly"
              />
            </div>
          </div>
        </div>

        <div
          v-else-if="areADDOptionsAvailable(planCode)"
          class="text-sm font-semibold items-center flex flex-row min-h-6"
        >
          <p>See details</p>
          <div class="ml-1 flex flex-col items-center">
            <BaseCoverageMarker marker-type="AD&D" />
            <BaseCoverageMarker
              v-if="isPlanFlightOnly(planCode)"
              marker-type="FlightOnly"
            />
          </div>
        </div>
      </template>

      <!-- If none of the conditions above were hit, let's just go by the limits present -->
      <div v-else-if="Array.isArray(coverage.value)">
        <p
          v-for="(text, index) in coverage.value"
          class="text-sm font-semibold capitalized"
          :key="index"
        >
          {{ text }}
        </p>
      </div>
      <div
        v-else-if="coverage.value"
        class="text-sm font-semibold capitalized flex items-center min-h-6"
      >
        <p class="text-sm">
          {{ coverage.value }}
        </p>
        <BaseCoverageMarker
          class="ml-1"
          v-if="coverage.secondary"
          marker-type="Secondary"
        />
      </div>
      <!-- Sorry bro... The coverage just isn't here -->
      <p
        v-else-if="plan?.type === 'Evacuation'"
        class="min-h-6 text-[0.688rem] font-bold"
      >
        <span class="qr-text-excluded">X</span> {{ coverage.label }}
      </p>
      <div v-else class="items-center flex flex-row min-h-6 text-xs">
        <p><span class="qr-text-excluded">X</span> Not included</p>
      </div>
    </div>

    <div
      v-else-if="!planCode && coverage.value === 'loader'"
      class="w-2/4 bg-imt-grey h-2 rounded-md animate-pulse"
    ></div>
  </div>
</template>

<style lang="scss" scoped>
  #quote-results-app {
    .pre-ex.daisy-tooltip::before {
      left: -3%;
    }
  }
</style>
