<template>
  <UModal v-model="isOpen">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
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
          v-model="inviteEmail"
          placeholder="Enter Email"
          @keyup.enter="addUserToInviteList"
        />
        <UTable
          :rows="usersToInvite"
          :columns="[{ key: 'name', label: 'Username' }, { key: 'actions', label: '' }]"
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
        <div v-if="inviteError" class="text-red-600 font-semibold">{{ inviteError }}</div>
      </div>
      <template #footer>
        <div class="flex justify-end p-4">
          <UButton @click="sendBulkInvites">Send Invites</UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
  uniqueGroupId: string
}>()

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const inviteEmail = ref('')
const usersToInvite = ref<{ email: string, name?: string }[]>([])
const inviteError = ref('')

async function addUserToInviteList() {
  const email = inviteEmail.value.trim()
  if (email && !usersToInvite.value.find(u => u.email === email)) {
    let name = ''
    try {
      // Call your user search endpoint to get the username
      const user = await $fetch(`/api/user/search?email=${encodeURIComponent(email)}`)
      name = user?.name || ''
    } catch (e) {
      name = ''
    }
    usersToInvite.value.push({ email, name })
  }
  inviteEmail.value = ''
}

function removeUserFromInviteList(row: { email: string }) {
  usersToInvite.value = usersToInvite.value.filter(u => u.email !== row.email)
}

async function sendBulkInvites() {
  inviteError.value = ''
  if (usersToInvite.value.length === 0) {
    inviteError.value = 'Please add at least one user to invite.'
    return
  }
  try {
    await $fetch(`/api/groups/${props.uniqueGroupId}/invite`, {
      method: 'POST',
      body: { users: usersToInvite.value.map(u => u.email) },
    })
  }
  catch (error) {
    console.error('Failed to send invites:', error)
  }
  finally {
    isOpen.value = false
    usersToInvite.value = []
  }
}
</script>