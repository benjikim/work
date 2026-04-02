<script setup>
  import { event } from 'vue-gtag';
  import { useApiStore } from 'src/store/modules/api.js';
  import { hideReviewPeriodContent } from 'src/utility/index.js';
  import { ref, onMounted } from 'vue';
  import UtilityHTMLRenderer from '../utility/UtilityHTMLRenderer.vue';

  defineProps({
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
  <div class="purchase-summary py-5 pl-5">
    <div class="purchase-summary__product-details product-details mb-2">
      <div class="product-details__logo">
        <img
          v-if="(planLogo || productDetails?.product?.logo) && !hideForm"
          class="w-[100px]"
          :src="planLogo || productDetails.provider.logo"
          :alt="`${productDetails.provider.name} Logo`"
        />
        <span
          v-else
          class="w-20 bg-gray-300 h-20 rounded-md animate-pulse block"
        >
          <!-- Placeholder until we have logo. Keep as skeleton loader. -->
        </span>
      </div>

      <div class="product-details__name">
        <span v-if="productDetails?.product?.name && !hideForm">{{
          productDetails.product.name
        }}</span>
        <span
          v-else
          class="w-3/4 bg-gray-300 h-2 rounded-md animate-pulse inline-block"
        ></span>
      </div>

      <div v-if="!hideLinks">
        <a
          v-if="productDetails?.product?.certificateUrl"
          :href="productDetails.product.certificateUrl"
          data-cy="certificate-pdf"
          target="_blank"
          @click="trackCertClick"
        >
          View Certificate
        </a>
      </div>
    </div>
    <!-- /.purchase-summary__product-details -->

    <ul class="purchase-summary__quote-details py-1">
      <li
        v-for="(item, index) in quoteDetailsList"
        :key="index"
        class="flex justify-center lg:justify-between my-3 items-center"
      >
        <span v-if="item.value">{{ item.value }}</span>
        <span
          v-else
          :class="item.loadingWidth"
          class="bg-gray-300 h-2 rounded-md animate-pulse"
        ></span>
      </li>
      <!-- /.purchase-summary__quote-details-->
      <li
        v-for="(item, index) in priceBreakdownList"
        :key="index"
        class="flex justify-center lg:justify-between my-3 items-center"
      >
        <span v-if="item.value" class="font-bold">
          {{
            !['Plan Cost', 'Plan Taxes', 'Policy Fee'].includes(item.title)
              ? `You have selected the ${item.title}&nbsp;`
              : `${item.title}:&nbsp;`
          }}</span
        >
        <span v-if="item.value">{{ item.value }}</span>
      </li>
    </ul>
    <!-- /.purchase-summary__quote-details-->

    <ul
      v-if="
        reviewPeriodMessaging &&
        typeof reviewPeriodMessaging.title === 'string' &&
        reviewPeriodMessaging.title.length > 0 &&
        typeof reviewPeriodMessaging.message === 'string' &&
        reviewPeriodMessaging.message.length > 0 &&
        !shouldHideReviewPeriod
      "
      class="product-details__premium border border-inheret-500 p-4 my-4"
    >
      <li class="flex flex-col justify-between my-3">
        <span class="font-semibold mb-2 text-3xl">{{
          reviewPeriodMessaging.title
        }}</span>
        <UtilityHTMLRenderer
          :content="reviewPeriodMessaging.message"
          is="span"
          class="text-2xl"
        >
        </UtilityHTMLRenderer>
      </li>
    </ul>

    <!-- /.purchase-summary__footer-->
  </div>
</template>

<style lang="scss" scoped>
  .purchase-summary {
    a {
      font-size: 0.875em;
    }

    .product-details {
      text-align: center;

      @media (min-width: 1024px) {
        text-align: left;
      }

      &__logo {
        span,
        img {
          margin: 0 auto;
          cursor: pointer;
        }
      }

      &__name {
        span {
          cursor: pointer;
        }
        @include header-2-typography;
        text-align: center;
        margin-top: 10px;
      }
    }
  }
</style>
