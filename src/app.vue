<template>
  <div>
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
  /* Add small left and right margins application-wide */
  div#__nuxt {
    margin: 0 20px;
  }
</style>

<script lang="ts" setup>
  /* Ensure a consistent body app look */
  useHead({
    bodyAttrs: {
      class: 'min-h-screen bg-gradient-to-t from-green-300 to-50%',
    }
  });
</script>
