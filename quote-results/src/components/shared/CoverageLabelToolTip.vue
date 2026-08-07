<script setup lang="ts">
  import { computed } from 'vue';
  import { InformationCircleIcon } from '@heroicons/vue/24/outline';

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
  });

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
</script>

<template>
  <div
    class="daisy-tooltip inline-block tooltip-wrapper"
    :class="tooltipClass"
    :data-tip="toolTipText"
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
