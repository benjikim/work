<script setup lang="ts">
  import { computed, reactive } from 'vue';
  import { useApiStore } from '@/store/api';
  import { useUserSessionStore } from '@/store/userSession';
  import { useContentStore } from '@/store/content';
  import { useThemeStore } from '@/store/theme';
  import ClickThroughs from './ClickThroughs.vue';
  import Options from './Options.vue';
  import {
    getAgentEmailFromQuoteResultsContainer,
    getOptionsInKeyValueFormat,
  } from '@/utility';
  import { event } from 'vue-gtag';
  import { GAObject } from '@/types';

  const sessionStore = useUserSessionStore();
  const apiStore = useApiStore();
  const contentStore = useContentStore();
  const themeStore = useThemeStore();

  const plan = computed(() =>
    apiStore.getPlanByPlanCode(sessionStore.getPBMPlan)
  );

  const planLogo = computed(() =>
    contentStore.getPlanLogo(plan?.value?.code || '')
  );
  const currentCost = computed(() =>
    sessionStore.getCurrentPlanCost(sessionStore.getPBMPlan)
  );

  const state = reactive({
    pageIndex: 0,
    isLoading: false,
    hideModal: false,
  });

  /**
   * Closes the modal by setting PBM plan to null.
   */
  const closeModal = () => {
    sessionStore.setPBMCurrentState(false);
    sessionStore.setPBMPlan('');
  };

  const submitButtonText = computed(() => {
    if (plan.value?.options.length === 0 || state.pageIndex === 1) {
      return 'Continue To Purchase';
    }
    return 'Next';
  });

  const instructionText = computed(() => {
    if (state.pageIndex === 0) {
      return 'You must agree to the statements below by checking the boxes to purchase this plan.';
    }
    return 'This Plan has Additional Options';
  });

  const isSoventureUpdateTripCostHidden = computed(
    () => sessionStore.isSoventureUpdateTripCostHidden
  );

  const isThemeSoventure = computed(() => themeStore.isThemeSoventure);

  const currentTripCost = computed(() => apiStore.getTripCost);

  const numberOfTravelers = computed(
    () => apiStore.getQuoteDetails?.travelers?.length
  );

  // If the user is on the Soventure theme and the trip cost is 1 but the user has not updated the trip cost, we need to requote the plan
  if (
    isThemeSoventure.value &&
    !isSoventureUpdateTripCostHidden.value &&
    currentTripCost.value === numberOfTravelers.value
  ) {
    if (!sessionStore.plansToRequote.includes(sessionStore.getPBMPlan)) {
      sessionStore.plansToRequote.push(sessionStore.getPBMPlan);
    }
    apiStore.setTripCost(0);
  }

  const handleNavigation = async (): Promise<void> => {
    state.isLoading = false;

    if (submitButtonText.value !== 'Next') {
      state.isLoading = true;
      // To ensure we have the current state of the quote before we hit the purchase page,
      // we will set plan parameters here and set a new qid.
      // Now if the user returns, they should have the quote they entered with in the case they
      // adjusted options before continuing to purchase
      await sessionStore.setPlanParameters();

      // Set loader to notify user we are moving forward to the purchase page
      sessionStore.setMovingToPurchase(true);
      const quoteId = apiStore.getQuoteId;
      const productCode = sessionStore.getPBMPlan;
      const currUserOptions =
        sessionStore.getOptionsOfSelectedPlan(productCode);
      const optionsForProductOrder = getOptionsInKeyValueFormat(
        currUserOptions,
        true
      );
      const isComparePage = window.location.pathname.includes('compare');

      event('plan_action_plan_details_modal', {
        hierarchical_layer_1: 'Continue to Purchase',
        hierarchical_layer_2: `Plan Code ${sessionStore.getPBMPlan}`,
        hierarchical_layer_4: isComparePage
          ? 'Compare Page'
          : 'Quote Results Page',
      } as GAObject);

      // If the agent email is not set in metadata
      if (!apiStore.isAgentEmailSet) {
        // Get the agent email from the quote results container
        const currAgentEmail = getAgentEmailFromQuoteResultsContainer();
        if (currAgentEmail) {
          // Create a new quote to ensure the agent email is set in metadata
          // everytime a quote is created we do this.
          await apiStore.createQuote();
        }
      }

      await apiStore.createOrder();
      if (quoteId) {
        try {
          // add product to order
          await apiStore.addProductToOrder(
            productCode,
            quoteId,
            optionsForProductOrder
          );
          const url = new URL(window.location.origin);
          url.pathname = import.meta.env.VITE_IMT_PURCHASE_URL;
          url.searchParams.set('_pc', productCode);
          url.searchParams.set('productCode', productCode);
          url.searchParams.set('_oid', apiStore.getOrderId || '');

          if (themeStore.getCurrentThemeMode !== 'default') {
            url.searchParams.set('mode', themeStore.getCurrentThemeMode);
          }

          // add clickthroughs to product
          const validClickthroughs = sessionStore.getAcceptedClickthroughs;

          if (Object.entries(validClickthroughs).length > 0) {
            await apiStore.addProductInputsToProduct(validClickthroughs);
          }
          sessionStore.deselectPlansForCompare();
          // Clear out session storage causing the user to have stale data
          // when they hit the back button from the purchase page
          sessionStorage.removeItem('imt.purchase.formData');
          sessionStorage.removeItem('imt.purchase.requestPayloads');
          (window as Window).location = url.toString();
        } catch (error) {
          sessionStore.setMovingToPurchase(false);
          state.isLoading = false;
          console.error(error);
        }
      }
    }

    state.pageIndex = 1;
  };
  const clickThroughValidationStatus = computed(
    () =>
      sessionStore.getClickThroughValidationStatus ||
      hideClickThroughsInPBM.value
  );

  // // Get a list of non signature clickthroughs.
  // // F.e. multi, boolean and general notes.
  const nonSignatureClickThroughs = computed(() => {
    return (
      plan.value?.clickthroughs.filter(
        (ct) =>
          ct?.type !== 'text' &&
          ct?.id !== 'note51dc21549571e' &&
          !ct?.modalKey &&
          !ct?.modalContent
      ) ?? []
    );
  });

  const hideClickThroughsInPBM = computed(() =>
    apiStore.getFFValue('imt_20260121_pbm_clickthrough_buy_modal')
  );

  if (
    nonSignatureClickThroughs.value.length === 0 ||
    hideClickThroughsInPBM.value
  ) {
    state.pageIndex = 1;
  }

  // If there are no clickthroughs or options, lets hide the modal and
  // send to buy page!
  if (
    plan.value?.options.length === 0 &&
    (hideClickThroughsInPBM.value ||
      nonSignatureClickThroughs.value.length === 0)
  ) {
    state.hideModal = true;
    handleNavigation();
  }

  window.addEventListener('pageshow', (e: PageTransitionEvent) => {
    // If the user has navigated back to the page, we need to reset the moving to purchase state to stop the loader from showing
    // This is specific for safari
    // only act on a back-forward cache restore…
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    const isBFCache = e.persisted || nav?.type === 'back_forward';

    if (isBFCache) {
      state.isLoading = false;
      sessionStore.setMovingToPurchase(false);
    }
  });
</script>
<template>
  <dialog
    class="daisy-modal pbm daisy-modal-open z-[999999] md:z-[998]"
    :class="{
      'display-none': state.hideModal,
    }"
    @close="closeModal()"
  >
    <div
      class="daisy-modal-box w-full md:w-11/12 md:max-w-[60vw] lg:max-w-[40rem] p-0 overflow-hidden px-1"
    >
      <!-- Modal Header (name, logo, cost and general text) -->
      <div class="grid grid-cols-12 gap-4 w-full pb-4 px-5 pt-6">
        <button
          type="button"
          class="close-btn"
          @click="closeModal()"
          aria-label="close"
        >
          ×
        </button>
        <div class="col-span-4 flex justify-center items-center">
          <img
            class="w-auto min-h-12 max-h-12"
            :src="planLogo"
            :alt="`${plan?.provider.name} Logo`"
          />
        </div>
        <div class="col-span-8">
          <p class="text-xl font-bold">{{ plan?.name }}</p>
          <p class="text-3xl font-bold ml-4">{{ currentCost }}</p>
          <div class="text-3xl pb-3"></div>
        </div>
      </div>
      <!-- PBM Content (notes, click through, options) -->
      <div
        class="grid grid-cols-12 w-full base-border-t rounded-xl px-5 pbm__content min-h-0 overflow-y-auto"
      >
        <p class="col-span-12 py-4 text-sm text-center font-bold">
          {{ instructionText }}
        </p>
        <ClickThroughs
          v-if="
            state.pageIndex === 0 &&
            nonSignatureClickThroughs.length > 0 &&
            !hideClickThroughsInPBM
          "
          :clickthroughs="nonSignatureClickThroughs"
        />
        <Options v-else />
      </div>
      <!-- Modal Footer -->
      <div class="daisy-modal-action px-5 pb-6">
        <!-- btn-disabled -->
        <button
          class="daisy-btn daisy-btn-block text-white font-semibold disabled:opacity-60 bg-action-primary hover:bg-action-primary uppercase tracking-wider"
          :data-cy="`pre-buy__button-${plan?.code}`"
          :disabled="
            (!clickThroughValidationStatus &&
              nonSignatureClickThroughs.length > 0) ||
            state.isLoading
          "
          @click="handleNavigation"
        >
          {{ submitButtonText }}
        </button>
      </div>
    </div>
    <!-- This creates a backdrop for the modal to enable us to close when clicked outside -->
    <div class="daisy-modal-backdrop" @click="closeModal()"></div>
  </dialog>
</template>

<style lang="scss">
  .close-btn {
    font-size: 30px;
    position: fixed;
    right: 30px;
    font-size: 32px;
    line-height: 1;
    color: #757575;
  }

  .modal .clickthrough:last-of-type .pbm__checkbox,
  .modal .clickthrough:last-of-type .pbm__radio {
    border: none;
  }

  .pbm {
    &__content {
      flex: 1 1 auto;
      min-height: 0;
      padding-right: 10px;
      &::-webkit-scrollbar {
        -webkit-appearance: none;
        width: 7px;
      }

      &::-webkit-scrollbar-thumb {
        border-radius: 7px;
        background-color: rgba(0, 0, 0, 0.5);
        -webkit-box-shadow: 0 0 1px rgba(255, 255, 255, 0.5);
      }
    }
  }

  .daisy-modal-box {
    display: flex;
    flex-direction: column;
    max-height: 90vh;
  }

  .daisy-modal-action {
    flex-shrink: 0;
  }
</style>
