<template>
  <div v-if="isLoading" class="flex place-content-center text-3xl">
    <p :class="style">Loading data ...</p>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch } from 'vue';

const props = defineProps(['isLoading', 'style']);
const isLoading = ref(props.isLoading);
const style = ref(props.style);

watch(() => props.isLoading, async (updateValue: boolean) => {
  isLoading.value = updateValue;
})

</script>