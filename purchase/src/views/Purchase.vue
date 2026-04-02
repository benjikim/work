<script setup>
import { reactive, computed, onMounted, ref } from 'vue';
import { useContentStore } from 'src/store/modules/content.js';
import { useApiStore } from 'src/store/modules/api.js';
import { useFormStore } from 'src/store/modules/form.js';

import { waitForElm } from 'src/utility';
import SectionMain from 'src/components/section/SectionMain.vue';
import SectionSidebar from 'src/components/section/SectionSidebar.vue';
import BaseModal from '../components/base/BaseModal.vue';
import { useAppDataStore } from 'src/store/modules/preloadedData.js';
import { determineTheme, determineCaptchaVisibility } from '/src/utility/index.js';

const apiStore = useApiStore();
const contentStore = useContentStore();
const preloadedDataStore = useAppDataStore();

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const productCode =  urlParams.get('_pc') ?? urlParams.get('productCode') ?? '';

// Initialize getting all the data from API's
onMounted(async () => {
  determineTheme(contentStore);
  determineCaptchaVisibility(formStore);
  await preloadedDataStore.loadData(productCode);
  await apiStore.init();
  await apiStore.setWPPlanContent();
  // Remove call us div in page.
  const mobileStickyFooter = await waitForElm('.mobile-sticky-footer');
  mobileStickyFooter.classList.remove('flex');
});

// Setup content
const formStore = useFormStore();
const state = reactive({
  modal: {
    show: computed(() => contentStore.getIsModalDisplayed),
    data: computed(() => contentStore.getModalData),
  },
  pageLoader: {
    show: computed(() => contentStore.getIsPageLoaderDisplayed),
    data: computed(() => contentStore.getPageLoaderData),
  },
});

const close = () => {
  contentStore.setShowModal(false);
};

</script>

<template>
  <main class="purchase-container">
    <div class="purchase-form-main">
      <SectionMain></SectionMain>
    </div>
    <div class="purchase-details-main">
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
    :secondary-button-action-text="state.modal.data?.secondaryButtonActionText"
    :width="state.modal.data?.width"
    :footer-style-override="state.modal.data?.footerStyleOverride"
    :header-style-override="state.modal.data?.headerStyleOverride"
    :action-button="state.modal.data?.actionButton"
    :outlined-action-button="state.modal.data?.outlinedActionButton"
    :outlined-secondary-action-button="state.modal.data?.outlinedSecondaryActionButton"
    :secondary-action-button="state.modal.data?.secondaryActionButton"
    :show-submit-form-button="state.modal.data?.showSubmitFormButton"
    :show-close-button="state.modal.data?.showCloseButton"
    :show-close-icon="state.modal.data?.showCloseIcon"
    :compress-close-button="state.modal.data?.compressCloseButton"
    :outlined-close-button="state.modal.data?.outlinedCloseButton"
    @click:action="state.modal.data?.actionMethod"
    @click:second-action="state.modal.data?.secondaryActionMethod"
    @click:close="close"
  >
  </BaseModal>
</template>


<style lang="scss" scoped>
.purchase-container, .confirmation-container {
  display: grid;
  max-width: $base-content-max-width;
  padding-top: 20px;
  @media (min-width: 1024px) {
    display: inline;
    margin-left: 14px;
  }
}

.purchase-form-main {
  display: block;
  order: 2;
  margin-left: 14px;
  margin-right: 14px;
  @media (min-width: 1024px) {
    display: inline-block;
    width: 60%;
    margin-right: 14px;
    margin-top: 0;
    margin-bottom: 60px;
    max-width: 800px;
  }
}

.purchase-details-main {
  display: block;
  order: 1;
  @media (min-width: 1024px) {
    display: inline-block;
    position: absolute;
    width: 374px;
  }
}
</style>
