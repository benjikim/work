<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { useUserSessionStore } from '@/store/userSession';
  import { useApiStore } from '@/store/api';
  import router from '@/router';
  import { event } from 'vue-gtag';
  import { GAObject } from '@/types';
  import { useThemeStore } from '@/store/theme';

  const userSessionStore = useUserSessionStore();
  const apiStore = useApiStore();
  const themeStore = useThemeStore();

  const planCodes = computed(() => userSessionStore.getSelectedPlansForCompare);
  const quoteId = computed(() => apiStore.getQuoteId);
  const isThemeIMT = computed(() => themeStore.isThemeIMT);

  const handleDeselect = () => {
    event('plan_action_compare_footer', {
      hierarchical_layer_1: 'Deselect Selected Compare Footer',
      hierarchical_layer_2: 'Deselect Plans',
    } as GAObject);
    userSessionStore.deselectPlansForCompare();
  };

  const goToCompare = () => {
    // We going to the compare page baby!
    const planCodesJoined = planCodes.value.join();
    router.push({
      name: 'Compare',
      query: {
        planCodes: planCodesJoined,
        _qid: quoteId.value,
      },
    });

    event('plan_action_compare_footer', {
      hierarchical_layer_1: `Compare ${planCodes.value.length} Plans Compare Footer`,
      hierarchical_layer_2: `Plans to compare: ${planCodesJoined}`,
    } as GAObject);
  };

  onMounted(() => {
    if (localStorage.getItem('plansToCompare')) {
      localStorage
        .getItem('plansToCompare')
        ?.split(',')
        .forEach((planCode: string) => {
          userSessionStore.setSelectedPlanForCompare(planCode);
        });
    }
  });
</script>
<template>
  <div
    v-if="planCodes.length > 0"
    class="z-10 fixed bottom-0 bg-base-bg-color w-full max-w-[1185px] p-4 base-border rounded left-0 lg:left-auto"
  >
    <div class="grid grid-flow-col w-full place-content-evenly">
      <div class="col-span-4">
        <button
          type="button"
          class="daisy-btn btn-block hover:bg-white bg-white text-action-alt-primary border-action-alt-primary w-full uppercase tracking-wider"
          @click="handleDeselect"
        >
          Deselect Plans
        </button>
      </div>
      <div class="col-span-4">
        <button
          type="button"
          class="daisy-btn btn-block text-[white] base-border w-full uppercase tracking-wider"
          :class="[isThemeIMT ? 'btn-primary' : 'bg-action-alt-primary']"
          @click="goToCompare"
          data-cy="go-to-compare"
        >
          Compare {{ planCodes.length }} plan{{
            planCodes.length === 1 ? '' : 's'
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss"></style>
