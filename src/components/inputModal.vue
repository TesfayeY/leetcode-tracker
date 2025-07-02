<template>
    <div class="fixed top-0 bottom-0 left-0 right-0 flex justify-center items-center bg-[#000000da]">
      <div class="modal rounded-lg bg-[#363636] to-10% p-5 h-fit w-[500px] text-left">
        <div class="text-left text-lg">{{ modalTitle }}</div>
        <UFormGroup class="mt-5">
          <UInput v-model="inputField" type="text"/>
        </UFormGroup>
        <p v-if="errorCode === '404'" class="font-bold mt-2" style="color: red;">Username does not exist</p>
        <p v-if="errorCode === '500'" class="font-bold mt-2" style="color: red;">Server error</p>
        <div class="mt-5 flex flex-end gap-4">
          <UButton v-bind:disabled="inputField === ''" class="p-2 px-3 text-md" type="submit" @click="sendFormToParent">Submit</UButton>
          <UButton class="p-2 px-3 text-md" @click="closeModal">Close</UButton>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted, watch } from 'vue';

const props = defineProps(['title', 'errorCode']);

const inputField = ref('');
const modalTitle = ref('');
const errorCode = ref('');
const emit = defineEmits(['submit-form', 'close-modal']);

onMounted(() => {
  modalTitle.value = props.title;
  errorCode.value = props.errorCode;
})

// These function will emit the control and value back to the parent 
const sendFormToParent = () => {
  emit('submit-form', inputField.value);
}

const closeModal = () => {
  emit('close-modal')
}

watch(() => props.errorCode, (updateValue: boolean) => {
  errorCode.value = updateValue
});

</script>

<style scoped>
</style>