<script setup>
  import UtilityHTMLRenderer from '@/components/utility/UtilityHTMLRenderer.vue';
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
     * Required attribute
     */
    required: {
      type: Boolean,
      required: true,
    },

    name: {
      type: String,
      required: false,
      default: '',
    },

    /**
     * Boolean to render label as html.
     */
    renderLabelHtml: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['update:checked', 'label:clicked', 'row:clicked']);

  const handleChecked = (e) => {
    emit('update:checked', e.target.value);
  };

  const handleLabelClick = (e) => {
    e.stopPropagation();
    emit('label:clicked');
  };

  const handleRowClick = (e) => {
    e.stopPropagation();
    emit('row:clicked');
  };
</script>

<template>
  <div
    class="form-checkbox flex items-center gap-4"
    :class="{
      'form-checkbox--required': required,
    }"
    @click="handleRowClick"
  >
    <input
      :id="id"
      type="checkbox"
      :checked="checked"
      :class="{
        'form-input__input-container--disabled': disabled,
      }"
      :disabled="disabled"
      :data-cy="`form-checkbox-${id}`"
      :name="name"
      @input="handleChecked"
    />
    <label
      v-if="renderLabelHtml"
      :for="id"
      class="form-checkbox__label flex"
      :class="{
        'opacity-50': disabled,
      }"
      @click="handleLabelClick"
    >
      <span v-if="required" class="form-checkbox__required-indicator">*</span>
      <UtilityHTMLRenderer
        is="span"
        class="utility-html-renderer"
        :content="label"
      ></UtilityHTMLRenderer>
    </label>
    <label
      v-else
      :for="id"
      class="form-checkbox__label flex"
      @click="handleLabelClick"
    >
      <span v-if="required" class="form-checkbox__required-indicator">*</span>
      {{ label }}
    </label>
  </div>
</template>

<style lang="scss" scoped>
  .form-checkbox {
    cursor: pointer;
    input {
      border-radius: 4px;
      border: 2px solid var(--action-alt-primary);
      background: var(--action-alt-primary);
      min-width: 20px;
      min-height: 20px;
      cursor: pointer;
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
