<template>
  <div class="grid grid-rows-20">
    <div class="flex flex-row justify-start gap-5 h-[5vh] row-span-1 items-center">
      <UButton class="p-2 px-3 text-md h-full" to="/welcome">Return</UButton>
      <UButton v-if="hasLeetcodeProfile" class="p-2 px-3 text-md h-full" @click="openModal('Change Leetcode Username')">Change Profile</UButton>
      <UButton v-if="hasLeetcodeProfile && !isProfileValidated" class="p-2 px-3 text-md h-full" @click="handleLinkProfile()">Link Leetcode Profile</UButton>
    </div>
    <div v-if="!hasLeetcodeProfile" class="row-span-19 flex flex-col place-content-evenly h-[60vh] mt-5">
      <p class="text-center text-3xl">There is no profile to display</p>
      <UButton class="p-3 text-lg" @click="openModal('Add Leetcode Username')">Add Leetcode Profile</UButton>
    </div>
    <div v-else class="flex flex-col place-content-evenly h-[60vh] mt-5">
      <UserCard :lcUsername="lcUsername" :username="username"></UserCard>
    </div>
  </div>
  <InputModal 
    v-if="isInputModalOpen" 
    :errorInfo="errorInfo"
    :title="modalTitle"
    @close-modal="closeModal" 
    @submit-form="handleInputFormModal"
  ></InputModal>
  <InputModal 
    v-if="isLinkModalOpen" 
    :errorInfo="errorInfo"
    :title="modalTitle"
    :description="'You can obtain the Leetcode Session by login to Leetcode and open Browser Inspection, navigate to Application tab, then click on the Cookies dropdown. Do not share this token!'"
    :placeholder="'Leetcode Session Token'"
    @close-modal="closeModal" 
    @submit-form="handleValidateProfile"
  ></InputModal>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import { useErrorLogger } from '../../composables/useErrorLogger';
import InputModal from '../../components/inputModal.vue';
import UserCard from '../../components/userCard.vue';

const { reportError } = useErrorLogger();
const route = useRoute();
const username = ref(route.params.username);
const errorInfo = ref({});
const token = useCookie('token') ;
const hasLeetcodeProfile = ref(false);
const isInputModalOpen = ref(false);
const isLinkModalOpen = ref(false);
const modalTitle = ref('');
const lcUsername = ref('');
const isProfileValidated = ref(false);

const openModal = (title: string) => {
  modalTitle.value = title;
  isInputModalOpen.value = true;
}

const closeModal = () => {
  errorInfo.value = null;;
  isInputModalOpen.value = false;
  isLinkModalOpen.value = false;
  modalTitle.value = '';
}

onMounted(async () => {
  // Fetch the account data to check for leetcode username
  try {
    const response = await $fetch(`/api/user/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (response.data) {
      hasLeetcodeProfile.value = response.data.lcUsername !== "";
      lcUsername.value = response.data.lcUsername;
    }

  } catch(error: any) {
    reportError(error,{ section : `users/${username.value}`});
  }
})

const handleLinkProfile = async () => {
  isLinkModalOpen.value = true;
  openModal('Link Leetcode Profile via Session');
}

const handleValidateProfile = async (modalValue: string) => {
  // Validate the profile by calling for global state data
  try {
    const response = await $fetch(`/api/user/profile/validate?lcUsername=${lcUsername.value}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: { sessionToken: modalValue }
    });

    isProfileValidated.value = true;
    closeModal();
  } catch (error: any) {
    reportError(error, { section : `users/${username.value}`});
    errorInfo.value = error;
  }
  
}

//Handle value from input modal
const handleInputFormModal = async (modalValue: string) => {
  if (modalValue !== "") {
    // Check and Apply to persistent layer
    try {
      const data = await $fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lcUsername: modalValue
        }),
      });

      lcUsername.value = modalValue;
      hasLeetcodeProfile.value = true;
      isProfileValidated.value = false;
      closeModal();

    } catch (error: any) {
      reportError(error, { section : `users/${username.value}`}); 
      errorInfo.value = error;
    }
  }
}
</script>