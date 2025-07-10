<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">{{ modalTitle }}</h3>
      </template>
      <p v-if="description !== null" class="text-left text-sm italic">{{ description }}</p>
      <UFormGroup class="mt-5">
        <UInput v-model="inputField" type="text" :placeholder="placeholder"></UInput>
      </UFormGroup>
      <p v-if="errorInfo !== null" class="font-bold mt-5" style="color: red;">{{ errorInfo.statusMessage }}</p>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <UButton @click="closeModal" variant="ghost">Cancel</UButton>
          <UButton color="green" @click="sendFormToParent">Submit</UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
import { ref, defineProps, watch } from 'vue';

const props = defineProps(['isOpen', 'title', 'description', 'placeholder', 'errorInfo']);
const inputField = ref('');
const isOpen = ref(props.isOpen);
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
  isOpen.value = false;
  emit('close-modal');
}

// Reason why we don't do watcher on list because it will trigger on OR condition and updated every other values, not individually
watch(() => props.title, (updateValue: string) => {
  modalTitle.value = updateValue;
});

watch(() => props.isOpen, (updateValue: boolean) => {
  isOpen.value = updateValue;
});

watch(() => props.errorInfo, (updateValue: any) => {
  errorInfo.value = updateValue;

});

</script>