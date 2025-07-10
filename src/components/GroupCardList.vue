<template>
  <div class="w-full max-w-4xl">
    <h2 class="text-2xl font-semibold mb-12 text-center">Your Groups</h2>

    <div v-if="groups.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="group in groups"
        :key="group.uniqueGroupId"
        @click="goToGroupDetails(group.uniqueGroupId)"
        class="cursor-pointer hover:shadow-lg transition transform hover:-translate-y-1"
        :ui="{
          body:      { padding: 'px-4 sm:p-6' },
          header:    { padding: 'px-4 sm:p-6' },
          footer:    { padding: 'px-4 sm:p-6' },
          ring:      'ring-1 ring-gray-200 dark:ring-gray-800',
          divide:    'divide-y divide-gray-200 dark:divide-gray-800',
          background:'bg-white dark:bg-gray-900',
          shadow:    'shadow',
          rounded:   'rounded-lg'
        }"
      >
        <template #header>
          <div class="flex justify-between items-center gap-4">
            <h3 class="text-xl font-bold truncate text-gray-900 dark:text-white">
              {{ group.groupName }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              Users: {{ group.numberOfUsers }}
            </p>
          </div>
        </template>

        <UAvatarGroup size="md" :max="3">
          <UAvatar
            v-for="user in group.users"
            :key="user.id"
            :src="user.userAvatar || '/img/avatar.png'"
            :alt="user.id.toString()"
          />
        </UAvatarGroup>
      </UCard>
    </div>

    <div v-else class="text-center text-gray-500 dark:text-gray-400">
      Create or join one to get started!
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface AvatarUser {
  id: number
  userAvatar?: string
}

interface Group {
  uniqueGroupId: string
  groupName:      string
  numberOfUsers:  number
  users:          AvatarUser[]
}

const groups = ref<Group[]>([])
const router = useRouter()

async function fetchGroups() {
  try {
    const response = await fetch('/api/groups')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    groups.value = await response.json()
  } catch (err) {
    console.error('Error fetching groups:', err)
  }
}

function goToGroupDetails(uniqueGroupId: string) {
  router.push(`/groups/${uniqueGroupId}`)
}

onMounted(fetchGroups)
defineExpose({ fetchGroups })
</script>

<style scoped>
</style>