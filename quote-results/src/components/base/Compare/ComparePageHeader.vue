<script setup lang="ts">
  import { computed } from 'vue';
  import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';
  import { useApiStore } from '@/store/api';
  import logo from '@/assets/images/logo.svg';

  const apiStore = useApiStore();

  const quoteId = computed(() => apiStore.getQuoteId);
  const resultsHref = computed(() =>
    quoteId.value ? `/?_qid=${quoteId.value}` : '/'
  );

  const utilityLinks = [
    { label: 'Login', href: 'https://www.insuremytrip.com/login/' },
    { label: 'Contact Us', href: 'https://www.insuremytrip.com/contact/' },
  ];

  const primaryLinks = [
    { label: 'Plans', href: 'https://www.insuremytrip.com/travel-insurance-plans/' },
    { label: 'Reviews & FAQs', href: 'https://www.insuremytrip.com/travel-insurance-reviews/' },
    { label: 'Resources', href: 'https://www.insuremytrip.com/travel-guidance/' },
    { label: 'Get Support', href: 'https://www.insuremytrip.com/service/' },
  ];

  const searchHref = 'https://www.insuremytrip.com/?s=';
</script>

<template>
  <div class="display-none lg:block compare-page-header">
    <div class="compare-page-header__inner">
      <a class="compare-page-header__logo-link" href="/">
        <img
          class="compare-page-header__logo"
          :src="logo"
          alt="InsureMyTrip"
        />
      </a>

      <div class="compare-page-header__nav-group">
        <nav class="compare-page-header__utility-nav" aria-label="Utility">
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
            Quote &amp; Compare
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .compare-page-header {
    background: #0c233c;
    color: #fff;
    padding: 0 24px;
  }

  .compare-page-header__inner {
    align-items: center;
    display: flex;
    gap: 48px;
    height: 100px;
    justify-content: space-between;
    margin: 0 auto;
    max-width: 1420px;
    padding: 0 50px;
    width: 100%;
  }

  .compare-page-header__logo-link {
    align-items: center;
    display: inline-flex;
    flex: 0 0 306px;
  }

  .compare-page-header__logo {
    display: block;
    filter: brightness(0) invert(1);
    height: 52px;
    width: 306px;
  }

  .compare-page-header__nav-group {
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: flex-end;
    gap: 17px;
  }

  .compare-page-header__utility-nav,
  .compare-page-header__main-row,
  .compare-page-header__primary-nav {
    align-items: center;
    display: flex;
  }

  .compare-page-header__utility-nav {
    gap: 32px;
    padding-bottom: 2px;
  }

  .compare-page-header__utility-link {
    color: #fff !important;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0;
    line-height: 14.4px;
    opacity: 0.88;
    text-decoration: none;
    text-transform: uppercase;
    transition:
      color 0.18s ease,
      opacity 0.18s ease;
  }

  .compare-page-header__main-row {
    gap: 18px;
  }

  .compare-page-header__primary-nav {
    gap: 18px;
  }

  .compare-page-header__primary-link {
    align-items: center;
    color: #fff !important;
    display: inline-flex;
    font-size: 18px;
    font-weight: 700;
    gap: 6px;
    letter-spacing: 0;
    line-height: 19.8px;
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
    height: 28px;
    justify-content: center;
    padding: 0;
    text-decoration: none;
    transition:
      color 0.18s ease,
      opacity 0.18s ease;
    width: 20px;
  }

  .compare-page-header__search-icon {
    height: 20px;
    width: 20px;
  }

  .compare-page-header__cta {
    align-items: center;
    background: #77bb33;
    border: 2px solid #77bb33;
    color: #fff !important;
    display: inline-flex;
    font-size: 16px;
    font-weight: 700;
    height: 64px;
    justify-content: center;
    letter-spacing: 2px;
    min-width: 208px;
    padding: 0 28px;
    text-decoration: none;
    text-transform: uppercase;
    transition:
      background-color 0.18s ease,
      border-color 0.18s ease,
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
    border-color: #6cab2c;
    color: #fff !important;
  }
</style>
