<script setup lang="ts">
  import { computed } from 'vue';
  import { useContentStore } from '@/store/content';
  import { useUserSessionStore } from '@/store/userSession';
  import {
    displayLabel,
    displayAdditionalOptionLabel,
  } from '@/utility/index.ts';
  import { CostAndSelected } from '@/types/index.ts';
  import BaseCheckBox from '@/components/base/Form/BaseCheckBox.vue';
  import { useApiStore } from '@/store/api';
  import Secondary from '@/components/shared/Secondary.vue';

  const contentStore = useContentStore();
  const sessionStore = useUserSessionStore();
  const apiStore = useApiStore();
  const inputs = contentStore.getInput;
  const checkBoxInput = inputs?.checkboxOption;

  const props = defineProps({
    planCode: {
      type: String,
      required: true,
    },
    optionKey: {
      type: String,
      required: true,
    },
    optionLocation: {
      type: String,
      required: true,
    },
  });

  const options = computed(() =>
    sessionStore.getOptionsOfSelectedPlan(props.planCode)
  );

  const isAdditionalOption = computed(() =>
    contentStore.isOptionAnOptionalCoverage(props.optionKey)
  );

  const isOptionSecondary = computed(() => {
    const coverages = sessionStore.getCoveragesOfSelectedPlan(props.planCode);
    const coverage = coverages[props.optionKey];
    const isSecondary = coverage?.secondary ?? false;
    return isSecondary;
  });

  /**
   * Handles input change for options.
   *
   * @param {MouseEvent} event
   * @param {string} optionId
   * @param {string} value
   */
  function handleInput(
    event: MouseEvent,
    optionId: string,
    value: string | number
  ): void {
    const target = event.target as HTMLInputElement;

    sessionStore.updateOption(
      props.planCode,
      optionId,
      value,
      target.checked ?? false
    );

    if (
      apiStore.getPlanByPlanCode(props.planCode)?.type === 'Travel Medical' &&
      props.optionLocation === 'preBuyModal'
    ) {
      sessionStore.setPlanParameters();
    }
  }

  /**
   * Helper Function to Sort Option Keys while keeping the key 'off' as the first option
   *
   * @param {Object} options
   * @returns {string[]}
   */
  const sortValues = (options: {
    [key: string]: CostAndSelected;
  }): string[] => {
    const optionKeys = Object.keys(options);
    return optionKeys.length > 2
      ? optionKeys.sort((a: string, b: string) => {
          if (a === 'off') return -1; // "off" should come first
          if (b === 'off') return 1;
          if (typeof a === 'number' && typeof b === 'number') {
            return a - b; // Numeric comparison for numbers
          }
          return 0; // No sorting for other types (only "off" and numbers are expected)
        })
      : optionKeys;
  };
</script>

<template>
  <div
    v-for="(key, _index) in sortValues(options[optionKey].values)"
    :key="`${planCode}-${optionKey}-${key}-${optionLocation}`"
    class="option-container"
  >
    <div class="flex">
      <BaseCheckBox
        :id="`${planCode}-${optionKey}-${key}-${optionLocation}`"
        :key="`${planCode}-${optionKey}-${key}-${optionLocation}`"
        :name="`${planCode}-${optionKey}-${key}-${optionLocation}`"
        :label="
          isAdditionalOption || optionKey === 'deductible'
            ? displayAdditionalOptionLabel(
                planCode,
                optionKey,
                options[optionKey].values[key].cost,
                key,
                options[optionKey].displayName
              )
            : displayLabel(
                contentStore,
                sessionStore,
                planCode,
                key,
                options[optionKey].values[key].cost,
                options[optionKey].displayName,
                optionKey
              )
        "
        :disabled="
          options[optionKey].values[key].selected &&
          Object.keys(options[optionKey].values).length > 1
        "
        :required="checkBoxInput.required"
        :hint="checkBoxInput.hint"
        :placeholder="checkBoxInput.placeholder"
        :checked="options[optionKey].values[key].selected"
        :value="key"
        class="pt-2 pb-4"
        @input.stop="(e: MouseEvent) => handleInput(e, optionKey, key)"
      >
      </BaseCheckBox>
      <Secondary
        modal-view
        class="text-xs font-bold capitalized inline pt-2"
        v-if="isOptionSecondary && optionLocation !== 'planRowDetails'"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .form-checkbox input {
    background-color: white;
  }
  .daisy-tooltip:before {
    font-weight: normal;
    max-width: 19rem;
  }
</style>
