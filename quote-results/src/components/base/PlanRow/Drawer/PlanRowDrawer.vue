<script setup lang="ts">
  import { computed, ref, watch, PropType, nextTick } from 'vue';
  import MainSection from '@/components/base/PlanRow/Drawer/MainSection.vue';
  import { useUserSessionStore } from '@/store/userSession';
  import { QuoteResult } from '@/types';
  import AsideSection from '@/components/base/PlanRow/Drawer/AsideSection.vue';
  import { useThemeStore } from '@/store/theme';

  const themeStore = useThemeStore();

  const props = defineProps({
    isOpen: {
      type: Boolean,
      required: true,
    },
    plan: {
      type: Object as PropType<QuoteResult>,
      required: true,
    },
    showPlanDetailCoveredActivities: {
      type: Boolean,
      required: true,
    },
    closeDrawer: {
      type: Function as PropType<() => void>,
      required: true,
    },
  });

  const sessionStore = useUserSessionStore();

  const drawerRoot = ref<HTMLElement | null>(null);
  const isSoventure = computed(() => themeStore.isThemeSoventure);

  watch(
    () => sessionStore.getScrollToPlanDetailSection,
    (val) => {
      if (!val || !props.isOpen) return;
      if (props.plan?.code !== sessionStore.getScrollPlanCode) return;
      scrollToSection();
    }
  );

  const scrollToSection = async () => {
    const scrollSelector = sessionStore.getScrollToPlanDetailSection;
    if (!scrollSelector || !props.plan?.code) return;

    // Clear the scroll section immediately so other drawers don't try to use it
    // We'll set it back if we need to scroll, or leave it cleared if we don't
    sessionStore.setScrollToPlanDetailSection(null);
    
    // Map selector to section header name
    const sectionNameMap: Record<string, string> = {
      '.tr_included_benefits': 'Included Benefits',
      '.tr_covered_activities': 'Covered Activities',
    };
    
    const sectionName = sectionNameMap[scrollSelector];
    if (!sectionName || !props.plan?.code) return;
    
    // Open the section first if it's closed (element won't be in DOM if section is closed due to v-if)
    const needsToOpen = !sessionStore.isSectionOpen(sectionName, props.plan.code);
    if (needsToOpen) {
      sessionStore.toggleSection(sectionName, props.plan.code);
    }
    
    // Wait for Vue to render the content and for accordion animation to complete
    // Accordion uses duration-300 (300ms) transition, so wait a bit longer to be safe
    await nextTick();
    setTimeout(() => {
      // Scope the search to this drawer's container to ensure we find the correct plan row's section
      const drawerContainer = drawerRoot.value;
      if (!drawerContainer) {
        return;
      }
      
      // Use the id attribute which already includes both section name and plan code
      // Format: plan-row-details-accordion-header-{section_name}-{plan_code}
      const sectionNameForSelector = sectionName.toLowerCase().replace(/\s+/g, '_');
      const headerId = `plan-row-details-accordion-header-${sectionNameForSelector}-${props.plan.code}`;
      
      // Find the accordion header container with the id attribute
      const accordionHeader = drawerContainer.querySelector(`#${headerId}`) as HTMLElement;
      
      // The element with the class (tr_included_benefits, etc.) is the <p> inside the header
      // If we found the header, find the <p> element with the class, otherwise fall back to class selector
      const element = accordionHeader 
        ? (accordionHeader.querySelector(scrollSelector) as HTMLElement) || accordionHeader
        : drawerContainer.querySelector(scrollSelector) as HTMLElement;
      
      // Verify the element belongs to this plan and is within the drawer
      if (element) {
        const isInCurrentDrawer = drawerContainer.contains(element);
        
        if (isInCurrentDrawer) {
          // Now scroll to the element
          setTimeout(() => {
            // Always scroll the page (window) to the element
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // On mobile, adjust scroll position to account for sticky header with DropDownContainer
            if (sessionStore.isMobileView) {
              setTimeout(() => {
                const stickyHeader = document.querySelector('header.sticky.top-0') as HTMLElement;
                if (stickyHeader) {
                  const headerHeight = stickyHeader.offsetHeight;
                  // const padding = 20;
                  // Get current element position after scrollIntoView
                  const elementRect = element.getBoundingClientRect();
                  // Calculate how much we need to adjust so element appears below sticky header
                  const desiredTop = headerHeight;
                  const currentTop = elementRect.top;
                  const offset = currentTop - desiredTop;
                  
                  // Adjust window scroll to position element below sticky header
                  if (offset > 0) {
                    window.scrollBy({ top: offset, behavior: 'smooth' });
                  }
                }
              }, 100); // Wait for scrollIntoView to complete
            }
          }, 50);
        }
      }
    }, needsToOpen ? 350 : 50); // Wait longer if we had to open the section for animation to complete
  };

</script>
<template>
  <Transition
    enter-active-class="transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="isOpen"
      ref="drawerRoot"
      class="col-span-18 w-full bg-white pt-[12px]"
      :class="isSoventure ? 'xl:col-span-20' : ''"
    >
      <div
        class="grid grid-cols-18 w-full h-full"
        :class="{ 'xl:grid-cols-20': isSoventure }"
      >
        <div
          class="col-span-18 h-full flex flex-col"
          :class="
            isSoventure ? 'md:col-span-13 xl:col-span-15' : 'md:col-span-13'
          "
        >
          <div class="drawer-content h-full flex-1">
            <MainSection :plan="plan" />
          </div>
        </div>

        <div
          class="md:col-start-14 display-none md:block h-full"
          :class="
            isSoventure
              ? 'md:col-span-5 md:mx-6 lg:ml-0 lg:mr-3 lg:pl-3 xl:col-start-16 xl:col-span-5'
              : 'md:col-span-5 md:mx-6'
          "
        >
          <div>
            <AsideSection :plan="plan" />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
<style lang="scss">
  #quote-results-app {
    .provider-content p {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .daisy-tabs a {
      text-decoration: none;
      color: inherit;
    }
  }
</style>
