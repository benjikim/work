<script setup lang="ts">
  import { computed, reactive } from 'vue';
  import { ChevronUpIcon } from '@heroicons/vue/24/solid';
  import { event } from 'vue-gtag';
  import { useContentStore } from '@/store/content';
  import { useUserSessionStore } from '@/store/userSession';
  import { useApiStore } from '@/store/api';
  import { intersect } from '@/utility';
  import { GAObject } from '@/types';

  defineProps({
    displayType: {
      type: String,
      required: true,
    },
  });

  const contentStore = useContentStore();
  const sessionStore = useUserSessionStore();
  const apiStore = useApiStore();

  const availablePlans = computed(() => apiStore.getAvailablePlans);
  const arePlansFullyLoaded = computed(
    () => apiStore.getPlansFullyLoadedStatus
  );
  const numberOfPlansShown = computed(() => sessionStore.getFilteredPlansCount);
  const areSelectedFiltersDefault = computed(
    () => sessionStore.areSelectedFiltersDefault || !apiStore.getDataLoadedState
  );

  const openSections = reactive({
    trip: true,
    medical: true,
    evacuation: false,
    baggage: true,
    other: true,
    providers: false,
  });

  const providerLabels = computed(() =>
    apiStore.cms.providers.map((provider) => provider.name)
  );

  const providerKeys = computed(() =>
    apiStore.cms.providers.map((_, index) => `provider-${index}`)
  );

  const resetDefaultFilters = () => {
    sessionStore.resetFilters();
    event('filters__reset', {
      hierarchical_layer_1: 'Reset Filters Link Clicked',
    } as GAObject);
  };

  const toggleSection = (section: keyof typeof openSections) => {
    openSections[section] = !openSections[section];
  };

  const handleTooltip = (filterKey: string, label?: string) => {
    sessionStore.setFilterToolTipId(filterKey);
    sessionStore.setFilterToolTipLabel(label ?? null);
    sessionStore.setFilterToolTipModalOpen(true);
    contentStore.removeHighlightedCoverageInformation();
    event('filter_tool_tip', {
      hierarchical_layer_1: 'Filter Tool Tip Selected',
      hierarchical_layer_2: filterKey,
    } as GAObject);
  };

  const getFilterData = (key: string) => contentStore.getFilterData(key);
  const isResultsCopyRoute = ['/QRPOCCopy', '/QRPOCSeparate'].some((route) =>
    window.location.pathname.includes(route)
  );

  const combineGroupedFilters = (filterGroups: string[][]) =>
    Array.from(
      new Set(
        filterGroups.reduce(
          (accumulator, values) => accumulator.concat(values),
          [] as string[]
        )
      )
    );

  const getNumberOfPlans = (filterKey: string) => {
    let selectedFilters = [...sessionStore.getSelectedFilters];
    const productFilters = apiStore.getFilters;

    if (Object.keys(productFilters).length === 0) {
      return '';
    }

    if (selectedFilters.includes(filterKey)) {
      return '';
    }

    if (sessionStore.areSelectedFiltersDefault) {
      return `${productFilters[filterKey]?.size ?? 0} plans`;
    }

    const radioMedicalIndex = selectedFilters.findIndex((filter: string) => {
      const splitFilter = filter.split('-');
      return (
        splitFilter.length === 2 &&
        splitFilter[0] === 'medical' &&
        splitFilter[1] !== '0' &&
        splitFilter[1] !== 'primary'
      );
    });

    if (
      radioMedicalIndex !== -1 &&
      filterKey.split('-')[0] === 'medical' &&
      filterKey.split('-')[1] !== 'primary'
    ) {
      selectedFilters.splice(radioMedicalIndex, 1);
    }

    const radioEvacIndex = selectedFilters.findIndex((filter: string) => {
      const splitFilter = filter.split('-');
      return (
        splitFilter.length === 2 &&
        splitFilter[0] === 'emergencyMedicalEvacuation' &&
        splitFilter[1] !== '0' &&
        splitFilter[1] !== 'primary'
      );
    });

    if (
      radioEvacIndex !== -1 &&
      filterKey.split('-')[0] === 'emergencyMedicalEvacuation' &&
      filterKey.split('-')[1] !== 'primary'
    ) {
      selectedFilters.splice(radioEvacIndex, 1);
    }

    if (filterKey.split('-')[0] === 'provider') {
      selectedFilters = selectedFilters.filter((selectedFilter) => {
        const splitFilter = selectedFilter.split('-');
        return splitFilter[0] !== 'provider';
      });
    }

    const providerFiltersArr = [] as string[][];
    const tripInterruptionFiltersArr = [] as string[][];
    selectedFilters.push(filterKey);

    let arr = [] as string[][];

    selectedFilters.forEach((selectedFilter: string) => {
      if (selectedFilter.split('-')[0] === 'tripInterruption') {
        tripInterruptionFiltersArr.push(Array.from(productFilters[selectedFilter]));
        return;
      }

      if (selectedFilter.split('-')[0] === 'provider') {
        providerFiltersArr.push(Array.from(productFilters[selectedFilter]));
        return;
      }

      if (selectedFilter in productFilters) {
        arr.push(Array.from(productFilters[selectedFilter]));
      }
    });

    if (providerFiltersArr.length > 0) {
      arr.push(combineGroupedFilters(providerFiltersArr));
    }

    if (tripInterruptionFiltersArr.length > 0) {
      arr.push(combineGroupedFilters(tripInterruptionFiltersArr));
    }

    let setFilters = arr[0] || [];
    while (arr.length > 1) {
      const lastSet = arr.pop() as string[];
      setFilters = intersect(setFilters, lastSet);
    }

    return `${setFilters.length} plans`;
  };

  const isChecked = (filterKey: string) =>
    sessionStore.getSelectedFilters.includes(filterKey);

  const isDisabled = (filterKey: string) => {
    if (
      isResultsCopyRoute &&
      filterKey.split('-')[0] === 'tripInterruption'
    ) {
      return false;
    }

    return getNumberOfPlans(filterKey) === '0 plans';
  };

  const filterIncludedHandler = (checked: boolean, filterKey: string) => {
    const cfarFilters = apiStore.getFilters['cancelForAnyReasonOption-0'];
    const rentalCarFilters = apiStore.getFilters['otherCoverages-0'];

    if (checked) {
      sessionStore.addFilter(filterKey);
    } else {
      sessionStore.removeFilter(filterKey);
    }

    if (checked && filterKey === 'cancelForAnyReasonOption-0') {
      sessionStore.setCfarDetailsModal(true);
    }

    if (filterKey === 'cancelForAnyReasonOption-0' && cfarFilters) {
      sessionStore.setPlanCFAR(Array.from(cfarFilters), checked);
    }

    if (filterKey === 'otherCoverages-0' && rentalCarFilters) {
      sessionStore.setPlanRentalCar(Array.from(rentalCarFilters), checked);
    }

    event('filter_handle', {
      hierarchical_layer_1: `Filter Handle Selected ${filterKey}`,
      hierarchical_layer_2: filterKey,
    } as GAObject);
  };

  const filterRadioHandler = (filterKey: string, total: number) => {
    const userFilters = sessionStore.getSelectedFilters;

    if (userFilters.includes(filterKey)) {
      return;
    }

    const [groupKey] = filterKey.split('-');
    for (let i = 0; i < total; i += 1) {
      sessionStore.removeFilter(`${groupKey}-${i}`);
    }

    sessionStore.addFilter(filterKey);

    event('filter_handle', {
      hierarchical_layer_1: `Filter Handle Selected ${filterKey}`,
      hierarchical_layer_2: filterKey,
    } as GAObject);
  };

  const tripInterruptionOptions = [
    { key: 'tripInterruption-0', label: '100% of trip cost' },
    { key: 'tripInterruption-1', label: '125% of trip cost' },
    { key: 'tripInterruption-2', label: '150% of trip cost' },
  ];

  const medicalOptions = [
    { key: 'medical-0', label: 'All Amounts' },
    { key: 'medical-1', label: 'Minimum — up to $50,000' },
    { key: 'medical-2', label: 'Basic — $50,000 and up' },
    { key: 'medical-3', label: 'Recommended — $100,000+' },
    { key: 'medical-4', label: 'Maximum — $250,000 and up' },
  ];

  const evacuationOptions = [
    { key: 'emergencyMedicalEvacuation-0', label: 'All Amounts' },
    { key: 'emergencyMedicalEvacuation-1', label: 'up to $150,000' },
    { key: 'emergencyMedicalEvacuation-2', label: '$250,000' },
    { key: 'emergencyMedicalEvacuation-3', label: '$500,000' },
    { key: 'emergencyMedicalEvacuation-4', label: '$1,000,000' },
    { key: 'emergencyMedicalEvacuation-5', label: 'Unlimited' },
  ];

  const baggageOptions = [
    { key: 'travelDelay-0', label: 'Travel Delay' },
    { key: 'baggageDelay-0', label: 'Baggage Delay' },
    { key: 'baggage-0', label: 'Baggage Loss up to $750' },
    { key: 'baggage-1', label: 'Baggage Loss $1000' },
    { key: 'baggage-2', label: 'Baggage Loss $1500 to $2000' },
    { key: 'baggage-3', label: 'Baggage Loss $2,500 and more' },
  ];

  const otherCoverageOptions = [
    { key: 'otherCoverages-0', label: 'Rental Car' },
    { key: 'otherCoverages-1', label: 'Vacation' },
    { key: 'otherCoverages-2', label: 'Cruise' },
    { key: 'accidentalDeath24Hour-0', label: 'Accidental Death' },
  ];
</script>

<template>
  <div class="copy-filter-container">
    <div class="summary-block">
      <p v-if="arePlansFullyLoaded" class="summary-count">
        {{ availablePlans.length }} Plans Available
      </p>
      <p v-else class="summary-count">Loading Plans</p>
      <button
        v-if="!areSelectedFiltersDefault && arePlansFullyLoaded"
        class="reset-link"
        @click="resetDefaultFilters"
      >
        <span class="reset-link__text reset-link__count"
          >Showing {{ numberOfPlansShown }}</span
        >
        <span class="reset-link__text reset-link__action">Reset Filters</span>
      </button>
    </div>

    <section class="filter-section">
      <div
        class="filter-header"
        :class="{
          'border-b border-[#DEDEDE]': openSections.trip,
        }"
        @click="toggleSection('trip')"
      >
        <div class="flex items-center gap-2">
          <ChevronUpIcon
            class="size-5 text-black cursor-pointer transition-transform duration-200 ease-in-out"
            :class="{ 'rotate-180': openSections.trip }"
          />
          <p class="text-xs md:text-sm text-imt-black">Trip Interruption &amp; Cancellation</p>
        </div>
      </div>
      <div v-if="openSections.trip" class="filter-body">
        <label
          v-for="option in tripInterruptionOptions"
          :key="option.key"
          class="filter-row"
          :class="{ 'filter-row--disabled': isDisabled(option.key) }"
        >
          <input
            type="checkbox"
            :checked="isChecked(option.key)"
            :disabled="isDisabled(option.key)"
            @change="filterIncludedHandler(($event.target as HTMLInputElement).checked, option.key)"
          />
          <span class="filter-row__content">
            <span class="filter-row__label">
              {{ option.label }} <small>{{ getNumberOfPlans(option.key) }}</small>
            </span>
            <button
              type="button"
              class="info-button info-button--inline"
              @click.stop.prevent="handleTooltip(option.key, option.label)"
              aria-label="coverage-info"
            >
              i
            </button>
          </span>
        </label>
        <div class="filter-divider"></div>
        <label
          class="filter-row"
          :class="{ 'filter-row--disabled': isDisabled('cancelForAnyReasonOption-0') }"
        >
          <input
            type="checkbox"
            :checked="isChecked('cancelForAnyReasonOption-0')"
            :disabled="isDisabled('cancelForAnyReasonOption-0')"
            @change="filterIncludedHandler(($event.target as HTMLInputElement).checked, 'cancelForAnyReasonOption-0')"
          />
          <span class="filter-row__content">
            <span class="filter-row__label">
              Cancel for Any Reason (CFAR)
              <small>{{ getNumberOfPlans('cancelForAnyReasonOption-0') }}</small>
            </span>
            <button
              type="button"
              class="info-button info-button--inline"
              @click.stop.prevent="handleTooltip('cancelForAnyReasonOption-0', 'Cancel for Any Reason (CFAR)')"
              aria-label="coverage-info"
            >
              i
            </button>
          </span>
        </label>
        <label
          class="filter-row"
          :class="{ 'filter-row--disabled': isDisabled('preExWaiver-0') }"
        >
          <input
            type="checkbox"
            :checked="isChecked('preExWaiver-0')"
            :disabled="isDisabled('preExWaiver-0')"
            @change="filterIncludedHandler(($event.target as HTMLInputElement).checked, 'preExWaiver-0')"
          />
          <span class="filter-row__content">
            <span class="filter-row__label">
              PRE-EX Waivers <small>{{ getNumberOfPlans('preExWaiver-0') }}</small>
            </span>
            <button
              type="button"
              class="info-button info-button--inline"
              @click.stop.prevent="handleTooltip('preExWaiver-0', 'PRE-EX Waivers')"
              aria-label="coverage-info"
            >
              i
            </button>
          </span>
        </label>
      </div>
    </section>

    <section class="filter-section">
      <div
        class="filter-header"
        :class="{
          'border-b border-[#DEDEDE]': openSections.medical,
        }"
        @click="toggleSection('medical')"
      >
        <div class="flex items-center gap-2">
          <ChevronUpIcon
            class="size-5 text-black cursor-pointer transition-transform duration-200 ease-in-out"
            :class="{ 'rotate-180': openSections.medical }"
          />
          <p class="text-xs md:text-sm text-imt-black">{{ getFilterData('medical').label }}</p>
        </div>
      </div>
      <div v-if="openSections.medical" class="filter-body">
        <label
          v-for="option in medicalOptions"
          :key="option.key"
          class="filter-row filter-row--radio"
          :class="{ 'filter-row--disabled': isDisabled(option.key) }"
        >
          <input
            type="radio"
            name="medical-copy"
            :checked="isChecked(option.key)"
            :disabled="isDisabled(option.key)"
            @change="filterRadioHandler(option.key, medicalOptions.length)"
          />
          <span class="filter-row__content">
            <span class="filter-row__label">
              {{ option.label }} <small>{{ getNumberOfPlans(option.key) }}</small>
            </span>
            <button
              type="button"
              class="info-button info-button--inline"
              @click.stop.prevent="handleTooltip(option.key, option.label)"
              aria-label="coverage-info"
            >
              i
            </button>
          </span>
        </label>
        <div class="filter-divider"></div>
        <label
          class="filter-row"
          :class="{ 'filter-row--disabled': isDisabled('medical-primary') }"
        >
          <input
            type="checkbox"
            :checked="isChecked('medical-primary')"
            :disabled="isDisabled('medical-primary')"
            @change="filterIncludedHandler(($event.target as HTMLInputElement).checked, 'medical-primary')"
          />
          <span class="filter-row__content">
            <span class="filter-row__label">
              Primary Only <small>{{ getNumberOfPlans('medical-primary') }}</small>
            </span>
            <button
              type="button"
              class="info-button info-button--inline"
              @click.stop.prevent="handleTooltip('medical-primary', 'Primary Only')"
              aria-label="coverage-info"
            >
              i
            </button>
          </span>
        </label>
      </div>
    </section>

    <section class="filter-section">
      <div
        class="filter-header"
        :class="{
          'border-b border-[#DEDEDE]': openSections.evacuation,
        }"
        @click="toggleSection('evacuation')"
      >
        <div class="flex items-center gap-2">
          <ChevronUpIcon
            class="size-5 text-black cursor-pointer transition-transform duration-200 ease-in-out"
            :class="{ 'rotate-180': openSections.evacuation }"
          />
          <p class="text-xs md:text-sm text-imt-black">Emergency Evacuation</p>
        </div>
      </div>
      <div v-if="openSections.evacuation" class="filter-body">
        <label
          v-for="option in evacuationOptions"
          :key="option.key"
          class="filter-row filter-row--radio"
          :class="{ 'filter-row--disabled': isDisabled(option.key) }"
        >
          <input
            type="radio"
            name="evacuation-copy"
            :checked="isChecked(option.key)"
            :disabled="isDisabled(option.key)"
            @change="filterRadioHandler(option.key, evacuationOptions.length)"
          />
          <span class="filter-row__content">
            <span class="filter-row__label">
              {{ option.label }} <small>{{ getNumberOfPlans(option.key) }}</small>
            </span>
            <button
              type="button"
              class="info-button info-button--inline"
              @click.stop.prevent="handleTooltip(option.key, option.label)"
              aria-label="coverage-info"
            >
              i
            </button>
          </span>
        </label>
        <div class="filter-divider"></div>
        <label
          class="filter-row"
          :class="{ 'filter-row--disabled': isDisabled('emergencyMedicalEvacuation-primary') }"
        >
          <input
            type="checkbox"
            :checked="isChecked('emergencyMedicalEvacuation-primary')"
            :disabled="isDisabled('emergencyMedicalEvacuation-primary')"
            @change="filterIncludedHandler(($event.target as HTMLInputElement).checked, 'emergencyMedicalEvacuation-primary')"
          />
          <span class="filter-row__content">
            <span class="filter-row__label">
              Primary Only
              <small>{{ getNumberOfPlans('emergencyMedicalEvacuation-primary') }}</small>
            </span>
            <button
              type="button"
              class="info-button info-button--inline"
              @click.stop.prevent="handleTooltip('emergencyMedicalEvacuation-primary', 'Primary Only')"
              aria-label="coverage-info"
            >
              i
            </button>
          </span>
        </label>
      </div>
    </section>

    <section class="filter-section">
      <div
        class="filter-header"
        :class="{
          'border-b border-[#DEDEDE]': openSections.baggage,
        }"
        @click="toggleSection('baggage')"
      >
        <div class="flex items-center gap-2">
          <ChevronUpIcon
            class="size-5 text-black cursor-pointer transition-transform duration-200 ease-in-out"
            :class="{ 'rotate-180': openSections.baggage }"
          />
          <p class="text-xs md:text-sm text-imt-black">Baggage + Delay Coverage</p>
        </div>
      </div>
      <div v-if="openSections.baggage" class="filter-body">
        <label
          v-for="option in baggageOptions"
          :key="option.key"
          class="filter-row"
          :class="{ 'filter-row--disabled': isDisabled(option.key) }"
        >
          <input
            type="checkbox"
            :checked="isChecked(option.key)"
            :disabled="isDisabled(option.key)"
            @change="filterIncludedHandler(($event.target as HTMLInputElement).checked, option.key)"
          />
          <span class="filter-row__content">
            <span class="filter-row__label">
              {{ option.label }} <small>{{ getNumberOfPlans(option.key) }}</small>
            </span>
            <button
              type="button"
              class="info-button info-button--inline"
              @click.stop.prevent="handleTooltip(option.key, option.label)"
              aria-label="coverage-info"
            >
              i
            </button>
          </span>
        </label>
      </div>
    </section>

    <section class="filter-section">
      <div
        class="filter-header"
        :class="{
          'border-b border-[#DEDEDE]': openSections.other,
        }"
        @click="toggleSection('other')"
      >
        <div class="flex items-center gap-2">
          <ChevronUpIcon
            class="size-5 text-black cursor-pointer transition-transform duration-200 ease-in-out"
            :class="{ 'rotate-180': openSections.other }"
          />
          <p class="text-xs md:text-sm text-imt-black">Other Coverages</p>
        </div>
      </div>
      <div v-if="openSections.other" class="filter-body">
        <label
          v-for="option in otherCoverageOptions"
          :key="option.key"
          class="filter-row"
          :class="{ 'filter-row--disabled': isDisabled(option.key) }"
        >
          <input
            type="checkbox"
            :checked="isChecked(option.key)"
            :disabled="isDisabled(option.key)"
            @change="filterIncludedHandler(($event.target as HTMLInputElement).checked, option.key)"
          />
          <span class="filter-row__content">
            <span class="filter-row__label">
              {{ option.label }} <small>{{ getNumberOfPlans(option.key) }}</small>
            </span>
            <button
              type="button"
              class="info-button info-button--inline"
              @click.stop.prevent="handleTooltip(option.key, option.label)"
              aria-label="coverage-info"
            >
              i
            </button>
          </span>
        </label>
      </div>
    </section>

    <section class="filter-section">
      <div
        class="filter-header"
        :class="{
          'border-b border-[#DEDEDE]': openSections.providers,
        }"
        @click="toggleSection('providers')"
      >
        <div class="flex items-center gap-2">
          <ChevronUpIcon
            class="size-5 text-black cursor-pointer transition-transform duration-200 ease-in-out"
            :class="{ 'rotate-180': openSections.providers }"
          />
          <p class="text-xs md:text-sm text-imt-black">Insurance Providers</p>
        </div>
      </div>
      <div v-if="openSections.providers" class="filter-body">
        <label
          v-for="(providerKey, index) in providerKeys"
          :key="providerKey"
          class="filter-row"
          :class="{ 'filter-row--disabled': isDisabled(providerKey) }"
        >
          <input
            type="checkbox"
            :checked="isChecked(providerKey)"
            :disabled="isDisabled(providerKey)"
            @change="filterIncludedHandler(($event.target as HTMLInputElement).checked, providerKey)"
          />
          <span class="filter-row__content">
            <span class="filter-row__label">
              {{ providerLabels[index] }} <small>{{ getNumberOfPlans(providerKey) }}</small>
            </span>
            <button
              type="button"
              class="info-button info-button--inline"
              @click.stop.prevent="handleTooltip(providerKey, providerLabels[index])"
              aria-label="coverage-info"
            >
              i
            </button>
          </span>
        </label>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
  .copy-filter-container {
    width: 100%;
  }

  .summary-block {
    padding-left: 24px;
  }

  .summary-count {
    margin: 0 0 8px;
    color: #27364a;
    font-size: 16px;
    font-weight: 700;
  }

  .reset-link {
    margin: 0 0 20px;
    border: 0;
    padding: 0;
    background: transparent;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
    text-decoration: none;
    position: relative;
    display: inline-grid;
    align-items: start;
    justify-items: start;

    &:hover {
      .reset-link__count {
        opacity: 0;
      }

      .reset-link__action {
        opacity: 1;
      }
    }
  }

  .reset-link__text {
    grid-area: 1 / 1;
    transition: opacity 0.15s ease;
  }

  .reset-link__count {
    color: #0b67e3;
    opacity: 1;
    text-decoration-line: underline;
    text-decoration-style: dotted;
    text-underline-offset: 2px;
  }

  .reset-link__action {
    color: #0b67e3;
    opacity: 0;
    text-decoration-line: underline;
    text-decoration-style: dotted;
    text-underline-offset: 2px;
  }

  @media (min-width: 1024px) {
    .summary-block {
      padding-left: 12px;
    }
  }

  .filter-section + .filter-section {
    margin-top: 10px;
  }

  .filter-section {
    border: 1px solid transparent;
    border-radius: 6px;
    padding: 10px;
    transition:
      border-color 0.15s ease,
      background-color 0.15s ease,
      box-shadow 0.15s ease;

    &:hover {
      border-color: #dedede;
      box-shadow: 0 4px 12px rgba(39, 54, 74, 0.08);
    }
  }

  .filter-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 5px;
    padding-bottom: 8px;
    margin-bottom: 0;
    cursor: pointer;
    user-select: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .info-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: 1.5px solid #0b67e3;
    border-radius: 999px;
    padding: 0;
    background: #fff;
    color: #0b67e3;
    font-family: 'gamay', sans-serif;
    font-size: 12px;
    font-weight: 600;
    font-style: normal;
    line-height: 1;
    cursor: pointer;
  }

  .filter-body {
    padding-top: 10px;
  }

  .filter-divider {
    height: 1px;
    margin: 8px 0 10px;
    background: #dedede;
  }

  .filter-row {
    display: flex;
    align-items: center;
    gap: 14px;
    min-height: 34px;
    color: rgba(33, 38, 41, 0.6);
    font-size: 15px;
    cursor: pointer;

    &:hover {
      color: rgba(33, 38, 41, 1);
    }
  }

  .filter-row__content {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: space-between;
    width: 100%;
  }

  .filter-row__label {
    display: inline-flex;
    align-items: baseline;
    gap: 4px;
    flex-wrap: wrap;
  }

  .filter-row small {
    font-size: 11px;
    font-weight: 400;
  }

  .filter-row input {
    width: 20px;
    height: 20px;
    margin: 0;
    accent-color: #0b67e3;
    cursor: pointer;
  }

  .filter-row--radio input {
    border-radius: 999px;
  }

  .filter-row--disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .filter-row--disabled input {
    cursor: not-allowed;
  }

  .info-button--inline {
    width: 15.3px;
    height: 15.3px;
    min-width: 15.3px;
    min-height: 15.3px;
    border-width: 1px;
    font-size: 9.35px;
    flex: 0 0 auto;
    opacity: 0.5;

    &:hover {
      opacity: 1;
    }
  }
</style>
