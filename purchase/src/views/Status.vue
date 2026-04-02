<script setup>
import { useApiStore } from 'src/store/modules/api.js';

const apiStore = useApiStore();
apiStore.init();

const order = apiStore.getOrder;
const quote = apiStore.getQuote;

</script>

<template>
  <main class="grid grid-cols-1 my-4 mx-8">
    <h1>Purchase App Status Page</h1>

    <h2>Quick View</h2>
    <div>
      <table>
        <tbody>
          <tr>
            <td>Order ID</td>
            <td>{{ order.id || 'Not set' }}</td>
          </tr>
          <tr>
            <td>Order Token</td>
            <td><code>{{ order.details.token || 'Not set'}}</code></td>
          </tr>
          <tr>
            <td>Quote ID</td>
            <td>{{ quote.id || 'Not set'}}</td>
          </tr>
        </tbody>
      </table>
    </div>

  </main>
</template>
