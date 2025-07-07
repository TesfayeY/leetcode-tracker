<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue';
import JoinGroupModal from '~/components/JoinGroupModal.vue';
import CreateGroupModal from '~/components/CreateGroupModal.vue';
import GroupCardList from '~/components/GroupCardList.vue'; 

definePageMeta({
  layout: 'default',
  middleware: 'require-auth'
});

const displayName = useCookie('name').value;
const userName = ref<string | null>(displayName);

const router = useRouter()

// reactive variables to control modal visibility
const showCreateGroupModal = ref(false);
const showJoinGroupModal = ref(false);

// ref to GroupcardList component to call methods
const groupCardListRef = ref<InstanceType<typeof GroupCardList> | null>(null); 

function openCreateGroupModal() {
  showCreateGroupModal.value = true;
}

function closeCreateGroupModal() {
  showCreateGroupModal.value = false;
  //create a group, and refresh groupCardList
  if (groupCardListRef.value) {
    groupCardListRef.value.fetchGroups();
  }
}

function openJoinGroupModal() {
  showJoinGroupModal.value = true;
}

function closeJoinGroupModal() {
  showJoinGroupModal.value = false;
  // After joining group, refresh GroupCardList 
  if (groupCardListRef.value) {
    groupCardListRef.value.fetchGroups();
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4"> <div class="text-center mb-8">
      <h1 class="text-3xl font-semibold mb-8">Welcome, {{ userName }}!</h1>

      <hr class="w-full max-w-4xl border-gray-300 my-8" />
      <GroupCardList ref="groupCardListRef" /> 
      <hr class="w-full max-w-4xl border-gray-300 my-8" />

      <button
        @click="openCreateGroupModal"
        class="w-48 py-3 mb-4 mx-2 rounded-lg shadow-md
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