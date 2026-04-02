<script setup>
import { computed, watch } from 'vue';
import InformationOutline from 'vue-material-design-icons/InformationOutline.vue';
import { useFormStore } from 'src/store/modules/form.js';
const formStore = useFormStore();

const props = defineProps({
  /**
   * Disabled attribute
   */
   disabled: {
    type: Boolean,
    required: true,
  },

  /**
   * List of error messages
   */
  errors: {
    type: Array,
    default: () => [],
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
   id: {
    type: String,
    required: true,
  },

  /**
   * Label attribute
   */
  label: {
    type: String,
    required: true,
  },

  /**
   * Messages
   */
  messages: {
    type: Array,
    default: () => [],
  },

  /**
   * Required attribute
   */
   required: {
    type: Boolean,
    required: true,
  },
});

/**
 * @var {Boolean} hasError Checks if this field has an error
 */
const hasError = computed(() => {
  return props.errors.length;
});

/**
 * @var {Boolean} hasError Checks if this field has an error
 */
const hasMessage = computed(() => {
  return props.messages.length;
});

const errors = computed(() => {
  return props.errors;
});

watch(errors, (val) => {
  if (val.length) {
    formStore.trackError(props.id, val.join(''));
  }
});

</script>

<template>
  <div
    class="form-input"
    :class="{
      'form-input--required': required,
      'form-input--has-error': hasError,
    }"
    :data-cy="`form-input-${id}`"
  >
    <label
      class="form-input__label flex justify-content-center"
      :for="id"
    >
      <span v-if="required" class="form-input__required-indicator">*</span>
      <span class="form-input__label-text mr-1">{{ label }}</span>

      <div v-if="hint" class="form-input__hint">
        <BaseTooltip :content="hint">
          <template #trigger>
            <information-outline :title="hint"></information-outline>
          </template>
        </BaseTooltip>
      </div>

    </label>

    <div
      class="form-input__input-container flex"
      :class="{
        'form-input__input-container--disabled': disabled,
      }"
      tabindex="-1"
    >
      <slot name="input"></slot>
    </div>
    <!-- /.form-input__hint -->

    <ul
      v-show="hasError && !disabled"
      :id="`${id}-errors`"
      :data-cy="`${id}-errors`"
      class="form-input__error-list error-list"
      role="alert"
    >
      <li v-for="(error, index) in errors" :key="index" class="error-list__error">
        {{ error }}
      </li>
    </ul>
    <!-- /.form-input__error-list -->

    <ul
      v-show="hasMessage && !hasError && !disabled"
      :id="`${id}-messages`"
      :data-cy="`${id}-messages`"
      class="form-input__message-list message-list"
      role="alert"
    >
      <li v-for="(message, index) in messages" :key="index" class="message-list__message">
        {{ message }}
      </li>
    </ul>
    <!-- /.form-input__message-list -->

  </div>
  <!-- /.form-input -->
</template>

<style lang="scss" scoped>
.form-input{
  &__label  {
    font-size: 14px;
    font-weight: 700;
    line-height: 18px;
    letter-spacing: 0px;
    text-align: left;
    margin-bottom: 8px;
    align-items: center;
    &-text {
      white-space: nowrap;
    }
  }

  &__required-indicator {
    color: $imt-red;
    margin-right: 4px;
  }

}

.error-list {
  color: $imt-red;
  list-style: none;
  padding: 0;
  margin: 0;
}

.tooltip {
  .material-design-icon {
    font-size: 18px;
  }
}
</style>
