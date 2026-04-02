<script setup>
import { useContentStore } from 'src/store/modules/content.js';
import { useApiStore } from 'src/store/modules/api.js';


const contentStore = useContentStore();
const modelId = 'travelSupplierHelpText';

const inputField = contentStore.getInput(modelId);

const apiStore = useApiStore();
const isNWCruisePlan = apiStore.isNWCruisePlan();

</script>
<template>
  <div>
    <p v-if="inputField.helpTextFirstRow" class="travel-supplier__help-text">
      {{ inputField.helpTextFirstRow }}
    </p>
    <p v-if="inputField.helpTextSecondRow" class="travel-supplier__help-text">
      {{ inputField.helpTextSecondRow }}
    </p>
    <p v-if="isNWCruisePlan" class="travel-supplier__help-text">
      {{ inputField.NWCText }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
  .travel-supplier__help-text {
    padding: 8px 16px;
    @media (max-width: 1023px) {
      padding: 0;
    }
  }
</style>
