<script setup lang="ts">
  import { computed, onBeforeMount, onMounted, ref, watch } from 'vue';
  import { event } from 'vue-gtag';
  import { useApiStore } from '@/store/api';
  import { useContentStore } from '@/store/content';
  import { useThemeStore } from '@/store/theme';
  import { useUserSessionStore } from '@/store/userSession';
  import Loader from '@/components/shared/Loader.vue';
  import PlanDetailsTable from '@/components/shared/PlanDetailsTable.vue';
  import EditTripModal from '@/components/header/EditTripModal.vue';
  import AnnualEligibilityModal from '@/components/eligibility/AnnualEligibilityModal.vue';
  import MoreInfoModal from '@/components/shared/MoreInfoModal.vue';
  import SecondaryToolTipModal from '@/components/shared/SecondaryToolTipModal.vue';
  import PreBuyModal from '@/components/base/PreBuyModal/PreBuyModal.vue';
  import { getShownPlans, initResellerRatings } from '@/utility';
  import { previousRoute } from '@/router/previousRoute';
  import { GAObject } from '@/types';
  import siteLogo from '@/assets/images/logo.svg';

  const apiStore = useApiStore();
  const contentStore = useContentStore();
  const themeStore = useThemeStore();
  const sessionStore = useUserSessionStore();

  const isReady = ref(false);
  const isMobileWhyChooseOpen = ref(false);

  const updateScreenResize = () => {
    sessionStore.setIsSM(window.matchMedia('(max-width: 640px)').matches);
    sessionStore.setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    sessionStore.setIsLG(window.matchMedia('(min-width: 1024px)').matches);
  };

  onBeforeMount(async () => {
    themeStore.setMode('annual');
    updateScreenResize();

    if (!apiStore.getDataLoadedState) {
      await apiStore.init();
    }
  });

  onMounted(() => {
    const fromCompare = previousRoute.value?.name === 'Compare';
    if (!fromCompare) {
      sessionStore.deselectPlansForCompare();
    }

    updateScreenResize();
    window.addEventListener('resize', updateScreenResize);
    window.addEventListener('pageshow', (e) => {
      const nav = performance.getEntriesByType('navigation')[0] as
        | PerformanceNavigationTiming
        | undefined;

      const isBFCache = e.persisted || nav?.type === 'back_forward';

      if (isBFCache) {
        sessionStore.setPBMCurrentState(false);
      }
    });

    contentStore.setWPPlanContent();
    initResellerRatings();
    contentStore.setCoverageLimitMap();
    contentStore.setPlanDetailsCoverageLimitMap();
    isReady.value = true;
  });

  const displayLoader = computed(() => apiStore.getLoaderState);
  const isMobile = computed(() => sessionStore.isMobileView);
  const plans = computed(() => getShownPlans());
  const plan = computed(() => plans.value[0]);
  const currentCost = computed(() =>
    plan.value ? sessionStore.getCurrentPlanCostFormatted(plan.value.code) : ''
  );
  const currentCostParts = computed(() => {
    const [whole = '', decimals = '00'] = currentCost.value.split('.');
    return { whole, decimals };
  });
  const travelDates = computed(() => apiStore.getTravelDates);
  const travelerAges = computed(() => apiStore.getTravelerAges);
  const isEditTripDetailsOpen = computed(() => sessionStore.isEditTripDetailsOpen);
  const isAnnualEligibilityModalOpen = computed(
    () => sessionStore.isAnnualEligibilityModalOpen
  );
  const isMoreInfoModalOpen = computed(() => sessionStore.isMoreInfoModalOpen);
  const isSecondaryToolTipOpen = computed(() => sessionStore.isSecondaryToolTipOpen);
  const isPBMOpen = computed(() => sessionStore.isPBMOpen);

  const planLogo = computed(() => {
    if (!plan.value?.code) {
      return `${import.meta.env.BASE_URL}previous-site-20260323/intrip-reserve-protection-logo-insuremytrip.svg`;
    }

    return (
      contentStore.getPlanLogo(plan.value.code) ||
      `${import.meta.env.BASE_URL}previous-site-20260323/intrip-reserve-protection-logo-insuremytrip.svg`
    );
  });

  const openEditTripDetailsModal = () => {
    sessionStore.setEditTripModalIsOpen(true);
  };

  const handleBuyButtonSelection = (planCode: string) => {
    event('plan_action_plan_details_modal', {
      hierarchical_layer_1: 'Selected Clicked',
      hierarchical_layer_2: `Plan Code ${planCode}`,
      hierarchical_layer_4: 'Annual Results Copy Page',
    } as GAObject);

    sessionStore.setPBMCurrentState(true);
    sessionStore.setPBMPlan(planCode);
  };

  const shareResults = async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Annual Plan Results',
          text: 'Review this annual travel insurance plan.',
          url: shareUrl,
        });
        return;
      } catch (_error) {
        // Ignore cancellation and fall back to clipboard copy.
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (_error) {
      window.prompt('Copy this link', shareUrl);
    }
  };

  watch(displayLoader, (newVal, oldVal) => {
    if (!newVal && oldVal) {
      setTimeout(initResellerRatings, 500);
    }
  });

  const openMobileWhyChoose = () => {
    isMobileWhyChooseOpen.value = true;
  };

  const closeMobileWhyChoose = () => {
    isMobileWhyChooseOpen.value = false;
  };

</script>

<template>
  <div class="annual-results-copy">
    <Loader v-if="displayLoader && isReady" />

    <div v-else class="annual-page-shell">
      <header class="annual-topbar">
        <div v-if="!isMobile" class="annual-topbar__main">
          <a class="annual-topbar__brand" href="https://www.insuremytrip.com/" target="_blank" rel="noreferrer">
            <img :src="siteLogo" alt="InsureMyTrip" />
          </a>

          <div class="annual-topbar__right">
            <div class="annual-topbar__utility">
              <a href="https://www.insuremytrip.com/login/" target="_blank" rel="noreferrer">LOGIN</a>
              <a href="https://www.insuremytrip.com/contact/" target="_blank" rel="noreferrer">CONTACT US</a>
            </div>

            <div class="annual-topbar__nav-row">
              <nav class="annual-topbar__nav" aria-label="Primary">
                <a href="https://www.insuremytrip.com/travel-insurance-plans/" target="_blank" rel="noreferrer">Plans</a>
                <a href="https://www.insuremytrip.com/travel-insurance-reviews/" target="_blank" rel="noreferrer">Reviews &amp; FAQs</a>
                <a href="https://www.insuremytrip.com/resources/" target="_blank" rel="noreferrer">Resources</a>
                <a href="https://www.insuremytrip.com/get-support/" target="_blank" rel="noreferrer">Get Support</a>
              </nav>

              <a
                class="annual-topbar__search"
                href="https://www.insuremytrip.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Search"
              >
                <span></span>
              </a>

              <a
                class="annual-topbar__cta"
                href="https://www.insuremytrip.com/travel-insurance-quote/"
                target="_blank"
                rel="noreferrer"
              >
                YOUR QUOTE
              </a>
            </div>
          </div>
        </div>
        <div v-else class="annual-topbar__mobile">
          <a
            class="annual-topbar__phone"
            href="tel:8004874722"
            aria-label="Call us"
          >
            <span class="annual-topbar__phone-icon"></span>
          </a>
          <a class="annual-topbar__mobile-brand" href="https://www.insuremytrip.com/" target="_blank" rel="noreferrer">
            <img :src="siteLogo" alt="InsureMyTrip" />
          </a>
          <button class="annual-topbar__menu" type="button" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      <main class="annual-content">
        <section v-if="!isMobile" class="annual-summary-row">
          <div class="annual-summary-row__details">
            <h1>Your Annual Plan Results</h1>
            <div class="annual-detail-grid">
              <button class="annual-detail-card" type="button" @click="openEditTripDetailsModal">
                <span class="annual-detail-card__label">Coverage Dates:</span>
                <span class="annual-detail-card__value">{{ travelDates }}</span>
              </button>
              <div class="annual-detail-divider"></div>
              <button class="annual-detail-card annual-detail-card--age" type="button" @click="openEditTripDetailsModal">
                <span class="annual-detail-card__label">Traveler Ages:</span>
                <span class="annual-detail-card__value">{{ travelerAges }}</span>
              </button>
            </div>
          </div>

          <button class="annual-share-button" type="button" @click="shareResults">
            <span class="annual-share-button__chevron" aria-hidden="true"></span>
            <span>Share Results</span>
            <span class="annual-share-button__icon" aria-hidden="true"></span>
          </button>
        </section>

        <section v-else class="annual-mobile-summary">
          <div class="annual-mobile-summary__title-row">
            <p class="annual-mobile-summary__title">Your Annual Plan Results</p>
            <button
              class="annual-mobile-summary__date"
              type="button"
              @click="openEditTripDetailsModal"
            >
              {{ travelDates }}
            </button>
          </div>

          <div class="annual-mobile-actions">
            <button class="annual-mobile-actions__info" type="button" @click="openMobileWhyChoose">
              <span>Why choose annual travel insurance?</span>
              <span class="annual-mobile-actions__chevron" aria-hidden="true"></span>
            </button>
            <button class="annual-mobile-actions__share" type="button" @click="shareResults" aria-label="Share Results">
              <span class="annual-share-button__icon" aria-hidden="true"></span>
            </button>
          </div>
        </section>

        <section class="annual-layout" v-if="plan">
          <aside v-if="!isMobile" class="annual-sidebar">
            <div class="annual-sidebar__help">
              <h2>Why choose annual travel insurance?</h2>
              <ul>
                <li>One policy covers all eligible trips for an entire year</li>
                <li>Medical protection and emergency evacuation coverage</li>
                <li>Baggage loss, delay, and damage protection</li>
                <li>Trip cancellation and interruption benefits</li>
                <li>Travel delay reimbursement</li>
                <li>Annual plans may cost less than buying separate single-trip policies</li>
              </ul>

              <div class="annual-sidebar__divider"></div>
              <h3>Need help choosing?</h3>
              <p>Our licensed agents are here to help.</p>
              <a href="tel:8004874722">800-487-4722</a>
            </div>
          </aside>

          <section class="annual-plan-card-wrap">
            <div class="annual-plan-card">
              <div class="annual-plan-card__summary">
              <div class="annual-plan-card__brand">
                <img :src="planLogo" :alt="`${plan.provider.name} logo`" />
                <div class="annual-plan-card__title-group">
                  <h2>{{ plan.name }}</h2>
                </div>
              </div>

                <div class="annual-plan-card__pricing">
                  <div class="annual-plan-card__amount" v-if="currentCost">
                    <span class="annual-plan-card__currency">$</span>
                    <span class="annual-plan-card__whole">{{ currentCostParts.whole }}</span>
                    <span class="annual-plan-card__decimal-wrap">
                      <span class="annual-plan-card__decimals">.{{ currentCostParts.decimals }}</span>
                      <span class="annual-plan-card__total">TOTAL</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    class="annual-plan-card__select"
                    @click="handleBuyButtonSelection(plan.code)"
                  >
                    SELECT
                  </button>
                </div>
              </div>

              <div class="annual-plan-card__table">
                <PlanDetailsTable :plan="plan" />
              </div>
            </div>

            <p class="annual-plan-card__footer-note">
              Don’t see the coverage you need?
              <a href="https://www.insuremytrip.com/annual-travel-insurance/" target="_blank" rel="noreferrer">
                Explore more options.
              </a>
            </p>
          </section>
        </section>
      </main>

      <div
        v-if="isMobile && isMobileWhyChooseOpen"
        class="annual-mobile-why-overlay"
      >
        <div class="annual-mobile-why-overlay__header">
          <button
            type="button"
            class="annual-mobile-why-overlay__header-button"
            @click="closeMobileWhyChoose"
          >
            <span>Why choose annual travel insurance?</span>
            <span
              class="annual-mobile-why-overlay__header-chevron"
              aria-hidden="true"
            ></span>
          </button>
        </div>

        <div class="annual-mobile-why-overlay__content">
          <div class="annual-mobile-why-overlay__copy">
            <h2>Why choose annual travel insurance?</h2>
            <ul>
              <li>One policy covers all eligible trips for an entire year</li>
              <li>Medical protection and emergency evacuation coverage</li>
              <li>Baggage loss, delay, and damage protection</li>
              <li>Trip cancellation and interruption benefits</li>
              <li>Travel delay reimbursement</li>
              <li>
                Annual plans may cost less than buying separate single-trip
                policies
              </li>
            </ul>

            <div class="annual-mobile-why-overlay__divider"></div>

            <h3>Need help choosing?</h3>
            <p>Our licensed agents are here to help.</p>
            <a href="tel:8004874722">800-487-4722</a>

            <div class="annual-mobile-why-overlay__divider"></div>
          </div>

          <button
            type="button"
            class="annual-mobile-why-overlay__cta"
            @click="closeMobileWhyChoose"
          >
            See Plan Details
          </button>
        </div>
      </div>
    </div>

    <EditTripModal v-if="isEditTripDetailsOpen" />
    <PreBuyModal v-if="isPBMOpen" />
    <AnnualEligibilityModal v-if="isAnnualEligibilityModalOpen" />
    <SecondaryToolTipModal v-if="isSecondaryToolTipOpen" />
    <MoreInfoModal v-if="isMoreInfoModalOpen" />
  </div>
</template>

<style scoped lang="scss">
  .annual-results-copy {
    min-height: 100vh;
    background: #fff;
    color: #2a2a2a;
    font-family: 'gamay', sans-serif;
  }

  .annual-page-shell {
    min-height: 100vh;
    background: #fff;
  }

  .annual-topbar {
    background: #0c233c;
    color: #fff;
    padding: 0;
  }

  .annual-topbar__main,
  .annual-content {
    margin: 0 auto;
  }

  .annual-topbar__mobile {
    display: none;
  }

  .annual-topbar__main {
    width: min(1185px, calc(100% - 40px));
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
    min-height: 116px;
    padding: 0;
  }

  .annual-topbar__utility a,
  .annual-topbar__utility a:visited,
  .annual-topbar__utility a:hover,
  .annual-topbar__utility a:active,
  .annual-topbar__nav a,
  .annual-topbar__nav a:visited,
  .annual-topbar__nav a:hover,
  .annual-topbar__nav a:active,
  .annual-topbar__brand,
  .annual-topbar__cta,
  .annual-topbar__cta:visited,
  .annual-topbar__cta:hover,
  .annual-topbar__cta:active,
  .annual-topbar__search,
  .annual-topbar__search:visited,
  .annual-topbar__search:hover,
  .annual-topbar__search:active {
    color: #fff;
    text-decoration: none;
  }

  .annual-topbar__brand {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    padding-right: 0;
  }

  .annual-topbar__brand img {
    width: 300px;
    max-width: 100%;
    display: block;
    opacity: 1;
    filter: brightness(0) invert(1);
  }

  .annual-topbar__right {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    gap: 12px;
    min-width: 0;
    flex: 1 1 auto;
    padding-top: 6px;
  }

  .annual-topbar__utility {
    display: flex;
    justify-content: flex-end;
    gap: 40px;
    font-family: 'gamay', sans-serif;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0;
    text-transform: uppercase;
    color: #ffffff !important;
    line-height: 1;
    width: 100%;
    padding-right: 248px;
  }

  .annual-topbar__nav-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 34px;
    width: 100%;
  }

  .annual-topbar__nav {
    display: flex;
    align-items: center;
    gap: 34px;
    font-family: 'gamay', sans-serif;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0;
    white-space: nowrap;
    color: #ffffff !important;
    line-height: 1.1;
  }

  .annual-topbar__nav a {
    position: relative;
    padding-right: 18px;
  }

  .annual-topbar__nav a::after {
    content: '';
    position: absolute;
    right: 0;
    top: 8px;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid #fff;
  }

  .annual-topbar__search {
    position: relative;
    width: 24px;
    height: 24px;
    flex: 0 0 auto;
    margin-left: 2px;
    margin-right: 6px;
  }

  .annual-topbar__search span {
    position: absolute;
    inset: 0;
  }

  .annual-topbar__search span::before {
    content: '';
    position: absolute;
    left: 1px;
    top: 1px;
    width: 14px;
    height: 14px;
    border: 2px solid #fff;
    border-radius: 50%;
  }

  .annual-topbar__search span::after {
    content: '';
    position: absolute;
    right: 1px;
    bottom: 2px;
    width: 8px;
    height: 2px;
    background: #fff;
    transform: rotate(45deg);
    transform-origin: center;
  }

  .annual-topbar__cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 188.305px;
    min-height: 60px;
    padding: 0 20px;
    background: #77bb33;
    color: #fff !important;
    font-family: 'gamay', sans-serif;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 1.2px;
    line-height: 1;
    text-transform: uppercase;
    flex: 0 0 auto;
  }

  .annual-topbar__utility a,
  .annual-topbar__utility a:link,
  .annual-topbar__utility a:visited,
  .annual-topbar__utility a:hover,
  .annual-topbar__utility a:active,
  .annual-topbar__nav a,
  .annual-topbar__nav a:link,
  .annual-topbar__nav a:visited,
  .annual-topbar__nav a:hover,
  .annual-topbar__nav a:active,
  .annual-topbar__cta,
  .annual-topbar__cta:link,
  .annual-topbar__cta:visited,
  .annual-topbar__cta:hover,
  .annual-topbar__cta:active,
  .annual-topbar__search,
  .annual-topbar__search:link,
  .annual-topbar__search:visited,
  .annual-topbar__search:hover,
  .annual-topbar__search:active {
    color: #ffffff !important;
    text-decoration: none !important;
  }

  .annual-content {
    width: min(1185px, calc(100% - 40px));
    padding: 20px 0 64px;
  }

  .annual-mobile-summary {
    display: none;
  }

  .annual-mobile-why-overlay {
    display: none;
  }

  .annual-summary-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 224px;
    align-items: end;
    gap: 20px;
    padding-top: 20px;
  }

  .annual-summary-row__details h1 {
    margin: 0 0 20px;
    color: #0c233c;
    font-family: 'gamay', sans-serif;
    font-size: 24px;
    line-height: normal;
    font-weight: 600;
  }

  .annual-detail-grid {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    width: fit-content;
  }

  .annual-detail-card {
    border: 0;
    background: transparent;
    padding: 0 12px 0 0;
    text-align: left;
    cursor: pointer;
  }

  .annual-detail-card--age {
    width: 128px;
  }

  .annual-detail-card__label {
    display: block;
    margin-bottom: 4px;
    color: #2a2a2a;
    font-family: 'gamay', sans-serif;
    font-size: 12px;
    line-height: 16px;
    font-weight: 600;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .annual-detail-card__value {
    color: #1f67e7;
    font-family: 'gamay', sans-serif;
    font-size: 12px;
    line-height: 16px;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .annual-detail-divider {
    width: 1px;
    height: 48px;
    background: #757575;
    flex: 0 0 auto;
  }

  .annual-share-button {
    display: inline-flex;
    align-items: center;
    gap: 14px;
    justify-content: center;
    width: 224px;
    min-height: 48px;
    padding: 0 16px;
    border: 2px solid #d4dbe4;
    border-radius: 999px;
    background: #fff;
    color: #0354d6;
    font-family: 'gamay', sans-serif;
    font-size: 16px;
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .annual-share-button__chevron {
    width: 10px;
    height: 10px;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(45deg) translateY(-1px);
  }

  .annual-share-button__icon {
    position: relative;
    width: 16px;
    height: 16px;
    border: 2px solid currentColor;
    border-top: 0;
    border-radius: 2px;
    margin-left: 2px;
  }

  .annual-share-button__icon::before {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;
    top: -6px;
    left: 5px;
    transform: rotate(-45deg);
  }

  .annual-share-button__icon::after {
    content: '';
    position: absolute;
    width: 2px;
    height: 8px;
    background: currentColor;
    top: -3px;
    left: 7px;
  }

  .annual-layout {
    display: grid;
    grid-template-columns: 324px minmax(0, 1fr);
    gap: 20px;
    align-items: start;
    padding-top: 20px;
  }

  .annual-sidebar {
    padding-top: 20px;
  }

  .annual-sidebar__help {
    width: 324px;
    color: #596270;
    font-family: 'gamay', sans-serif;
    font-size: 14px;
    line-height: normal;
  }

  .annual-sidebar__help h2,
  .annual-sidebar__help h3 {
    margin: 0;
    color: #0c233c;
    font-family: 'gamay', sans-serif;
    font-size: 14px;
    line-height: normal;
    font-weight: 600;
  }

  .annual-sidebar__help ul {
    margin: 20px 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .annual-sidebar__help li {
    position: relative;
    padding-left: 16px;
    line-height: 20px;
  }

  .annual-sidebar__help li::before {
    content: '•';
    position: absolute;
    left: 0;
    top: 0;
    color: #039097;
    font-size: 16px;
    line-height: 20px;
  }

  .annual-sidebar__divider {
    border-top: 1px solid #dedede;
    margin: 20px 0;
  }

  .annual-sidebar__help p {
    margin: 8px 0 0;
    color: #596270;
    font-size: 14px;
    line-height: normal;
  }

  .annual-sidebar__help a {
    display: inline-block;
    margin-top: 8px;
    color: #039097;
    font-size: 14px;
    line-height: normal;
    font-weight: 600;
    text-decoration: none;
  }

  .annual-plan-card {
    overflow: visible;
    border: 1px solid #dedede;
    border-radius: 6px;
    background: #fff;
  }

  .annual-plan-card-wrap {
    min-width: 0;
  }

  .annual-plan-card__summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 20px;
    border-bottom: 1px solid #f2f2f2;
  }

  .annual-plan-card__brand {
    display: flex;
    gap: 12px;
    align-items: center;
    min-width: 0;
  }

  .annual-plan-card__brand img {
    width: 120px;
    max-width: 120px;
    height: auto;
    object-fit: contain;
  }

  .annual-plan-card__title-group {
    min-width: 0;
  }

  .annual-plan-card__eyebrow {
    margin: 0 0 4px;
    color: #7a8597;
    font-family: 'gamay', sans-serif;
    font-size: 14px;
    line-height: 16px;
    font-weight: 600;
    text-transform: uppercase;
  }

  .annual-plan-card__title-group h2 {
    margin: 0;
    color: #2a2a2a;
    font-family: 'gamay', sans-serif;
    font-size: 24px;
    line-height: normal;
    font-weight: 600;
  }

  .annual-plan-card__pricing {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    min-width: 160px;
  }

  .annual-plan-card__amount {
    display: inline-flex;
    align-items: flex-start;
    color: #111827;
    font-weight: 600;
  }

  .annual-plan-card__currency {
    margin-top: 2px;
    font-size: 24px;
    line-height: 1;
  }

  .annual-plan-card__whole {
    font-family: 'gamay', sans-serif;
    font-size: 58px;
    line-height: 0.9;
    font-weight: 700;
  }

  .annual-plan-card__decimal-wrap {
    display: inline-flex;
    flex-direction: column;
    margin-top: 5px;
  }

  .annual-plan-card__decimals {
    font-size: 20px;
    line-height: 1;
  }

  .annual-plan-card__total {
    margin-top: 2px;
    font-size: 12px;
    line-height: 1;
    font-weight: 500;
  }

  .annual-plan-card__select {
    min-width: 152px;
    min-height: 40px;
    border: 0;
    border-radius: 4px;
    background: #77bb33;
    color: #fff;
    font-family: 'gamay', sans-serif;
    font-size: 16px;
    line-height: 20px;
    font-weight: 600;
    letter-spacing: 0;
  }

  .annual-plan-card__table {
    padding: 0 20px 18px;
  }

  .annual-plan-card__footer-note {
    margin: 16px 0 0;
    padding: 0;
    color: #526975;
    font-family: 'gamay', sans-serif;
    font-size: 16px;
    line-height: 20px;
    text-align: center;
  }

  .annual-plan-card__footer-note a {
    color: inherit;
    font-weight: 600;
    text-decoration: none;
  }

  :deep(.annual-plan-card__table .daisy-table) {
    width: 100%;
    border-spacing: 0 0;
  }

  :deep(.annual-plan-card__table thead th) {
    padding: 9px 16px;
    color: #000;
    font-family: 'gamay', sans-serif;
    font-size: 14px;
    line-height: 20px;
    font-weight: 400;
    text-transform: none;
    border-top: 1px solid #f2f2f2;
    border-bottom: 1px solid #f2f2f2;
  }

  :deep(.annual-plan-card__table thead:not(:first-child) th) {
    padding-top: 24px;
  }

  :deep(.annual-plan-card__table thead:first-child th) {
    border-top: 0;
  }

  :deep(.annual-plan-card__table tbody tr) {
    background: #f6fafd;
  }

  :deep(.annual-plan-card__table tbody td) {
    padding: 10px 16px;
    border-bottom: 1px solid #f2f2f2;
    vertical-align: top;
  }

  :deep(.annual-plan-card__table tbody tr:last-child td) {
    border-bottom: 0;
  }

  :deep(.annual-plan-card__table tbody td:first-child) {
    width: 300px;
    padding-right: 8px;
    color: #7a8597;
    font-family: 'gamay', sans-serif;
    font-size: 14px;
    line-height: 16px;
    font-weight: 400;
  }

  :deep(.annual-plan-card__table tbody td:last-child) {
    color: #2a2a2a;
    font-family: 'gamay', sans-serif;
    font-size: 14px;
    line-height: 120%;
    font-weight: 400;
  }

  :deep(.annual-plan-card__table tbody td *),
  :deep(.annual-plan-card__table tbody td p),
  :deep(.annual-plan-card__table tbody td span),
  :deep(.annual-plan-card__table tbody td div),
  :deep(.annual-plan-card__table tbody td a),
  :deep(.annual-plan-card__table tbody td button),
  :deep(.annual-plan-card__table tbody td label),
  :deep(.annual-plan-card__table tbody td strong) {
    font-family: 'gamay', sans-serif !important;
    font-size: 14px !important;
    line-height: 120% !important;
    font-weight: 400 !important;
  }

  :deep(.annual-plan-card__table tbody td:first-child span:first-child) {
    white-space: nowrap;
  }

  :deep(.annual-plan-card__table .form-checkbox) {
    gap: 12px !important;
    margin-bottom: 0 !important;
    justify-content: flex-start !important;
  }

  :deep(.annual-plan-card__table .form-checkbox input) {
    appearance: auto !important;
    -webkit-appearance: checkbox !important;
    accent-color: var(--action-alt-primary) !important;
    width: 20px !important;
    height: 20px !important;
    min-width: 20px !important;
    min-height: 20px !important;
    border-radius: 4px !important;
    border: 2px solid var(--action-alt-primary) !important;
    background: var(--action-alt-primary) !important;
    cursor: pointer !important;
    flex-shrink: 0 !important;
  }

  :deep(.annual-plan-card__table .form-checkbox__label) {
    padding-top: 0 !important;
    align-items: center !important;
  }

  :deep(.annual-plan-card__table .text-\[\#878787\]) {
    color: #7a8597 !important;
  }

  :deep(.annual-plan-card__table .uppercase) {
    letter-spacing: 0.03em;
  }

  :deep(.annual-plan-card__table tbody .font-bold) {
    font-weight: 400;
  }

  @media (max-width: 1400px) {
    .annual-topbar__main,
    .annual-content {
      width: calc(100% - 40px);
    }

    .annual-layout {
      grid-template-columns: 1fr;
    }

    .annual-summary-row {
      grid-template-columns: 1fr;
    }

    .annual-sidebar {
      padding-top: 0;
    }
  }

  @media (max-width: 768px) {
    .annual-topbar {
      padding: 0;
    }

    .annual-content {
      width: 100%;
    }

    .annual-topbar__main {
      display: none;
    }

    .annual-topbar__mobile {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 80px;
      padding: 23px 20px;
      position: relative;
    }

    .annual-topbar__phone,
    .annual-topbar__mobile-brand,
    .annual-topbar__menu {
      position: relative;
      z-index: 1;
    }

    .annual-topbar__phone {
      width: 23px;
      height: 23px;
      color: #fff;
    }

    .annual-topbar__phone-icon {
      display: block;
      position: relative;
      width: 23px;
      height: 23px;
    }

    .annual-topbar__phone-icon::before {
      content: '';
      position: absolute;
      left: 5px;
      top: 3px;
      width: 12px;
      height: 16px;
      border: 2px solid #fff;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
      border-right-color: transparent;
      transform: rotate(-35deg);
    }

    .annual-topbar__mobile-brand {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 200px;
    }

    .annual-topbar__mobile-brand img {
      width: 200px;
      height: 37px;
      object-fit: contain;
    }

    .annual-topbar__menu {
      width: 30px;
      height: 21px;
      background: transparent;
      border: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .annual-topbar__menu span {
      display: block;
      width: 30px;
      height: 2px;
      background: #fff;
    }

    .annual-content {
      padding: 0 0 40px;
    }

    .annual-summary-row {
      display: none;
    }

    .annual-mobile-summary {
      display: flex;
      flex-direction: column;
      width: 100%;
      padding: 0 10px 16px;
      background: #fff;
    }

    .annual-mobile-summary__title-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      width: 100%;
      padding: 10px 0;
    }

    .annual-mobile-summary__title {
      margin: 0;
      color: #2a2a2a;
      font-family: 'gamay', sans-serif;
      font-size: 12px;
      line-height: 24px;
      font-weight: 600;
      white-space: nowrap;
    }

    .annual-mobile-summary__date {
      border: 0;
      background: transparent;
      color: #0354d6;
      font-family: 'gamay', sans-serif;
      font-size: 12px;
      line-height: 16px;
      font-weight: 600;
      text-decoration: underline;
      text-underline-offset: 2px;
      padding: 0;
      white-space: nowrap;
    }

    .annual-mobile-actions {
      display: flex;
      align-items: center;
      gap: 20px;
      width: 100%;
      padding: 4px 0 0;
    }

    .annual-mobile-actions__info,
    .annual-mobile-actions__share {
      background: #f6f6f6;
      border: 0;
      border-radius: 8px;
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
      min-height: 36px;
    }

    .annual-mobile-actions__info {
      flex: 1 1 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0 16px;
      color: #0c233c;
      font-family: 'Open Sans', sans-serif;
      font-size: 12px;
      font-weight: 700;
      text-align: center;
    }

    .annual-mobile-actions__chevron {
      width: 12px;
      height: 12px;
      border-right: 2px solid #0354d6;
      border-bottom: 2px solid #0354d6;
      transform: rotate(45deg) translateY(-2px);
      flex: 0 0 auto;
    }

    .annual-mobile-actions__share {
      width: 92px;
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #f2f2f2;
      background: #f2f2f2;
    }

    .annual-mobile-why-overlay {
      position: fixed;
      inset: 0;
      z-index: 40;
      display: flex;
      flex-direction: column;
      background: #fff;
      overflow-y: auto;
    }

    .annual-mobile-why-overlay__header {
      background: #0c233c;
      padding: 14px 14px 0;
    }

    .annual-mobile-why-overlay__header-button {
      width: 100%;
      min-height: 96px;
      border: 0;
      background: transparent;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 0 22px 0 36px;
      font-family: 'gamay', sans-serif;
      font-size: 18px;
      line-height: 1.2;
      font-weight: 600;
      text-align: left;
    }

    .annual-mobile-why-overlay__header-chevron {
      width: 20px;
      height: 20px;
      border-top: 6px solid #fff;
      border-right: 6px solid #fff;
      transform: rotate(45deg);
      flex: 0 0 auto;
    }

    .annual-mobile-why-overlay__content {
      display: flex;
      flex: 1 1 auto;
      flex-direction: column;
      justify-content: space-between;
      padding: 36px 14px 18px;
    }

    .annual-mobile-why-overlay__copy {
      padding: 0 22px;
      color: #596270;
      font-family: 'gamay', sans-serif;
      font-size: 16px;
      line-height: 1.45;
    }

    .annual-mobile-why-overlay__copy h2,
    .annual-mobile-why-overlay__copy h3 {
      margin: 0;
      color: #0c233c;
      font-family: 'gamay', sans-serif;
      font-size: 18px;
      line-height: 1.25;
      font-weight: 600;
    }

    .annual-mobile-why-overlay__copy ul {
      margin: 20px 0 24px;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 22px;
    }

    .annual-mobile-why-overlay__copy li {
      position: relative;
      padding-left: 28px;
    }

    .annual-mobile-why-overlay__copy li::before {
      content: '•';
      position: absolute;
      left: 0;
      top: 0;
      color: #039097;
      font-size: 24px;
      line-height: 1;
    }

    .annual-mobile-why-overlay__copy p {
      margin: 16px 0 0;
      font-size: 16px;
      line-height: 1.45;
    }

    .annual-mobile-why-overlay__copy a {
      display: inline-block;
      margin-top: 14px;
      color: #039097;
      font-size: 16px;
      line-height: 1.2;
      font-weight: 600;
      text-decoration: none;
    }

    .annual-mobile-why-overlay__divider {
      border-top: 1px solid #dedede;
      margin: 20px 0;
    }

    .annual-mobile-why-overlay__cta {
      margin: 28px 14px 0;
      min-height: 92px;
      border: 0;
      border-radius: 18px;
      background: #0f8cab;
      color: #fff;
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.25);
      font-family: 'gamay', sans-serif;
      font-size: 20px;
      line-height: 1.2;
      font-weight: 600;
    }

    .annual-plan-card__summary {
      padding: 10px;
      align-items: flex-start;
      gap: 10px;
      border-bottom: 0;
    }

    .annual-layout {
      display: block;
      padding-top: 10px;
    }

    .annual-plan-card {
      border: 0;
      border-radius: 0;
      box-shadow: none;
    }

    .annual-plan-card__brand {
      gap: 0;
      width: auto;
      align-items: flex-start;
      flex-direction: column;
    }

    .annual-plan-card__brand img {
      width: 120px;
      max-width: 120px;
    }

    .annual-plan-card__title-group h2 {
      font-size: 18px;
      line-height: 28px;
      text-align: left;
      margin-top: 4px;
    }

    .annual-plan-card__eyebrow {
      display: none;
    }

    .annual-plan-card__pricing {
      align-items: center;
      min-width: 190px;
      gap: 12px;
      margin-left: auto;
    }

    .annual-plan-card__select {
      min-width: 190px;
      min-height: 40px;
      font-size: 22px;
    }

    .annual-plan-card__amount {
      justify-content: center;
    }

    .annual-plan-card__currency {
      font-size: 16px;
      line-height: 24px;
    }

    .annual-plan-card__whole {
      font-size: 36px;
      line-height: 36px;
    }

    .annual-plan-card__decimals {
      font-size: 12px;
      line-height: 16px;
    }

    .annual-plan-card__total {
      font-size: 10px;
      line-height: 15px;
      text-transform: uppercase;
    }

    .annual-plan-card__table {
      padding: 0 10px;
    }

    :deep(.annual-plan-card__table .daisy-table) {
      display: block;
    }

    :deep(.annual-plan-card__table .daisy-table thead),
    :deep(.annual-plan-card__table .daisy-table .tr_plan_info),
    :deep(.annual-plan-card__table .daisy-table .tr_coverage_upgrades),
    :deep(.annual-plan-card__table .daisy-table .tr_medical),
    :deep(.annual-plan-card__table .daisy-table .tr_trip_protection),
    :deep(.annual-plan-card__table .daisy-table .tr_pre-existing_conditions),
    :deep(.annual-plan-card__table .daisy-table .tr_evacuation),
    :deep(.annual-plan-card__table .daisy-table .tr_accidental_death),
    :deep(.annual-plan-card__table .daisy-table tbody),
    :deep(.annual-plan-card__table .daisy-table tr),
    :deep(.annual-plan-card__table .daisy-table td),
    :deep(.annual-plan-card__table .daisy-table th) {
      display: block;
      width: 100%;
    }

    .annual-plan-card__footer-note {
      padding: 18px 10px 10px;
      font-size: 12px;
      line-height: 16px;
    }

    :deep(.annual-plan-card__table thead th) {
      padding: 18px 16px 12px;
      font-size: 14px;
      line-height: 20px;
      font-weight: 600;
      background: #fff;
      border-top: 0;
      border-bottom: 1px solid #f2f2f2;
    }

    :deep(.annual-plan-card__table tbody) {
      margin-bottom: 2px;
    }

    :deep(.annual-plan-card__table tbody tr) {
      margin-bottom: 2px;
      background: #f6fafd;
    }

    :deep(.annual-plan-card__table tbody td) {
      border-bottom: 0;
    }

    :deep(.annual-plan-card__table tbody td:first-child) {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      width: 100%;
      padding: 10px 10px 2px;
      color: #878787;
      font-size: 10px !important;
      line-height: 16px !important;
    }

    :deep(.annual-plan-card__table tbody td:first-child *),
    :deep(.annual-plan-card__table tbody td:first-child p),
    :deep(.annual-plan-card__table tbody td:first-child span),
    :deep(.annual-plan-card__table tbody td:first-child div) {
      font-size: 10px !important;
      line-height: 16px !important;
      letter-spacing: 0.02em;
    }

    :deep(.annual-plan-card__table tbody td:first-child .tooltip-wrapper) {
      order: -1;
      flex: 0 0 auto;
    }

    :deep(.annual-plan-card__table tbody td:last-child) {
      width: 100%;
      padding: 0 10px 10px;
      font-size: 14px !important;
      line-height: 16px !important;
    }

    :deep(.annual-plan-card__table tbody td:last-child *),
    :deep(.annual-plan-card__table tbody td:last-child p),
    :deep(.annual-plan-card__table tbody td:last-child span),
    :deep(.annual-plan-card__table tbody td:last-child div),
    :deep(.annual-plan-card__table tbody td:last-child a),
    :deep(.annual-plan-card__table tbody td:last-child button),
    :deep(.annual-plan-card__table tbody td:last-child label) {
      font-size: 14px !important;
      line-height: 16px !important;
    }

    :deep(.annual-plan-card__table .form-checkbox) {
      gap: 8px !important;
      padding-left: 4px;
      align-items: flex-start !important;
    }

    :deep(.annual-plan-card__table .form-checkbox input) {
      width: 18px !important;
      height: 18px !important;
      min-width: 18px !important;
      min-height: 18px !important;
      border: 1px solid #000 !important;
      border-radius: 0 !important;
      background: #fff !important;
      accent-color: transparent !important;
      appearance: none !important;
      -webkit-appearance: none !important;
      position: relative;
    }

    :deep(.annual-plan-card__table .form-checkbox input:checked) {
      background: var(--action-primary) !important;
      border-color: var(--action-primary) !important;
    }

    :deep(.annual-plan-card__table .form-checkbox input:checked::after) {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      width: 6px;
      height: 10px;
      border: solid #fff;
      border-width: 0 2px 2px 0;
      transform: translate(-50%, -58%) rotate(45deg);
    }

    :deep(.annual-plan-card__table .form-checkbox__label) {
      align-items: flex-start !important;
    }
  }
</style>
