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
    <td class="font-bold text-xs bg-[#F6FAFD] snap-center">
      {{ `${benefit.details.value} ${benefit.details.description}` }}
      <Secondary
        class="text-sm font-bold capitalized inline"
        v-if="benefit.secondary"
        modal-view
      />
    </td>
  </div>
  <div class="font-bold text-xs bg-[#F6FAFD]" v-else>-</div>
</template>
