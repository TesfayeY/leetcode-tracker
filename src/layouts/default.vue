<template>
    <header>
        <div>
          <Logo />
          <Navbar/>
        </div>
    </header>
    <div>
      <ClientOnly>
        <NuxtPage />
      </ClientOnly>
     </div>
  </template>
  
<script setup>
  import { ref, onMounted, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import Navbar from '../components/navbar.vue';
  import UserMenu from '../components/UserMenu.vue';
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
