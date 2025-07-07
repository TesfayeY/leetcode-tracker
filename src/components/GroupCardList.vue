<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

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

<template>
  <div class="w-full max-w-4xl">
    <h2 class="text-2xl font-semibold mb-6 text-center">Your Groups</h2>
    <div v-if="groups.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="group in groups"
        :key="group.id"
        @click="goToGroupDetails(group.id)"
        class="bg-white rounded-lg shadow-md p-6 cursor-pointer
               hover:shadow-lg transition transform hover:-translate-y-1"
      >
        <h3 class="text-xl text-black font-bold mb-2">{{ group.groupName }}</h3> <p class="text-gray-600 mb-2">Users: {{ group.numberOfUsers }}</p> </div>
    </div>
    <div v-else class="text-center text-gray-500">
      Create or join one to get started!
    </div>
  </div>
</template>
