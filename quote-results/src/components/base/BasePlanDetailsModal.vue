<script setup lang="ts">
  import { useApiStore } from '@/store/api';
  import { ChevronLeftIcon } from '@heroicons/vue/24/solid';
  import { computed, ref, onMounted, onUnmounted } from 'vue';
  import PlanActions from '@/components/shared/PlanActions.vue';
  import PlanDetailsTable from '@/components/shared/PlanDetailsTable.vue';
  import { useUserSessionStore } from '@/store/userSession';
  import PlanTag from '@/components/base/PlanRow/PlanTag.vue';
  import UtilityHTMLRenderer from '@/components/utility/UtilityHTMLRenderer.vue';
  import BaseReview from '@/components/base/PlanRow/BaseReview.vue';
  import { useContentStore } from '@/store/content';
  import { useThemeStore } from '@/store/theme';
  import { QuoteResult } from '@/types';

  defineProps({
    showPlanDetailCoveredActivities: {
      type: Boolean,
      required: true,
    },
  });

  const apiStore = useApiStore();
  const sessionStore = useUserSessionStore();
  const contentStore = useContentStore();
  const themeStore = useThemeStore();

  const modal = ref<HTMLElement | null>(null);
  const nav = ref<HTMLElement | null>(null);
  const header = ref<HTMLElement | null>(null);
  const tabs = ref<HTMLElement | null>(null);
  const table = ref<HTMLElement | null>(null);

  const isMobile = computed(() => sessionStore.isMobileView);

  const planCode = computed(() => sessionStore.getPlanCodeForModal);
  const isModalOpen = computed(() => sessionStore.isModalOpen);
  const isThemeIMT = computed(() => themeStore.isThemeIMT);
  const scrollToSection = computed(
    () => sessionStore.getScrollToPlanDetailSection
  );
  const hiddenPlanTagPlans = computed(
    () => sessionStore.getSoventureHiddenPlanTagPlans
  );

  const getPlanType = (plan: QuoteResult) => {
    if (!isThemeIMT.value) {
      return !hiddenPlanTagPlans.value.includes(plan.code)
        ? 'Adventure Sports'
        : 'Hidden';
    } else {
      return plan.type;
    }
  };

  const planLogo = computed(() => contentStore.getPlanLogo(planCode.value));

  const planDescription = computed(() =>
    contentStore.getPlanDescription(planCode.value)
  );

  onMounted(() => {
    window.addEventListener('resize', updateMaxHeight);
    updateMaxHeight();
    if (scrollToSection.value !== null && table.value) {
      const el = document.querySelector(scrollToSection.value) as HTMLElement;
      if (el) {
        table.value.scrollTo({
          top: el?.offsetTop,
          behavior: 'smooth',
        });
      }
    }
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateMaxHeight);
  });

  const updateMaxHeight = () => {
    if (
      isMobile.value &&
      nav.value &&
      header.value &&
      tabs.value &&
      table.value
    ) {
      const val =
        window.innerHeight -
        nav.value.scrollHeight -
        header.value.scrollHeight -
        tabs.value.scrollHeight;
      table.value.style.maxHeight = `${val}px`;
    } else if (
      !isMobile.value &&
      nav.value &&
      header.value &&
      tabs.value &&
      table.value &&
      modal.value
    ) {
      const val =
        modal.value.clientHeight -
        nav.value.scrollHeight -
        header.value.scrollHeight -
        tabs.value.scrollHeight;
      table.value.style.maxHeight = `${val}px`;
    }
  };

  const modalSelection = computed(() => sessionStore.getActivePlanDetailsTab);

  const plan = computed(() => apiStore.getPlanByPlanCode(planCode.value));

  const handleClose = () => {
    sessionStore.setModalCurrentState(false);
    sessionStore.setActivePlanDetailsTab('coverageLimits');
    sessionStore.setScrollToPlanDetailSection(null);
  };

  const sortCoveredActivities = computed(() => {
    return plan.value?.coveredActivities.sort((a, b) =>
      a[0].localeCompare(b[0], undefined, { sensitivity: 'base' })
    );
  });
</script>
<template>
  <dialog
    class="daisy-modal filter-mobile-modal z-[997]"
    :class="{ 'daisy-modal-open': isModalOpen }"
    @close="handleClose"
  >
    <div
      class="daisy-modal-box p-0 rounded-none overflow-hidden w-full max-h-full h-full md:max-w-[80%] md:max-h-[80%] lg:max-w-[70%] xl:max-w-[50%] sm:max-w-3xl"
      ref="modal"
    >
      <div
        ref="nav"
        class="daisy-modal-action mt-0 h-20"
        :class="[isThemeIMT ? 'bg-[#0c233c]' : 'bg-[#274452]']"
      >
        <form method="dialog">
          <div class="left-2 top-8 absolute text-[white]">
            <button
              @click="handleClose"
              class="whitespace-nowrap inline-flex text-center font-normal text-base"
            >
              <ChevronLeftIcon
                aria-label="back"
                class="size-6 stroke-[white]"
              />
              Back
            </button>
          </div>
        </form>
      </div>

      <div class="grid grid-cols-12 w-full h-full base-border">
        <div class="col-span-12 md:col-span-9 h-full">
          <div class="grid grid-cols-12 h-full">
            <!-- Plan Header -->
            <div class="col-span-12 h-full">
              <div
                ref="header"
                class="grid grid-cols-12 gap-6 pb-1 md:pb-2 p-4"
              >
                <div
                  class="col-span-6 md:col-span-12 flex flex-col md:flex-row justify-evenly"
                >
                  <div
                    class="md:row-start-auto lg:row-start-auto col-span-6 md:col-span-4 px-3 flex justify-center min-h-16 max-h-16"
                  >
                    <img
                      v-if="plan?.code"
                      :src="planLogo"
                      class="w-auto min-h-16 max-h-16"
                      :alt="`${plan?.provider.name} Logo`"
                    />
                  </div>
                  <div
                    class="py-4 md:row-start-auto lg:row-start-auto col-span-6 md:col-span-8 text-xl font-bold flex flex-col justify-between items-center md:items-baseline"
                  >
                    {{ plan?.name }}
                    <div
                      class="flex flex-col md:flex-row md:justify-between items-center md:items-baseline"
                      v-if="plan?.type"
                    >
                      <PlanTag
                        :plan-code="plan?.code"
                        :type="getPlanType(plan)"
                      />
                      <BaseReview
                        :plan-code="plan?.code"
                        :manually-get-reviews="true"
                      />
                    </div>
                  </div>
                </div>
                <div class="col-span-6 pt-3 md:display-none bg-base-bg-color">
                  <PlanActions
                    class="p-3"
                    v-if="plan"
                    :plan="plan"
                    :modal="true"
                  />
                </div>
              </div>
              <div
                ref="tabs"
                role="tablist"
                class="daisy-tabs daisy-tabs-bordered"
              >
                <a
                  role="tab"
                  class="daisy-tab"
                  :class="[
                    modalSelection === 'description' ? 'daisy-tab-active' : '',
                    isMobile ? 'text-xs' : 'text-sm',
                  ]"
                  @click="sessionStore.setActivePlanDetailsTab('description')"
                  >Description</a
                >
                <a
                  role="tab"
                  @click="
                    sessionStore.setActivePlanDetailsTab('coverageLimits')
                  "
                  class="daisy-tab"
                  :class="[
                    modalSelection === 'coverageLimits'
                      ? 'daisy-tab-active'
                      : '',
                    isMobile ? 'text-xs' : 'text-sm',
                  ]"
                  >Coverage Limits</a
                >
                <a
                  v-if="showPlanDetailCoveredActivities"
                  role="tab"
                  @click="
                    sessionStore.setActivePlanDetailsTab('coveredActivities')
                  "
                  class="daisy-tab"
                  :class="[
                    modalSelection === 'coveredActivities'
                      ? 'daisy-tab-active'
                      : '',
                    isMobile ? 'text-xs' : 'text-sm',
                  ]"
                  >Covered Activities</a
                >
              </div>
              <div
                ref="table"
                class="tabletable overflow-x-auto h-full md:max-h-[30rem]"
              >
                <div
                  class="provider-content p-5 font-normal text-sm"
                  v-show="modalSelection === 'description'"
                >
                  <UtilityHTMLRenderer
                    is="p"
                    class="utility-html-renderer"
                    v-if="plan?.code"
                    :content="planDescription"
                  ></UtilityHTMLRenderer>
                </div>
                <template v-if="modalSelection === 'coverageLimits'">
                  <PlanDetailsTable :plan="plan" />
                </template>
                <div
                  v-if="
                    showPlanDetailCoveredActivities &&
                    modalSelection === 'coveredActivities' &&
                    plan?.coveredActivities
                  "
                  class="p-5"
                >
                  <div
                    v-if="
                      sortCoveredActivities && sortCoveredActivities?.length > 0
                    "
                    class="p-3 font-bold text-sm"
                  >
                    <p class="text-[#878787] text-xs mb-2 px-[1rem]">
                      {{ sortCoveredActivities?.length }} COVERED ACTIVITIES
                    </p>
                    <p
                      v-for="(activity, i) of sortCoveredActivities"
                      :key="i"
                      class="bg-[#F6FAFD] py-[0.75rem] px-[1rem] my-2 capitalize"
                    >
                      {{ activity }}
                    </p>
                  </div>

                  <div class="font-normal text-sm" v-else>
                    <p>
                      This insurance plan does not provide an explicit list of
                      covered activities. Please refer to the plan’s certificate
                      for detailed information or consult an IMT representative
                      for assistance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          class="col-span-12 md:col-span-3 md:base-border-l p-3 md:p-0 display-none md:block"
        >
          <div class="grid grid-cols-12 h-full">
            <!-- Desktop View -->
            <div
              class="md:col-span-12 flex flex-col p-4 bg-base-bg-color h-full"
            >
              <PlanActions v-if="plan" :plan="plan" :modal="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- This creates a backdrop for the modal to enable us to close when clicked outside -->
    <div class="daisy-modal-backdrop" @click="handleClose"></div>
  </dialog>
</template>
<style lang="scss">
  #quote-results-app {
    .provider-content p {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .daisy-tabs a {
      text-decoration: none;
      color: inherit;
    }
  }
</style>
