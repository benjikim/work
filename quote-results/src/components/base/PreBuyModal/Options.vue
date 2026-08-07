<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { useContentStore } from '@/store/content';
  import { useUserSessionStore } from '@/store/userSession';
  import { useThemeStore } from '@/store/theme';
  import { FormattedOption } from '@/types';
  import Option from '@/components/options/Option.vue';

  const contentStore = useContentStore();
  const sessionStore = useUserSessionStore();
  const themeStore = useThemeStore();

  const planCode = computed(() => sessionStore.getPBMPlan);

  const isThemeSoventure = computed(() => themeStore.isThemeSoventure);

  const plan = computed(() => sessionStore.getPlanByPlanCode(planCode.value));

  type displayOption = {
    [key: string]: FormattedOption;
  };

  const displayOptions = computed(() => {
    const optionHeaderMap = contentStore.getOptionHeaderMap;
    const obj = {} as displayOption;

    if (plan?.value?.options) {
      // First handle Cancel For Any Reason if it exists
      if ('cancelForAnyReason' in plan.value.options) {
        const header =
          optionHeaderMap['cancelForAnyReason'] ??
          optionHeaderMap['optionalCoverages'];
        obj[header] = {
          cancelForAnyReason: plan.value.options.cancelForAnyReason,
        };
      }

      // Handle all other options
      for (const optionKey of Object.keys(plan?.value?.options)) {
        if (optionKey === 'cancelForAnyReason') continue; // Skip CFAR as it's already handled
        if (optionKey === 'adventureSportsRider' && isThemeSoventure.value) continue; // Skip adventureSportsRider if we are in soventure (already applied)
        const header =
          optionHeaderMap[optionKey] ?? optionHeaderMap['optionalCoverages'];

        if (!(header in obj)) {
          obj[header] = {};
        }

        obj[header][optionKey] = plan?.value?.options[optionKey];
      }
    }

    return obj;
  });

  onMounted(() => sessionStore.setPlanParameters());
</script>

<template>
  <div class="col-span-12">
    <div
      v-for="(optionHeader, i) in Object.keys(displayOptions)"
      :key="i"
      :class="i === 0 ? '' : 'pt-4'"
    >
      <p class="font-bold">{{ optionHeader }}</p>

      <div
        v-for="(optionId, j) in Object.keys(displayOptions[optionHeader])"
        :key="j"
      >
        <p
          v-if="optionHeader === 'Optional Coverages'"
          class="pt-2 text-imt-grey font-semibold text-xs uppercase"
        >
          {{ displayOptions[optionHeader][optionId].displayName }}
        </p>
        <p 
          v-if="['accidentalDeathFlight', 'accidentalDeath24Hour', 'accidentalDeathCommonCarrier'].includes(optionId)" 
          class="uppercase text-xs font-bold text-imt-grey pt-1"
        >
          {{contentStore.getToolTipTextByKey(optionId)}}
        </p>

        <Option
          :plan-code="planCode"
          :option-key="optionId"
          option-location="preBuyModal"
        />
      </div>
    </div>
  </div>
</template>
