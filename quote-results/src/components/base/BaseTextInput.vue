<script setup>
  import BaseField from '@/components/base/BaseField.vue';
  import { computed } from 'vue';

  const props = defineProps({
    /**
     * Disabled attribute
     */
    disabled: {
      type: Boolean,
      required: true,
    },

    /**
     * Determines if input is read-only
     */
    readOnly: {
      type: Boolean,
      required: false,
      default: false,
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
     * Placeholder text
     */
    placeholder: {
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
      required: false,
    },

    /**
     * Type
     */
    type: {
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
      required: false,
    },

    /**
     * Default input value
     */
    value: {
      type: [String, Number, null],
      required: false,
    },

    /**
     * Optional mask patter
     */
    mask: {
      type: String,
      required: false,
      default: null,
    },

    /**
     * Set max length
     */
    maxlength: {
      type: Number,
      required: false,
      default: 64,
    },

    /**
     * v-model bound value to update state of child component
     */
    modelValue: {
      type: [String, Number],
      required: false,
      default: null
    }
  });

  const emit = defineEmits(['update:blur', 'update:focus', 'update:modelValue']);

  const handleBlur = (e) => {
    // Remove leading/trailing whitespace before
    // broadcasting event
    const value = e.target.value.trim();
    emit('update:blur', value);
  };

  const handleFocus = (e) => {
    emit('update:focus', e);
  };


  const handleInput = (e) => {
    // Emit the new value to the parent component
    emit('update:modelValue', e.target.value);
  }

  /**
   * @var {Boolean} hasError Checks if this field has an error
   */
  const hasError = computed(() => {
    return props.errors.length;
  });
</script>

<template>
  <BaseField
    :id="id"
    :hint="hint"
    :label="label"
    :disabled="disabled"
    :required="required"
    :errors="errors"
    :messages="messages"
  >
    <template #input>
      <input
        :id="id"
        :type="type"
        :disabled="disabled"
        :readonly="readOnly"
        :placeholder="placeholder"
        :required="required"
        :value="modelValue"
        :maxlength="maxlength"
        :class="`${readOnly || disabled ? 'disabled' : ''} ${hasError ? 'has-errors' : ''}`"
        :data-maska="mask"
        @blur="handleBlur"
        @focus="handleFocus"
        @input="handleInput"
      />
    </template>
  </BaseField>
</template>

<style lang="scss" scoped>
  input {
    height: 48px;
    width: 100%;
    padding: 8px 16px;
    border: 1px solid $imt-border-color-dark;
    border-radius: $base-input-border-radius;
    background-color: $imt-input-color-default;
  }
  .disabled {
    background: linear-gradient(
        0deg,
        $imt-border-color-light,
        $imt-border-color-light
      ),
      linear-gradient(0deg, $imt-border-color-dark, $imt-border-color-dark);
  }
  .has-errors {
    border-color: $imt-red;
  }
</style>
