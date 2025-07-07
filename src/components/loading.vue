<template>
  <div v-if="isLoading" class="flex place-content-center text-3xl">
    <p>Loading data ...</p>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch } from 'vue';

const props = defineProps(['isLoading']);
const isLoading = ref(props.isLoading);

watch(() => props.isLoading, async (updateValue: boolean) => {
  isLoading.value = updateValue;
})

</script>