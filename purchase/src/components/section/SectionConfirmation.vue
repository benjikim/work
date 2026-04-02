<script setup>
  import { computed, onMounted, reactive } from 'vue';
  import { useContentStore } from 'src/store/modules/content.js';
  import { useFormStore } from 'src/store/modules/form.js';
  import { useAppDataStore } from 'src/store/modules/preloadedData.js';
  import { useApiStore } from 'src/store/modules/api.js';
  import { deepCopy } from 'src/utility/index.js';
  import { TRACKING_PROVIDERS } from 'src/config/index.js';
  import { event } from 'vue-gtag';
  import UtilityHTMLRenderer from '../utility/UtilityHTMLRenderer.vue';
  /**
   * @var {Object} contentStore
   */
  const contentStore = useContentStore();
  const formStore = useFormStore();
  const appDataStore = useAppDataStore();
  const apiStore = useApiStore();

  const props = defineProps({
    pageType: {
      type: String,
      required: true,
    },
  });

  onMounted(async () => {
    await apiStore.setWPPlanContent();
  });

  const isStaticConfirmation = props.pageType.split('_').includes('static');
  const productDetails = contentStore.getProductDetails;

  const page = deepCopy(contentStore.getConfirmationPage(props.pageType));
  const state = reactive({
    data: computed(() => contentStore.getConfirmationData),
  });
  const crimtan = computed(() =>
    appDataStore.getTrackingProvider(TRACKING_PROVIDERS.CRIMTAN)
  );

  let totalCost = null;
  let email = null;
  let orderNumber = null;
  if (!isStaticConfirmation) {
    totalCost = apiStore.getProductTotalCost;
    email = formStore.getEmailAddress;
    orderNumber = contentStore.getOrderNumber;
    // Setting our variables
    page.body.setContent({
      '{{providerName}}': productDetails?.provider?.name,
      '{{totalCost}}': productDetails?.product?.totalCost,
      '{{productName}}': productDetails?.product?.name,
      '{{email}}': email,
      '{{orderNumber}}': orderNumber,
    });
  }

  // Set the confirmation page.
  contentStore.setConfirmationData(page);

  // Send GTag event that the confirmation page is loaded
  // We have a server container for IMT, since our previous ecommerce data wont persist per event, we need to add it here
  if (contentStore.isThemeIMT) {
    window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'buy_confirmation_page_load',
        ecommerce: {
          transaction_id: orderNumber,
          currency: 'USD',
          value: totalCost,
          items: [
            {
              id: productDetails?.product?.code,
              name: productDetails?.product?.name,
              price: productDetails?.product?.totalCost,
              quantity: 1,
            }
          ],
        },
        OnetrustActiveGroups: window?.OnetrustActiveGroups || '',
        item_purchased_with_npp: true,
        eduPurchase: contentStore.isModeEdu
      });
  } else {
    event('buy_confirmation_page_load');
  }
</script>

<template>
  <!-- Conditionally render order complete views here.  -->
  <section>
    <h1>{{ state.data?.header }}</h1>
    <UtilityHTMLRenderer :content="state.data?.body?.content" class="pb-3">
    </UtilityHTMLRenderer>

    <!--
      Crimtan tracking pixel
    -->
    <template
      v-if="
        crimtan &&
        crimtan?.containerId &&
        orderNumber !== null &&
        totalCost !== null &&
        !isStaticConfirmation
      "
    >
      <img
        :src="`http://i.ctnsnet.com/int/integration?pixel=68338140&nid=66354764&cont=i&orderID=${orderNumber}​&revenue=${totalCost}​​`"
        width="1"
        height="1"
        border="0"
        alt=""
      />
    </template>

    <!--
      Reseller ratings global (window) vars
    -->
    <component
      :is="'script'"
      v-if="email !== null && orderNumber !== null && !isStaticConfirmation"
    >
      var __rr_email_pass = '{{ email }}'; var __rr_invoice_pass = '{{
        orderNumber
      }}';
    </component>
  </section>
</template>

<style lang="scss" scoped>
  h1 {
    @include header-1-typography;
    margin-bottom: 24px;
  }
</style>
