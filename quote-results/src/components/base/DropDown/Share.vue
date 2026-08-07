<script setup lang="ts">
  import { ChevronDownIcon, LinkIcon } from '@heroicons/vue/24/solid';
  import { ArrowUpOnSquareIcon, EnvelopeIcon } from '@heroicons/vue/24/outline';
  import { useApiStore } from '@/store/api';
  import { useContentStore } from '@/store/content';
  import { useUserSessionStore } from '@/store/userSession';
  import { useThemeStore } from '@/store/theme';
  import QuoteReferenceNumber from '@/components/shared/QuoteReferenceNumber.vue';
  import { computed, onMounted, onBeforeUnmount, ref, reactive } from 'vue';
  import { GAObject, QuoteShortCodePayload } from '@/types';
  import { event } from 'vue-gtag';
  import axios from 'axios';
  import { API_ENDPOINTS } from '@/config';

  const contentStore = useContentStore();
  const apiStore = useApiStore();
  const sessionStore = useUserSessionStore();
  const themeStore = useThemeStore();
  const shareContent = computed(() => contentStore.getShareContent);
  const shareMessage = computed(() => contentStore.getShareMessage);
  const isComparePage = window.location.pathname.includes('compare');
  const isMobile = computed(() => sessionStore.isMobileView);
  const planCodes = computed(() => sessionStore.getSelectedPlansForCompare);
  const quoteReferenceCode = computed(() => apiStore.getQuoteReferenceCode);
  const hasShareCapability = computed(
    () => typeof window !== 'undefined' && window.navigator?.share
  );

  const shareLoading = reactive<{ [key: string]: boolean }>({
    email: false,
    facebook: false,
    copy: false,
  });

  const dropdown = ref<HTMLElement | null>(null);
  const isOpen = ref(false);
  const originalCopyLabel = shareContent.value.options.find(
    (ele) => ele.type === 'copy'
  )?.label;

  const closeDropdown = () => {
    if (dropdown.value) {
      dropdown.value.removeAttribute('open');
      isOpen.value = false;
    }
  };

  // Checks for outside clicks to close the dropdown
  const handleOutsideClick = (event: any) => {
    if (dropdown.value && !dropdown.value.contains(event.target)) {
      closeDropdown();
    }
  };

  const quoteId = computed(() => apiStore.getQuoteId);
  const departureDate = computed(() => apiStore.getDepartureDate);

  // Add new method for silent requote
  const silentRequote = async () => {
    try {
      await sessionStore.setPlanParameters(true);
    } catch (error) {
      console.error('Error during silent requote for Share Results: ', error);
    }
  };

  const fetchQuoteReferenceCode = async () => {
    const payload: QuoteShortCodePayload = {
      qid: quoteId.value,
      comparePlans: [],
      departureDate: departureDate.value,
    };

    if (isComparePage && planCodes.value.length) {
      payload.comparePlans = planCodes.value;
    }

    try {
      apiStore.setQuoteReferenceCode(null);
      const res = await axios.post(
        API_ENDPOINTS.cms.getQuoteShortCode(),
        payload
      );
      if (res.status === 200) {
        apiStore.setQuoteReferenceCode(res.data.code);
      }
    } catch (err) {
      console.error('Error during fetching quote reference code', err);
    }
  };

  // Add this new function to handle dropdown open event
  const handleDropdownOpen = async () => {
    isOpen.value = !isOpen.value;
    event('share_results', {
      hierarchical_layer_1: 'Share Results Dropdown Open',
      hierarchical_layer_2: new Date().toISOString(),
      hierarchical_layer_3: quoteId.value,
    } as GAObject);
  };

  const buildAttributionQueryString = (
    isMobile: boolean,
    shareType: string = 'sharequote'
  ) => {
    const url = new URL(window.location.origin + window.location.pathname);
    const searchParams = new URLSearchParams('_qid=' + apiStore.getQuoteId);
    searchParams.append('mode', themeStore.getCurrentThemeMode);

    if (typeof apiStore.getPartnerId === 'string' && apiStore.getPartnerId.trim() !== '') {
      searchParams.append('linkId', apiStore.getPartnerId);
    }

    if (isMobile) {
      searchParams.append('utm_source', 'sharequote');
      searchParams.append('utm_medium', 'mobile');
      searchParams.append('utm_campaign', 'mobile');
      searchParams.append(
        'utm_content',
        window.location.pathname.includes('compare') ? 'compare' : 'results'
      );
      url.search = searchParams.toString();
    } else {
      searchParams.append('utm_source', 'sharequote');
      searchParams.append(
        'utm_content',
        window.location.pathname.includes('compare') ? 'compare' : 'results'
      );
      searchParams.append('utm_medium', 'desktop');
      searchParams.append('utm_campaign', shareType);
      url.search = searchParams.toString();
    }

    // cannot use URLSearchParams because it encodes ','
    if (isComparePage) {
      url.search =
        url.search +
        `&planCodes=${sessionStore.getSelectedPlansForCompare.join(',')}`;
    }

    return url.toString();
  };

  const retrieveCodeTitle = () => {
    const refCode = quoteReferenceCode.value;
    let title = JSON.parse(JSON.stringify(shareMessage.value.heading));
    if (refCode !== null) {
      title = title.replace('[refCode]', `#${refCode}`);
    }
    return title;
  };

  const handleShareMobile = async () => {
    if (isMobile.value) {
      await silentRequote();
      await fetchQuoteReferenceCode();
      // Fire Event to Track that user is sharing results on mobile
      event('share_results', {
        hierarchical_layer_1: 'User Shared Results On Mobile',
        hierarchical_layer_2: new Date().toISOString(),
        hierarchical_layer_3: quoteId.value,
        hierarchical_layer_4: isComparePage
          ? `Compare Page: ${sessionStore.getSelectedPlansForCompare.join(',')}`
          : 'Quote Results Page',
      } as GAObject);

      try {
        const shareURL = buildAttributionQueryString(true);
        const title = retrieveCodeTitle();
        const refCode = quoteReferenceCode.value;
        let body = JSON.parse(JSON.stringify(shareMessage.value.body));

        if (refCode) {
          body = body.replace('[refCode]', `#${refCode}`);
        }

        await window.navigator.share({
          title: `${title}\n`,
          text: `\n${body}\n`,
          url: shareURL,
        });
      } catch (error) {
        console.error('Error sharing results via mobile', error);
      }
    }
  };

  const handleShareSelection = async (shareSelection: {
    label: string;
    type: string;
    icon: { url: string; alt: string };
  }) => {
    shareLoading[shareSelection.type] = true;
    try {
      await silentRequote();
      const refCode = apiStore.getQuoteReferenceCode;
      const { type, label } = shareSelection;
      const shareURL = buildAttributionQueryString(false, type);
      switch (type) {
        case 'email':
          let shareEmailContent = contentStore.getShareEmailContent;
          shareEmailContent.body = shareEmailContent.body.replace(
            '[share link]',
            shareURL
          );
          if (refCode) {
            shareEmailContent.heading = shareEmailContent.heading.replace(
              '[refCode]',
              `#${refCode}`
            );
            shareEmailContent.body = shareEmailContent.body.replace(
              '[refCode]',
              `#${refCode}`
            );
          }

          window.location.href = `mailto:?subject=${encodeURIComponent(shareEmailContent.heading)}&body=${encodeURIComponent(shareEmailContent.body)}`;
          break;
        case 'facebook':
          // @TODO When we make this live for insuremytrip, we will need to update this URL and the
          // facebook app id to get the correct one.
          const encodedURL = encodeURIComponent(shareURL);
          const redirectURL = 'https://www.soventure.com/';
          const redirectEncodedURL = encodeURIComponent(redirectURL);
          window.open(
            `https://www.facebook.com/dialog/send?app_id=${import.meta.env.VITE_SOVENTURE_FACEBOOK_APP_ID}&link=${encodedURL}&redirect_uri=${redirectEncodedURL}`,
            'facebook-share',
            'width=626,height=436,resizable=yes,scrollbars=yes'
          );
          break;
        case 'copy':
          await navigator.clipboard.writeText(shareURL);
          contentStore.setShareOptionLabel('copy', 'Copied!');
          setTimeout(() => {
            if (originalCopyLabel) {
              contentStore.setShareOptionLabel('copy', originalCopyLabel);
            }
          }, 2000);
          break;
      }

      // Fire Event with Share Selection is updated.
      event('share_results', {
        hierarchical_layer_1: `Share Results ${label} Clicked`,
        hierarchical_layer_2: new Date().toISOString(),
        hierarchical_layer_3: apiStore.getQuoteId,
        hierarchical_layer_4: isComparePage
          ? `Compare Page: ${sessionStore.getSelectedPlansForCompare.join(',')}`
          : 'Quote Results Page',
      } as GAObject);
    } catch (error) {
      console.error('Error in handleShareSelection:', error);
    } finally {
      shareLoading[shareSelection.type] = false;
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleOutsideClick);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleOutsideClick);
  });
</script>

<template>
  <button
    v-if="isMobile && hasShareCapability && isComparePage"
    type="button"
    class="flex-1 inline-flex flex-row items-center justify-center daisy-btn rounded-3xl bg-white border-2 border-[#DEDEDE] font-normal max-w-[215px]"
    @click="handleShareMobile"
    aria-label="Back to results"
  >
    <ArrowUpOnSquareIcon
      class="size-5 stroke-imt-blue cursor-pointer mb-[2px]"
    />
    <span
      class="font-bold text-xs text-[--action-primary] ml-[-3px] pt-[2px]"
      v-if="shareContent"
    >
      <span class="block">Share results</span>
    </span>
  </button>
  <div v-else-if="isMobile && hasShareCapability">
    <button
      data-cy="share-results-button"
      class="text-xs h-[36px] md:h-12 min-h-8 md:min-h-12 sm:text-base m-1 daisy-btn mb-1 md:mb-5 md:rounded-3xl md:bg-transparent md:border-2 md:border-[#DEDEDE] font-normal md:w-[215px]"
      @click="handleShareMobile"
    >
      <ArrowUpOnSquareIcon class="size-5 md:stroke-imt-blue cursor-pointer" />
    </button>
  </div>
  <div v-else>
    <details
      ref="dropdown"
      class="daisy-dropdown daisy-dropdown-end bg-white m-0"
    >
      <summary
        data-cy="share-results-button"
        class="text-xs h-[36px] m-0 !mt-0 !mb-0 flex items-center list-none md:h-12 min-h-8 md:min-h-12 sm:text-base daisy-btn md:mb-5 md:rounded-3xl md:bg-transparent md:border-2 md:border-[#DEDEDE] font-normal md:w-[215px]"
        @click="handleDropdownOpen"
      >
        <ChevronDownIcon
          class="size-3 sm:size-5 stroke-[--action-primary] display-none md:block"
        />
        <span
          class="md:font-bold text-[--action-primary] display-none md:block"
          v-if="shareContent"
        >
          {{ shareContent.label }}
        </span>
        <ArrowUpOnSquareIcon
          class="size-5 md:stroke-[--action-primary] cursor-pointer"
        />
        <ChevronDownIcon
          class="size-3 sm:size-5 stroke-imt-black md:display-none"
        />
      </summary>
      <ul
        class="p-2 shadow daisy-menu daisy-dropdown-content z-[1] rounded-box w-52 bg-white"
      >
        <template v-for="item in shareContent.options" :key="item.label">
          <li>
            <span
              :data-cy="'share-results-sub-' + item.type"
              @click="handleShareSelection(item)"
              class="text-black"
            >
              <template v-if="!shareLoading[item.type]">
                <EnvelopeIcon
                  v-if="item.type === 'email'"
                  class="size-5 stroke-black"
                />
                <LinkIcon
                  v-else-if="item.type === 'copy'"
                  class="size-5 stroke-black"
                />
                <img
                  v-else
                  :src="item.icon.url"
                  :alt="item.icon.alt"
                  class="size-5 object-contain"
                />
              </template>
              <span
                v-else
                class="daisy-loading daisy-loading-spinner daisy-loading-xl"
              ></span>
              {{ item.label }}
            </span>
          </li>
        </template>
        <li v-if="isOpen">
          <span data-cy="share-results-sub-reference">
            <QuoteReferenceNumber />
          </span>
        </li>
      </ul>
    </details>
  </div>
</template>
