<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits(['close'])

const router = useRouter()
const groupId = ref('')
const error = ref('')
const isSubmitting = ref(false)

function close() {
  emit('close')
}

async function joinGroup() {
  error.value = ''
  if (!groupId.value.trim()) {
    error.value = 'Group ID is required.'
    return
  }

  isSubmitting.value = true
  try {
    // ← replace with your real API call to verify/join group:
    // const res = await $fetch(`/api/groups/${groupId.value}/join`, { method: 'POST' })
    // if (!res.success) throw new Error(res.message)
    await new Promise(r => setTimeout(r, 300)) // simulate latency

    router.push(`/groups/${groupId.value.trim()}`)
    emit('close')
  } catch (e: any) {
    console.error(e)
    error.value = e.statusMessage || 'Unable to join. Check the Group ID and try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="w-full max-w-md p-6 rounded-2xl shadow-lg" style="background-color: #748873;">
      <h2 class="text-2xl font-semibold mb-4">Join a Group</h2>

      <div class="mb-4">
        <label for="groupId" class="block text-sm font-medium mb-1">
          Group ID <span class="text-red-500">*</span>
        </label>
        <input
          id="groupId"
          type="text"
          v-model="groupId"
          :class="[
            'w-full px-3 py-2 border rounded-md focus:outline-none',
            error ? 'border-red-500' : 'border-gray-300'
          ]"
          placeholder="Enter Group ID"
        />
        <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
      </div>

      <div class="flex justify-end space-x-3">
        <button
          @click="close"
          class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
          :disabled="isSubmitting"
        >
          Cancel
        </button>
        <button
          @click="joinGroup"
          :disabled="!groupId.trim() || isSubmitting"
          class="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
        >
          {{ isSubmitting ? 'Joining…' : 'Join Group' }}
        </button>
      </div>
    </div>
  </div>
</template>