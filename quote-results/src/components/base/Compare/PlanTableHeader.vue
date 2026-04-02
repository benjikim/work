<script setup lang="ts">
  import { computed } from 'vue';
  import { useUserSessionStore } from '@/store/userSession';
  import { useContentStore } from '@/store/content';
  import { useApiStore } from '@/store/api';
  import PlanActions from '@/components/shared/PlanActions.vue';

  defineProps({
    planCode: {
      type: String,
      required: true,
    },
    isMobile: {
      type: Boolean,
      required: true,
    },
  });

  const userSessionStore = useUserSessionStore();
  const contentStore = useContentStore();
  const apiStore = useApiStore();

  const planCodes = computed(() => userSessionStore.getSelectedPlansForCompare);
  const getPlan = (planCode: string) => {
    return apiStore.getPlanByPlanCode(planCode);
  };
  const getPlanLogo = (planCode: string) => {
    return contentStore.getPlanLogo(planCode);
  };
</script>
<template>
  <div
    class="pb-1 md:pb-2"
    :class="planCodes.length === 1 ? 'md:w-96 md:mx-auto' : ''"
  >
    <div v-if="getPlan(planCode)" class="flex flex-col items-center">
      <!-- Plan Logo -->
      <img
        class="w-16 h-8 mb-0 md:my-3"
        :src="getPlanLogo(planCode)"
         :alt="`${getPlan(planCode)?.provider.name} Logo`"
      />

      <!-- Plan Name -->
      <div
        class="min-h-[3rem] max-h-[3rem]md:h-5 md:min-h-8 md:max-h-16 flex items-center justify-center"
      >
        <p
          v-if="getPlan(planCode)"
          class="text-center text-wrap text-imt-black text-[1rem] h-auto"
        >
          {{ getPlan(planCode)?.name }}
        </p>
      </div>
    </div>
    <div class="flex flex-col items-center" v-else>
      <div class="w-32 bg-imt-grey h-10 rounded-md animate-pulse mb-3"></div>
      <div class="w-52 bg-imt-grey h-8 rounded-md animate-pulse mb-3"></div>
      <div class="w-28 bg-imt-grey h-4 rounded-md animate-pulse"></div>
    </div>

    <div
      class="gap-2 col-span-full text-lg font-bold flex flex-col justify-between"
    >
      <div class="row-start-3 row-span-3">
        <div
          v-if="getPlan(planCode)"
          class="md:col-span-12 flex flex-col justify-center p-2 h-full sm:min-w-[12.5rem] md:min-w-fit"
        >
          <PlanActions :plan="getPlan(planCode)!" :modal="false" />
        </div>

        <div v-else>
          <div
            class="w-full h-10 rounded-md bg-imt-grey animate-pulse mb-2"
          ></div>
          <div class="w-32 h-4 rounded bg-imt-grey animate-pulse mx-auto"></div>
        </div>
      </div>
    </div>
  </div>
</template>
