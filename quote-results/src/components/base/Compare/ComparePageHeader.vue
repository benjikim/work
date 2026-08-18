<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';
  import { XMarkIcon } from '@heroicons/vue/24/solid';
  import { useApiStore } from '@/store/api';
  import logo from '@/assets/images/logo.svg';

  const apiStore = useApiStore();

  const quoteId = computed(() => apiStore.getQuoteId);
  const resultsHref = computed(() =>
    quoteId.value ? `/?_qid=${quoteId.value}` : '/'
  );

  const utilityLinks = [
    { label: 'Contact Us', href: 'https://www.insuremytrip.com/contact/' },
  ];

  const primaryLinks = [
    {
      label: 'Discover Insurance',
      href: 'https://www.insuremytrip.com/travel-insurance-plans/',
    },
    { label: 'Reviews & FAQs', href: 'https://www.insuremytrip.com/travel-insurance-reviews/' },
    { label: 'Resources', href: 'https://www.insuremytrip.com/travel-guidance/' },
    { label: 'Get Support', href: 'https://www.insuremytrip.com/service/' },
  ];

  const searchHref = 'https://www.insuremytrip.com/?s=';
  const isWhatsNewOpen = ref(false);
  const showWhatsNewPill = ref(false);

  const handleHeaderMouseMove = (event: MouseEvent) => {
    const currentTarget = event.currentTarget as HTMLElement | null;
    if (!currentTarget) {
      showWhatsNewPill.value = false;
      return;
    }

    const { top } = currentTarget.getBoundingClientRect();
    const pointerOffsetY = event.clientY - top;

    showWhatsNewPill.value = pointerOffsetY <= 22;
  };

  const handleHeaderMouseLeave = () => {
    showWhatsNewPill.value = false;
  };

  const execSummary = [
    'This version is a more guided, more structured quote results experience than what’s currently live. The biggest differences are a redesigned filter system, a stronger Trip Details + trust-factor header, and more interactive plan rows with clearer actions and refined typography.',
    'From a product perspective, the local version is trying to make three things easier: scanning available plans, understanding optional/related coverages, and taking action from the plan row without needing to parse as much visual noise. It also adds clearer fallback behavior when filters produce no matches.',
  ];

  const sideBySideRows = [
    {
      area: 'Header summary',
      online: 'Standard quote results header',
      updated: 'Reframed as `Trip Details` with stronger editable/details treatment',
    },
    {
      area: 'Trip detail formatting',
      online: 'More default/live presentation',
      updated: 'Dates and trip cost date formatted for faster scanning',
    },
    {
      area: 'Filter organization',
      online: 'More fragmented filter structure',
      updated: 'Consolidated filter system with clearer grouping',
    },
    {
      area: 'Trip interruption / cancellation',
      online: 'More separated in live filter flow',
      updated: 'Combined into one `Trip Interruption & Cancellation` section',
    },
    {
      area: 'Pre-ex waiver placement',
      online: 'Separate from CFAR context',
      updated: 'Moved closer to CFAR-related filtering',
    },
    {
      area: 'Accidental death',
      online: 'More standalone treatment',
      updated: 'Folded into `Other Coverages`',
    },
    {
      area: 'Emergency evacuation',
      online: 'Open in standard flow',
      updated: 'Minimized by default',
    },
    {
      area: 'Provider filters',
      online: 'Existing live behavior',
      updated: 'Explicit provider section in updated filter stack',
    },
    {
      area: 'Filter styling',
      online: 'Standard live styling',
      updated: 'Uses card-like borders, spacing, hover behavior, and stronger hierarchy',
    },
    {
      area: 'Filter summary text',
      online: 'Standard shown/reset language',
      updated: 'Split into total available vs currently shown, with hover-reset behavior',
    },
    {
      area: 'Plan card actions',
      online: 'Primarily select + compare/live behaviors',
      updated: 'Adds dedicated `Details` button beside `Compare`',
    },
    {
      area: 'Plan row interaction',
      online: 'More distributed across cells/controls',
      updated: 'Stronger row-level interaction and hover treatment',
    },
    {
      area: 'Pricing block',
      online: 'Standard total display',
      updated: 'Adds `For All Travelers` under price',
    },
    {
      area: 'Label/value typography',
      online: 'Current live mix',
      updated: 'More normalized hierarchy between plan tag, labels, and values',
    },
    {
      area: 'Plan details drawer',
      online: 'Existing details layout',
      updated: 'Refined spacing, tooltip behavior, alignment, and content grouping',
    },
    {
      area: 'Tooltip treatment',
      online: 'More icon-driven in places',
      updated: 'More dotted-underline-driven in plan detail contexts',
    },
    {
      area: 'Non-applicable annual/single-trip content',
      online: 'More mixed into coverage rows',
      updated: 'Moved into clearer supporting guidance below the main table',
    },
    {
      area: 'Sort/share controls',
      online: 'Current live control styling',
      updated: 'Restyled pills/buttons for a more unified control system',
    },
    {
      area: 'No-results behavior',
      online: 'Can leave results area feeling empty',
      updated: 'Explicit empty state with reset action',
    },
  ];
</script>

<template>
  <div
    class="display-none lg:block compare-page-header"
    @mousemove="handleHeaderMouseMove"
    @mouseleave="handleHeaderMouseLeave"
  >
    <div class="compare-page-header__inner">
      <div class="compare-page-header__brand-column">
        <button
          type="button"
          class="compare-page-header__whats-new-pill"
          :class="{ 'compare-page-header__whats-new-pill--visible': showWhatsNewPill }"
          @click="isWhatsNewOpen = true"
        >
          What&apos;s New?
        </button>
        <a class="compare-page-header__logo-link" href="/">
          <img
            class="compare-page-header__logo"
            :src="logo"
            alt="InsureMyTrip"
          />
        </a>
      </div>

      <div class="compare-page-header__nav-group">
        <nav class="compare-page-header__utility-nav" aria-label="Utility">
          <div class="compare-page-header__utility-spacer"></div>
          <a
            v-for="link in utilityLinks"
            :key="link.label"
            class="compare-page-header__utility-link"
            :href="link.href"
          >
            {{ link.label }}
          </a>
        </nav>

        <div class="compare-page-header__main-row">
          <nav class="compare-page-header__primary-nav" aria-label="Main">
            <a
              v-for="link in primaryLinks"
              :key="link.label"
              class="compare-page-header__primary-link"
              :href="link.href"
            >
              <span>{{ link.label }}</span>
              <ChevronDownIcon class="compare-page-header__chevron" aria-hidden="true" />
            </a>
          </nav>

          <a
            class="compare-page-header__search"
            :href="searchHref"
            aria-label="Search"
          >
            <MagnifyingGlassIcon class="compare-page-header__search-icon" />
          </a>

          <a class="compare-page-header__cta" :href="resultsHref">
            Start a Quote
          </a>
        </div>
      </div>
    </div>
  </div>
  <dialog
    v-if="isWhatsNewOpen"
    class="daisy-modal daisy-modal-open compare-page-header__whats-new-modal"
    @close="isWhatsNewOpen = false"
  >
    <div class="daisy-modal-box compare-page-header__whats-new-box">
      <div class="compare-page-header__whats-new-header">
        <div>
          <p class="compare-page-header__whats-new-eyebrow">What&apos;s New?</p>
          <h2 class="compare-page-header__whats-new-title">
            Quote Results POC Summary
          </h2>
        </div>
        <button
          type="button"
          class="compare-page-header__whats-new-close"
          aria-label="Close what’s new modal"
          @click="isWhatsNewOpen = false"
        >
          <XMarkIcon class="compare-page-header__whats-new-close-icon" />
        </button>
      </div>

      <div class="compare-page-header__whats-new-content">
        <section class="compare-page-header__whats-new-section">
          <h3>Executive Summary</h3>
          <ul>
            <li v-for="item in execSummary" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section class="compare-page-header__whats-new-section">
          <h3>Side by Side</h3>
          <div class="compare-page-header__comparison-table" role="table" aria-label="Side by side comparison">
            <div class="compare-page-header__comparison-head" role="row">
              <div role="columnheader">Area</div>
              <div role="columnheader">Currently Online</div>
              <div role="columnheader">Updated POC</div>
            </div>
            <div
              v-for="row in sideBySideRows"
              :key="row.area"
              class="compare-page-header__comparison-row"
              role="row"
            >
              <div role="cell" class="compare-page-header__comparison-area">{{ row.area }}</div>
              <div role="cell">{{ row.online }}</div>
              <div role="cell">{{ row.updated }}</div>
            </div>
          </div>
        </section>
      </div>
    </div>
    <form method="dialog" class="daisy-modal-backdrop">
      <button @click="isWhatsNewOpen = false">close</button>
    </form>
  </dialog>
</template>

<style scoped lang="scss">
  .compare-page-header {
    background: #0c233c;
    color: #fff;
    position: static;
    top: auto;
    z-index: 30;
  }

  .compare-page-header__inner {
    align-items: flex-start;
    display: flex;
    gap: 28px;
    max-width: 1200px;
    justify-content: space-between;
    margin: 0 auto;
    padding: 0 24px;
    width: 100%;
  }

  .compare-page-header__brand-column {
    align-items: flex-start;
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    gap: 10px;
    padding-top: 10px;
  }

  .compare-page-header__logo-link {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
  }

  .compare-page-header__logo {
    display: block;
    filter: brightness(0) invert(1);
    max-width: 100%;
    width: 198px;
  }

  .compare-page-header__nav-group {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: flex-end;
    gap: 0;
  }

  .compare-page-header__utility-nav,
  .compare-page-header__main-row,
  .compare-page-header__primary-nav {
    align-items: center;
    display: flex;
  }

  .compare-page-header__utility-nav {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    min-height: 34px;
    width: 100%;
  }

  .compare-page-header__utility-spacer {
    flex: 1;
  }

  .compare-page-header__utility-link {
    color: #f3f6f9 !important;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0;
    line-height: 1.4;
    text-decoration: none;
    text-transform: uppercase;
    transition:
      color 0.18s ease,
      opacity 0.18s ease;
  }

  .compare-page-header__main-row {
    gap: 18px;
    min-height: 76px;
    width: 100%;
  }

  .compare-page-header__primary-nav {
    align-items: center;
    display: flex;
    flex: 1;
    gap: 42px;
    justify-content: center;
  }

  .compare-page-header__whats-new-pill {
    align-items: center;
    background: #f28c28;
    border: 0;
    border-radius: 999px;
    color: #0c233c;
    cursor: pointer;
    display: inline-flex;
    flex: 0 0 auto;
    font-family: 'Open Sans', sans-serif;
    font-size: 11px;
    font-weight: 700;
    height: 28px;
    justify-content: center;
    letter-spacing: 0.03em;
    opacity: 0;
    pointer-events: none;
    padding: 0 12px;
    text-transform: uppercase;
    transition:
      background-color 0.18s ease,
      opacity 0.18s ease,
      visibility 0.18s ease,
      transform 0.18s ease;
    visibility: hidden;
    white-space: nowrap;
  }

  .compare-page-header__whats-new-pill--visible {
    opacity: 1;
    pointer-events: auto;
    visibility: visible;
  }

  .compare-page-header__primary-link {
    align-items: center;
    color: #fff !important;
    display: inline-flex;
    font-family: 'Open Sans', sans-serif;
    font-size: 18px;
    font-weight: 700;
    gap: 6px;
    letter-spacing: 0;
    line-height: 1.3;
    text-decoration: none;
    transition:
      color 0.18s ease,
      opacity 0.18s ease;
    white-space: nowrap;
  }

  .compare-page-header__chevron {
    height: 14px;
    flex: 0 0 14px;
    stroke-width: 2.5;
    width: 14px;
  }

  .compare-page-header__search {
    align-items: center;
    color: #fff !important;
    cursor: pointer;
    display: inline-flex;
    height: 22px;
    justify-content: center;
    padding: 0;
    text-decoration: none;
    transition:
      color 0.18s ease,
      opacity 0.18s ease;
    width: 22px;
  }

  .compare-page-header__search-icon {
    height: 22px;
    width: 22px;
  }

  .compare-page-header__cta {
    align-items: center;
    background: #7bb832;
    border: 0;
    color: #fff !important;
    display: inline-flex;
    font-size: 16px;
    font-weight: 600;
    height: 58px;
    justify-content: center;
    letter-spacing: 0;
    min-width: 0;
    padding: 0 26px;
    text-decoration: none;
    text-transform: uppercase;
    transition:
      background-color 0.18s ease,
      color 0.18s ease;
    white-space: nowrap;
  }

  .compare-page-header__utility-link:hover,
  .compare-page-header__primary-link:hover,
  .compare-page-header__search:hover {
    color: #fff !important;
    opacity: 0.72;
  }

  .compare-page-header__cta:hover {
    background: #6cab2c;
    color: #fff !important;
  }

  .compare-page-header__whats-new-pill:hover {
    background: #ff9a3d;
    transform: translateY(-1px);
  }

  .compare-page-header__whats-new-modal {
    z-index: 998;
  }

  .compare-page-header__whats-new-box {
    border-radius: 16px;
    max-width: 1080px;
    padding: 28px;
    width: calc(100vw - 48px);
  }

  .compare-page-header__whats-new-header {
    align-items: flex-start;
    display: flex;
    justify-content: space-between;
    gap: 24px;
    margin-bottom: 24px;
  }

  .compare-page-header__whats-new-eyebrow {
    color: #0354d6;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    margin: 0 0 8px;
    text-transform: uppercase;
  }

  .compare-page-header__whats-new-title {
    color: #0c233c;
    font-size: 32px;
    font-weight: 700;
    line-height: 1.1;
    margin: 0;
  }

  .compare-page-header__whats-new-close {
    align-items: center;
    background: transparent;
    border: 0;
    color: #203444;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    margin: -6px -6px 0 0;
    padding: 6px;
  }

  .compare-page-header__whats-new-close-icon {
    height: 24px;
    width: 24px;
  }

  .compare-page-header__whats-new-content {
    display: grid;
    gap: 24px;
  }

  .compare-page-header__whats-new-section {
    border: 1px solid #dedede;
    border-radius: 12px;
    padding: 20px;
  }

  .compare-page-header__whats-new-section h3 {
    color: #0c233c;
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 14px;
  }

  .compare-page-header__whats-new-section ul {
    display: grid;
    gap: 12px;
    margin: 0;
    padding-left: 20px;
  }

  .compare-page-header__whats-new-section li,
  .compare-page-header__comparison-row div {
    color: #203444;
    font-size: 16px;
    line-height: 1.55;
  }

  .compare-page-header__comparison-table {
    border: 1px solid #dedede;
    border-radius: 12px;
    overflow: hidden;
  }

  .compare-page-header__comparison-head,
  .compare-page-header__comparison-row {
    display: grid;
    gap: 0;
    grid-template-columns: 160px minmax(0, 1fr) minmax(0, 1fr);
  }

  .compare-page-header__comparison-head {
    background: #f5f8fb;
  }

  .compare-page-header__comparison-head div {
    color: #0c233c;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    padding: 14px 16px;
    text-transform: uppercase;
  }

  .compare-page-header__comparison-row + .compare-page-header__comparison-row {
    border-top: 1px solid #dedede;
  }

  .compare-page-header__comparison-row div {
    padding: 16px;
  }

  .compare-page-header__comparison-area {
    color: #0c233c !important;
    font-weight: 700;
  }
</style>
