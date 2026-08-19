<script setup lang="ts">
  import { computed, onBeforeMount, onMounted, ref, watch } from 'vue';
  import ComparePageHeader from '@/components/base/Compare/ComparePageHeader.vue';
  import HeaderContainer from '@/components/header/HeaderContainer.vue';
  import SectionSidebarCopy from '@/components/section/SectionSidebarCopy.vue';
  import SectionMain from '@/components/section/SectionMain.vue';
  import Loader from '@/components/shared/Loader.vue';
  import { useApiStore } from '@/store/api';
  import { useContentStore } from '@/store/content';
  import { useUserSessionStore } from '@/store/userSession';
  import { initResellerRatings } from '@/utility';

  const apiStore = useApiStore();
  const contentStore = useContentStore();
  const sessionStore = useUserSessionStore();

  const displayLoader = computed(() => apiStore.getLoaderState);
  const isMobile = computed(() => sessionStore.isMobileView);
  const determinedTheme = ref(false);

  const guideNotes = [
    {
      title: 'Live specimen',
      body: 'The top section is the actual QRPOCCopy experience rendered with the same demo data, component structure, and spacing system as the main POC.',
    },
    {
      title: 'Primary reusable systems',
      body: 'This page intentionally centers the real Trip Details header, trust factor card, updated filter rail, plan rows, and details interactions instead of redrawing them as separate approximations.',
    },
    {
      title: 'Why this is closer',
      body: 'Anything you review here should now inherit the same visual language as QRPOCCopy because it uses the same underlying Vue components and static demo bootstrapping path.',
    },
  ];

  const tokenRows = [
    ['Typography', 'Open Sans with semibold plan names, uppercase muted labels, and stronger value hierarchy'],
    ['Borders', '1px light-gray outlines with 6px radius on cards and major controls'],
    ['Controls', 'Rounded pills for sort/share/back actions and green primary CTA buttons'],
    ['Rows', 'Plan detail rows use very light blue fills with dotted underline tooltip affordances'],
  ];

  onBeforeMount(async () => {
    if (!apiStore.getDataLoadedState) {
      await apiStore.init();
    }
  });

  onMounted(() => {
    contentStore.setWPPlanContent();
    initResellerRatings();
    contentStore.setCoverageLimitMap();
    contentStore.setPlanDetailsCoverageLimitMap();
    determinedTheme.value = true;
  });

  watch(displayLoader, (newVal, oldVal) => {
    if (!newVal && oldVal) {
      setTimeout(initResellerRatings, 500);
    }
  });
</script>

<template>
  <div class="style-guide-library">
    <ComparePageHeader v-if="!isMobile" />
    <HeaderContainer v-else />

    <main class="style-guide-library__shell">
      <section class="style-guide-library__intro">
        <div class="style-guide-library__intro-copy">
          <p class="style-guide-library__eyebrow">QRPOCCopy Design Library</p>
          <h1 class="style-guide-library__title">UI Library Reference</h1>
          <p class="style-guide-library__body">
            This guide is now built from the same quote-results component system as
            the actual `QRPOCCopy` work, so the preview below is the real visual
            language rather than a separate mock layout.
          </p>
        </div>
        <div class="style-guide-library__intro-meta">
          <p class="style-guide-library__meta-title">What’s included</p>
          <p class="style-guide-library__meta-copy">
            Trip Details header, trust-factor card, updated filter groups, plan row
            anatomy, plan details styling, and the current action/control system.
          </p>
        </div>
      </section>

      <section class="style-guide-library__specimen">
        <div
          class="quote-results-container grid md:grid-cols-10 gap-3 sm:gap-0 lg:gap-x-14 lg:gap-y-5"
        >
          <HeaderContainer v-if="!isMobile" />
          <SectionSidebarCopy />
          <SectionMain />
          <Loader v-if="displayLoader && determinedTheme" />
        </div>
      </section>

      <section class="style-guide-library__notes">
        <article
          v-for="note in guideNotes"
          :key="note.title"
          class="style-guide-library__note-card"
        >
          <p class="style-guide-library__note-title">{{ note.title }}</p>
          <p class="style-guide-library__note-body">{{ note.body }}</p>
        </article>
      </section>

      <section class="style-guide-library__tokens">
        <article class="style-guide-library__token-card">
          <p class="style-guide-library__eyebrow">System summary</p>
          <h2 class="style-guide-library__section-title">Core visual rules</h2>
          <div class="style-guide-library__token-rows">
            <div
              v-for="row in tokenRows"
              :key="row[0]"
              class="style-guide-library__token-row"
            >
              <p class="style-guide-library__token-label">{{ row[0] }}</p>
              <p class="style-guide-library__token-value">{{ row[1] }}</p>
            </div>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped lang="scss">
  .style-guide-library {
    min-height: 100vh;
    background: #fff;
    color: #333;
  }

  .style-guide-library__shell {
    max-width: 1280px;
    margin: 0 auto;
    padding: 20px 20px 80px;
  }

  .style-guide-library__intro {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
    gap: 24px;
    margin-bottom: 28px;
  }

  .style-guide-library__intro-copy,
  .style-guide-library__intro-meta,
  .style-guide-library__note-card,
  .style-guide-library__token-card {
    border: 1px solid #dedede;
    border-radius: 6px;
    background: #fff;
    padding: 20px 22px;
  }

  .style-guide-library__eyebrow {
    margin: 0 0 8px;
    font-size: 11px;
    line-height: 16px;
    font-weight: 400;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #878787;
  }

  .style-guide-library__title,
  .style-guide-library__section-title {
    margin: 0;
    font-size: 22px;
    line-height: 26px;
    font-weight: 600;
    color: #27364a;
  }

  .style-guide-library__body,
  .style-guide-library__meta-copy,
  .style-guide-library__note-body,
  .style-guide-library__token-value {
    margin: 12px 0 0;
    font-size: 16px;
    line-height: 28px;
    color: #333;
  }

  .style-guide-library__meta-title,
  .style-guide-library__note-title,
  .style-guide-library__token-label {
    margin: 0;
    font-size: 18px;
    line-height: 28px;
    font-weight: 600;
    color: #27364a;
  }

  .style-guide-library__specimen {
    border: 1px solid #dedede;
    border-radius: 6px;
    padding: 0 14px 24px;
    overflow: hidden;
    background: #fff;
  }

  .quote-results-container {
    max-width: 1185px;
    margin: 0 auto;
    padding-top: 20px;
  }

  .style-guide-library__notes {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-top: 28px;
  }

  .style-guide-library__tokens {
    margin-top: 24px;
  }

  .style-guide-library__token-rows {
    display: grid;
    gap: 10px;
    margin-top: 16px;
  }

  .style-guide-library__token-row {
    display: grid;
    grid-template-columns: minmax(180px, 0.42fr) minmax(0, 1fr);
    gap: 18px;
    align-items: start;
    padding: 14px 16px;
    background: rgb(246, 250, 253);
    border-radius: 6px;
  }

  @media (max-width: 1024px) {
    .style-guide-library__intro,
    .style-guide-library__notes {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .style-guide-library__shell {
      padding: 16px 16px 56px;
    }

    .style-guide-library__specimen {
      padding: 0 0 24px;
    }

    .style-guide-library__token-row {
      grid-template-columns: 1fr;
    }
  }
</style>
