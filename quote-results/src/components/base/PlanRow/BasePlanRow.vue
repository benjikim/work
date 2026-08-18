<script setup lang="ts">
  import { QuoteResult, CoverageText, Coverage, GAObject } from '@/types/index';
  import { PropType, ref, computed } from 'vue';
  import { useContentStore } from '@/store/content';
  import { useThemeStore } from '@/store/theme';
  import {
    formatCurrency,
    getCoverageDataDetails,
    areThereMultipleMedicalOptions,
    getCoverageDetails,
    isPlanFlightOnly,
    removeHTMLTags,
    getCoverageData,
    areADDOptionsAvailable,
  } from '@/utility/index.ts';
  import BaseCoverageText from '@/components/base/PlanRow/BaseCoverageText.vue';
  import PlanActions from '@/components/shared/PlanActions.vue';
  import PlanTag from '@/components/base/PlanRow/PlanTag.vue';
  import BaseReview from '@/components/base/PlanRow/BaseReview.vue';
  import { useUserSessionStore } from '@/store/userSession';
  import { event } from 'vue-gtag';
  import PlanRowDrawer from '@/components/base/PlanRow/Drawer/PlanRowDrawer.vue';
  import { useApiStore } from '@/store/api';

  const contentStore = useContentStore();
  const sessionStore = useUserSessionStore();
  const apiStore = useApiStore();
  const themeStore = useThemeStore();


  const props = defineProps({
    plan: {
      type: Object as PropType<QuoteResult>,
      required: false,
    },
  });

  const getPlanLogo = (planCode: string) => {
    return contentStore.getPlanLogo(planCode);
  };

  const isModeEdu = computed(() => themeStore.isModeEdu);
  const findCoverage = (coverageId: string) => {
    return props.plan?.coverages.find(
      (coverage: Coverage) => coverage.id === coverageId
    );
  };

  const coverageArrayKeys = Object.keys(contentStore.getCoverageLabels);
  // A map of values for our coverage details.
  /**
   * 'medical': {
   *   value: '$100,000',
   *   secondary: false,
   *   label: 'Medical Limits'
   * }
   */
  const coverageMap = coverageArrayKeys.reduce((acc: any, item: string) => {
    const coverage = findCoverage(item);
    let value;

    if (coverage?.limits) {
      const coverageType = coverage?.limits[0]?.valueType ?? false;
      value = coverage?.limits[0]?.coverageValue ?? false;

      if (coverageType === 'limit') {
        value = formatCurrency(value, 0);
      } else if (coverageType === 'percentage') {
        value = `${value}%`;
      } else if (coverageType === 'days') {
        value = `${value} Days`;
      } else if (coverageType === 'years') {
        value = `${value} Years`;
      } else if (coverageType === 'months') {
        value = `${value} Months`;
      }
    }

    acc[item] = {
      value: value,
      secondary: coverage?.secondary ?? false,
      label:
        contentStore.getCoverageLabels[
          item as keyof typeof contentStore.getCoverageLabels
        ],
    };
    return acc;
  }, {});

  let planCoverages = ref<CoverageText[][]>([[]]);

  if (!props.plan) {
    planCoverages = ref<CoverageText[][]>([
      [
        {
          label: coverageMap.medical.label,
          value: 'loader',
          secondary: coverageMap.medical.secondary,
        },
        {
          label: coverageMap.emergencyMedicalEvacuation.label,
          value: 'loader',
          secondary: coverageMap.emergencyMedicalEvacuation.secondary,
        },
      ],
      [
        {
          label: coverageMap.tripInterruption.label,
          value: 'loader',
          secondary: coverageMap.tripInterruption.secondary,
        },
        {
          label: coverageMap.tripCancellation.label,
          value: 'loader',
          secondary: coverageMap.tripCancellation.secondary,
        },
        {
          label: coverageMap.travelDelay.label,
          value: 'loader',
          secondary: coverageMap.travelDelay.secondary,
        },
      ],
      [
        {
          label: coverageMap.baggageDelay.label,
          value: 'loader',
          secondary: coverageMap.baggageDelay.secondary,
        },
        {
          label: coverageMap.baggage.label,
          value: 'loader',
          secondary: coverageMap.baggage.secondary,
        },
        {
          label: coverageMap.accidentalDeath24Hour.label,
          value: 'loader',
          secondary: coverageMap.accidentalDeath24Hour.secondary,
        },
      ],
      [
        {
          label: coverageMap.preExPeriod.label,
          value: 'loader',
          secondary: coverageMap.preExPeriod.secondary,
        },
        {
          label: coverageMap.preExWaiver.label,
          value: 'loader',
          secondary: coverageMap.preExWaiver,
        },
      ],
    ]);
  } else if (props.plan?.type === 'Evacuation') {
    planCoverages = ref<CoverageText[][]>([
      [
        {
          label: coverageMap.emergencyMedicalEvacuation.label,
          value: coverageMap.emergencyMedicalEvacuation.value,
          secondary: coverageMap.emergencyMedicalEvacuation.secondary,
        },
        {
          label: coverageMap.duration.label,
          value: coverageMap.duration.value,
          secondary: coverageMap.duration.secondary,
        },
      ],
      [
        {
          label: coverageMap.evacFrom.label,
          value: coverageMap.evacFrom.value,
          secondary: coverageMap.evacFrom.secondary,
        },
        {
          label: coverageMap.evacTo.label,
          value: coverageMap.evacTo.value,
          secondary: coverageMap.evacTo.secondary,
        },
      ],
      [
        {
          label: coverageMap.evacCriteria.label,
          value: coverageMap.evacCriteria.value,
          secondary: coverageMap.evacCriteria.secondary,
        },
      ],
      [
        {
          label: coverageMap.includedBenefits.label,
          value: coverageMap.includedBenefits.value,
          secondary: coverageMap.includedBenefits.secondary,
        },
      ],
    ]);
  } else {
    planCoverages = ref<CoverageText[][]>([
      [
        {
          label: coverageMap.medical.label,
          value: coverageMap.medical.value,
          secondary: coverageMap.medical.secondary,
        },
        {
          label: coverageMap.emergencyMedicalEvacuation.label,
          value: coverageMap.emergencyMedicalEvacuation.value,
          secondary: coverageMap.emergencyMedicalEvacuation.secondary,
        },
      ],
      [
        {
          label: coverageMap.tripCancellation.label,
          value: coverageMap.tripCancellation.value,
          secondary: coverageMap.tripCancellation.secondary,
        },
        {
          label: coverageMap.tripInterruption.label,
          value: coverageMap.tripInterruption.value,
          secondary: coverageMap.tripInterruption.secondary,
        },
      ],
      [
        {
          label: coverageMap.travelDelay.label,
          value: coverageMap.travelDelay.value,
          secondary: coverageMap.travelDelay.secondary,
        },
        {
          label: coverageMap.baggage.label,
          value: coverageMap.baggage.value,
          secondary: coverageMap.baggage.secondary,
        },
      ],
      [
        {
          label: coverageMap.baggageDelay.label,
          value: coverageMap.baggageDelay.value,
          secondary: coverageMap.baggageDelay.secondary,
        },
        {
          label: coverageMap.accidentalDeath24Hour.label,
          value: coverageMap.accidentalDeath24Hour.value,
          secondary: coverageMap.accidentalDeath24Hour.secondary,
        },
      ],
      [
        {
          label: coverageMap.preExPeriod.label,
          value: coverageMap.preExPeriod.value,
          secondary: coverageMap.preExPeriod.secondary,
        },
        {
          label: coverageMap.preExWaiver.label,
          value: coverageMap.preExWaiver.value,
          secondary: coverageMap.preExWaiver.secondary,
        },
      ],
    ]);
  }

  const atEnd = ref(false);
  const scrollContainer = ref<HTMLDivElement | null>(null);
  const isDrawerOpen = ref(false);

  const showPlanDetailCoveredActivities = computed(() =>
    apiStore.getFFValue('cms_20250522_soventure_covered_activities')
  );

  const handleOpenDrawer = (plan?: QuoteResult) => {
    if (!plan) return;
    isDrawerOpen.value = !isDrawerOpen.value;
    sessionStore.setScrollPlanCode(plan.code);

    event('plan_action_plan_details_drawer', {
      hierarchical_layer_1: 'Plan Details Clicked',
      hierarchical_layer_2: `Plan Code ${plan.code}`,
      hierarchical_layer_4: 'Quote Results Page',
    } as GAObject);
  };

  const handleScroll = () => {
    const el = scrollContainer.value;
    if (!el) return;

    const threshold = 1; // px wiggle room
    const scrolledToEnd =
      el.scrollWidth - el.scrollLeft - el.clientWidth <= threshold;
    atEnd.value = scrolledToEnd;
  };

  /**
   * Sets tooltip id in session store.
   */
  const openCoverageToolTip = (
    coverageDisplayValue: string,
    coverage: CoverageText
  ) => {
    const key = contentStore.getCoverageKeyByLabel(coverage.label);
    sessionStore.setFilterToolTipId(key);
    const toolTipData = contentStore.getFilterData(
      sessionStore.getFilterToolTipId
    );

    event('plan_action_plan_details_modal', {
      hierarchical_layer_1: 'Plan Row Details Clicked',
      hierarchical_layer_2: `Plan Code ${props?.plan?.code}`,
      hierarchical_layer_3: `Plan Row Section ${contentStore.getCoverageKeyByLabel(coverage.label)} Clicked`,
      hierarchical_layer_4: coverageDisplayValue,
    } as GAObject);

    const toolTipDataPlans = toolTipData.toolTipSecondaryPlans;

    if (toolTipDataPlans !== '' && typeof toolTipDataPlans === 'string') {
      const PlanCodesShowModalDeta = toolTipDataPlans
        .replace(/\s+/g, '')
        .split(',');
      if (
        props?.plan?.code &&
        PlanCodesShowModalDeta.includes(props.plan.code)
      ) {
        sessionStore.setFilterToolTipModalPlanShow(true);
      } else {
        sessionStore.setFilterToolTipModalPlanShow(false);
      }
    }

    // Removing any existing highlighted coverage information.
    contentStore.removeHighlightedCoverageInformation();
    if (coverage.secondary) {
      contentStore.setHighlightedCoverageInformation({
        heading: 'Secondary Coverage',
        markerType: 'Secondary',
        description:
          'This coverage will be paid after any other Primary collectible insurance has paid the claim and the Primary policy limits have been exhausted.',
      });
    }

    if (props.plan && key === 'emergencyMedicalEvacuation') {
      const coverageDetails = getCoverageDetails(
        props.plan,
        'emergencyMedicalEvacuation'
      );
      const labels = getCoverageDataDetails(props.plan, key);
      if (
        (coverageDetails.length > 0 && coverageDetails[0].description) ||
        labels.length > 1
      ) {
        contentStore.setHighlightedCoverageInformation({
          heading:
            labels.length === 1 ? labels.join(' ') : labels.slice(1).join(' '),
          markerType: 'AdditionalInfo',
          description: null,
        });
      }
    }

    if (
      props.plan &&
      key === 'medical' &&
      areThereMultipleMedicalOptions(props.plan.code)
    ) {
      contentStore.setHighlightedCoverageInformation({
        heading: 'This plan has options, see details',
        markerType: 'OptionAvailable',
        description: null,
      });
    }

    if (props.plan && key === 'accidentalDeath24Hour') {
      const planFlight = isPlanFlightOnly(props.plan.code);
      const ADDOptionsAvailable = areADDOptionsAvailable(props.plan.code);
      // Display flight only text
      if (planFlight) {
        contentStore.setHighlightedCoverageInformation({
          heading: 'Flight Only',
          markerType: 'FlightOnly',
          description: null,
        });
      }

      if (ADDOptionsAvailable) {
        contentStore.setHighlightedCoverageInformation({
          heading: 'This plan has accidental death options, see details',
          markerType: 'AD&D',
          description: null,
        });
      }
    }

    if (props.plan && key === 'preExWaiver') {
      const description = removeHTMLTags(getCoverageData(props.plan, key));
      if (description !== '-') {
        contentStore.setHighlightedCoverageInformation({
          heading: 'Pre-Ex Waiver',
          markerType: 'PreEx',
          description,
        });
      }
    }

    if (
      props.plan &&
      key === 'tripInterruption' &&
      props.plan.type === 'Travel Medical'
    ) {
      contentStore.setHighlightedCoverageInformation({
        heading: 'See details for more trip interruption info',
        markerType: 'TripInterruption',
        description: null,
      });
    }

    sessionStore.setFilterToolTipModalOpen(true);
  };

  const handleCoverageClick = (
    coverageDisplayValue: string,
    coverage: CoverageText
  ) => {
    const isNewPlanDetailsDrawerEnabled = apiStore.getFFValue(
      'website_20260121_enable_new_plan_row_details_us_release'
    );

    if (coverage?.label === 'Included Benefits' && props?.plan?.code) {
      if (isNewPlanDetailsDrawerEnabled) {
        if (!isDrawerOpen.value) {
          handleOpenDrawer(props.plan);
        }

        sessionStore.setScrollToPlanDetailSection('.tr_included_benefits');
        return;
      }

      sessionStore.setPlanCodeForModal(props.plan.code);
      sessionStore.setScrollToPlanDetailSection('.tr_included_benefits');
      sessionStore.setModalCurrentState(true);
      sessionStore.setActivePlanDetailsTab('coverageLimits');

      event('plan_action_plan_row', {
        hierarchical_layer_1: `Plan Row Clicked ${coverage?.label}`,
        hierarchical_layer_2: `Plan Code ${props?.plan?.code}`,
        hierarchical_layer_4: 'Quote Results Page',
      } as GAObject);
    } else if (coverage?.label === 'Covered Activities' && props?.plan?.code) {
      if (isNewPlanDetailsDrawerEnabled) {
        if (!isDrawerOpen.value) {
          handleOpenDrawer(props.plan);
        }

        sessionStore.setScrollToPlanDetailSection('.tr_covered_activities');
        return;
      }

      sessionStore.setPlanCodeForModal(props.plan.code);
      sessionStore.setModalCurrentState(true);
      sessionStore.setActivePlanDetailsTab('coveredActivities');

      event('plan_action_plan_row', {
        hierarchical_layer_1: `Plan Row Clicked ${coverage?.label}`,
        hierarchical_layer_2: `Plan Code ${props.plan.code}`,
        hierarchical_layer_4: 'Quote Results Page',
      } as GAObject);
    } else if (coverage?.label !== 'Included Benefits') {
      openCoverageToolTip(coverageDisplayValue, coverage);
    }
  };
</script>

<template>
  <div
    class="grid grid-cols-18 w-full rounded-md mb-5 lg:mb-7 transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(39,54,74,0.08)]"
    :class="{
      border: plan,
    }"
  >
    <div
      class="col-span-18 grid grid-cols-18"
      :class="
        isDrawerOpen
          ? 'plan-row-sticky-summary md:sticky md:top-0 md:z-30 md:self-start bg-white md:isolate md:shadow-[0_10px_24px_rgba(15,23,42,0.12)]'
          : ''
      "
    >
      <div
        class="col-span-18 md:col-span-13 p-3 md:px-3 md:pb-3 md:pr-0 md:pt-[0.375rem]"
      >
        <div v-if="plan" class="col-span-12 md:p-0 md:pt-[0.375rem]">
          <PlanTag
            :type="isModeEdu ? 'EDU' : plan?.type"
            :plan-code="plan.code"
          />
        </div>
        <div class="grid grid-cols-12">
          <!-- Plan Header -->
          <div class="col-span-12">
            <div
              class="grid grid-cols-12 gap-[0.625rem] pb-1 md:pb-2 md:border-b md:border-[#DEDEDE] md:grid-cols-5"
            >
              <div
                class="col-span-3 md:col-span-1 mx-2 flex justify-center items-center"
              >
                <img
                  v-if="plan"
                  class="w-auto max-h-11"
                  :src="getPlanLogo(plan.code)"
                  :alt="`${plan.provider.name} Logo`"
                />
                <span
                  v-else
                  class="w-32 bg-imt-grey h-16 rounded-md animate-pulse inline-block"
                ></span>
              </div>
              <div
                class="col-span-9 md:col-span-4 font-bold flex flex-col justify-between text-base whitespace-nowrap md:whitespace-normal"
              >
                <template v-if="plan">
                  <p>{{ plan.name }}</p>
                  <div
                    class="flex flex-col items-start md:flex-row md:justify-between"
                    :data-cy="`plan-type__label-${plan.code}`"
                  >
                    <BaseReview :plan-code="plan.code" />
                  </div>
                </template>
                <template v-else>
                  <span
                    class="w-full bg-imt-grey h-8 rounded-md animate-pulse inline-block"
                  ></span>
                </template>
              </div>
            </div>

            <!-- Plan Actions -->
            <div v-if="plan" class="col-span-12 md:display-none">
              <PlanActions
                :plan="plan"
                :modal="false"
                :on-see-details-click="() => handleOpenDrawer(plan)"
                :is-details-open="isDrawerOpen"
              />
            </div>
            <!-- Plan Coverages -->
            <div class="relative">
              <div
                ref="scrollContainer"
                class="overflow-auto xl:overflow-visible"
                @scroll="handleScroll"
              >
                <div
                  v-if="plan"
                  class="grid gap-1 grid-flow-col auto-cols-[minmax(8rem,_1fr)]"
                  :class="{
                    'xl:grid-cols-4': plan?.type === 'Evacuation',
                    'xl:grid-cols-5': plan?.type !== 'Evacuation',
                  }"
                >
                  <div
                    v-for="(col, index) in planCoverages"
                    :key="index"
                    class="pt-2"
                  >
                    <BaseCoverageText
                      class="pb-2"
                      v-for="(coverage, i) in col"
                      :key="i"
                      :coverage="coverage"
                      :plan-code="plan?.code"
                      @select="(value) => handleCoverageClick(value, coverage)"
                    />
                  </div>
                </div>
              </div>
              <div
                v-if="!atEnd"
                class="xl:display-none pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white to-transparent"
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-span-12 md:col-span-5 md:px-3 md:pb-3 h-full">
        <div class="grid grid-cols-12 h-full">
          <div
            v-if="plan"
            class="md:col-span-12 md:flex flex-col justify-center p-2 display-none h-full sm:min-w-[12.5rem] md:min-w-fit"
          >
            <PlanActions
              :plan="plan"
              :modal="false"
              :on-see-details-click="() => handleOpenDrawer(plan)"
              :is-details-open="isDrawerOpen"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- Plan Row Drawer -->
    <PlanRowDrawer
      v-if="plan"
      :is-open="isDrawerOpen"
      :plan="plan"
      :show-plan-detail-covered-activities="
        Boolean(showPlanDetailCoveredActivities)
      "
      :close-drawer="() => handleOpenDrawer(plan)"
    />
  </div>
</template>

<style lang="scss">
  .plan-row-sticky-summary {
    @media (min-width: 768px) {
      position: sticky;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: auto;
        bottom: -24px;
        left: 0;
        right: 0;
        height: 24px;
        background: linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0.98),
          rgba(255, 255, 255, 0)
        );
        pointer-events: none;
      }
    }
  }
</style>
