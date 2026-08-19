<script setup lang="ts">
  import { computed } from 'vue';
  import { useContentStore } from '@/store/content';
  import { useUserSessionStore } from '@/store/userSession';
  import { useThemeStore } from '@/store/theme';
  import Option from '@/components/options/Option.vue';
  import { FormattedOption } from '@/types';

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
    allowedOptionKeys: {
      type: Array as () => string[],
      required: false,
      default: () => [],
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
  const hasAllowedOptionKeys = computed(() => props.allowedOptionKeys.length > 0);

</script>

<template>
  <div
    class="col-span-12"
    :class="{
      'additional-options--compare': optionLocation === 'comparePage',
    }"
  >
    <div v-for="(optionHeader, i) in Object.keys(displayOptions)" :key="i">
      <div
        v-for="(optionId, j) in Object.keys(displayOptions[optionHeader])"
        :key="j"
      >
        <template
          v-if="
            isAdditionalOption(optionId) ||
            (isModeAnnual && props.allowedOptionKeys.includes(optionId))
          "
        >
          <template
            v-if="
              !hasAllowedOptionKeys ||
              props.allowedOptionKeys.includes(optionId)
            "
          >
          <p
            v-if="optionHeader === 'Optional Coverages' && !isModeAnnual"
            class="pt-2 text-left text-[#878787] font-normal text-sm uppercase"
          >
            {{ displayOptions[optionHeader][optionId].displayName }}
          </p>

          <Option
            :plan-code="planCode"
            :option-key="optionId"
            :option-location="optionLocation"
          />
          <div
            v-if="
              (optionId === 'DeluxeUpgrade' || optionId === 'tripCancellation') &&
              isModeAnnual
            "
            :data-cy="`option-${optionId}__${optionLocation}-${planCode}`"
            class="annual-deluxe-copy"
          >
            <ul v-if="optionId === 'DeluxeUpgrade'">
              <li>
                <strong>Increase Trip delay coverage</strong>
                <span>5+ hours: $100 per day; $500 per person/per trip</span>
              </li>
              <li>
                <strong>Increase Emergency Medical expenses</strong>
                <span>$25,000 per person/per trip</span>
              </li>
              <li>
                <strong>Increase Emergency Medical Evacuation / Repatriation</strong>
                <span>$250,000 per person/per trip</span>
              </li>
            </ul>
          </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
  .form-checkbox input {
    background-color: white;
  }

  .additional-options--compare :deep(.form-checkbox__label) {
    color: #878787;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1.25rem;
    text-transform: uppercase;
  }

  .annual-deluxe-copy {
    padding-top: 8px;
    color: #2a2a2a;
    font-size: 12px;
    line-height: 1.5;
    text-align: left;
    align-self: flex-start;
    width: 100%;
  }

  .annual-deluxe-copy ul {
    margin: 0;
    padding-left: 18px;
    text-align: left;
  }

  .annual-deluxe-copy li {
    margin: 0 0 10px;
    text-align: left;
  }

  .annual-deluxe-copy li:last-child {
    margin-bottom: 0;
  }

  .annual-deluxe-copy span {
    display: block;
  }

  .annual-deluxe-copy strong {
    font-weight: 600;
  }
</style>
