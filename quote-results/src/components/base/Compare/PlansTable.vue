<script setup lang="ts">
  import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
  import { event } from 'vue-gtag';
  import { useUserSessionStore } from '@/store/userSession';
  import { useThemeStore } from '@/store/theme';
  import { useContentStore } from '@/store/content';
  import AdditionalOptions from '@/components/options/AdditionalOptions.vue';
  import { useApiStore } from '@/store/api';
  import { GAObject } from '@/types';
  import IncludedBenefitsTableRows from '@/components/base/Compare/IncludedBenefitsTableRows.vue';
  import CoveredActivitiesTableRow from '@/components/shared/CoveredActivitiesTableRow.vue';
  import CoverageTableRows from '@/components/base/Compare/CoverageTableRows.vue';
  import CoverageLabelToolTip from '@/components/shared/CoverageLabelToolTip.vue';
  import PlanTableHeader from '@/components/base/Compare/PlanTableHeader.vue';
  import BaseReview from '@/components/base/PlanRow/BaseReview.vue';
  import { ChevronDownIcon } from '@heroicons/vue/24/solid';
  import { ChevronUpIcon } from '@heroicons/vue/24/solid';
  import CertificateLink from '@/components/shared/CertificateLink.vue';

  const userSessionStore = useUserSessionStore();
  const contentStore = useContentStore();
  const themeStore = useThemeStore();
  const apiStore = useApiStore();
  const planCodes = computed(() => userSessionStore.getSelectedPlansForCompare);
  const coverageLimitMap = computed(() => contentStore.getCoverageLimitsMap);
  const isMobile = computed(() => userSessionStore.isMobileView);
  const isThemeSoventure = computed(() => themeStore.isThemeSoventure);
  const isComparePage = window.location.pathname.includes('compare');

  const show = ref(coverageLimitMap.value.map(() => true));
  const handleMobileShow = () => {
    if (userSessionStore.isMobileView) {
      // First three are the coverages we want to show in mobile
      for (let index = 3; index < show.value.length; index++) {
        show.value[index] = false;
      }
    }
  };
  handleMobileShow();
  watch(coverageLimitMap, () => {
    handleMobileShow();
  });
  /**
   * Toggles the accordion state.
   */
  const handleAccordion = (index: number) => {
    show.value[index] = !show.value[index];
  };

  const getPlan = (planCode: string) => {
    return apiStore.getPlanByPlanCode(planCode);
  };

  const isEvacPlanIncluded = computed(() =>
    planCodes.value.some((planCode) => getPlan(planCode)?.type === 'Evacuation')
  );

  const isMedPlanIncluded = computed(() =>
    planCodes.value.some(
      (planCode) => getPlan(planCode)?.type === 'Travel Medical'
    )
  );

  const coveredActivitiesArray = computed(() => {
    if (!isThemeSoventure.value) {
      return [];
    }
    const temp = new Set();
    planCodes.value.forEach((planCode: string) => {
      const plan = apiStore.getPlanByPlanCode(planCode);
      plan?.coveredActivities.forEach((coveredActivity: string) => {
        temp.add(coveredActivity);
      });
    });
    return [...temp].sort((a: any, b: any) =>
      a[0].localeCompare(b[0], undefined, { sensitivity: 'base' })
    );
  });

  const evacuationSpecificSection = contentStore.getEvacuationSpecificMap;
  const medicalSpecificSection = contentStore.getMedicalSpecificMap;

  const scrollLeft = ref(0);
  const headerScrollRef = ref<HTMLElement | null>(null);
  const bodyScrollRef = ref<HTMLElement | null>(null);
  const sessionStore = useUserSessionStore();

  const isScrolledToRight = ref(false);
  const showRating = ref(true);
  const hasStickyHeaderShadow = ref(false);
  const pendingScrollRestore = ref<{ top: number; left: number } | null>(null);

  const handleBodyScroll = () => {
    const bodyEl = bodyScrollRef.value;
    const headerEl = headerScrollRef.value;
    if (!bodyEl) return;

    scrollLeft.value = bodyEl.scrollLeft;

    // detect if user reached the right edge
    const maxScrollLeft = bodyEl.scrollWidth - bodyEl.clientWidth;
    isScrolledToRight.value = bodyEl.scrollLeft >= maxScrollLeft - 2;

    // sync header horizontal scroll
    if (headerEl && headerEl.scrollLeft !== bodyEl.scrollLeft) {
      headerEl.scrollLeft = bodyEl.scrollLeft;
    }
  };

  // optional: keep sync if header is scrolled (e.g., user drags header)
  const handleHeaderScroll = () => {
    const bodyEl = bodyScrollRef.value;
    const headerEl = headerScrollRef.value;
    if (!bodyEl || !headerEl) return;

    if (bodyEl.scrollLeft !== headerEl.scrollLeft) {
      bodyEl.scrollLeft = headerEl.scrollLeft;
    }
  };

  const toggleRating = () => {
    showRating.value = !showRating.value;
  };

  const updateStickyHeaderShadow = () => {
    const headerEl = headerScrollRef.value;
    const bodyEl = bodyScrollRef.value;

    if (!headerEl || !bodyEl) {
      hasStickyHeaderShadow.value = false;
      return;
    }

    const headerRect = headerEl.getBoundingClientRect();
    const bodyRect = bodyEl.getBoundingClientRect();
    hasStickyHeaderShadow.value = bodyRect.top < headerRect.bottom - 1;
  };

  onMounted(() => {
    window.addEventListener('scroll', updateStickyHeaderShadow, {
      passive: true,
    });
    window.addEventListener('resize', updateStickyHeaderShadow);
    updateStickyHeaderShadow();
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', updateStickyHeaderShadow);
    window.removeEventListener('resize', updateStickyHeaderShadow);
  });

  const trackCertificateClick = (planCode: string) => {
    event('plan_action_plan_details_modal', {
      hierarchical_layer_1: 'View Certificate Clicked',
      hierarchical_layer_2: `Plan Code ${planCode}`,
      hierarchical_layer_4: 'Compare Page',
    } as GAObject);
  };

  const handleRemoveButtonSelection = (planCode: string) => {
    pendingScrollRestore.value = {
      top: window.scrollY,
      left: bodyScrollRef.value?.scrollLeft ?? 0,
    };
    sessionStore.removePlanFromCompare(planCode);
  };

  watch(
    planCodes,
    async () => {
      if (!pendingScrollRestore.value) return;

      const target = pendingScrollRestore.value;
      pendingScrollRestore.value = null;
      await nextTick();

      window.scrollTo({
        top: target.top,
        behavior: 'auto',
      });

      if (bodyScrollRef.value) {
        bodyScrollRef.value.scrollLeft = target.left;
      }

      if (headerScrollRef.value) {
        headerScrollRef.value.scrollLeft = target.left;
      }

      updateStickyHeaderShadow();
    },
    { flush: 'post' }
  );
</script>

<template>
  <div
    class="relative w-[100vw] max-w-none left-1/2 -translate-x-1/2 pl-0 lg:pl-[2vw]"
  >
    <div
      ref="headerScrollRef"
      class="sticky top-0 z-30 bg-white w-full overflow-x-auto md:pt-[6%] lg:pt-[4%]"
      :class="[
        isMobile ? 'no-scrollbar' : '',
        hasStickyHeaderShadow ? 'compare-sticky-header--shadow' : '',
      ]"
      @scroll="handleHeaderScroll"
    >
      <table
        class="daisy-table table-fixed border-separate w-max min-w-max mx-auto mb-0"
      >
        <colgroup>
          <col v-if="!isMobile" class="md:w-[211px]" />
          <template
            v-for="(_planCode, _idx) in planCodes"
            :key="'header-col-' + _idx"
          >
            <col class="w-[190px] md:w-[311px]" />
          </template>
        </colgroup>
        <thead class="sticky top-[56px] z-20 bg-white">
          <tr>
            <th
              class="display-none md:table-cell snap-center p-0 bg-white md:w-[211px]"
            ></th>
            <th
              v-for="(planCode, index) in planCodes"
              :key="'header-' + index"
              class="p-0 min-w-[190px] md:w-[311px] snap-center bg-white"
            >
              <PlanTableHeader
                :plan-code="planCode"
                :is-mobile="isMobile"
                @remove="handleRemoveButtonSelection"
              />
            </th>
          </tr>
        </thead>
      </table>
    </div>

    <!-- BODY SCROLL WRAPPER -->
    <div ref="bodyScrollRef" class="overflow-x-auto" @scroll="handleBodyScroll">
      <div
        v-if="!isScrolledToRight && isMobile"
        class="compare-shadow-right pointer-events-none"
      ></div>

      <table
        class="daisy-table table-fixed border-separate pb-[90px] border-spacing-0 plans-table w-max min-w-max mx-auto"
      >
        <colgroup>
          <col v-if="!isMobile" class="md:w-[211px]" />
          <template
            v-for="(_planCode, _idx) in planCodes"
            :key="'body-col-' + _idx"
          >
            <col class="w-[190px] md:w-[311px]" />
          </template>
        </colgroup>

        <tbody>
          <tr
            class="compare-section-header w-full cursor-pointer transition-colors duration-200 hover:bg-[rgba(135,135,135,0.2)]"
            @click="toggleRating"
          >
            <th
              v-for="(_, j) in userSessionStore.isMobileView ? planCodes : [null]"
              :key="`rating-header-${j}`"
              :colspan="1"
              class="py-3"
            >
              <div class="flex items-center justify-center gap-2">
                <p class="text-imt-black text-center text-xs md:text-sm uppercase tracking-[0.08em]">
                  Plan Summary
                </p>
                <ChevronUpIcon
                  v-if="showRating"
                  class="size-5 stroke-[#878787] fill-[#878787]"
                />
                <ChevronDownIcon
                  v-else
                  class="size-5 stroke-[#878787] fill-[#878787]"
                />
              </div>
            </th>
            <th
              v-if="!userSessionStore.isMobileView"
              :colspan="planCodes.length"
              class="py-3"
            ></th>
          </tr>

          <Transition
            enter-active-class="transition-none"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-[200px] opacity-100"
            leave-active-class="transition-none"
            leave-from-class="max-h-[200px] opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
            <tr v-if="showRating" class="align-top text-center">
              <th
                scope="row"
                v-if="!isMobile"
                class="text-xs text-left md:table-cell align-top"
              >
                <span class="font-normal text-[#878787] uppercase pr-1">
                  Overall Rating
                </span>
              </th>
              <td
                v-for="planCode in planCodes"
                :key="'rating-' + planCode"
                class="snap-center align-top !text-left"
              >
                <BaseReview class="inline-block" :plan-code="planCode" />
              </td>
            </tr>
          </Transition>

          <Transition
            enter-active-class="transition-none"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-[200px] opacity-100"
            leave-active-class="transition-none"
            leave-from-class="max-h-[200px] opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
            <tr v-if="showRating" class="align-top text-center">
              <th
                scope="row"
                v-if="!isMobile"
                class="text-xs text-left md:table-cell align-top"
              >
                <span class="font-normal text-[#878787] uppercase pr-1">
                  View Certificate
                </span>
              </th>
              <td
                v-for="planCode in planCodes"
                :key="'certificate-' + planCode"
                class="snap-center align-top !text-left"
              >
                <CertificateLink
                  :plan-code="planCode"
                  :is-compare-page="true"
                  :data-cy="`plan-action__certificate__link-details-${planCode}`"
                  class="text-xs font-bold text-action-alt-primary"
                  :track-certificate-click="() => trackCertificateClick(planCode)"
                />
              </td>
            </tr>
          </Transition>

          <template
            v-for="(section, i) in coverageLimitMap"
            :key="section.header"
          >
            <!-- Section title row -->
            <tr
              v-if="section.header.toLowerCase() !== 'plan info'"
              class="compare-section-header w-full cursor-pointer transition-colors duration-200 hover:bg-[rgba(135,135,135,0.2)]"
              @click="handleAccordion(i)"
            >
              <!-- first cell -->
              <th
                v-for="(_, j) in userSessionStore.isMobileView
                  ? planCodes
                  : [null]"
                :key="j"
                :colspan="1"
                class="py-3"
              >
                <div class="flex justify-center w-full items-center gap-2">
                  <p
                    class="text-imt-black text-center text-xs md:text-sm uppercase tracking-[0.08em]"
                  >
                    {{ section.header }}
                  </p>
                  <ChevronUpIcon
                    v-if="show[i]"
                    class="size-5 stroke-[#878787] fill-[#878787] cursor-pointer"
                  />
                  <ChevronDownIcon
                    v-else
                    class="size-5 stroke-[#878787] fill-[#878787] cursor-pointer"
                  />
                </div>
              </th>

              <!-- filler cell for desktop -->
              <th
                v-if="!userSessionStore.isMobileView"
                :colspan="planCodes.length"
                class="h-7 py-1"
              ></th>
            </tr>

            <!-- Evacuation special rows -->
            <Transition
              v-if="isEvacPlanIncluded && section.header === 'Evacuation'"
              v-for="evacCoverage in evacuationSpecificSection"
              :key="evacCoverage.key"
              enter-active-class="transition-none"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-[200px] opacity-100"
              leave-active-class="transition-none"
              leave-from-class="max-h-[200px] opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <tr v-if="show[i]">
                <th
                  scope="row"
                  v-if="!isMobile"
                  class="text-xs text-left md:table-cell align-top"
                >
                  <CoverageLabelToolTip
                    :tool-tip-text="evacCoverage.toolTipText"
                    :mobile-modal-heading="evacCoverage.label"
                    tool-tip-position="right"
                    underline-label
                  >
                    <span class="font-normal text-[#878787] uppercase pr-1">
                      {{ evacCoverage.label }}
                    </span>
                  </CoverageLabelToolTip>
                </th>

                <td
                  v-for="planCode in planCodes"
                  :key="`${planCode}-${evacCoverage.key}`"
                  class="snap-center align-top !text-left"
                >
                  <CoverageTableRows
                    :plan-code="planCode"
                    :coverage="evacCoverage"
                    option-location="comparePage"
                  />
                </td>
              </tr>
            </Transition>

            <!-- Pre-Existing Conditions special rows -->

            <Transition
              v-else-if="
                isMedPlanIncluded &&
                section.header === 'Pre-Existing Conditions'
              "
              v-for="preExCoverage in medicalSpecificSection"
              :key="preExCoverage.key"
              enter-active-class="transition-none"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-[200px] opacity-100"
              leave-active-class="transition-none"
              leave-from-class="max-h-[200px] opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <tr v-if="show[i]">
                <th
                  scope="row"
                  v-if="!isMobile"
                  class="text-xs text-left md:table-cell align-top"
                >
                  <CoverageLabelToolTip
                    :tool-tip-text="preExCoverage.toolTipText"
                    :mobile-modal-heading="preExCoverage.label"
                    tool-tip-position="right"
                    underline-label
                  >
                    <span class="font-normal text-[#878787] uppercase pr-1">
                      {{ preExCoverage.label }}
                    </span>
                  </CoverageLabelToolTip>
                </th>

                <td
                  v-for="planCode in planCodes"
                  :key="`${planCode}-${preExCoverage.key}`"
                  class="snap-center align-top !text-left"
                >
                  <CoverageTableRows
                    :plan-code="planCode"
                    :coverage="preExCoverage"
                    option-location="comparePage"
                  />
                </td>
              </tr>
            </Transition>

            <!-- Generic coverage rows -->

            <Transition
              v-else-if="section.coverages.length > 0"
              v-for="coverage in section.coverages"
              :key="coverage.key"
              enter-active-class="transition-none"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-[200px] opacity-100"
              leave-active-class="transition-none"
              leave-from-class="max-h-[200px] opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <tr v-if="show[i]">
                <th
                  scope="row"
                  v-if="!isMobile"
                  class="text-xs text-left md:table-cell align-top"
                >
                  <CoverageLabelToolTip
                    :tool-tip-text="coverage.toolTipText"
                    :mobile-modal-heading="coverage.label"
                    tool-tip-position="right"
                    underline-label
                  >
                    <span class="font-normal text-[#878787] uppercase pr-1">
                      {{ coverage.label }}
                    </span>
                  </CoverageLabelToolTip>
                </th>

                <td
                  v-for="planCode in planCodes"
                  :key="`${planCode}-${coverage.key}`"
                  class="snap-center align-top !text-left"
                >
                  <CoverageTableRows
                    :plan-code="planCode"
                    :coverage="coverage"
                    option-location="comparePage"
                  />
                </td>
              </tr>
            </Transition>

            <!-- Optional Coverages -->
            <Transition
              v-else-if="section.header === 'Optional Coverages'"
              enter-active-class="transition-none"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-[200px] opacity-100"
              leave-active-class="transition-none"
              leave-from-class="max-h-[200px] opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <tr v-if="show[i]">
                <th v-if="!isMobile" class="md:table-cell"></th>
                <td
                  v-for="planCode in planCodes"
                  :key="`${planCode}-optional-coverages`"
                  class="text-xs snap-center align-top !text-left"
                >
                  <AdditionalOptions
                    :plan-code="planCode"
                    option-location="comparePage"
                  />
                </td>
              </tr>
            </Transition>

            <!-- Included Benefits -->
            <Transition
              v-else-if="section.header === 'Included Benefits'"
              enter-active-class="transition-none"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-[200px] opacity-100"
              leave-active-class="transition-none"
              leave-from-class="max-h-[200px] opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <tr v-if="show[i]">
                <th v-if="!isMobile" class="md:table-cell"></th>
                <td
                  v-for="planCode in planCodes"
                  :key="`${planCode}-includedBenefits`"
                  class="align-top text-xs snap-center text-left"
                  :class="{
                    'font-bold': !isComparePage,
                  }"
                >
                  <IncludedBenefitsTableRows :plan-code="planCode" />
                </td>
              </tr>
            </Transition>

            <!-- Covered Activities -->
            <Transition
              v-else-if="section.header === 'Covered Activities'"
              enter-active-class="transition-none"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-[200px] opacity-100"
              leave-active-class="transition-none"
              leave-from-class="max-h-[200px] opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <tr v-if="show[i]">
                <th v-if="!isMobile" class="md:table-cell"></th>
                <td
                  v-for="planCode in planCodes"
                  :key="`${planCode}-coveredActivities`"
                  class="align-top font-bold text-xs snap-center text-left"
                >
                  <CoveredActivitiesTableRow
                    :plan-code="planCode"
                    :covered-activities-array="coveredActivitiesArray"
                  />
                </td>
              </tr>
            </Transition>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style lang="scss">
  .shadow-plan {
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(120, 120, 120, 0.17) 52%,
      rgba(0, 0, 0, 0.25) 100%
    );
    width: 92px;
    height: 100%;
    position: absolute;
    right: 0; /* keep it at the content's initial right edge */
    top: 0;
    z-index: 1;
    pointer-events: none;
    will-change: transform; /* smoother on iOS */
    transform: translateZ(0); /* GPU hint for mobile Safari */
  }

  .no-scrollbar {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome/Safari/WebKit */
  }

  .compare-shadow-right {
    position: absolute;
    top: 0;
    right: 0;
    width: 80px;
    height: 100%;
    z-index: 999;
    background: linear-gradient(
      to left,
      rgba(0, 0, 0, 0.2),
      rgba(0, 0, 0, 0.1) 40%,
      rgba(0, 0, 0, 0) 100%
    );
    transition: opacity 0.2s ease-out;
  }

  #quote-results-app .daisy-table.plans-table {
    th,
    td {
      border-collapse: separate;
      border-bottom: 1px solid #e0e0e0;
      vertical-align: top;
      padding-top: 0.875rem;
      padding-bottom: 0.875rem;
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }
    .utility-html-renderer strong {
      font-weight: 400;
    }
  }

  .compare-section-header {
    background-color: #f7f7f7;
  }

  .compare-sticky-header--shadow {
    box-shadow: 0 12px 20px -18px rgba(15, 23, 42, 0.35);
  }
</style>
