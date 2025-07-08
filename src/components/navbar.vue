<template>
  <nav class="flex flex-row justify-end mt-5 items-center">
    <div class="grid grid-cols-2">
      <ClientOnly>
        <UButton block
                :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
                variant="ghost"
                aria-label="Theme"
                @click="isDark = !isDark"
                class="theme-button"
              />
      </ClientOnly>
      <UserMenu :profilePath="`/users/${displayName}`" class="z-[100]"></UserMenu>
    </div>
  </nav>
  <UDivider :avatar="{ src: '/img/logo-sq.png' }" />
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useCookie } from '#app';
import { computed, onMounted, defineProps, ref, watch } from 'vue';
import * as Sentry from "@sentry/nuxt";
import UserMenu from './UserMenu.vue';

const router = useRouter();

const props = defineProps(['page'])
const currentPage = ref(props.page);
const displayName = ref('');

watch(() => props.page, (updatedValue) => {
  currentPage.value = updatedValue;
})

const navigate = (path) => {
  router.push(path);
};

// FIXME: Not sure if my commenting above broke this... Also need to review how to
//   get to this route as I think it might not be accessible / correct?
onMounted(async () => {
  const token = useCookie('token').value || "";
  //console.log('me: Token:', token); // Log to ensure token is retrieved

  return await $fetch('/api/auth/me', { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: token }) 
  }).then((data) => { 
    displayName.value = useCookie('name').value;
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
})

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