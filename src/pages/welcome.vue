<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue';
// Import your modal components
import JoinGroupModal from '~/components/JoinGroupModal.vue';
import CreateGroupModal from '~/components/CreateGroupModal.vue';

definePageMeta({
  layout: 'default',
  middleware: 'require-auth'
});

const displayName = useCookie('name').value;
const userName = ref<string | null>(displayName);

const router = useRouter()

// Reactive variables to control modal visibility
const showCreateGroupModal = ref(false);
const showJoinGroupModal = ref(false);

function openCreateGroupModal() {
  showCreateGroupModal.value = true;
}

function closeCreateGroupModal() {
  showCreateGroupModal.value = false;
}

function openJoinGroupModal() {
  showJoinGroupModal.value = true;
}

function closeJoinGroupModal() {
  showJoinGroupModal.value = false;
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="text-center">
      <h1 class="text-3xl font-semibold mb-8">Welcome, {{ userName }}!</h1>

      <button
        @click="openCreateGroupModal"
        class="w-48 py-3 mb-4 rounded-lg shadow-md
               bg-green-600 text-white font-medium
               hover:bg-blue-700 transition"
      >
        Create Group
      </button>

      <button
        @click="openJoinGroupModal"
        class="w-48 py-3 mb-4 rounded-lg shadow-md
               bg-green-600 text-white font-medium border 
               hover:bg-blue-700 transition"
      >
        Join Group
      </button>
    </div>

    <CreateGroupModal v-if="showCreateGroupModal" @close="closeCreateGroupModal" />
    <JoinGroupModal v-if="showJoinGroupModal" @close="closeJoinGroupModal" />
  </div>
</template>