<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import axios from 'axios';

  import { API_ENDPOINTS } from '@/config';
  import { useApiStore } from '@/store/api';
  import { useUserSessionStore } from '@/store/userSession';
  import { QuoteShortCodePayload } from '@/types';
  import { handleWordpressContentError } from '@/utility';

  const apiStore = useApiStore();
  const sessionStore = useUserSessionStore();

  const quoteReferenceCode = computed(() => apiStore.getQuoteReferenceCode);
  const quoteReferenceErrorRequest = ref(false);
  const isComparePage = window.location.pathname.includes('compare');
  const planCodes = computed(() => sessionStore.getSelectedPlansForCompare);
  const departureDate = computed(() => apiStore.getDepartureDate);
  const displayCopiedText = ref(false);
  async function requestCodeFromWP() {
    const qid = apiStore.getQuoteId;

    const payload: QuoteShortCodePayload = {
      qid,
      comparePlans: [],
      departureDate: departureDate.value,
    };

    if (isComparePage && planCodes.value.length) {
      payload.comparePlans = planCodes.value;
    }

    try {
      apiStore.setQuoteReferenceCode(null);
      quoteReferenceErrorRequest.value = false;
      const res = await axios.post(
        API_ENDPOINTS.cms.getQuoteShortCode(),
        payload
      );

      if (res.status === 200) {
        apiStore.setQuoteReferenceCode(res.data.code);
      }
    } catch (error) {
      handleWordpressContentError(
        error,
        `Error fetching quote reference code on ${window.location.hostname}`
      );
      quoteReferenceErrorRequest.value = true;
    }
  }

  const handleRetry = async () => {
    await requestCodeFromWP();
  };

  onMounted(async () => {
    await requestCodeFromWP();
  });
  const handleCopy = async () => {
    if (quoteReferenceCode.value) {
      await navigator.clipboard.writeText(quoteReferenceCode.value);
      displayCopiedText.value = true;
      setTimeout(() => {
        displayCopiedText.value = false;
      }, 2000);
    }
  };
</script>

<template>
  <div @click="handleCopy">
    <div v-if="quoteReferenceCode !== null && displayCopiedText">
      <span>Copied!</span>
    </div>
    <div v-else class="flex">
      <div class="mr-2">Reference #</div>
      <span
        class="font-bold font-mono slashed-zero"
        v-if="quoteReferenceCode !== null && !displayCopiedText"
        >{{ quoteReferenceCode }}</span
      >
      <div
        v-else-if="quoteReferenceCode === null"
        class="w-5 h-5 border-4 border-imt-blue border-t-transparent rounded-full animate-spin"
      ></div>
      <button
        v-else-if="quoteReferenceErrorRequest"
        class="daisy-btn daisy-btn-xs"
        @click="handleRetry"
      >
        Retry
      </button>
    </div>
  </div>
</template>

<style></style>
