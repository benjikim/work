<script setup>
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
      required: true,
    },

    /**
     * Checkbox state
     */
    checked: {
      type: Boolean,
      required: true,
    },
  });

  const emit = defineEmits(['row:clicked']);

  const handleRowClick = (e) => {
    e.stopPropagation();
    emit('row:clicked');
  };

</script>

<template>
  <div
    class="form-radio flex items-center gap-4"
    :class="{
      'form-radio--required': required,
    }"
    @click="handleRowClick"
  >
    <input
      :id="id"
      type="radio"
      :class="{
        'form-input__input-container--disabled': disabled,
      }"
      :data-cy="`form-radio-${id}`"
      :name="name"
      :checked="checked"
    />
    <label :for="id" class="form-radio__label flex capitalize">
      <span v-if="required" class="form-radio__required-indicator">*</span>
      {{ label }}
    </label>
  </div>
</template>

<style lang="scss" scoped>
  .form-radio {
    cursor: pointer;
    input {
      border-radius: 3px;
      border: 2px solid $imt-blue;
      background: $imt-blue;
      width: 27px;
      height: 27px;
    }
    &__required-indicator {
      color: $imt-red;
      margin-right: 4px;
    }
    &__label, input {
      cursor: pointer;
    }
  }
</style>
