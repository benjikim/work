<script setup lang="ts">
  import { ChevronDownIcon } from '@heroicons/vue/24/solid';
  import { CheckIcon } from '@heroicons/vue/24/solid';
  import { StopIcon } from '@heroicons/vue/24/outline';
  import { useContentStore } from '@/store/content';
  import { useUserSessionStore } from '@/store/userSession';
  import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
  import { SortOptions } from '@/types';
  import { event } from 'vue-gtag';
  import { GAObject } from '@/types';

  const contentStore = useContentStore();
  const sortContent = contentStore.getSortContent;
  const userSession = useUserSessionStore();
  const currentSortSelection = computed(() => userSession.getSortSelection);

  const dropdown = ref<HTMLElement | null>(null);

  const closeDropdown = () => {
    if (dropdown.value) {
      dropdown.value.removeAttribute('open');
    }
  };

  // Checks for outside clicks to close the dropdown
  const handleOutsideClick = (event: any) => {
    if (dropdown.value && !dropdown.value.contains(event.target)) {
      closeDropdown();
    }
  };
    // Add this new function to handle dropdown open event
  const handleDropdownOpen = () => {
    event('sort_by', {
      hierarchical_layer_1: 'Sort By Open'
    } as GAObject);
  
  };

  const findCurrentSelection = (currentSortSelection: string) => {
    return sortContent.options.find(
      (sortEl) => sortEl.type === currentSortSelection
    );
  };

  const handleSortSelection = (selection: SortOptions) => {
    userSession.setSortSelection(selection);
    // Fire Event with Sort By Selection is updated.
    event('sort_by', {
      hierarchical_layer_1: `Sort By ${selection}`
    } as GAObject);

    closeDropdown();
  };

  onMounted(() => {
    document.addEventListener('click', handleOutsideClick);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleOutsideClick);
  });
</script>

<template>
  <details ref="dropdown" class="daisy-dropdown" @click="handleDropdownOpen">
    <summary
      class="text-xs h-[36px] md:h-12 min-h-8 md:min-h-12 sm:text-base m-1 daisy-btn mb-1 md:mb-5 md:rounded-3xl md:bg-transparent md:border-2 md:border-[#DEDEDE] font-normal md:w-[215px]"
    >
      <ChevronDownIcon class="size-3 sm:size-5 stroke-imt-black display-none md:block" />
      <span class="md:font-bold" v-if="sortContent">{{
        findCurrentSelection(currentSortSelection)?.label
      }}</span
      ><ChevronDownIcon class="size-3 sm:size-5 stroke-imt-black md:display-none" />
    </summary>
    <ul
      class="p-2 shadow daisy-menu daisy-dropdown-content z-[1] bg-base-100 rounded-box w-52"
    >
      <template v-for="item in sortContent.options" :key="item.label">
        <li v-if="item.type === currentSortSelection">
          <span
            ><CheckIcon class="size-3 sm:size-5 stroke-imt-black" />
            {{ item.label }}</span
          >
        </li>
        <li v-else>
          <span @click.stop="handleSortSelection(item.type)">
            <StopIcon class="size-3 sm:size-5 stroke-imt-black" />
            {{ item.label }}
          </span>
        </li>
      </template>
    </ul>
  </details>
</template>
<style lang="scss"></style>
