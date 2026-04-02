<script setup>
import { ref, watch } from 'vue';
import UtilityHTMLRenderer from '../utility/UtilityHTMLRenderer.vue';

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
   * Select list items
   */
  options: {
    type: [Array, Object],
    required: true,
  },

  /**
   * Default input value
   */
   value: {
    type: String,
    required: false,
    default: '',
  },
});

/**
 * @var {String} selectedValue Binding for selected option value
 */
const selectedValue = ref('');

/**
 * BOLO for prop changes and set the default
 * selected value to prop value
 */
watch(() => props.value, (newValue) => {
  selectedValue.value = newValue;
}, { immediate: true, });

/**
 * @var {String} emit
 */
const emit = defineEmits(['update:select', 'update:blur']);

/**
 * @var {Event} handleBlur Blur event handler
 */
const handleBlur = () => {
  emit('update:select', selectedValue);
  emit('update:blur');
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
      <select
        :id="id"
        v-model="selectedValue"
        :disabled="disabled"
        :class="{
          'disabled': disabled
        }"
        @blur="handleBlur"
        >
        <option v-if="!value" style="display:none" selected="selected" value=""> </option>

        <!-- Used for data that has option groups -->
        <template v-if="'groups' in options">
          <optgroup v-for="(group, index) in options.groups" :key="index" :label="group.label">
            <option
              v-for="(text, key) in group.items"
              :key="key"
              :value="key"
              :selected="key === value"
            >
              <UtilityHTMLRenderer is="span" :content="text" ></UtilityHTMLRenderer>
            </option>
          </optgroup>
        </template>

        <!-- Used for data that is an array of strings with no keys -->
        <template v-else-if="Array.isArray(options)">
          <option
            v-for="(opt, index) in options"
            :key="index"
            :value="opt"
            :selected="key === value"
          >
            <UtilityHTMLRenderer is="span" :content="opt" ></UtilityHTMLRenderer>
          </option>
        </template>

        <!-- Used when data is an object -->
        <template v-else>
          <option
            v-for="(val, key) in options"
            :key="key"
            :value="key"
            :selected="key === value"
          >
          <UtilityHTMLRenderer is="span" :content="val" ></UtilityHTMLRenderer>
          </option>
        </template>
      </select>
    </template>
  </BaseFormField>
</template>

<style lang="scss" scoped>
  select {
    height: 48px;
    width: 100%;
    padding: 8px 16px;
    border-radius: $base-input-border-radius;
    border: 1px solid $imt-border-color-dark;
    background-color: $imt-input-color-default;
  }

  .disabled {
    background: linear-gradient(0deg, $imt-border-color-light, $imt-border-color-light),
    linear-gradient(0deg, $imt-border-color-dark, $imt-border-color-dark);
  }
</style>
