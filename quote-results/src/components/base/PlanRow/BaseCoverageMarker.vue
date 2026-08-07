<script setup lang="ts">
  import { computed, PropType } from 'vue';
  import { PlanRowMarkerType } from '@/types';
  import { resolveCoverageMarkerColor } from '@/utility';

  const props = defineProps({
    color: {
      type: String,
      required: false,
    },
    markerType: {
      type: String as PropType<PlanRowMarkerType>,
      required: false,
      default: '',
    },
  });

  const resolveColor = computed(() =>
    resolveCoverageMarkerColor(props.markerType, props.color)
  );

</script>
<template>
  <p
    class="w-full text-lg leading-3 flex items-center h-[0.375rem]"
    :style="{ color: resolveColor }"
  >
    •
  </p>
</template>
