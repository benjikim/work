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

  const utilityLinks = ['Login', 'Contact Us'];
  const primaryLinks = ['Plans', 'Reviews & FAQs', 'Resources', 'Get Support'];
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
            :key="link"
            class="compare-page-header__utility-link"
            href="#"
          >
            {{ link }}
          </a>
        </nav>

        <div class="compare-page-header__main-row">
          <nav class="compare-page-header__primary-nav" aria-label="Main">
            <a
              v-for="link in primaryLinks"
              :key="link"
              class="compare-page-header__primary-link"
              href="#"
            >
              <span>{{ link }}</span>
              <ChevronDownIcon class="compare-page-header__chevron" />
            </a>
          </nav>

          <button
            type="button"
            class="compare-page-header__search"
            aria-label="Search"
          >
            <MagnifyingGlassIcon class="compare-page-header__search-icon" />
          </button>

          <a class="compare-page-header__cta" :href="resultsHref">
            Your Quote
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
    display: inline-flex;
    flex: 0 0 275px;
    align-items: center;
  }

  .compare-page-header__logo {
    display: block;
    height: 51px;
    width: 275px;
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
    color: #eaeaea;
    font-size: 12px;
    letter-spacing: 0;
    line-height: 14.4px;
    text-decoration: none;
    text-transform: uppercase;
  }

  .compare-page-header__main-row {
    gap: 18px;
  }

  .compare-page-header__primary-nav {
    gap: 18px;
  }

  .compare-page-header__primary-link {
    align-items: center;
    color: #fff;
    display: inline-flex;
    font-size: 18px;
    font-weight: 700;
    gap: 6px;
    letter-spacing: 0.5px;
    line-height: 19.8px;
    text-decoration: none;
    white-space: nowrap;
  }

  .compare-page-header__chevron {
    height: 14px;
    stroke-width: 2.5;
    width: 14px;
  }

  .compare-page-header__search {
    align-items: center;
    background: transparent;
    border: 0;
    color: #fff;
    cursor: pointer;
    display: inline-flex;
    height: 28px;
    justify-content: center;
    padding: 0;
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
    color: #fff;
    display: inline-flex;
    font-size: 16px;
    font-weight: 700;
    height: 64px;
    justify-content: center;
    letter-spacing: 2px;
    min-width: 192px;
    padding: 0 24px;
    text-decoration: none;
    text-transform: uppercase;
    white-space: nowrap;
  }
</style>
