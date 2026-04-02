<script setup>
/**
 * For API reference and component usage, view
 * the Popper documentation
 * @link https://valgeirb.github.io/vue3-popper/guide/api.html
 */
import Popper from 'vue3-popper';

defineProps({
  /**
   * Text content
   */
  content: {
    type: String,
    required: true,
  },

  /**
   * Placement (position)
   */
  placement: {
    type: String,
    default: 'right',
  },
});

</script>

<template>
  <div class="tooltip">
    <Popper :content="content" hover :placement="placement">
      <slot name="trigger"></slot>
    </Popper>
  </div>
</template>

<style lang="scss" scoped>
.tooltip {
  // Override Popper CSS theming variables
  --popper-theme-background-color: #{$imt-overlay-bg-color};
  --popper-theme-border-radius: 4px;
  --popper-theme-text-color: #fff;
  --popper-theme-padding: 10px;
  cursor: pointer;

  .popper {
    font-size: 14px;
    font-weight: 300;
  }
}
</style>
