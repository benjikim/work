<script setup lang="ts">
  import { onMounted, ref, computed } from 'vue';
  import lottie from 'lottie-web';
  import { useContentStore } from '@/store/content.ts';
  import { useThemeStore } from '@/store/theme';
  import { useUserSessionStore } from '@/store/userSession';
  import UtilityHTMLRenderer from '@/components/utility/UtilityHTMLRenderer.vue';

  const animationContainer = ref(null);
  const contentStore = useContentStore();
  const userSessionStore = useUserSessionStore();
  const themeStore = useThemeStore();

  const isThemeIMT = computed(() => themeStore.isThemeIMT);
  const animationLoaderData = computed(() => {
    const activeLoaderKey = userSessionStore.getLoaderKey;
    return contentStore.getLoaderData(activeLoaderKey);
  });

  const message = computed(() => {
    if (
      animationLoaderData.value?.random_message &&
      animationLoaderData.value?.messages.length > 0
    ) {
      const randomIndex = Math.floor(
        Math.random() * animationLoaderData.value.messages.length
      );
      return animationLoaderData.value.messages[randomIndex].message;
    } else if (animationLoaderData.value?.messages[0]) {
      return animationLoaderData.value.messages[0].message;
    }
    return null;
  });

  onMounted(() => {
    if (
      animationContainer.value &&
      animationLoaderData.value?.animation.length > 0
    ) {
      lottie.loadAnimation({
        container: animationContainer.value,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: JSON.parse(animationLoaderData.value?.animation),
      });
    }
  });
</script>

<template>
  <dialog
    class="daisy-modal daisy-modal-open bg-black/[0.8] z-[1000000]"
    data-cy="loading-modal"
  >
    <div
      class="daisy-modal-box w-11/12 max-w-[23.375rem] p-0 overflow-hidden bg-transparent shadow-none"
    >
      <!-- Our Animation -->
      <div
        ref="animationContainer"
        :class="[!isThemeIMT ? 'w-48 h-48 mx-auto' : '']"
      ></div>
      <!-- Header -->
      <div
        class="font-bold text-center text-white"
      >
        {{ animationLoaderData?.heading }}
      </div>
      <!-- Sub Messages -->
      <UtilityHTMLRenderer
        v-if="message !== null"
        is="div"
        class="text-center mt-2 text-white"
        :content="message"
      ></UtilityHTMLRenderer>
    </div>
  </dialog>
</template>
