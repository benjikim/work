<script setup lang="ts">
  import { computed, defineAsyncComponent } from 'vue';
  import { useUserSessionStore } from '@/store/userSession';
  import { useThemeStore } from '@/store/theme';
  import QuoteDetails from '@/components/header/QuoteDetails.vue';
  import Header from '@/components/header/Header.vue';
  import TrustFactors from '@/components/header/TrustFactors.vue';
  import DropDownContainer from '@/components/base/DropDown/DropDownContainer.vue';

  import { onMounted, onUnmounted, watchEffect } from 'vue';

  const props = defineProps({
    isCompare: {
      type: Boolean,
      default: false,
    },
  });

  const EditTripModal = defineAsyncComponent(
    () => import('@/components/header/EditTripModal.vue')
  );

  const AdditionalDetailsModal = defineAsyncComponent(
    () =>
      import('@/components/base/AdditionalDetails/AdditionalDetailsModal.vue')
  );

  const CfarDetailsModal = defineAsyncComponent(
    () => import('@/components/base/Filters/SelectCFARModal.vue')
  );

  const FilterToolTipModal = defineAsyncComponent(
    () => import('@/components/base/Filters/FilterToolTipModal.vue')
  );

  const FilterMobileModal = defineAsyncComponent(
    () => import('@/components/base/Filters/FilterMobileModal.vue')
  );

  const PlanTagModal = defineAsyncComponent(
    () => import('@/components/base/PlanRow/PlanTagModal.vue')
  );

  const CoveredActivitiesModal = defineAsyncComponent(
    () => import('@/components/base/Filters/CoveredActivitiesModal.vue')
  );

  const PreBuyModal = defineAsyncComponent(
    () => import('@/components/base/PreBuyModal/PreBuyModal.vue')
  );

  const AnnualEligibilityModal = defineAsyncComponent(
    () => import('@/components/eligibility/AnnualEligibilityModal.vue')
  );

  const SecondaryToolTipModal = defineAsyncComponent(
    () => import('@/components/shared/SecondaryToolTipModal.vue')
  );

  const AdditionalDetails = defineAsyncComponent(
    () => import('@/components/base/AdditionalDetails/AdditionalDetails.vue')
  );

  const CompareButtonsContainer = defineAsyncComponent(
    () => import('@/components/base/Compare/CompareButtonsContainer.vue')
  );

  const MoreInfoModal = defineAsyncComponent(
    () => import('@/components/shared/MoreInfoModal.vue')
  );

  const sessionStore = useUserSessionStore();
  const themeStore = useThemeStore();

  const isMobile = computed(() => sessionStore.isMobileView);
  const isThemeIMT = computed(() => themeStore.isThemeIMT);

  const updateScreenResize = () => {
    sessionStore.setIsSM(window.matchMedia('(max-width: 640px)').matches);
    sessionStore.setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    sessionStore.setIsLG(window.matchMedia('(min-width: 1024px)').matches);
  };

  onMounted(() => {
    sessionStore.setIsSM(window.matchMedia('(max-width: 640px)').matches);
    sessionStore.setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    sessionStore.setIsLG(window.matchMedia('(min-width: 1024px)').matches);
    window.addEventListener('resize', updateScreenResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateScreenResize);
  });

  const isEditTripDetailsOpen = computed(
    () => sessionStore.isEditTripDetailsOpen
  );

  const isAdditionalDetailsModalOpen = computed(
    () => sessionStore.isAdditionalDetailsModalOpen
  );

  const isFilterToolTipModalOpen = computed(
    () => sessionStore.isFilterToolTipOpen
  );

  const isCfarDetailsModalOpen = computed(
    () => sessionStore.isCfarDetailsModalOpen
  );

  const isMobileFilterOpen = computed(
    () => sessionStore.isMobileFilterModalOpen
  );

  const isCoveredActivitiesModalOpen = computed(
    () => sessionStore.isCoveredActivitiesModalOpen
  );

  const isPBMOpen = computed(() => sessionStore.isPBMOpen);

  const isSecondaryToolTipOpen = computed(
    () => sessionStore.isSecondaryToolTipOpen
  );

  const isFilterModalOpen = computed(() => sessionStore.mobileFilterModalOpen);

  const isPlanTagModalOpen = computed(() => sessionStore.isPlanTagModalOpen);

  const isAnnualEligibilityModalOpen = computed(
    () => sessionStore.isAnnualEligibilityModalOpen
  );

  const isMoreInfoModalOpen = computed(() => sessionStore.isMoreInfoModalOpen);

  const isModalOpen = computed(
    () =>
      isEditTripDetailsOpen.value ||
      isAdditionalDetailsModalOpen.value ||
      isCfarDetailsModalOpen.value ||
      isFilterModalOpen.value ||
      isFilterToolTipModalOpen.value ||
      isMobileFilterOpen.value ||
      isPlanTagModalOpen.value ||
      isCoveredActivitiesModalOpen.value ||
      isPBMOpen.value ||
      isSecondaryToolTipOpen.value ||
      isAnnualEligibilityModalOpen.value ||
      isMoreInfoModalOpen.value
  );

  watchEffect(() => {
    const navHeader = document.querySelector('.header');
    const stickyFooterPhone = document.querySelector('.mobile-sticky-footer');
    const footer = document.querySelector('.footer');

    if (isMobile.value && (props.isCompare || isModalOpen.value)) {
      if (navHeader instanceof HTMLElement) {
        navHeader.classList.add('hidden');
      }
      if (stickyFooterPhone instanceof HTMLElement) {
        stickyFooterPhone.classList.add('hidden');
      }
      if (footer instanceof HTMLElement) {
        footer.classList.add('hidden');
      }
    } else {
      if (
        navHeader instanceof HTMLElement &&
        navHeader.classList.contains('hidden')
      ) {
        navHeader.classList.remove('hidden');
      }
      if (
        stickyFooterPhone instanceof HTMLElement &&
        stickyFooterPhone.classList.contains('hidden')
      ) {
        stickyFooterPhone.classList.remove('hidden');
      }
      if (
        footer instanceof HTMLElement &&
        footer.classList.contains('hidden')
      ) {
        footer.classList.remove('hidden');
      }
    }
  });

  const isComparePage = window.location.pathname.includes('compare');
  const isModeAnnual = computed(() => themeStore.isModeAnnual);
</script>

<template>
  <header
    class="col-span-full"
    :class="{
      'display-none lg:flex': isCompare,
      'bg-white pt-2': isMobile,
      'sticky top-0 z-[1] shadow-sm': !isModeAnnual && isMobile,
    }"
  >
    <div class="mx-auto pb-4 sm:pb-0 px-0 md:px-4 flex flex-col lg:flex-row w-full lg:mt-2">
      <div
        :class="[
          'lg:pb-0 lg:mx-0',
          isThemeIMT && !isModeAnnual ? 'md:border-b md:border-black' : '',
        ]"
      >
        <Header />
        <QuoteDetails class="display-none lg:flex" />
        <div v-if="isThemeIMT && isMobile && !isModeAnnual" class="mt-1.5">
          <AdditionalDetails />
        </div>
        <DropDownContainer v-if="isMobile" class="" />
      </div>

      <div
        class="relative lg:ml-auto display-none md:flex md:justify-center md:overflow-hidden py-2 lg:py-0"
      >
        <TrustFactors
          class="border-2 rounded-[6px] border-[--action-primary]"
          v-if="!isMobile"
        />
      </div>
    </div>
    <EditTripModal v-if="isEditTripDetailsOpen" />
    <AdditionalDetailsModal v-if="isAdditionalDetailsModalOpen" />
    <CfarDetailsModal v-if="isCfarDetailsModalOpen" />
    <FilterToolTipModal v-if="isFilterToolTipModalOpen" />
    <FilterMobileModal v-if="isMobileFilterOpen" />
    <PlanTagModal v-if="isPlanTagModalOpen" />
    <CoveredActivitiesModal v-if="isCoveredActivitiesModalOpen" />
  </header>
  <CompareButtonsContainer v-if="!isComparePage"></CompareButtonsContainer>
  <PreBuyModal v-if="isPBMOpen"></PreBuyModal>
  <AnnualEligibilityModal v-if="isAnnualEligibilityModalOpen" />
  <SecondaryToolTipModal v-if="isSecondaryToolTipOpen" />
  <MoreInfoModal v-if="isMoreInfoModalOpen" />
</template>

<style></style>
