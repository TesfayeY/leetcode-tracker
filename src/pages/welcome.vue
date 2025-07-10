<template>
  <div class="flex flex-col items-center px-4"> 
    <div class="text-center mb-8">
      <h1 class="text-3xl font-semibold mb-8">Welcome, {{ userName }}!</h1>

      <hr class="w-full max-w-4xl border-gray-300 my-8" />
      <GroupCardList ref="groupCardListRef" /> 
      <hr class="w-full max-w-4xl border-gray-300 my-8" />
      <div class="flex flex-row place-content-center gap-4">
        <UButton
          @click="openCreateGroupModal"
          class="rounded-lg shadow-md
                text-white text-center px-5"
        >
          Create Group
        </UButton>

        <UButton
          @click="openJoinGroupModal"
          class="rounded-lg shadow-md
                text-white border 
                text-center px-5"
        >
          Join Group
        </UButton>
      </div>
      
    </div>
    <InputModal
      :isOpen="showCreateGroupModal"
      :title="'Create new Group'"
      :description="'Group Name'"
      :errorInfo="errorInfo"
      @close-modal="closeModal"
      @submit-form="handleCreateGroupModal"
    >
    </InputModal>
    <InputModal
      :isOpen="showJoinGroupModal"
      :title="'Join a Group'"
      :description="'Group ID'"
      :errorInfo="errorInfo"
      @close-modal="closeModal"
      @submit-form="handleJoinGroupModal"
    >
    </InputModal>
    <!-- <CreateGroupModal v-if="showCreateGroupModal" @close="closeCreateGroupModal" /> -->
    <!-- <JoinGroupModal v-if="showJoinGroupModal" @close="closeJoinGroupModal" /> -->
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue';
// Import your modal components
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
const errorInfo = ref({});

// ref to GroupcardList component to call methods
const groupCardListRef = ref<InstanceType<typeof GroupCardList> | null>(null); 

function openCreateGroupModal() {
  showCreateGroupModal.value = true;
}

function openJoinGroupModal() {
  showJoinGroupModal.value = true;
}

const closeModal = () => {
  errorInfo.value = null;
  showCreateGroupModal.value = false;
  showJoinGroupModal.value = false;
}

const handleCreateGroupModal = async (modalValue: string) => {
  try {
    const newGroup = await $fetch('/api/groups', { 
      method: 'POST',
      body: { groupName: modalValue }, 
    });

    showCreateGroupModal.value = false;
    closeModal();

    const newId = newGroup.uniqueGroupId; // Use the uniqueGroupId from the database
    router.push(`/groups/${newId}`); //use actual ID from the DB

  } catch (error: any) {
    errorInfo.value = error;
  }
}

const handleJoinGroupModal = async (modalValue: string) => {
  try {
    const response = await $fetch(`/api/groups/${modalValue.trim()}/join`, {
      method: 'POST',
    });

    showJoinGroupModal.value = false;

    if (response.group) {
      router.push(`/groups/${response.group.uniqueGroupId}`);
    } 
  } catch (error: any) {
    errorInfo.value = error;
  }
}
</script>

