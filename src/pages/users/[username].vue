<template>
  <div class="flex flex-row justify-start gap-5">
    <UButton class="p-2 px-3 text-md" to="/welcome">Return</UButton>
    <UButton v-if="hasLeetcodeProfile" class="p-2 px-3 text-md" @click="openModal('Change Leetcode Username')">Change Profile</UButton>
  </div>
  <div v-if="!hasLeetcodeProfile" class="flex flex-col place-content-evenly h-[60vh] mt-5">
    <p class="text-center text-3xl">There is no profile to display</p>
    <UButton class="p-3 text-lg" @click="openModal('Add Leetcode Username')">Add Leetcode Profile</UButton>
  </div>
  <div v-else class="flex flex-col place-content-evenly h-[60vh] mt-5">
    <UserCard :lcUsername="lcUsername"></UserCard>
  </div>
  <InputModal 
    v-if="isInputModalOpen" 
    :title="modalTitle"
    @close-modal="closeModal" 
    @submit-form="handleInputFormModal"
  ></InputModal>
  
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref } from 'vue';
import { useErrorLogger } from '../../composables/useErrorLogger';
import InputModal from '../../components/inputModal.vue';
import UserCard from '../../components/userCard.vue';

const { reportError } = useErrorLogger();
const route = useRoute();
const username = ref(route.params.username);
const token = useCookie('token') ;
const hasLeetcodeProfile = ref(false);
const isInputModalOpen = ref(false);
const modalTitle = ref('');
const lcUsername = ref('');

const openModal = (title: string) => {
  modalTitle.value = title;
  isInputModalOpen.value = true;
}

const closeModal = () => {
  isInputModalOpen.value = false;
  modalTitle.value = '';
}

// Fetch the account data to check for leetcode username
try {
  const response = await $fetch(`/api/user/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })

  if (response.success) {
    hasLeetcodeProfile.value = response.data.lcUsername !== "";
    lcUsername.value = response.data.lcUsername;
  }

} catch(error: any) {
  reportError(error,{ section : `users/${username.value}`});
}

//Handle value from input modal
const handleInputFormModal = (modalValue: string) => {
  if (modalValue !== "") {
    lcUsername.value = modalValue;
    hasLeetcodeProfile.value = true;
  }
}
</script>