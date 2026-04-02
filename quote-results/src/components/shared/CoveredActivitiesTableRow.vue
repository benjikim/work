<script setup lang="ts">
  import { computed } from 'vue';
  import { useApiStore } from '@/store/api';

  const props = defineProps({
    planCode: {
      type: String,
      required: true,
    },
    coveredActivitiesArray: {
      type: Array,
      required: true,
    },
    isShownOnDetailsDrawer: {
      type: Boolean,
      default: false,
      required: false,
    },
  });

  const apiStore = useApiStore();

  const plan = computed(() => {
    if (props.planCode) {
      const p = apiStore.getPlanByPlanCode(props.planCode);
      return p;
    }
  });

  const filteredCoveredActivities = computed(() => {
    const arr: any = [];
    props.coveredActivitiesArray.forEach((ele: any) => {
      arr.push(plan.value?.coveredActivities.includes(ele) ? ele : '-');
    });
    return arr;
  });
</script>
<template>
  <ul
    v-if="plan && filteredCoveredActivities.length > 0"
    class="covered-activities capitalize flex flex-wrap gap-2"
  >
    <li
      v-for="activity in filteredCoveredActivities"
      :key="`${planCode}-${activity}`"
      class="text-xs md:text-sm snap-center flex-[0_0_calc(50%-0.25rem)] covered-activity-item"
      :class="{ 'bg-[#F6FAFD]': isShownOnDetailsDrawer }"
    >
      {{ activity }}
    </li>
  </ul>
  <div v-else class="text-sm text-center">-</div>
</template>
<style scoped>
  .covered-activity-item::before {
    content: '•';
    margin-right: 0.25rem;
  }
</style>
