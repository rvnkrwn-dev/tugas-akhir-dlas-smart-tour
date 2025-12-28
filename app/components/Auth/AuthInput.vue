<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-bold text-[#333] mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <div v-if="icon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <component :is="icon" class="h-5 w-5 text-[#666]" />
      </div>

      <input :id="id" :name="name || id" :type="type" :value="modelValue" :placeholder="placeholder"
        :required="required" :disabled="disabled" :autocomplete="autocomplete"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" :class="[
          'block w-full rounded-full border transition-all duration-200',
          icon ? 'pl-10 pr-4' : showPasswordToggle && type === 'password' ? 'pl-4 pr-10' : 'px-4',
          'py-3',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-gray-200 focus:border-[#4CAF50] focus:ring-2 focus:ring-[#4CAF50]/20',
          disabled
            ? 'bg-gray-50 cursor-not-allowed opacity-60'
            : 'bg-transparent',
          'text-[#333]',
          'placeholder:text-[#999]',
          'focus:outline-none'
        ]" />

      <div v-if="showPasswordToggle && type === 'password'" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <button type="button" @click="togglePasswordVisibility"
          class="text-[#666] hover:text-[#4CAF50] focus:outline-none transition-colors">
          <svg v-if="!passwordVisible" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </button>
      </div>
    </div>

    <p v-if="error" class="mt-2 text-sm text-red-600">
      {{ error }}
    </p>

    <p v-else-if="hint" class="mt-2 text-xs text-[#999]">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  id?: string
  name?: string
  type?: string
  modelValue?: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  icon?: any
  autocomplete?: string
  showPasswordToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
  showPasswordToggle: false,
  autocomplete: 'off'
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const passwordVisible = ref(false)

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
  // Toggle input type
  const input = document.getElementById(props.id || '') as HTMLInputElement
  if (input) {
    input.type = passwordVisible.value ? 'text' : 'password'
  }
}
</script>
