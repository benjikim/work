<script setup>
  import { computed } from 'vue';
  import LockOutline from 'vue-material-design-icons/LockOutline.vue';
  import { useRouter } from 'vue-router';
  import { useContentStore } from 'src/store/modules/content.js';
  import { useApiStore } from 'src/store/modules/api.js';
  import { useFormStore } from 'src/store/modules/form.js';
  import BaseButton from 'src/components/base/BaseButton.vue';
  import {
    ORDER_STATE,
    LOCAL_STORAGE_KEYS,
    ONE_TRUST_COOKIE_CATEGORIES,
  } from 'src/config/index.js';

  /**
   * @var {Object} route Vue router
   */
  const router = useRouter();

  /**
   * @var {Object} contentStore
   */
  const contentStore = useContentStore();

  /**
   * @var {Object} apiStore
   */
  const apiStore = useApiStore();

  /**
   * @var {Object} formStore
   */
  const formStore = useFormStore();

  /**
   * @var {Object} productDetails Product details display data
   */
  const productDetails = computed(() => contentStore.getProductDetails);

  /**
   * @var {Boolean} formIsValid
   */
  const formIsValid = computed(() => formStore.getFormValidationStatus);

  const productCode = computed(() => apiStore.getProductCodeFromUrl());

  /**
   * Handle Submit handler
   */
  const handleSubmit = async () => {
    if (formIsValid.value) {
      apiStore.clearApiResponseMessages();
      let success;

      try {
        success = await apiStore.processSubmit();
      } catch (error) {
        console.error('Error processing submit:', {
          error: error.message,
          orderId: apiStore.getOrderId,
        });
      }

      let pageType = 'success';

      if (contentStore.isModeEdu) {
        pageType = 'eduSuccess';
      }

      if (apiStore.getOrderDetailState === ORDER_STATE.DELAYED) {
        pageType = 'delay';
      }

      if (success) {
        // Checks to see if OneTrustActiveGroup is defined and has the functional consent flagged.
        if (
          window.OnetrustActiveGroups !== undefined &&
          window.OnetrustActiveGroups.split(',').includes(
            ONE_TRUST_COOKIE_CATEGORIES.FUNCTIONAL
          )
        ) {
          localStorage.setItem(LOCAL_STORAGE_KEYS.DISPLAY_RESELLER, 'true');
        }

        router.push({
          name: 'Confirmation',
          query: {
            pageType,
            productCode: productCode.value,
          },
        });
      }
    }
  };
</script>
<template>
  <BaseButton
    data-cy="purchase-securely"
    text="Purchase Securely"
    :disabled="!formIsValid || apiStore.getFinalizingPurchase"
    @click="handleSubmit"
  >
    <template #before-text>
      <lock-outline></lock-outline>
    </template>
    <template #after-text>
      {{ productDetails?.product?.totalCost }}
    </template>
  </BaseButton>
</template>
