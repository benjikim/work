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

    /**
     * Name attribute
     */
    name: {
      type: String,
      required: true,
    },

    /**
     * Value attribute
     */
    value: {
      type: String,
      required: true,
    },

    /**
     * Checked attribute
     */
     checked: {
      type: Boolean,
      required: false,
      default: false
    },
  });

  const emit = defineEmits(['click:label']);

  const labelClick = (e) => {
    emit('click:label');
  };
</script>

<template>
  <div
    class="form-radio flex items-center gap-4"
    :class="{
      'form-radio--required': required,
    }"
  >
    <input
      :id="id"
      type="radio"
      :class="{
        'form-input__input-container--disabled': disabled,
      }"
      :data-cy="`form-radio-${id}`"
      :name="name"
      :value="value"
      :checked="checked"
    />
    <label @click="labelClick" class="form-radio__label flex capitalize font-bold">
      <span v-if="required" class="form-radio__required-indicator">*</span>
      {{ label }}
    </label>
  </div>
</template>

<style lang="scss" scoped>
  .form-radio {
    cursor: pointer;
    input {
      appearance: none;
      font-size: 36px;
      width: 30px;
      height: 30px;
      border: 1px solid #ccc;
      border-radius: 3px;
      outline: none;
      position: relative;
      cursor: pointer;
    }
    input:checked {
      background: $imt-blue;
      border-color: $imt-blue;
    }
    input:checked:after {
      left: 37%;
      top: 8%;
      width: 8px;
      height: 20px;
      border: solid #fff;
      border-width: 0 3px 3px 0;
      -webkit-transform: rotate(45deg);
      -ms-transform: rotate(45deg);
      transform: rotate(45deg);
      content: '';
      position: absolute;
    }
    &__required-indicator {
      color: $imt-red;
      margin-right: 4px;
    }
    &__label,
    input {
      cursor: pointer;
    }
  }
</style>
