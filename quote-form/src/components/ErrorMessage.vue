<script setup lang="ts">
import { computed } from "vue";
import { useFormStore } from '@/store/form';

const formStore = useFormStore();
const errors = computed(() =>  formStore.getErrors);

</script>

<template>
  <div
    v-if="errors.length"
    class="quote-form-messages quote-form-messages--errors"
  >
    <h2>Validation errors have occurred with your request:</h2>
    <ul>
      <li
        v-for="(error, index) in errors"
        :key="index"
      >
        {{ error }}
      </li>
    </ul>
  </div>
</template>

<style lang="less" scoped>
  .quote-form-messages {
    padding: 20px;
    border-radius: 3px;
    margin-bottom: 10px;
    width: 100%;

    h2 {
      font-size: 1.25em;
      margin-top: 0;
      margin-bottom: 10px;
    }

    ul {
      margin: 0;
      padding-left: 20px;
      font-size: 16px;
    }

    li {
      margin-bottom: 5px;
    }

    &--errors {
      color: #721c24;
      border: 1px solid #f5c6cb;
      background-color: #f8d7da;
    }
  }
</style>