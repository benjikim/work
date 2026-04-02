<script setup>
import { computed } from 'vue';
import { useApiStore } from 'src/store/modules/api.js';

const apiStore = useApiStore();
const messages = computed(() => apiStore.getApiResponseMessages);

</script>

<template>
  <div class="modal__response-messages">

    <div v-if="messages.errors.length" class="modal__response modal__response--error mb-4">
      <h2 class="font-bold mb-1">The following errors have occured:</h2>
      <ul class="list-disc">
        <li v-for="(message, index) in messages.errors" :key="index">
          {{ message }}
        </li>
      </ul>
    </div>
    <!-- /.modal__response--error -->

    <div v-if="messages.missingInputs.length" class="modal__response modal__response--info mb-4">
      <h2 class="font-bold mb-1">The following data is missing:</h2>

      <ul class="list-disc">
        <li v-for="(message, index) in messages.missingInputs" :key="index">
          {{ message }}
        </li>
      </ul>

    </div>
    <!-- /.modal__response--info -->

    <div v-if="messages.coverageChanges.length" class="modal__response modal__response--info mb-4">
      <h2 class="font-bold mb-1">Please note the following coverage changes:</h2>

      <ul class="list-disc">
        <li v-for="(change, index) in messages.coverageChanges" :key="index">

          <template v-if="change.type === 'ltc'">
            {{ change.message }}
          </template>

          <template v-if="change.type === 'coverageChange'">
            The selected coverage "{{ change.displayName }}" has been removed.
          </template>
        </li>
      </ul>
    </div>
    <!-- /.modal__response--info -->

    <div v-if="messages.planCostChanges.length" class="modal__response modal__response--info mb-4">
      <h2 class="font-bold mb-1">Plan cost change</h2>

      <ul class="list-disc">
        <li v-for="(change, index) in messages.planCostChanges" :key="index">
          The cost of this plan has {{ change.direction }} as a result of the changes you have made.
          The updated cost is now ${{ change.cost }}.
        </li>
      </ul>

    </div>
    <!-- /.modal__response--info -->

    <div v-if="messages.pns.length" class="modal__response modal__response--info mb-4">
      <h2 class="font-bold mb-1">We're sorry. Please go back and select a new product to purchase.</h2>

      <ul class="list-disc">
        <li v-for="(message, index) in messages.pns" :key="index">
          {{ message?.message }}
        </li>
      </ul>

    </div>
    <!-- /.modal__response--info -->

  </div>
  <!-- /.modal__response-messages -->
</template>

<style lang="scss" scoped>
.modal__response {
  padding: 12px;
  border-radius: 3px;
  font-size: 0.875em;
  padding-left: 28px;

  &--error {
    background-color: $imt-bg-red;
    border-color: $imt-border-color-red;

    li {
      color: $imt-red;
    }
  }

  &--info {
    background-color: $imt-bg-yellow;
    border-color: $imt-border-color-red;

    li {
      color: $imt-grey;
    }
  }
}
</style>
