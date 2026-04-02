<script setup lang="ts">
  import { computed } from 'vue';
  import { useContentStore } from '@/store/content';
  import { useUserSessionStore } from '@/store/userSession';
  import { useThemeStore } from '@/store/theme';
  import Option from '@/components/options/Option.vue';
  import { FormattedOption } from '@/types';
  import { event } from 'vue-gtag';
  import { GAObject } from '@/types';

  const contentStore = useContentStore();
  const sessionStore = useUserSessionStore();
  const themeStore = useThemeStore();

  const props = defineProps({
    planCode: {
      type: String,
      required: true,
    },
    optionLocation: {
      type: String,
      required: true,
    },
  });

  const plan = computed(() => sessionStore.getPlanByPlanCode(props.planCode));

  const isThemeSoventure = computed(() => themeStore.isThemeSoventure);

  const isAdditionalOption = (optionKey: string) => {
    return contentStore.isOptionAnOptionalCoverage(optionKey);
  };

  type displayOption = {
    [key: string]: FormattedOption;
  };

  const displayOptions = computed(() => {
    const optionHeaderMap = contentStore.getOptionHeaderMap;
    const obj = {} as displayOption;

    if (plan?.value?.options) {
      for (const optionKey of Object.keys(plan?.value?.options)) {
        // Skip adventureSportsRider if we are in soventure (already applied)
        if (optionKey === 'adventureSportsRider' && isThemeSoventure.value)
          continue;
        if (optionKey !== 'cancelForAnyReason') {
          const header =
            optionHeaderMap[optionKey] ?? optionHeaderMap['optionalCoverages'];

          if (!(header in obj)) {
            obj[header] = {};
          }

          obj[header][optionKey] = plan?.value?.options[optionKey];
        }
      }
    }

    return obj;
  });

  const isModeAnnual = computed(() => themeStore.isModeAnnual);

  const handleDeluxeUpgradeClick = () => {
    event('plan_action_deluxe_upgrade_click', {
      hierarchical_layer_1: 'Deluxe Upgrade',
      hierarchical_layer_2: `Plan Code ${props.planCode}`,
      hierarchical_layer_3: 'Annual Quote Results',
    } as GAObject);

    sessionStore.setMoreInfoModalKey('deluxeUpgrade');
    sessionStore.setMoreInfoModalOpen(true);
  };
</script>

<template>
  <div class="col-span-12">
    <div v-for="(optionHeader, i) in Object.keys(displayOptions)" :key="i">
      <div
        v-for="(optionId, j) in Object.keys(displayOptions[optionHeader])"
        :key="j"
      >
        <template v-if="isAdditionalOption(optionId)">
          <p
            v-if="optionHeader === 'Optional Coverages' && !isModeAnnual"
            class="pt-2 text-left text-imt-grey font-semibold text-xs uppercase"
          >
            {{ displayOptions[optionHeader][optionId].displayName }}
          </p>

          <Option
            :plan-code="planCode"
            :option-key="optionId"
            :option-location="optionLocation"
          />
          <button
            v-if="optionId === 'DeluxeUpgrade' && isModeAnnual"
            :data-cy="`option-${optionId}__${optionLocation}-${planCode}`"
            class="text-xs text-action-primary font-bold btn btn-link capitalize p-0 tracking-normal"
            @click="handleDeluxeUpgradeClick"
          >
            What Does Deluxe Upgrade Include?
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .form-checkbox input {
    background-color: white;
  }
</style>
