<template>
  <div v-if="!hasLeetcodeProfile" class="flex flex-col place-content-evenly h-[60vh]">
    <p class="text-center text-3xl">There is no profile to display</p>
    <UButton class="p-5 text-lg" @click="isInputModalOpen = true">Add Leetcode Profile</UButton>
    <InputModal 
      v-show="isInputModalOpen" 
      @close-modal="isInputModalOpen = false" 
      @submit-form="handleInputFormModal"
    ></InputModal>
  </div>
  <div v-else class="flex flex-col place-content-evenly h-[60vh]">
    <p class="text-center text-3xl">Leetcode Profile: {{ lcUsername }}</p>
  </div>
  
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import { useErrorLogger } from '../../composables/useErrorLogger';
import InputModal from '../../components/inputModal.vue';

const { reportError } = useErrorLogger();
const route = useRoute();
const username = ref(route.params.username);
const token = useCookie('token') ;
const hasLeetcodeProfile = ref(false);
const isInputModalOpen = ref(false);
const lcUsername = ref('');

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
  reportError(error,{ section : `users/${username.value}`})
}

//Handle value from input modal
function handleInputFormModal(modalValue: string) {
  if (modalValue !== "") {
    lcUsername.value = modalValue;
    hasLeetcodeProfile.value = true;
    isInputModalOpen.value = false;
  }
}
</script>