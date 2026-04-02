<script setup>
import { reactive, computed } from 'vue';
import { useDocsStore } from 'src/store/modules/docs.js';
import BaseModal from 'src/components/base/BaseModal.vue';
import { event } from 'vue-gtag';

const docsStore = useDocsStore();
const sections = docsStore.getSections;
const htmlModal = docsStore.getModal('htmlModal');
const textModal = docsStore.getModal('textModal');
const listModal = docsStore.getModal('listModal');


const state = reactive({
  modal: {
    show: computed(() => docsStore.getIsModalDisplayed),
    data: computed(() => docsStore.getModalData),
  },
});

const handleAction = () => {
  alert('What a rebel 	ԅ(≖‿≖ԅ)');
  event('test_event', {
    transaction_id: null, //order #
    currency: 'USD',
    value: 0, //total plan cost
    items: [
      {
        id: 'test', //plan code,
        name: 'test', //plan name
        category:'test', //plan type
      }
    ],
  });
};

const close = () => {
  docsStore.setShowModal(false);
};

const openHtmlModal = () => {
  docsStore.setShowModal(true);
  docsStore.setModalData(htmlModal);
};

const openTextModal = () => {
  docsStore.setShowModal(true);
  docsStore.setModalData(textModal);
};

const openListModal = () => {
  docsStore.setShowModal(true);
  docsStore.setModalData(listModal);
};
</script>

<template>
  <main class="docs">
    <h1>Docs</h1>

    <BaseFormGroup
      v-for="(section, index) in sections"
      :key="index"
      :identifier="section.identifier"
      :title="section.title"
      :hint="section.hint"
    >
      <template #inner>
        <div :class="section.innerClasses">
          <div
            v-for="component in section.components"
            :key="component.id"
            class="component-definition mb-4"
            :class="component.classes"
          >
            <h3>{{ component.title }}</h3>
            <component :is="component.name" v-bind="component.props"></component>
          </div>
        </div>

      </template>
    </BaseFormGroup>


    <BaseButton  :text="'Open HTML Modal'" @click="openHtmlModal"></BaseButton>
    <br />
    <BaseButton  :text="'Open List Modal'" @click="openListModal"></BaseButton>
    <br/>
    <a class="docs__text-modal" @click="openTextModal">Open Text Modal </a>

    <BaseModal
      :id="state.modal.data?.id"
      :show="state.modal.show"
      :header="state.modal.data?.header"
      :body="state.modal.data?.body"
      :button-action-text="state.modal.data?.buttonActionText"
      :width="state.modal.data?.width"
      :action-button="state.modal.data?.actionButton"
      @click:action="handleAction"
      @click:close="close"
    >
    </BaseModal>

  </main>
  <!-- /.docs -->
</template>

<style lang="scss" scoped>
.docs {
  &__text-modal {
    cursor: pointer;
    text-decoration: underline;
  }

  &__modal-body {
    margin-left: 10px;
  }
}
</style>
