<script setup>
defineProps({
  /**
   * Disabled attribute
   */
   autocomplete: {
    type: String,
    required: false,
    default: 'on',
  },

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
    required: true,
  },

  /**
   * Default input value
   */
  value: {
    type: [String, Number, null],
    required: true,
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
});

const emit = defineEmits(['update:blur', 'update:focus']);

const handleBlur = (e) => {
  // Remove leading/trailing whitespace before
  // broadcasting event
  const value = e.target.value.trim();
  emit('update:blur', value);
};

const handleFocus = (e) => {
  emit('update:focus', e);
};

</script>

<template>
  <BaseFormField
    :id="id"
    :hint="hint"
    :label="label"
    :disabled="disabled"
    :required="required"
    :errors="errors"
  >
    <template #input>
      <input
        :id="id"
        v-maska
        :type="type"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :readonly="readOnly"
        :placeholder="placeholder"
        :required="required"
        :value="value"
        :maxlength="maxlength"
        :class="`${readOnly || disabled ? 'disabled' : ''}`"
        :data-maska="mask"
        @blur="handleBlur"
        @focus="handleFocus"
      >
    </template>
  </BaseFormField>
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
    background: linear-gradient(0deg, $imt-border-color-light, $imt-border-color-light),
    linear-gradient(0deg, $imt-border-color-dark, $imt-border-color-dark);
  }

</style>
