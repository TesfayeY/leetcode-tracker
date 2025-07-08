<template>
  <header>
    <div class="flex flex-row justify-between items-center">
      <Logo />
      <Navbar/>
    </div>
    <UDivider :avatar="{ src: '/img/logo-sq.png' }" />
  </header>
  <div>
    <ClientOnly>
      <NuxtPage />
    </ClientOnly>
    </div>
</template>
  
<script setup>
  import Navbar from '../components/navbar.vue';
</script>

<style>

header { 
  padding: 15px;
}

ul {
  padding: 20px;
}

li {
  padding: 1px;
}

button {
  align-self: center;
}
</style>
