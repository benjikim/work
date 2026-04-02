<script setup>
  import UtilityHTMLRenderer from '@/components/utility/UtilityHTMLRenderer.vue';
  import { ref } from 'vue';
  const isComparePage = window.location.pathname.includes('compare');
  defineProps({
    /**
     * Disabled attribute
     */
    disabled: {
      type: Boolean,
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
     * Checkbox state
     */
    checked: {
      type: Boolean,
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
     * Label attribute
     */
    agreeLabel: {
      type: String,
      default: '',
      required: false,
    },

    /**
     * Label attribute
     */
    mobileLabel: {
      type: String,
      default: '',
      required: false,
    },

    /**
     * Required attribute
     */
    required: {
      type: Boolean,
      required: true,
    },

    /**
     * Name attribute
     */
    name: {
      type: String,
      required: false,
      default: '',
    },

    /**
     * Value attribute
     */
    value: {
      type: String,
      required: true,
    },
  });
</script>

<template>
  <div
    class="form-checkbox flex items-center justify-center gap-4 mb-2"
    :class="{
      'form-checkbox--required': required,
    }"
  >
    <input
      :id="id"
      type="checkbox"
      :checked="checked"
      :disabled="disabled"
      :data-cy="`form-checkbox-${id}`"
      :name="name"
      :value="value"
    />
    <label
      :for="id"
      class="form-checkbox__label flex pt-1 text-xs text-left"
      :class="{
        '!display-none md:!flex': mobileLabel !== '',
      }"
    >
      <span v-if="required" class="form-checkbox__required-indicator">*</span>
      {{ checked && agreeLabel.length > 0 ? agreeLabel : label }}
    </label>
    <label
      v-if="mobileLabel !== ''"
      :for="id"
      class="form-checkbox__label text-xs text-left !flex md:!display-none font-bold"
      :class="{
        'font-bold': !isComparePage,
      }"
    >
      <span v-if="required" class="form-checkbox__required-indicator">*</span>
      {{ checked && agreeLabel.length > 0 ? agreeLabel : mobileLabel }}
    </label>
  </div>
</template>

<style lang="scss" scoped>
  .form-checkbox {
    cursor: pointer;
    input {
      appearance: none;
      font-size: 16px;
      width: 18px;
      height: 18px;
      min-width: 18px;
      min-height: 18px;
      border: 1px solid black;
      border-radius: 0px;
      outline: none;
      position: relative;
      cursor: pointer;
      flex-shrink: 0;
    }
    input:checked {
      background: var(--action-primary);
      border: 1px solid var(--action-primary);
    }
    input:checked:after {
      left: 50%;
      top: 50%;
      width: 6px;
      height: 10px;
      border: solid #fff;
      border-width: 0 2px 2px 0;
      -webkit-transform: translate(-50%, -50%) rotate(45deg);
      -ms-transform: translate(-50%, -50%) rotate(45deg);
      transform: translate(-50%, -50%) rotate(45deg);
      content: '';
      position: absolute;
    }
    &__required-indicator {
      color: $imt-red;
      margin-right: 4px;
    }
    &__label {
      cursor: pointer;
    }
    .utility-html-renderer {
      white-space: normal;
    }
  }
</style>
