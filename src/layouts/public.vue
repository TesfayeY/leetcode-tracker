<template>
  <div class="relative w-full max-w-6xl px-6 pt-6 mx-auto lg:px-16">
    <header class="relative w-full mx-auto space-y-4 md:flex md:items-center md:space-y-0 md:gap-x-4">
      <div class="flex items-center rounded-full border-dotted border-2 border-gray-500 justify-between py-2 px-6 md:flex-1">
      <Logo />
            <nav class="hidden md:flex md:space-x-4 lg:space-x-6">
                <nuxt-link to="/register">Register</nuxt-link>
                <nuxt-link to="/login">Login</nuxt-link>
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
    <div>
      <ClientOnly>
        <NuxtPage />
      </ClientOnly>
     </div>


  </template>

  <script setup lang="ts">
  import { ref, computed } from 'vue';

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



<style>
nav {
  display: flex;
  justify-content: center;
  align-content: center;
}

nav a {
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 5px;
}

nav a:hover {
  background-color: #45a049;
}

header {
  padding: 15px;
}

.theme-button {
  background-color: transparent !important; 
  border: none; 
  margin: 0px;
  padding: 0px;
}

button {
  align-self: center;
}
</style>