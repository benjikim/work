<script setup>
import { computed } from 'vue';

const props = defineProps({
  /**
   * Button theme color
   */
  color: {
    type: String,
    default: 'blue',
    validator(value) {
      return ['blue', 'purple', 'yellow', 'red', 'grey', 'green'].includes(value);
    },
  },

  /**
   * Disabled setting
   */
  disabled: {
    type: Boolean,
    default: false,
  },

  /**
   * Outlined setting
   */
  outlined: {
    type: Boolean,
    default: false,
  },

  /**
   * Button size
   */
  size: {
    type: String,
    default: 'default',
    validator(value) {
      return ['lg', 'sm', 'xs', 'xl', 'full', 'default'].includes(value);
    },
  },

  /**
   * Button text
   */
  text: {
    type: String,
    required: true,
  },
});

/**
 * @var {Array} classList Classes to apply to button element
 */
const classList = computed(() => {
  const classes = [];
  classes.push(`button--${props.color}`);

  if (props.size) {
    classes.push(`button--${props.size}`);
  }

  if (props.outlined) {
    classes.push(`button--outlined`);
  }

  if (props.disabled) {
    classes.push(`button--disabled`);
  }

  return classes;
});

</script>

<template>
  <button
    class="button"
    :class="classList"
    :disabled="disabled"
  >
    <slot name="before-text"></slot>
    {{ text }}
    <slot name="after-text"></slot>
  </button>
</template>

<style lang="scss" scoped>
.button {
  padding: 10px 30px;
  color: $imt-input-color-default;
  border-radius: $base-input-border-radius;
  transition: background-color .2s;
  font-weight: 600;
  cursor: pointer;

  &--full {
    width: 100%;
  }

  &--xl {
    font-size: 1.5em;
  }

  &--lg {
    font-size: 1.25em;
    padding: 5px 20px;
  }

  &--sm {
    font-size: 0.875em;
    padding: 5px 10px;
  }

  &--xs {
    font-size: 0.725em;
    padding: 5px 10px;
  }
}

.button--disabled {
  cursor: not-allowed;
  opacity: 0.5;
  background: inherit;
}

@each $key, $color in $themeColors {
  .button--#{$key} {
    background: $color;

    &:hover:not(.button--disabled) {
      background: color.adjust($color, $lightness: 4%);
    }
  }

  .button--outlined {
    background: transparent;

    &.button--#{$key} {
      border: 2px solid $color;
      color: $color;

      &:hover:not(.button--disabled) {
        background: inherit;
        border: 2px solid color.adjust($color, $lightness: 4%);
        color: color.adjust($color, $lightness: 4%);
      }
    }
  }
}
</style>
