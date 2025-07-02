<template>
  <div @keydown.escape="isOpen = false">
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
        class="absolute right-0 mt-2 w-[150px] bg-[#363636] shadow-lg rounded-md overflow-hidden"
        role="menu"
      >
        <UButton
          @click="goTo('welcome')"
          class="flex items-center w-full text-lg justify-center hover:bg-gray-300 cursor-pointer text-black"
        >
          Home
        </UButton>
        <UButton
          @click="goTo('users')"
          class="flex mt-2 items-center w-full text-lg justify-center hover:bg-gray-300 cursor-pointer text-black"
        >
          Profile
        </UButton>
        <UButton
          @click="goTo('settings')"
          class="flex mt-2 items-center w-full text-lg justify-center hover:bg-gray-300 cursor-pointer text-black"
        >
          Settings
        </UButton>
        <UButton
          @click="logout"
          class="flex mt-2 items-center w-full text-lg justify-center hover:bg-gray-300 cursor-pointer text-red-600"
        >
          Logout
        </UButton>
      </ul>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps(['username']);
const name = ref(props.username);

const isOpen = ref(false)
const router = useRouter()
const user = { avatarUrl: '/img/avatar.png' } 

watch(() => props.username, (updatedValue) => {
  name.value = updatedValue;
})

function goTo(page) {
  isOpen.value = false;
  page = page === 'users' ? `${page}/${name.value}` : page;
  router.push(`/${page}`);
}

const logout = async () => {
  isOpen.value = false; 
  const response = await $fetch('/api/auth/logout', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }).then((data) => {
    console.log('Logout successful (API response):', data);
    router.push('/login'); // Redirect after successful API call
    return data;
  }).catch((error) => {
    Sentry.captureException(error, {
      extra: {
        action: 'logout',
        endpoint: '/api/auth/logout',
        time: new Date().toISOString()
      }
    });
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