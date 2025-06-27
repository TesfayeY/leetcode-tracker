<template>
  <div class="relative w-full max-w-6xl px-6 pt-6 mx-auto lg:px-16">
    <header class="relative w-full mx-auto space-y-4 md:flex md:items-center md:space-y-0 md:gap-x-4">
      <div class="flex items-center rounded-full border-dotted border-2 border-gray-500 justify-between py-2 px-6 md:flex-1">
      <Logo />
        <nav class="hidden md:flex md:space-x-4 lg:space-x-6">
            <div class="flex items-center justify-end flex-shrink-0 space-x-2">
              <ClientOnly>
                <UButton block
                  :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
                  variant="ghost"
                  aria-label="Theme"
                  @click="isDark = !isDark"
                  class="theme-button"
                />
              </ClientOnly>
            </div>
        </nav>
      </div>
    </header>
    <UDivider :avatar="{ src: '/img/logo-sq.png' }" />
  </div>
  <div class="flex justify-center items-center mt-10">
    <div class="grid grid-flow-row justify-items-center">
      <ClientOnly>
        <h1 class="font-bold text-8xl">{{ error.statusCode }}</h1>
        <p class="text-4xl">{{ error.statusMessage.split(":")[0] || 'An unexpected error occurred.' }}</p>
        <button class="mt-5 w-auto" @click="handleError">Return</button>
      </ClientOnly>
    </div>
  </div>
  
</template>

<script setup lang="ts">
  import type { NuxtError } from '#app';
  import { ref, computed } from 'vue';
  import * as Sentry from "@sentry/nuxt";
  const props = defineProps({
    error: Object as () => NuxtError
  });

  const handleError = () => clearError(( { redirect: "/welcome" } ))

  const colorMode = useColorMode();
  const isDark = computed({
    get() {
      return colorMode.value === 'dark';
    },
    set() {
      colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
    }
  });
// onMounted hook ensures the Sentry event is sent only when the component is fully mounted in the DOM
 onMounted(() => {
   // Check if an error object is present in props
   if (props.error) {
     // Capture the NuxtError as a Sentry exception, logs the full error details to  dashboard
     Sentry.captureException(props.error, {
       // additional tags to the Sentry event for better filtering and analysis
       tags: {
         // Tag to easily identify events originating from the error page
         error_page_view: 'true',
         status_code: props.error.statusCode,
       },
       contexts: {
         error_details: {
           statusCode: props.error.statusCode,
           statusMessage: props.error.statusMessage,


         },
       },
     });
   }
 });

</script>

<style scoped>

button {
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}

button:hover {
  background-color: #45a049;
}

</style>