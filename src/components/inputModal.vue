<template>
  <div class="fixed top-0 bottom-0 left-0 right-0 flex justify-center items-center bg-[#000000da]">
    <div class="modal rounded-lg bg-[#363636] to-10% p-5 h-fit w-[500px] text-left">
      <h1 class="text-left text-lg ">Add Leetcode Username</h1>
      <UFormGroup class="mt-5">
        <UInput v-model="inputField" type="text"/>
      </UFormGroup>
      <div class="mt-5 flex flex-end gap-4">
        <UButton v-bind:disabled="inputField === ''" class="p-2 px-3 text-md" type="submit" @click="sendFormToParent">Submit</UButton>
        <UButton class="p-2 px-3 text-md" @click="closeModal">Close</UButton>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref } from 'vue';

const inputField = ref('');
const emit = defineEmits(['submit-form', 'close-modal']);

// These function will emit the control and value back to the parent 
function sendFormToParent() {
  emit('submit-form', inputField.value);
}

function closeModal() {
  emit('close-modal')
}

</script>

<style scoped>
</style>