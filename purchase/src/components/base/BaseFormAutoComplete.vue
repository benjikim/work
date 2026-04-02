<script setup>
import { reactive, computed, watch } from 'vue';


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
 * @var {String} emit
 */
const emit = defineEmits(['update:select', 'update:blur']);

const state = reactive({
  showOptions: false,
  inputStarted: false,
  searchTerm: props.value ?? '',
});


/**
 * onchange Event handler
 */
const handleSelect = (e) => {
  emit('update:select', e.target);
  state.searchTerm = e.target.getAttribute('data-name');
  state.showOptions = false;
  state.inputStarted = false;
};

const searchOptions = computed(() => {
  if (!state.showOptions) {
    return [];
  }
  return props.options.filter(option => {
    if (
      option.name.substr(0, state.searchTerm.length).toUpperCase() === state.searchTerm.toUpperCase()
    ) {
      return option;
    }
  });
});

watch(() => props.value, (newPropVal) => {
  state.searchTerm = newPropVal;
});

const onInput = () => {
  state.showOptions = true;
  state.inputStarted = true;
};

const onFocus = () => {
  state.showOptions = true;
};


const onBlur = () => {
  emit('update:blur', state.inputStarted);
  state.showOptions = false;
  if (state.inputStarted) {
    state.searchTerm = '';
  }
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
      <div class="base-form-auto-complete">
        <input v-model="state.searchTerm" type="text" @input="onInput" @focus="onFocus" @blur="onBlur" >
        <ul  v-if="searchOptions.length">
            <li
                v-for="option in searchOptions"
                :key="option.code"
                :data-val="option.code"
                :data-name="option.name"
                @mousedown="handleSelect"
            >
                {{ option.name }}
            </li>
        </ul>
      </div>
    </template>
  </BaseFormField>
</template>

<style lang="scss" scoped>
  .base-form-auto-complete {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    input {
      height: 48px;
      width: 100%;
      padding: 8px 16px;
      border: 1px solid $imt-border-color-dark;
      border-radius: $base-input-border-radius;
    }
    ul {
        z-index: 10;
        position: absolute;
        top: 50px;
        background-color: $imt-input-color-default;;
        width: 100%;
        max-height: 304px;
        box-shadow: 0 5px 5px -3px rgba(0,0,0,.2), 0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12);
        overflow-x: hidden;
        overflow-y: auto;

        li {
            &:hover {
                background: #F7F7F7;
                cursor: pointer;
            }
            border-top: none;
            padding: 12px 10px
        }
    }
  }
</style>
