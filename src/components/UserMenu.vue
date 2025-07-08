<template>
  <UDropdown :items="items" :ui="{ item: { disabled: 'cursor-text select-text', size: 'text-lg' } }" :popper="{ placement: 'bottom-start' }">
    <UAvatar :src="user.avatarUrl" size="md"></UAvatar>
    <template #item="{ item }">
      <span class="truncate">{{ item.label }}</span>
      <UIcon :name="item.icon" class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto"></UIcon>
    </template>
  </UDropdown>
</template>

<script setup>
import { ref, defineProps } from 'vue' // Add defineProps here
import { useRouter } from 'vue-router'

// Define the props that this component expects
const props = defineProps({
  profilePath: {
    type: String,
    required: true // This prop is now required
  }
})

const isOpen = ref(false)
const router = useRouter()
const user = { avatarUrl: '/img/avatar.png' } // Keep for now as you only want minimal change

const items = [
  [{
    label: 'Home',
    icon: 'i-heroicons-home-20-solid',
    click: () => goTo('/welcome')
  },
  {
    label: 'Profile',
    icon: 'i-heroicons-user-circle',
    click: () => goTo(props.profilePath)
  },
  {
    label: 'Inbox',
    icon: 'i-heroicons-envelope',
    click: () => goTo('/inbox')
  },
  {
    label: 'Settings',
    icon: 'i-heroicons-cog-8-tooth',
    click: () => goTo('/settings')
  }],
  [{
    label: 'Logout',
    icon: 'i-heroicons-arrow-right-start-on-rectangle-solid',
    click: () => logout()
  }]
]

// goTo now accepts the full path directly
function goTo(path) { // Changed 'page' to 'path' for clarity
  isOpen.value = false
  router.push(path) // Push the path directly
}

const logout = async () => {
  isOpen.value = false;
  const response = await $fetch('/api/auth/logout', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }).then((data) => {
    console.log('Logout successful (API response):', data);
    router.push('/login');
    return data;
  }).catch((error) => {
    
    console.error('Logout failed:', error);
    router.push('/login');
  });
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>