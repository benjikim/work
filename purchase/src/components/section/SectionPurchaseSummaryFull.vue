<script setup>
  import { event } from 'vue-gtag';
  import { useApiStore } from 'src/store/modules/api.js';
    import { hideReviewPeriodContent } from 'src/utility/index.js';
  import UtilityHTMLRenderer from '../utility/UtilityHTMLRenderer.vue';
  import { ref, onMounted } from 'vue';

  defineProps({
    privacyPolicyData: {
      type: Object,
      required: true,
    },
    productDetails: {
      type: Object,
      required: true,
    },
    priceBreakdownList: {
      type: Object,
      required: true,
    },
    quoteDetailsList: {
      type: Object,
      required: true,
    },
    legalText: {
      type: String,
      required: true,
    },
    hideForm: {
      type: Boolean,
      required: true,
    },
    planLogo: {
      type: String,
      required: false,
      default: '',
    },
    reviewPeriodMessaging: {
      type: Object,
      required: true,
    },
    hideLinks: {
      type: Boolean,
      default: false
    }
  });

  const apiStore = useApiStore();
  const shouldHideReviewPeriod = ref(false);

  const trackCertClick = () => {
    event('buy_page_action', {
      hierarchical_layer_1: 'View Certificate',
      hierarchical_layer_2: `Plan Code ${apiStore.getProductCodeFromUrl()}`,
    });
  };

  onMounted(async () => {
    shouldHideReviewPeriod.value = await hideReviewPeriodContent();
  });

</script>

<template>
  <div class="purchase-summary purchase-summary--full py-5 px-6">
    <div class="purchase-summary__product-details product-details mb-4">
      <div class="product-details__logo mb-2">
        <img
          v-if="(planLogo || productDetails?.provider?.logo) && !hideForm"
          :src="planLogo || productDetails?.provider?.logo"
          class="w-[100px]"
          :alt="`${productDetails.provider.name} Logo`"
        />
        <span
          v-else
          class="w-20 bg-gray-300 h-20 rounded-md animate-pulse block"
        >
          <!-- Placeholder until we have logo. Keep as skeleton loader. -->
        </span>
      </div>

      <div class="product-details__name mb-2">
        <span
          v-if="productDetails?.product?.name && !hideForm"
          class="font-bold"
          >{{ productDetails.product.name }}</span
        >
        <span
          v-else
          class="w-3/4 bg-gray-300 h-2 rounded-md animate-pulse inline-block"
        ></span>
      </div>
      <ul v-if="!hideLinks" class="product-details__links mb-2">
        <li>
          <a
            v-if="productDetails?.product?.certificateUrl"
            :href="productDetails?.product.certificateUrl"
            data-cy="certificate-pdf"
            target="_blank"
            @click="trackCertClick"
          >
            View Certificate
          </a>
        </li>
      </ul>
    </div>
    <!-- /.purchase-summary__product-details -->

    <hr />

    <ul class="purchase-summary__quote-details py-1">
      <li
        v-for="(item, index) in quoteDetailsList"
        :key="index"
        class="flex justify-between my-3 items-center"
      >
        <span class="font-bold">{{ item.title }}</span>
        <span v-if="item.value">{{ item.value }}</span>
        <span
          v-else
          :class="item.loadingWidth"
          class="bg-gray-300 h-2 rounded-md animate-pulse"
        ></span>
      </li>
    </ul>
    <!-- /.purchase-summary__quote-details-->

    <hr />

    <ul
      v-if="priceBreakdownList && !hideForm"
      class="purchase-summary__quote-details py-1"
    >
      <li
        v-for="(item, index) in priceBreakdownList"
        :key="index"
        class="flex items-start justify-between my-3"
      >
        <span
          :class="[
            !['Plan Cost', 'Plan Taxes', 'Policy Fee'].includes(item.title)
              ? 'pl-3 mr-9'
              : 'font-bold',
          ]"
        >
          {{
            !['Plan Cost', 'Plan Taxes', 'Policy Fee'].includes(item.title)
              ? `You have selected the ${item.title}`
              : item.title
          }}</span
        >
        <span v-if="item.value">{{ item.value }}</span>
        <span
          v-else
          :class="item.loadingWidth"
          class="bg-gray-300 h-2 rounded-md animate-pulse"
        ></span>
      </li>
    </ul>

    <hr class="mb-3" />

    <ul class="product-details__premium">
      <li class="flex justify-between my-3 items-center">
        <span class="font-bold">Total Cost</span>
        <span v-if="productDetails?.product?.totalCost && !hideForm">{{
          productDetails.product.totalCost
        }}</span>
        <span
          v-else
          class="w-1/4 bg-gray-300 h-2 rounded-md animate-pulse"
        ></span>
      </li>
    </ul>

    <hr class="mb-3" />

    <ul
      v-if="
        reviewPeriodMessaging &&
        reviewPeriodMessaging.title &&
        reviewPeriodMessaging.message &&
        !shouldHideReviewPeriod
      "
      class="product-details__premium border border-inheret-500 p-4 my-8"
    >
      <li class="flex flex-col justify-between my-3">
        <span class="font-semibold text-2xl mb-2">{{
          reviewPeriodMessaging.title
        }}</span>
        <UtilityHTMLRenderer
          :content="reviewPeriodMessaging.message"
          is="span"
          class="text-xl"
        >
        </UtilityHTMLRenderer>
      </li>
    </ul>

    <div class="purchase-summary__footer text-center">
      <p v-if="!hideLinks">
        <a
          :href="privacyPolicyData.url"
          :title="privacyPolicyData.text"
          :target="privacyPolicyData.target"
        >
          {{ privacyPolicyData.text }}
        </a>
      </p>
      <p>
        {{ legalText }}
      </p>
      <!-- /.purchase-summary__footer-->
    </div>
  </div>
  <!-- /.purchase-summary--full-->
</template>

<style lang="scss" scoped>
  .purchase-summary {
    background-color: $imt-bg-color;

    a {
      font-size: 0.875em;
    }
  }
</style>
