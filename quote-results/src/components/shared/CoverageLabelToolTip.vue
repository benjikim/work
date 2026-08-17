<script setup lang="ts">
  import { computed } from 'vue';
  import { InformationCircleIcon } from '@heroicons/vue/24/outline';
  import { useUserSessionStore } from '@/store/userSession';

  const props = defineProps({
    toolTipText: {
      type: String,
      required: true,
    },
    toolTipPosition: {
      type: String,
      required: false,
      default: 'top',
    },
    underlineLabel: {
      type: Boolean,
      required: false,
      default: false,
    },
    mobileModalHeading: {
      type: String,
      required: false,
      default: 'More Information',
    },
  });

  const sessionStore = useUserSessionStore();
  const useMobileModal = computed(
    () => sessionStore.isMobile && Boolean(props.toolTipText)
  );

  const tooltipClass = computed(() => {
    const position = props.toolTipPosition?.toLowerCase();
    const classMap: Record<string, string> = {
      right: 'daisy-tooltip-right',
      left: 'daisy-tooltip-left',
      bottom: 'daisy-tooltip-bottom',
      top: 'daisy-tooltip-top',
    };
    return classMap[position];
  });

  const openMobileModal = () => {
    if (!useMobileModal.value) return;

    sessionStore.setMoreInfoModalKey('');
    sessionStore.setMoreInfoModalContent({
      heading: props.mobileModalHeading,
      content: props.toolTipText,
    });
    sessionStore.setMoreInfoModalOpen(true);
  };
</script>

<template>
  <div
    class="inline-block tooltip-wrapper"
    :class="useMobileModal ? '' : ['daisy-tooltip', tooltipClass]"
    :data-tip="useMobileModal ? null : toolTipText"
    @click="openMobileModal"
  >
    <span
      v-if="underlineLabel"
      class="decoration-dotted underline underline-offset-4 cursor-help"
    >
      <slot />
    </span>
    <InformationCircleIcon v-else class="size-3 text-black" />
  </div>
</template>
