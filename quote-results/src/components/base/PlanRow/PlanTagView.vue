<script setup lang="ts">
  import { PlanTagData } from '@/types/index';
  import { useUserSessionStore } from '@/store/userSession';
  import { ref, onMounted, PropType } from 'vue';


  const sessionStore = useUserSessionStore();

  const props = defineProps({
    planTagData: {
      type: {} as PropType<PlanTagData>,
      required: true,
    },
  });
  const modalKey = ref('');
  /**
   * Sets plan tag id in session store.
   */
  const handleClick = (type: string) => {
    if (!props.planTagData.modal) return;
    sessionStore.setPlanTagId(type);
    sessionStore.setPlanTagModalOpen(true);
  };

  onMounted(() => {
    if (props.planTagData.modalKey) {
      modalKey.value = props.planTagData.modalKey;
    }
  });
</script>

<template>
  <div class="flex items-center">
    <p
      class="mt-1 md:mt-0 rounded px-[0.375rem] md:block text-[#999999] uppercase text-[0.5rem] md:text-[0.6rem] font-bold"
      :style="{
        color: planTagData.textColor,
      }"
      :class="{
        'cursor-pointer': props.planTagData.modal,
      }"
      @click="handleClick(modalKey)"
    >
      {{ planTagData.text }}
    </p>
  </div>
</template>
