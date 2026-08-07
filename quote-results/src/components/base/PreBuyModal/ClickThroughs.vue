<script setup lang="ts">
  import {
    computed,
    ComponentPublicInstance,
    onMounted,
    reactive,
    ref,
    PropType,
  } from 'vue';
  import { findKeyByValue } from '@/utility/index.ts';
  import { useUserSessionStore } from '@/store/userSession';
  import { useApiStore } from '@/store/api';
  import { useContentStore } from '@/store/content';
  import { ClickThrough } from '@/types';
  import BaseCheckBox from '@/components/base/Form/BaseCheckBox.vue';
  import BaseRadio from '@/components/base/Form/BaseRadio.vue';
  import UtilityHTMLRenderer from '@/components/utility/UtilityHTMLRenderer.vue';
  import { GAObject } from '@/types';
  import { event } from 'vue-gtag';

  const props = defineProps({
    clickthroughs: {
      type: Array as PropType<ClickThrough[]>,
      required: true,
    },
  });

  const contentStore = useContentStore();
  const sessionStore = useUserSessionStore();
  const apiStore = useApiStore();

  const clickthroughPopups = computed(
    () => apiStore.getPlanContent(sessionStore.getPBMPlan)?.popups
  );

  const plan = computed(() =>
    apiStore.getPlanByPlanCode(sessionStore.getPBMPlan)
  );

  const getCMSPopup = (clickthrough: ClickThrough, text: string): string => {
    const popups = clickthroughPopups.value;
    const popup = popups?.[clickthrough.id];
    if (popup?.content) {
      // Enabling ISOSGTIMT to be turned on again by doing some
      // stuff to get the cert link here instead of the broken link.
      if (plan?.value?.code === 'ISOSGTIMT') {
        const certLink = plan?.value?.certificate.url;
        // Create a temporary DOM element to parse the HTML content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = popup.content;

        // Find the first anchor tag if it exists
        const anchorTag = tempDiv.querySelector('a');
        if (anchorTag) {
          anchorTag.href = certLink?.toString() || '';
          return tempDiv.innerHTML;
        }
      }

      return popup.content;
    }
    return text;
  };

  const state = reactive({
    clickThroughValidations: {} as ClickThroughValidationMap,
  });

  const inputs = contentStore.getInput;
  const checkBoxInput = inputs?.pbm_checkbox;
  const radioInput = inputs?.pbm_radio;

  type ClickThroughValidationMap = {
    [key: string]: string;
  };

  // A type to handle refs for our clickthrough components.
  type ClickThroughRefs = {
    noteId: string;
    ele: HTMLElement;
  };

  const clickthroughRefs = ref<ClickThroughRefs[]>([]);

  /**
   * Handles input change for both multi and boolean clickthroughs.
   *
   * @param e InputEvent
   */
  const handleSelect = (e: InputEvent): void => {
    const target = e.target as HTMLInputElement;
    let value = target?.value;

    if (target?.type === 'checkbox') {
      value = target?.checked ? 'yes' : '';
    }

    state.clickThroughValidations[target?.id] = value;
    sessionStore.setClickThroughValue(target?.id, value);

    if (value === '') {
      event('plan_action_plan_details_modal', {
        hierarchical_layer_1: `Clickthrough <${target?.id}> unselected`,
      } as GAObject);
    } else {
      event('plan_action_plan_details_modal', {
        hierarchical_layer_1: `Clickthrough <${target?.id}> selected`,
        hierarchical_layer_2: `${target?.type}: ${value}`,
      } as GAObject);
    }

    processValidation();

    scrollToNextClickthrough();
  };

  /**
   * Adding our clickthrough refs.
   *
   * @param {ComponentPublicInstance} ele
   * @param {String} noteId
   */
  const setClickthroughRefs = (
    ele: ComponentPublicInstance,
    noteId: string
  ): void => {
    if (ele) {
      clickthroughRefs.value.push({
        noteId,
        ele: ele.$el,
      });
    }
  };

  /**
   * Label select method for Radio button handler
   *
   * @param {string} noteId
   * @param {string} entry
   */
  const handleLabelSelect = (noteId: string, entry: string): void => {
    state.clickThroughValidations[noteId] = entry;
    sessionStore.setClickThroughValue(noteId, entry);

    scrollToNextClickthrough();
  };

  /**
   * Helper method to reduce repeated logic.
   */
  const scrollToNextClickthrough = (): void => {
    // Scroll to next clickThrough.
    const obj = { ...state.clickThroughValidations };
    // Gets the
    const ctNoteId = findKeyByValue(obj, '') ?? Object.keys(obj).pop();
    if (ctNoteId) {
      const ctElement = clickthroughRefs.value.find(
        (ele) => ele.noteId === ctNoteId
      )?.ele;
      ctElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  /**
   * Checks validation for clickthroughs
   */
  const processValidation = (): void => {
    let valid = true;

    Object.keys(state.clickThroughValidations).forEach((noteId: string) => {
      if (noteId !== 'note51dc21549571e') {
        const clickThrough = plan.value?.clickthroughs.find(
          (ct) => ct.id === noteId
        );

        if (!clickThrough?.modalKey && !clickThrough?.modalContent) {
          let validation = clickThrough?.validation ?? '';

          // Removes / / strings if validation has it.
          if (validation.startsWith('/') && validation.endsWith('/')) {
            validation = validation.slice(1, -1);
          }
          // Regex validation test

          const regex = new RegExp(validation);
          if (!regex.test(state.clickThroughValidations[noteId] as string)) {
            valid = false;
          }
        }
      }
    });
    sessionStore.setClickThroughValidation(valid);
  };

  // Setting default value of to '' if there are any required validation.
  for (const ct of props.clickthroughs) {
    if (ct.validation !== 'no') {
      const value = sessionStore.getClickthroughValue(ct.id);
      state.clickThroughValidations[ct.id] = value;
    }
  }

  // Scroll to next clickthrough and set
  // check if vlaid.
  onMounted(() => {
    scrollToNextClickthrough();
    processValidation();
  });
</script>

<template>
  <div class="col-span-12">
    <div
      v-for="clickthrough in clickthroughs"
      :key="clickthrough?.id"
      class="clickthrough"
    >
      <!-- Clickthrough notes -->
      <UtilityHTMLRenderer
        is="p"
        v-for="(text, index) in clickthrough.notes"
        :key="index"
        :content="text"
        class="py-2"
      ></UtilityHTMLRenderer>

      <template v-for="(text, index) in clickthrough.messages" :key="index">
        <UtilityHTMLRenderer
          v-if="
            clickthroughPopups &&
            clickthrough?.id &&
            clickthroughPopups[clickthrough.id]
          "
          is="p"
          :content="getCMSPopup(clickthrough, text)"
          class="py-2"
        ></UtilityHTMLRenderer>

        <UtilityHTMLRenderer
          v-else
          is="p"
          :content="text"
          class="py-2"
        ></UtilityHTMLRenderer>
      </template>

      <div
        class="pbm__checkbox border-b border-black"
        v-if="clickthrough?.type === 'boolean'"
      >
        <BaseCheckBox
          :id="clickthrough?.id"
          :ref="
            (ele: ComponentPublicInstance) =>
              setClickthroughRefs(ele, clickthrough?.id)
          "
          :label="checkBoxInput.label"
          :mobile-label="checkBoxInput.mobileLabel"
          :agree-label="checkBoxInput.agreeLabel"
          :disabled="checkBoxInput.disabled"
          :name="clickthrough?.id"
          :required="
            state.clickThroughValidations[clickthrough?.id] !==
            clickthrough?.validation
          "
          :hint="checkBoxInput.hint"
          :placeholder="checkBoxInput.placeholder"
          :checked="
            state.clickThroughValidations[clickthrough?.id] ===
            clickthrough?.validation
          "
          :value="clickthrough?.values[0]"
          class="pt-2 pb-4"
          @input="handleSelect"
        >
        </BaseCheckBox>
      </div>

      <!-- Multi -->
      <div
        class="pbm__radio flex justify-evenly border-b border-black"
        v-if="clickthrough.type === 'multi'"
      >
        <BaseRadio
          v-for="(entry, index) in clickthrough?.values"
          :ref="
            (ele: ComponentPublicInstance) =>
              setClickthroughRefs(ele, clickthrough?.id)
          "
          :id="`${clickthrough?.id}`"
          :key="`${clickthrough?.id}-${index}`"
          :label="entry"
          :value="entry"
          :disabled="radioInput.disabled"
          :name="`${clickthrough?.id}`"
          :required="radioInput.required"
          :checked="state.clickThroughValidations[clickthrough?.id] === entry"
          class="pt-2 pb-4"
          @input="handleSelect"
          @click:label="handleLabelSelect(clickthrough?.id, entry)"
        >
        </BaseRadio>
      </div>
    </div>
  </div>
</template>
