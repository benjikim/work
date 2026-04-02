<script setup lang="ts">
  import { computed } from 'vue';
  import { useApiStore } from '@/store/api';
  import Secondary from '@/components/shared/Secondary.vue';

  const props = defineProps({
    planCode: {
      type: String,
      required: true,
    },
  });

  const apiStore = useApiStore();

  const plan = computed(() => {
    if (props.planCode) return apiStore.getPlanByPlanCode(props.planCode);
  });
</script>
<template>
  <div
    v-if="plan && plan.includedBenefits?.length > 0"
    v-for="benefit in plan.includedBenefits"
    :key="`${planCode}-${benefit.details.value}-${benefit.details.description}`"
  >
    <div class="pl-2 text-sm snap-center">
      • {{ `${benefit.details.value} ${benefit.details.description}` }}
      <Secondary
        v-if="benefit.secondary"
        class="text-sm capitalized inline"
        modal-view
      />
    </div>
  </div>
  <div v-else class="text-xs">-</div>
</template>
