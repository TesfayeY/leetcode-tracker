<template>
  <div class="w-full max-w-4xl">
    <h2 class="text-2xl font-semibold mb-12 text-center">Your Groups</h2>
    <div v-if="groups.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="group in groups"
        :key="group.id"
        @click="goToGroupDetails(group.id)"
        class="cursor-pointer hover:shadow-lg transition transform hover:-translate-y-1"
        :ui="{
          body: { padding: 'px-4 sm:p-6' }, // Adjust padding if default is too much or too little
          header: { padding: 'px-4 sm:p-6' },
          footer: { padding: 'px-4 sm:p-6' },
          ring: 'ring-1 ring-gray-200 dark:ring-gray-800',
          divide: 'divide-y divide-gray-200 dark:divide-gray-800',
          background: 'bg-white dark:bg-gray-900',
          shadow: 'shadow',
          rounded: 'rounded-lg'
        }"
      >
         <template #header>
          <div class="flex justify-between items-center gap-4"> <h3 class="text-xl text-black dark:text-white font-bold truncate"> {{ group.groupName }}
            </h3>
            <UAvatarGroup size="md" :max="4">
              <UAvatar
                v-for="user in group.users"
                :key="user.id"
                :src="user.userAvatar || '/img/avatar.png'"
                :alt="user.id.toString()"
              />
            </UAvatarGroup>
          </div>
        </template>

        <p class="text-gray-600 dark:text-gray-400 mb-2">Users: {{ group.numberOfUsers }}</p>

        </UCard>
    </div>
    <div v-else class="text-center text-gray-500 dark:text-gray-400">
      Create or join one to get started!
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// UCard, UAvatarGroup, UAvatar are auto-imported by Nuxt UI module
// No explicit imports typically needed for these components in Nuxt 3

const groups = ref([]);
const router = useRouter();

async function fetchGroups() {
  try {
    const response = await fetch('/api/groups');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    groups.value = data;
  } catch (error) {
    console.error('Error fetching groups:', error);
  }
}

function goToGroupDetails(groupId: number) {
  router.push(`/groups/${groupId}`);
}

onMounted(() => {
  fetchGroups();
});

defineExpose({
  fetchGroups
});
</script>

<style scoped>
/* No specific scoped styles needed as UCard and UAvatarGroup handle their own styling,
   and Tailwind classes are applied directly in the template. */
</style>