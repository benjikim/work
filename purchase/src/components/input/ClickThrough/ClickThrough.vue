<script setup>
  import { required, helpers } from '@vuelidate/validators';
  import { useVuelidate } from '@vuelidate/core';
  import { computed, reactive, watch } from 'vue';
  import { event } from 'vue-gtag';

  import { useContentStore } from 'src/store/modules/content.js';
  import { useFormStore } from 'src/store/modules/form.js';
  import UtilityHTMLRenderer from 'src/components/utility/UtilityHTMLRenderer.vue';

  const props = defineProps({
    id: {
      type: String,
      required: true,
    },
    validation: {
      type: String,
      required: true,
    },
    messages: {
      type: Array,
      required: true,
    },
    notes: {
      type: Array,
      required: true,
    },
    dataType: {
      type: String,
      required: true,
    },
    values: {
      type: Array,
      required: true,
    },
  });

  const contentStore = useContentStore();
  const formStore = useFormStore();

  const inputType = props.dataType;
  const isClickThroughESig = inputType === 'text';
  const isClickThroughCheckBox = inputType === 'boolean';
  const isClickThroughRadio = inputType === 'multi';
  const isClickThroughMessageOnly = inputType.length === 0;

  const modelId = `${inputType}ClickThrough`;
  const inputField = contentStore.getInput(modelId);
  const value = computed(() => formStore.getClickthroughValue(props.id));

  const state = reactive({
    signature: null,
    checked: false,
    multi: [...Array(props.values.length).fill(false)],
  });

  watch(value, (newVal) => {
    if (isClickThroughRadio && newVal !== null) {
      // Setting all values to false.
      state.multi = [...Array(props.values.length).fill(false)];
      // Getting index of newVal and setting it to true.
      const indexOfValue = props.values.findIndex((val) => newVal === val);
      if (indexOfValue !== -1) {
        state.multi[indexOfValue] = true;
      }
    }
  });

  const rules = computed(() => {
    if (isClickThroughESig) {
      return {
        signature: {
          required: helpers.withMessage(
            inputField.messages.validation.required,
            required
          ),
        },
      };
    }
    return {};
  });

  const v$ = useVuelidate(rules, state);

  const handleChecked = () => {
    state.checked = !state.checked;

    event('buy-page_clickthrough-selected', {
      hierarchical_layer_1: `Clickthrough <${props.id}> selected`,
      hierarchical_layer_2: `checkbox: ${state.checked}`,
    });

    // Since this is a boolean type, we can set default value to be in 0 index.
    formStore.setClickthrough(props.id, state.checked ? props.values[0] : null);
  };

  const handleBlur = (data) => {
    state.signature = data;
    v$.value.signature.$validate();
    if (!v$.value.signature.$error) {
      formStore.setClickthrough(props.id, data);
      event('buy-page_clickthrough-selected', {
        hierarchical_layer_1: `Clickthrough <${props.id}> selected`,
        hierarchical_layer_2: `esignature: ${data}`,
      });
    } else {
      formStore.setClickthrough(props.id, null);
    }
  };

  const handleRadioSelect = (index) => {
    let validation = props.validation;
    if (validation.startsWith('/') && validation.endsWith('/')) {
      validation = validation.slice(1, -1);
    }
    const regex = new RegExp(validation);
    const value = props.values[index];
    state.multi = state.multi.map((_, i) => i === index);

    if (regex.test(value)) {
      formStore.setClickthrough(props.id, value);
      event('buy-page_clickthrough-selected', {
        hierarchical_layer_1: `Clickthrough <${props.id}> selected`,
        hierarchical_layer_2: `multi: ${props.validation}`,
      });
    } else {
      formStore.setClickthrough(props.id, null);
    }
  };

  const combinedMessages = props.messages.join('\n');
</script>

<template>
  <div>
    <!-- Header -->
    <p v-if="inputField?.header.length > 0" class="font-bold">
      <span v-if="validation !== 'no'" class="required-indicator">*</span>
      {{ inputField.header }}
    </p>

    <!-- Handle Notes -->
    <div v-if="Array.isArray(notes) && notes.length > 0">
      <UtilityHTMLRenderer
        is="p"
        v-for="(text, index) in notes"
        :key="index"
        :content="text"
        class="py-2"
      ></UtilityHTMLRenderer>
    </div>

    <!-- ESignature ClickThrough -->
    <div v-if="isClickThroughESig">
      <UtilityHTMLRenderer
        is="p"
        v-for="(message, index) in messages"
        :key="index"
        :content="message"
        class="py-4"
      ></UtilityHTMLRenderer>
      <BaseFormTextInput
        :id="`clickthrough-${id}`"
        v-model="state.signature"
        :value="value"
        :disabled="inputField.disabled"
        :required="inputField.required"
        :errors="v$?.signature?.$errors.map((error) => error.$message)"
        :type="inputField.type"
        :hint="inputField.hint"
        :label="inputField.label"
        :placeholder="inputField.placeholder"
        :mask="inputField.mask"
        @update:blur="handleBlur"
      >
      </BaseFormTextInput>
    </div>

    <!-- Checkbox ClickThrough -->
    <BaseCheckBox
      v-if="isClickThroughCheckBox"
      :id="`clickthrough-${id}`"
      :render-label-html="true"
      :label="combinedMessages"
      :disabled="inputField.disabled"
      :name="id"
      :required="inputField.required"
      :hint="inputField.hint"
      :placeholder="inputField.placeholder"
      :checked="value"
      class="py-2"
      @input="handleChecked"
    >
    </BaseCheckBox>

    <!-- Multi -->
    <div v-if="isClickThroughRadio">
      <UtilityHTMLRenderer
        is="p"
        v-for="(message, index) in messages"
        :key="index"
        :content="message"
        class="py-4"
      ></UtilityHTMLRenderer>
      <div class="flex flex-row justify-left items-center py-4">
        <BaseRadio
          v-for="(entry, index) in values"
          :id="`${id}-${index}`"
          :key="`${id}-${index}`"
          :label="entry"
          :disabled="inputField.disabled"
          :name="`${id}-${index}`"
          :required="inputField.required"
          :checked="state.multi[index]"
          :class="`${index !== 0 ? 'pl-10' : ''}`"
          @row:clicked="handleRadioSelect(index)"
        >
        </BaseRadio>
      </div>
    </div>

    <!-- No Input just a message -->
    <UtilityHTMLRenderer
      is="div"
      v-if="isClickThroughMessageOnly"
      :content="combinedMessages"
    ></UtilityHTMLRenderer>
  </div>
</template>

<style lang="scss" scoped>
  .required-indicator {
    color: $imt-red;
    margin-right: 4px;
  }
</style>
