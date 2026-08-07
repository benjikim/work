<script setup lang="ts">
  import { useApiStore } from '@/store/api';
  import { computed, ref } from 'vue';
  import { ChevronDownIcon } from '@heroicons/vue/24/solid';
  import { ChevronUpIcon } from '@heroicons/vue/24/solid';

  const hide = ref(true);
  const apiStore = useApiStore();
  const pnsPlans = computed(() => apiStore.getPNSPlans);

  /**
   * Toggles the accordion state.
   */
  const handleAccordion = () => {
    hide.value = !hide.value;
  };
</script>

<template>
  <div
    :class="`pb-5 grid transition-[grid-template-rows] duration-500 ease-in-out overflow-hidden ${hide ? 'grid-rows-[min-content_0fr]' : 'grid-rows-[min-content_1fr]'}`"
  >
    <div class="flex justify-between border-b-2 border-[#A7A7A7] pb-2">
      <div class="flex" @click="handleAccordion">
        <ChevronUpIcon
          v-if="hide"
          class="size-6 stroke-imt-blue cursor-pointer"
        />
        <ChevronDownIcon v-else class="size-6 stroke-imt-blue cursor-pointer" />
        <p class="pl-2 text-base font-bold text-imt-blue">Unavailable Plans</p>
      </div>
    </div>
    <div :class="`mt-2 overflow-hidden`">
      <div v-for="plan in pnsPlans" :key="plan.code">
        <div class="font-bold">{{ `${plan.name} - ${plan.code}` }}</div>
        <div class="font-normal" v-if="plan.rules && plan.rules.length > 0">
          - {{ plan.rules[0].message }}
        </div>
      </div>
    </div>
  </div>
</template>
