<template>
  <nav>
    <ul class="flex items-center rounded-full h-16 border-dotted border-2 border-gray-500 justify-between">
      <li><a class="rounded-full" href="/welcome" @click.prevent="navigate('/welcome')">Home</a></li>
      <li><a class="rounded-full" href="/settings" @click.prevent="navigate('/settings')">Settings</a></li>
      <li><a class="rounded-full" href="https://github.com/bioneos/training-project/tree/main" target="_blank">Repo</a></li>
      <li><a class="rounded-full" href="#" @click.prevent="logout">Logout</a></li>
      <li>
        <ClientOnly>
          <UButton block
                  :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
                  variant="ghost"
                  aria-label="Theme"
                  @click="isDark = !isDark"
                  class="theme-button"
                />
        </ClientOnly>
      </li>
    </ul>
  </nav>
  <UDivider :avatar="{ src: '/img/logo-sq.png' }" />
</template>

<script setup>
import { useRouter } from 'vue-router';
//import { useCookie } from '#app'; // Ensure you import useCookie
import { computed } from 'vue';
import * as Sentry from "@sentry/nuxt";

const router = useRouter();

const navigate = (path) => {
  router.push(path);
};

// FIXME: Not sure if my commenting above broke this... Also need to review how to
//   get to this route as I think it might not be accessible / correct?
const me = async () => {
  const token = useCookie('token').value || "";
  console.log('me: Token:', token); // Log to ensure token is retrieved

  return await $fetch('/api/auth/me', { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: token }) 
  }).then((data) => { 
    return data;
  }).catch((error) => {
  Sentry.captureException(error, {
    extra: {//give context to generic sentry failure such as seesion issues and token
      action: 'logout',
      endpoint: '/api/auth/logout',
      timestamp: new Date().toISOString(),
      tokenPresent: Boolean(useCookie('token').value),
    }
  });
  });
};
const logout = async () => {
  const response = await $fetch('/api/auth/logout', { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }).then((data) => {
    return data;
  }).catch((error) => {
  Sentry.captureException(error, {
    extra: {//provide more information on route and user
      action: 'logout',
      endpoint: '/api/auth/logout',
      time: new Date().toISOString()
    }
  });
});

  if (response && response.success) {
    console.log('Logout successful');
    router.push('/login'); // Navigate to login page after logout
  } else {
    console.log('Logout failed');
  }
};

const colorMode = useColorMode();
const isDark = computed({
  get() {
    return colorMode.value === 'dark';
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
  }
});

</script>

<style scoped>
nav ul {
  list-style-type: none;
  padding: 0px;
  display: flex; 
  align-items: center; 
}

nav li {
  display: flex; 
  margin-right: 10px;
  margin-left: 10px;
  align-items: center; 
  flex: 1px; 
}

.theme-button {
    margin: 0px; 
    padding: 0px; 
  }
</style>
