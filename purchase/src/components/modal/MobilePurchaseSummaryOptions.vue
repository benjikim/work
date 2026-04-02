<script setup>
import { computed } from 'vue';
import { useContentStore } from 'src/store/modules/content.js';

const contentStore = useContentStore();
const productDetails = computed(() => contentStore.getProductDetails);

</script>

<template>
  <div class="mobile-purchase-summary-modal-body">
    <div class="mobile-purchase-summary-modal-body__logo">
        <img
            v-if="productDetails.provider.logo"
            :src="productDetails.provider.logo"
            :alt="`${productDetails.provider.name} Logo`"
        >
        <span v-else class="w-20 bg-gray-300 h-20 rounded-md animate-pulse block"></span>
    </div>

    <div class="mobile-purchase-summary-modal-body__name">
        <span v-if="productDetails.product.name">{{ productDetails.product.name }}</span>
        <span v-else class="w-3/4 bg-gray-300 h-2 m-4 rounded-md animate-pulse inline-block"></span>
    </div>
    <BaseButton class="my-1" text="View More Information" size="full"></BaseButton>
    <BaseButton class="my-1" text="Download Certificate" size="full"></BaseButton>
    <BaseButton class="mt-1 mb-2" text="View Price Breakdown" size="full"></BaseButton>
  </div>
</template>

<style lang="scss" scoped>
    .mobile-purchase-summary-modal-body {
        &__logo, &__name {
            display: flex;
            justify-content: center;
        }
        &__name {
            @include header-2-typography;
            text-align: center;
            margin-top: 10px;
            margin-bottom: 36px;
        }    
    }
</style>
