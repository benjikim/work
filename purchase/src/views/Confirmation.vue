<script setup>
  import { useApiStore } from 'src/store/modules/api.js';
  import { useFormStore } from 'src/store/modules/form.js';
  import { useRoute } from 'vue-router';
  import { reactive, computed } from 'vue';
  import { useContentStore } from 'src/store/modules/content.js';
  import {
    PARTNER_EVENT_TYPES,
    RE_SELLER_RATINGS,
    LOCAL_STORAGE_KEYS,
  } from 'src/config/index.js';
  import { dynamicLoadJS } from 'src/utility/index.js';

  import SectionConfirmation from 'src/components/section/SectionConfirmation.vue';
  import SectionSidebar from 'src/components/section/SectionSidebar.vue';
  import BaseModal from '../components/base/BaseModal.vue';

  const apiStore = useApiStore();
  const contentStore = useContentStore();
  const formStore = useFormStore();
  const route = useRoute();

  if (window.ACF_PAGE_DATA_CONFIRMATION) {
    contentStore.setWPContent(window.ACF_PAGE_DATA_CONFIRMATION);
  }

  // Fire the partner event for verify page if we are coming
  // in from the form page. This event should only fire
  // once on the confirmation page, and localStorage is tracking
  // the previous partner event
  if (
    localStorage.getItem('partnerEvents') === PARTNER_EVENT_TYPES.VERIFY_PAGE
  ) {
    apiStore.handlePartnerEvent(PARTNER_EVENT_TYPES.CONFIRMATION_PAGE);
    localStorage.removeItem('partnerEvents');
  }

  if (localStorage.getItem('_imtActiveQuoteId') != null) {
    localStorage.removeItem('_imtActiveQuoteId');
  }

  // Be sure there are no lingering loaders
  contentStore.setShowPageLoader(false);

  // These are the confirmation page type
  // We are making success default and checking
  // if query param pageType is in pageTypes.
  const pageTypes = ['success', 'eduSuccess', 'delay', 'sanction', 'error'];
  let pageType = 'success';

  if (pageTypes.includes(route.query?.pageType)) {
    pageType = route.query?.pageType;
  }

  if (contentStore.getIsQuoteDetailsEmpty) {
    pageType = `${pageType}_static`;
  }

  const state = reactive({
    modal: {
      show: computed(() => contentStore.getIsModalDisplayed),
      data: computed(() => contentStore.getModalData),
    },
    pageLoader: {
      show: computed(() => contentStore.getIsPageLoaderDisplayed),
      data: computed(() => contentStore.getPageLoaderData),
    },
    isQuoteDetailsEmpty: computed(() => contentStore.getIsQuoteDetailsEmpty),
  });

  // Setting reseller object and loading script.
  if (localStorage.getItem(LOCAL_STORAGE_KEYS.DISPLAY_RESELLER)) {
    let currentSeller = RE_SELLER_RATINGS.insuremytrip.SELLER_ID;
    let currentStoreFront = 'InsureMyTrip';
    if (window.location.hostname.includes('soventure')) {
      currentStoreFront = 'Soventure_Insurance';
      currentSeller = RE_SELLER_RATINGS.soventure.SELLER_ID;
    }

    let scriptToBeLoaded = `//www.resellerratings.com/popup/include/${currentStoreFront}.js`;

    window._rrES = {
      seller_id: currentSeller,
      email: formStore.getEmailAddress,
      invoice: contentStore.getOrderNumber,
    };

    dynamicLoadJS(scriptToBeLoaded);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.DISPLAY_RESELLER);

    // Firing trip advisor event
    // with purchase amount and order number to dataLayer
    window.dataLayer.push({
      event: 'tripAdvisorEvent',
      purchaseAmount: Number(
        contentStore.getProductDetails?.product?.totalCost.replace(
          /[^0-9\.-]+/g,
          ''
        )
      ),
      orderNumber: contentStore.getOrderNumber,
    });
  }

  // Good time to do some browser storage housekeeping
  apiStore.clearLocalStorage();
  apiStore.clearSessionStorage();

  const close = () => {
    contentStore.setShowModal(false);
  };

  // Scroll to the top of the page.
  window.scroll({
    top: 0,
    left: 0,
  });
</script>

<template>
  <main class="confirmation-container">
    <div class="confirmation-container__main">
      <SectionConfirmation :page-type="pageType"></SectionConfirmation>
    </div>
    <div
      v-if="!state.isQuoteDetailsEmpty"
      class="confirmation-container__sidebar order-first lg:order-last lg:col-span-2 col-span-12 mx-4 lg:m-0"
    >
      <SectionSidebar></SectionSidebar>
    </div>
  </main>
  <!-- ./purchase-container -->
  <BasePageLoader
    v-if="state.pageLoader.show"
    :id="state.pageLoader.data?.id"
    :show="state.pageLoader.show"
    :text="state.pageLoader.data?.text"
  >
  </BasePageLoader>

  <BaseModal
    v-if="state.modal.show"
    :id="state.modal.data?.id"
    :show="state.modal.show"
    :header="state.modal.data?.header"
    :body="state.modal.data?.body"
    :button-action-text="state.modal.data?.buttonActionText"
    :width="state.modal.data?.width"
    :action-button="state.modal.data?.actionButton"
    :show-close-button="state.modal.data?.showCloseButton"
    :show-close-icon="state.modal.data?.showCloseIcon"
    :compress-close-button="state.modal.data?.compressCloseButton"
    :outlined-close-button="state.modal.data?.outlinedCloseButton"
    @click:action="state.modal.data?.actionMethod"
    @click:close="close"
  >
  </BaseModal>
</template>

<style lang="scss" scoped>
  .confirmation-container {
    display: grid;
    max-width: $base-content-max-width;
    padding-top: 20px;
    @media (min-width: 1024px) {
      display: flex;
      flex-direction: row;
      margin-left: 14px;
    }

    &__sidebar {
      display: block;
      order: 1;
      @media (min-width: 1024px) {
        display: inline-block;
        width: 374px;
      }
    }

    &__main {
      display: block;
      order: 2;
      margin: 24px;
      @media (min-width: 1024px) {
        display: inline-block;
        width: 60%;
        margin-right: 14px;
        margin-top: 0;
        margin-bottom: 60px;
        margin-left: 14px;
      }
    }
  }

  .base-confirmation-container {
    display: block;
    margin: 24px;
  }
</style>
