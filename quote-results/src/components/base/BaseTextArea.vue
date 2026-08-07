<script setup>
  import BaseField from '@/components/base/BaseField.vue';

  defineProps({
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

    /**
     * Default input value
     */
    value: {
      type: String,
      required: true,
    },
  });

  const emit = defineEmits(['update:blur', 'update:focus']);

  const handleBlur = (e) => {
    // Remove leading/trailing whitespace before
    // broadcasting event
    const value = e.target.value.trim();
    emit('update:blur', value);
  };
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
      <textarea
        :id="id"
        :value="value"
        :disabled="disabled"
        :readonly="readOnly"
        :placeholder="placeholder"
        :required="required"
        :class="`${readOnly || disabled ? 'disabled' : ''}`"
        rows="10"
        @blur="handleBlur"
      >
      </textarea>
    </template>
  </BaseField>
</template>

<style lang="scss" scoped>
  textarea {
    height: 100%;
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
</style>
