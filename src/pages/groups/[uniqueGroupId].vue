<template>
  <div class="p-4">
    
    <div class="mb-6">
      <UButton variant="ghost" @click="router.push('/welcome')" class="px-4">
        ← Back to Welcome
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center text-gray-500 dark:text-gray-400 py-10">
      <p>Loading group details...</p>
    </div>

    <!-- Page Content -->
    <div v-else>
      <!-- Group Header -->
      <div class="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
        <div class="mb-4">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ group?.groupName }}
          </h1>
          <!-- <p v-if="group?.description" class="text-gray-500 dark:text-gray-400 mt-1">
            {{ group.description }}
          </p> -->
        </div>
        <div class="w-fit flex flex-col space-y-2">
          <UButton @click="showInviteDialog = true" class="w-full justify-center">
            Invite
          </UButton>
          <UButton color="red" @click="showLeaveGroup = true" class="w-full justify-center">
            Leave Group
          </UButton>
        </div>
      </div>

      <!-- Leave Group Confirmation Modal -->
      <UModal v-model="showLeaveGroup">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Leave Group</h3>
          </template>
          <p>Are you sure you want to leave the group?</p>
          <template #footer>
            <div class="flex justify-end space-x-2">
              <UButton @click="showLeaveGroup = false" variant="ghost">Cancel</UButton>
              <UButton color="red" @click="confirmLeaveGroup">Leave</UButton>
            </div>
          </template>
        </UCard>
      </UModal>

      <!-- Invite Modal -->
      <UModal v-model="showInviteDialog">
        <UCard :ui="{ ring:'', divide:'divide-y divide-gray-100 dark:divide-gray-800' }">
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold">Invite Users</h3>
              <UButton icon="i-heroicons-plus" size="sm" @click="addUserToInviteList">
                Add
              </UButton>
            </div>
          </template>
          <div class="space-y-4 p-4">
            <UInput
              v-model="inviteUsername"
              placeholder="Enter username"
              @keyup.enter="addUserToInviteList"
            />
            <UTable
              :rows="usersToInvite"
              :columns="[{ key:'name', label:'Username' }, { key:'actions', label:'' }]"
            >
              <template #actions-data="{ row }">
                <UButton
                  color="red"
                  variant="ghost"
                  icon="i-heroicons-trash"
                  size="sm"
                  @click="removeUserFromInviteList(row)"
                />
              </template>
            </UTable>
          </div>
          <template #footer>
            <div class="flex justify-end p-4">
              <UButton @click="sendBulkInvites">Send Invites</UButton>
            </div>
          </template>
        </UCard>
      </UModal>

      <!-- User Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard
          v-for="user in group?.users || []"
          :key="user.id"
          variant="subtle"
          class="relative cursor-pointer hover:shadow-lg transition"
          @click="viewProfile(user)"
        >
          <!-- “You” badge for current user -->
          <span
            v-if="user.id === currentUserId"
            class="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
          >You</span>

          <template #header>
            <h4 class="text-xl font-medium">{{ user.name }}</h4>
          </template>
          <template #footer>
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-500">Member</span>
              <UButton size="sm" variant="ghost">View Profile</UButton>
            </div>
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface User {
  id:          number
  name:        string
  lc_username: string
}

interface Group {
  groupName:   string
  description: string
  users:       User[]
}

const route          = useRoute()
const router         = useRouter()
const uniqueGroupId  = route.params.uniqueGroupId as string

const loading          = ref(true)
const group            = ref<Group | null>(null)
const showInviteDialog = ref(false)
const showLeaveGroup   = ref(false)
const inviteUsername   = ref('')
const usersToInvite    = ref<{ name: string }[]>([])
const currentUserId    = ref<number | null>(null)

// Decode JWT from cookie to get current user's ID
if (process.client) {
  const match = document.cookie.match(/token=([^;]+)/)
  if (match) {
    try {
      const token = match[1]
      const payload = JSON.parse(atob(token.split('.')[1]))
      currentUserId.value = payload.userId
    } catch (e) {
      console.error('Failed to decode token payload:', e)
    }
  }
}

onMounted(async () => {
  try {
    group.value = await $fetch<Group>(`/api/groups/${uniqueGroupId}`)
  } catch (err) {
    console.error('Failed to load group:', err)
  } finally {
    loading.value = false
  }
})

function addUserToInviteList() {
  const name = inviteUsername.value.trim()
  if (name && !usersToInvite.value.find(u => u.name === name)) {
    usersToInvite.value.push({ name })
  }
  inviteUsername.value = ''
}

function removeUserFromInviteList(row: { name: string }) {
  usersToInvite.value = usersToInvite.value.filter(u => u.name !== row.name)
}

function sendBulkInvites() {
  console.log('Inviting:', usersToInvite.value, 'to', uniqueGroupId)
  // TODO: call invite API
  showInviteDialog.value = false
  usersToInvite.value    = []
}

async function confirmLeaveGroup() {
    try {
      await $fetch(`/api/groups/${uniqueGroupId}/leave`, { method: 'DELETE' })
      router.push('/welcome')
    } catch (e) {
      console.error('Leave failed', e)
    } finally {
      showLeaveGroup.value = false
    }
  }

function viewProfile(user: User) {
  router.push(`/users/${user.name}`)
}
</script>