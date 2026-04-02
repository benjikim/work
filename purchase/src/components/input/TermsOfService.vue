<script setup>
  import { useContentStore } from 'src/store/modules/content.js';
  import { useFormStore } from 'src/store/modules/form.js';
  import UtilityHTMLRenderer from '../utility/UtilityHTMLRenderer.vue';
  import { computed } from 'vue';

  const props = defineProps({
    clickthroughs: {
      type: Array,
      required: true,
    },
    clickthroughsNonModalTag: {
      type: Array,
      required: true,
    },
    clickthroughsInLink: {
      type: Boolean,
      required: false,
      default: false,
    },
  });

  const contentStore = useContentStore();
  const formStore = useFormStore();

  const productDetails = computed(() => contentStore.getProductDetails);
  const modelId = contentStore.isThemeSoventure
    ? 'termsOfServiceSoventureCheckbox'
    : 'termsOfServiceCheckbox';
  const modal = contentStore.isThemeSoventure
    ? 'termsOfServiceSoventureModal'
    : 'termsOfServiceModal';

  const tosCheckbox = computed(() => formStore.getTermsOfServiceAgreed);
  const tosModal = contentStore.getModal(modal);
  const inputField = contentStore.getInput(modelId);

  const hasClickThroughs = computed(
    () =>
      props.clickthroughs.some((ct) => ct.modalTag && ct.modalContent) ||
      (props.clickthroughsNonModalTag.length > 0 && props.clickthroughsInLink)
  );

  const updateCheckboxState = (newState) => {
    let checked = newState;
    if (typeof newState !== 'boolean') {
      checked = !tosCheckbox.value;
    }
    formStore.setTermsOfServiceAgreed(checked);
    formStore.setUserAgreementSelection(checked);

    if (hasClickThroughs.value && checked) {
      props.clickthroughs.forEach((ct) => {
        if (ct.modalTag && ct.modalContent && ct.validation === 'yes') {
          formStore.setClickthrough(ct.id, ct.validation);
        }
      });

      if (props.clickthroughsInLink) {
        props.clickthroughsNonModalTag.forEach((ct) => {
          if (ct.validation === 'yes') {
            formStore.setClickthrough(ct.id, ct.validation);
          }
        });
      }
    }
  };

  const openModal = (e) => {
    if (e.target?.id === 'terms-of-service__open-modal') {
      contentStore.setModalData(tosModal);
      contentStore.setShowModal(true);
    } else {
      updateCheckboxState(!tosCheckbox.value);
    }
  };

  const clickthroughModalId = 'userAgreementCheckbox';

  const clickthroughModalInputField =
    contentStore.getInput(clickthroughModalId);

  const agreementsMap = {
    GENERALDISCLOSURES: 'General Disclosures',
    NONMEDICALEVAC: 'Non Medical Evacuation',
    TERMS: 'Terms and Conditions',
    COVID19: 'COVID-19 Guidelines',
    MEMBERSHIP: 'Membership Terms',
    ELIGIBILITY: 'Eligibility Requirements',
    DISCLOSURES: 'Disclosures',
    EEACOUNTRIES: 'EEA Countries Guidelines',
    CALIFORNIANOTICE: 'California Notice',
    AVAILABILITY: 'Availability Requirements',
    TELADOC: 'Teladoc Benefit',
    DISCLAIMER: 'Disclaimers',
    NONMODALTAG: "The Provider's Eligibility Rules",
  };

  const getClickthroughLabel = (inputLabel) => {
    let result = [];

    for (const clickthrough of props.clickthroughs) {
      if (clickthrough.modalTag in agreementsMap) {
        result.push(
          `<a class="user-agreement__open-modal-text" data-modal-tag="${
            clickthrough.modalTag
          }">${agreementsMap[clickthrough.modalTag]}</a>`
        );
      }
    }

    if (
      props.clickthroughsNonModalTag.length > 0 &&
      props.clickthroughsInLink
    ) {
      result.push(
        `<a class="user-agreement__open-modal-text" data-modal-tag="NONMODALTAG">${agreementsMap.NONMODALTAG}</a>`
      );
    }

    if (result.length > 1) {
      const lastItem = result.pop();
      return `<label>${inputLabel} ${result.join(
        ', '
      )} and ${lastItem}.</label>`;
    }

    return `<label>${inputLabel} ${result.join(', ')}.</label>`;
  };

  const openClickthroughModal = (e) => {
    const modalTag = e.target?.dataset?.modalTag;
    if (modalTag && modalTag !== 'NONMODALTAG') {
      // Find the matching clickthrough data
      const clickthrough = props.clickthroughs.find(
        (ct) => ct.modalTag === modalTag
      );
      if (clickthrough) {
        // Set up modal data
        const modalData = {
          id: 'user-agreement',
          header: agreementsMap[modalTag],
          body: {
            type: 'html',
            content: clickthrough.modalContent,
          },
          width: '90%',
          actionButton: false,
          showCloseButton: true,
        };

        contentStore.setModalData(modalData);
        contentStore.setShowModal(true);
      }
    } else if (
      modalTag &&
      modalTag === 'NONMODALTAG' &&
      props.clickthroughsNonModalTag.length > 0 &&
      props.clickthroughsInLink
    ) {
      const content = props.clickthroughsNonModalTag
        .map((ct) => {
          if (productDetails.value?.product?.code === 'ISOSGTIMT') {
            const certLink = productDetails.value?.product?.certificateUrl;

            // Create a temporary DOM element to parse the HTML content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = [
              ...(Array.isArray(ct.notes) ? ct.notes : []),
              ...(Array.isArray(ct.messages) ? ct.messages : []),
            ].join('<br/>');

            // Find the first anchor tag if it exists
            const anchorTag = tempDiv.querySelector('a');
            if (anchorTag) {
              anchorTag.href = certLink?.toString() || '';
              return tempDiv.innerHTML;
            }
          }
          return [
            ...(Array.isArray(ct.notes) ? ct.notes : []),
            ...(Array.isArray(ct.messages) ? ct.messages : []),
          ].join('<br/>');
        })
        .join('<br/><br/>');
      // Set up modal data
      const modalData = {
        id: 'user-agreement',
        header: agreementsMap[modalTag],
        body: {
          type: 'html',
          content,
        },
        width: '90%',
        actionButton: false,
        showCloseButton: true,
      };

      contentStore.setModalData(modalData);
      contentStore.setShowModal(true);
    } else {
      updateCheckboxState(!tosCheckbox.value);
    }
  };
</script>

<template>
  <div class="terms-of-service">
    <h3 class="terms-of-service__sub-header mt-5">
      <span class="required-indicator">*</span> Please Check
    </h3>

    <div class="terms-of-service__body-container py-5">
      <BaseCheckBox
        :id="inputField.id"
        :label="inputField.label"
        :checked="tosCheckbox"
        :disabled="inputField.disabled"
        :required="inputField.required"
        @input="updateCheckboxState"
      >
      </BaseCheckBox>
      <div class="terms-of-service__label" @click="openModal">
        <UtilityHTMLRenderer
          :content="inputField.htmlLabel"
        ></UtilityHTMLRenderer>

        <div
          v-if="hasClickThroughs"
          class="user-agreement__label"
          @click.stop="openClickthroughModal"
        >
          <UtilityHTMLRenderer
            :content="
              getClickthroughLabel(clickthroughModalInputField.htmlLabel)
            "
          ></UtilityHTMLRenderer>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .terms-of-service {
    &__body-container {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    &__checkbox {
      padding-bottom: 5px;
    }

    &__open-modal-text {
      text-decoration: underline;
      cursor: pointer;
    }

    &__body-header {
      font-weight: bold;
      font-size: 20px;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    &__body-text {
      margin-left: 20px;
      padding-bottom: 10px;
    }

    &__agreement-terms {
      font-style: italic;
      padding-bottom: 0;
    }

    &__sub-header {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 16px;
      letter-spacing: 0;
    }

    label {
      white-space: normal;
      display: block;
      cursor: pointer;
    }

    .required-indicator {
      color: $imt-red;
      margin-right: 4px;
    }
  }

  .user-agreement {
    &__body-container {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    &__checkbox {
      padding-bottom: 5px;
    }

    &__open-modal-text {
      text-decoration: underline;
      cursor: pointer;
    }

    &__body-header {
      font-weight: bold;
      font-size: 20px;
      margin-bottom: 0;
      padding-bottom: 0;
    }

    &__body-text {
      margin-left: 20px;
      padding-bottom: 10px;
    }

    &__agreement-terms {
      font-style: italic;
      padding-bottom: 0;
    }

    &__sub-header {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 16px;
      letter-spacing: 0;
    }

    label {
      white-space: normal;
      display: block;
      cursor: pointer;
    }

    .required-indicator {
      color: $imt-red;
      margin-right: 4px;
    }
  }
</style>

<style lang="scss">
  #user-agreement .modal__body p {
    padding-bottom: 20px;
  }
  .terms-of-service {
    &__label label {
      cursor: pointer;
    }
  }
</style>
