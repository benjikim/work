<script setup lang="ts">
  import { useApiStore } from '@/store/api';
  import { useUserSessionStore } from '@/store/userSession';
  import { ref } from 'vue';

  const props = withDefaults(
    defineProps<{
      planCode: string;
      label?: string;
      dataCy: string;
      trackCertificateClick: (planCode: string) => void;
      isComparePage?: boolean;
    }>(),
    {
      label: 'View Certificate',
    }
  );

  const apiStore = useApiStore();
  const sessionStore = useUserSessionStore();
  const loading = ref(false);

  const getValidCertificate = async (planCode: string) => {
    if (sessionStore.plansToRequote.includes(planCode)) {
      try {
        await sessionStore.setPlanParameters(true);
      } catch (error) {
        console.error(
          'Error during silent requote for Certificate link: ',
          error
        );
      }
    }

    const plan = apiStore.getPlanByPlanCode(planCode);

    if (!plan) return;
    // Open certificate in new tab
    window.open(plan.certificate.url, '_blank');
  };

  const handleClick = async (e: Event) => {
    e.preventDefault();
    loading.value = true;
    try {
      await getValidCertificate(props.planCode);
      props.trackCertificateClick(props.planCode);
    } finally {
      loading.value = false;
    }
  };
</script>

<template v-if="plan && plan.certificate.url">
  <div v-if="loading" class="flex items-center justify-center gap-2 w-full">
    <span class="daisy-loading daisy-loading-spinner daisy-loading-sm"></span>
    Loading Certificate
  </div>
  <button
    v-else
    type="button"
    :data-cy="dataCy"
    @click="handleClick"
    :disabled="loading"
    class="text-blue-600 hover:text-blue-800 block w-full"
    :class="{ uppercase: isComparePage }"
  >
    <template v-if="isComparePage">
      <span class="display-none lg:block font-bold text-action-alt-primary"
        >View Certificate</span
      >
      <span class="block lg:display-none font-bold text-action-alt-primary"
        >Certificate</span
      >
    </template>
    <template v-else>
      {{ label }}
    </template>
  </button>
</template>
