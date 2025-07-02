<template>
  <div class="" @keydown.escape="isOpen = false">
    <button
      @click="isOpen = !isOpen"
      class="focus:outline-none p-1"
      aria-haspopup="true"
      :aria-expanded="isOpen"
    >
      <img
        :src="user.avatarUrl"
        alt="Your avatar"
        class="w-8 h-8 rounded-full"
      />
    </button>

    <transition name="fade">
      <ul
        v-if="isOpen"
        class="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden"
        role="menu"
      >
        <li
          @click="goTo(profilePath)" class="flex items-center px-4 py-2 hover:bg-gray-300 cursor-pointer text-black"
        >
          <NuxtIcon name="hero-outline:user" class="w-5 h-5 mr-3 text-black-600" />
          Profile
        </li>
        <li
          @click="goTo('settings')"
          class="flex items-center px-4 py-2 hover:bg-gray-300 cursor-pointer text-black"
        >
          <NuxtIcon name="hero-outline:cog-6-tooth" class="w-5 h-5 mr-3 text-black-600" />
          Settings
        </li>
        <li
          @click="logout"
          class="flex items-center px-4 py-2 hover:bg-gray-300 cursor-pointer text-red-600"
        >
          <NuxtIcon name="hero-outline:logout" class="w-5 h-5 mr-3" />
          Logout
        </li>
      </ul>
    </transition>
  </div>
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