<script setup>
import { useSlots } from 'vue';
import InformationOutline from 'vue-material-design-icons/InformationOutline.vue';
import BaseTooltip from './BaseTooltip.vue';

const slots = useSlots();

defineProps({
  /**
   * Classes to add to group
   */
  classes: {
    type: String,
    default: '',
  },

  /**
   * Hint or help text
   */
  hint: {
    type: [String, null],
    required: true,
  },

  /**
   * HTML ID attribute
   */
  identifier: {
    type: String,
    required: true,
  },

  /**
   * Label title as optional
   */
  optional: {
    type: Boolean,
    required: false,
    default: false,
  },

  /**
   * Fieldset title/legend
   */
  title: {
    type: String,
    required: true,
  },

  /**
   * Determine if we want to hide our fieldset header on mobile
   */
  hideMobileTitle: {
    type: Boolean,
    required: false,
    default: false,
  },

  /**
   * Change color of the background of our fieldset for mobile
   */
  mobileBackgroundColor: {
    type: String,
    required: false,
    default: '',
  },

  /**
   * Display the fieldset
   */
  display: {
    type: Boolean,
    required: false,
    default: true,
  },
});
</script>

<template>
  <fieldset
    class="form-group grid grid-cols-1"
    :class="[{
      [classes]: classes, 'form-group__mobile-background' : mobileBackgroundColor, 'form-group__hide-field' : !display, 'form-group__hide-on-mobile': optional && display
    }]"
    :aria-labelledby="identifier"
    :data-cy="`form-group-${identifier}`"
    :style="{ '--mobile-bg-color': mobileBackgroundColor }"
  >
    <div class="form-group__title flex justify-content-center">
      <h2
        :id="identifier"
        :class="{'form-group__title-hide': hideMobileTitle}"
      >
        {{ title }} <span v-if="optional">(Optional)</span>
      </h2>

      <div v-if="hint" class="form-group__hint">
        <BaseTooltip :content="hint">
          <template #trigger>
            <information-outline :title="hint"></information-outline>
          </template>
        </BaseTooltip>
      </div>
      <!-- /.form-group__hint -->

    </div>
    <!-- /.form-group__title -->

    <div v-if="slots.inner" class="form-group__inner">
      <slot name="inner"></slot>
    </div>
    <!-- /.form-group__inner -->

  </fieldset>
</template>

<style lang="scss" scoped>
.form-group {
  background: $imt-bg-color;
  border: 0 none;
  padding: 8px;
  margin-bottom: 16px;

  @media (min-width: 640px) {
    padding: 16px;
  }

  @media (min-width: 1024px) {
    margin-left: unset;
    margin-right: unset;
    margin-bottom: 20px;
  }

  @media (max-width: 768px) {
    &__mobile-background {
      background: var(--mobile-bg-color, $imt-bg-color);
    }

    &__title-hide {
      display: none;
    }

    &__hide-on-mobile {
      display: none;
    }
  }

  &__hide-field {
      display: none;
    }
}

h2 {
  margin: 0 4px 0 0;
  padding: 0;
  @include header-2-typography;
  text-align: left;
}

.tooltip {
  .material-design-icon {
    font-size: 22px;
  }
}
</style>
