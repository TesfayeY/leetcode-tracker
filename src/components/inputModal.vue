<template>
    <div class="fixed top-0 bottom-0 left-0 right-0 flex justify-center items-center bg-[#000000da]">
      <div class="modal rounded-lg bg-[#363636] to-10% p-5 h-fit w-[500px] text-left">
        <div class="text-left text-2xl">{{ modalTitle }}</div>
        <p v-if="description !== ''" class="text-left text-sm italic ml-5 mr-5 mt-2">{{ description }}</p>
        <UFormGroup class="mt-5">
          <UInput v-model="inputField" type="text" :placeholder="placeholder"></UInput>
        </UFormGroup>
        <p v-if="errorInfo !== null" class="font-bold mt-2" style="color: red;">{{ errorInfo.statusMessage }}</p>
        <div class="mt-5 flex flex-end gap-4">
          <UButton v-bind:disabled="inputField === ''" class="p-2 px-3 text-md" type="submit" @click="sendFormToParent">Submit</UButton>
          <UButton class="p-2 px-3 text-md" @click="closeModal">Close</UButton>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps, watch } from 'vue';

const props = defineProps(['title', 'description', 'placeholder', 'errorInfo']);
const inputField = ref('');
const modalTitle = ref(props.title);
const errorInfo = ref(props.errorInfo);
const description = ref(props.description);
const placeholder = ref(props.placeholder);
const emit = defineEmits(['submit-form', 'close-modal']);

// These function will emit the control and value back to the parent 
const sendFormToParent = () => {
  emit('submit-form', inputField.value);
}

const closeModal = () => {
  emit('close-modal')
}

watch(() => props.errorInfo, (updateValue: any) => {
  errorInfo.value = updateValue
});

</script>

<style scoped>
</style>