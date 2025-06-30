<template>
  <div v-if="!hasLeetcodeProfile.value" class="flex flex-col place-content-evenly h-[60vh]">
    <p class="text-center text-3xl">There is no profile to display</p>
    <UButton class="p-5 text-lg">Add Leetcode Profile</UButton>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import { useErrorLogger } from '../../composables/useErrorLogger';

const { reportError } = useErrorLogger();
const route = useRoute();
const username = ref(route.params.username);
const token = useCookie('token') ;
const hasLeetcodeProfile = ref(false);

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
  }

} catch(error: any) {
  reportError(error,{ section : `users/${username.value}`})
}
</script>