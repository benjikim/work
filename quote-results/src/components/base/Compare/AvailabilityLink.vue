<script setup lang="ts">
  import { computed } from 'vue';
  import { useUserSessionStore } from '@/store/userSession';
  import AvailabilityModal from './AvailabilityModal.vue';
  import type { QuoteResult } from '@/types';

  const { plan } = defineProps<{
    plan: QuoteResult;
  }>();

  const sessionStore = useUserSessionStore();

  const isMobile = computed(() => sessionStore.isMobileView);
  const label = computed(() =>
    isMobile.value ? 'SEE FULL RULES' : 'SEE RESTRICTIONS'
  );

  const handleClick = () => {
    sessionStore.setAvailabilityModalOpen(true);
  };
</script>

<template>
  <button
    type="button"
    :data-cy="`availability-button-${plan.code}`"
    @click="handleClick"
    class="text-[10px] text-blue-600 hover:text-blue-800 underline"
  >
    {{ label }}
  </button>

  <!-- keep modal mounted -->
  <AvailabilityModal
    :plan="plan"
    :data-cy="`availability-modal-${plan.code}`"
    v-show="true"
  />
</template>
