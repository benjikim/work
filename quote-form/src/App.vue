<script setup lang="ts">
  import QuoteForm from '@/views/QuoteForm.vue';
  import { useThemeStore } from '@/store/theme';
  import { computed, onMounted } from 'vue';

  const themeStore = useThemeStore();

  const getThemeName = computed(() => {
    return themeStore.getCurrentTheme;
  });

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const newQuote = urlParams.get('newQuote') ?? '';

  if (newQuote === 'true') {
    localStorage.removeItem('_imtActiveQuoteId');
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('newQuote');
    history.pushState({}, '', currentUrl.toString());
  }

  onMounted(() => {
    // Adding class to body when on results page
    const isResultsPage = window.location.pathname.includes(
      '/travel-insurance/quote/results'
    );
    themeStore.setIsOnResultsPage(isResultsPage);
  });
</script>

<template>
  <div class="quote-form-container">
    <QuoteForm :class="getThemeName" />
  </div>
</template>
