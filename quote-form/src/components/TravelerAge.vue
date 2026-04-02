<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import InputNumber from 'primevue/inputnumber'
import { useContentStore } from '@/store/content'
import { useFormStore } from '../store/form'
import { sendGtagEvent } from '@/utils/analytics'
import { getAgeFromDOB } from '@/utils/commonUtils'

type TravelerAge = number | null

const props = defineProps<{
  numberOfTravelers: number
  modelValue: TravelerAge[]
  submitAttempted?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: TravelerAge[]): void
}>()

const contentStore = useContentStore()
const formStore = useFormStore()

const values = reactive<TravelerAge[]>([])
const touched = reactive<boolean[]>([])

const syncLength = (count: number) => {
  while (values.length < count) {
    values.push(props.modelValue[values.length] ?? null)
    touched.push(false)
  }
  while (values.length > count) {
    values.pop()
    touched.pop()
  }
}

// initial sync
syncLength(props.numberOfTravelers)

watch(() => props.numberOfTravelers, syncLength)

watch(values, (newValues) => {
  const payload = [...newValues]
  formStore.setTravelerAges(payload)
  sendGtagEvent('traveler_ages_updated', [payload.toString()])
  emit('update:modelValue', payload)
})

watch(
  () => props.submitAttempted,
  (attempted) => {
    if (attempted) touched.fill(true)
  }
)

const hasActiveQuote = computed(
  () =>
    formStore.hasActiveQuote &&
    !formStore.getIsLoading &&
    formStore.getTravelers
)

const initializedFromQuote = ref(false)

watch(hasActiveQuote, (active) => {
  if (!active || initializedFromQuote.value) return

  const ages = formStore.getTravelers
    ?.filter((dob): dob is string => typeof dob === 'string')
    .map(getAgeFromDOB)

  if (!ages?.length) return

  values.splice(0, values.length, ...ages)
  emit('update:modelValue', ages)
  initializedFromQuote.value = true
})

const onAgeKeydown = (e: KeyboardEvent) => {
  const input = e.target as HTMLInputElement
  if (!/^\d$/.test(e.key)) return

  const digits = input.value.replace(/\D/g, '')
  const hasSelection =
    (input.selectionEnd ?? 0) - (input.selectionStart ?? 0) > 0

  if (!hasSelection && digits.length >= 2) {
    e.preventDefault()
  }
}
</script>

<template>
  <div class="flex flex-col w-full traveler-age-component">
    <label class="text-sm pb-[6px]">
      {{ contentStore.getQuoteFormContentByKey('traveler_info').age.placeholder }}
    </label>

    <div class="flex flex-row flex-wrap gap-[10px]">
      <InputNumber
        v-for="(_, index) in values"
        :key="index"
        v-model="values[index]"
        class="w-[70px]"
        :inputClass="{ 'p-invalid': touched[index] && (values[index] === null), 'h-[44px]': true }"
        :data-cy="`quote-form-traveler-${index}`"
        @keydown="onAgeKeydown"
        @blur="touched[index] = true"
        :min="0"
        :max="99"
      />
    </div>
  </div>
</template>
