<script setup lang="ts">
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
      class="w-full md:w-[215px] bg-[white] border border-[#DEDEDE] rounded-md flex p-1 items-center text-center mt-2.5 cursor-pointer relative gap-[5px] justify-center h-9 hover:bg-[#F6FAFD]"
    >
      <svg
        class="size-5 text-action-alt-primary"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M4 7l1.41 1.41L8 5.83V13h2V5.83l2.59 2.58L14 7 9 2 4 7zm16 10l-1.41-1.41L16 18.17V11h-2v7.17l-2.59-2.58L10 17l5 5 5-5z"></path>
      </svg>
      <span class="uppercase text-action-alt-primary text-[0.625rem] font-bold" v-if="sortContent">{{
        findCurrentSelection(currentSortSelection)?.label
      }}</span>
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
