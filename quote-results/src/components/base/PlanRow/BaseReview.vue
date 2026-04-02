<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { useContentStore } from '@/store/content';
  import { initResellerRatings } from '@/utility';

  const props = defineProps({
    planCode: {
      type: String,
      required: true,
    },
    manuallyGetReviews: {
      type: Boolean,
      default: false,
    },
  });

  const contentStore = useContentStore();
  const planPermaLink = computed(() =>
    contentStore.getPermaLinkViaCode(props.planCode)
  );

  onMounted(() => {
    props.manuallyGetReviews ? initResellerRatings() : null;
  });

  const handleClick = () => {
    if (planPermaLink.value !== null && planPermaLink.value !== undefined) {
      window.open(planPermaLink.value, '_blank');
    }
  };
</script>

<template>
  <div
    class="daisy-tooltip daisy-tooltip-left sm:daisy-tooltip-bottom review-tooltip flex items-start justify-center"
    data-tip="Based on the number of travelers that have purchased this plan"
  >
    <div
      class="rr_cat_ratings text-[0.75rem] leading-4 font-semibold text-[#878787] cursor-pointer flex justify-center"
      :data-rr-product-id="planCode"
      @click="handleClick"
    ></div>
  </div>
</template>

<style scoped>
  .rr_cat_ratings {
    min-height: 17px; /* Ensure container has some height */
    min-width: 100px; /* Ensure container has some width */
  }

  /* Override the default tooltip width */
  #quote-results-app .daisy-tooltip.review-tooltip::hover::before {
    max-width: 30rem;
  }

  /* Additional positioning fixes if needed */
  .review-tooltip::before {
    max-width: 200px; /* Limit tooltip width */
    white-space: normal; /* Allow text wrapping */
    width: max-content;
  }

  @media (max-width: 639px) {
    .review-tooltip::before {
      right: 0; /* Ensure tooltip stays within screen bounds */
      left: auto;
    }
  }
</style>
