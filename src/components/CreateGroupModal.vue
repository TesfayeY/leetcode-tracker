<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits(['close'])

const router = useRouter()
const groupName = ref('')
const error = ref('')
const isSubmitting = ref(false)

async function createGroup() {
  error.value = ''
  if (!groupName.value.trim()) {
    error.value = 'Group name is required.'
    return
  }
  isSubmitting.value = true

  try {
    // Nuxt's $fetch wrapper around ofetch, which provides convenient defaults for API calls within Nuxt app
    const newGroup = await $fetch('/api/groups', { 
      method: 'POST',
      body: { groupName: groupName.value }, 
    });

    const newId = newGroup.uniqueGroupId; // Use the uniqueGroupId from the database

    router.push(`/groups/${newId}`); //use actual ID from the DB
    emit('close');
  } catch (e: any) {
    console.error('Frontend error:', e);
    error.value = e.statusMessage || 'Could not create group. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

function close() {
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="w-full max-w-md p-6 rounded-2xl shadow-lg" style="background-color: #556E53;">
      <h2 class="text-2xl font-semibold mb-4">Create New Group</h2>

      <div class="mb-4">
        <label for="groupName" class="block text-sm font-medium mb-1">
          Group Name <span class="text-red-500">*</span>
        </label>
        <input
          id="groupName"
          type="text"
          v-model="groupName"
          :class="[
            'w-full px-3 py-2 border rounded-md focus:outline-none',
            error ? 'border-red-500' : 'border-gray-300'
          ]"
          placeholder="Enter a unique group name"
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
          @click="createGroup"
          :disabled="!groupName.trim() || isSubmitting"
          class="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
        >
          {{ isSubmitting ? 'Creating…' : 'Create Group' }}
        </button>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* Styles for your new VueButton component */
.vue-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;

  background-color: #4CAF50; /* Green */
  color: white; /* White text */
}

.vue-button:hover {
  background-color: #45a049; /* Darker green on hover */
}

.vue-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Your existing styles */
nav ul {
  list-style-type: none;
  padding: 0px;
  display: flex;
  align-items: center;
}

nav li {
  display: flex;
  margin-right: 10px;
  margin-left: 10px;
  align-items: center;
  flex: 1px;
}

.theme-button {
    margin: 0px;
    padding: 0px;
  }
</style>