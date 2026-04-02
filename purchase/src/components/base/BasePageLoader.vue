<script setup>
import { computed } from 'vue';

const props = defineProps({
    show: {
        type: Boolean,
        default: false,
        required: true,
    },
    text: {
        type: String,
        default: '',
        required: false,
    },
    id: {
        type: String,
        required: true,
    },
});

const classList = computed(() => {
    if (props.show) {
        return 'flex';
    }
    return 'display-none';
});

</script>

<template>
    <div
        :id="`${props.id}`"
        :class="`fixed inset-0 bg-gray-900 bg-opacity-60 overflow-y-auto h-full w-full px-4 loader ${classList}`"
        
    >
        <!-- Spinner -->
        <div 
            class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-neutral-100 motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status">
        </div>
        <p class="loader__text">{{ text }}</p>
    </div>
</template>

<style lang="scss" scoped>
    .loader {
        justify-content: center;
        align-items: center;
        flex-direction: column;
        &__text {
            margin-top: 20px;
            font-size: 20px;
            color: #fff;
        }
    }
</style>
