<template>
  <UCard>
    <template #header>
      
    </template>
    <div class="h-[500px]">
      <p class="text-center text-3xl">Leetcode Profile: {{ lcUsername }}</p>
    </div>
    
    <template #footer>
      
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';

const props = defineProps(['lcUsername']);

const lcUsername = ref(props.lcUsername);
</script>