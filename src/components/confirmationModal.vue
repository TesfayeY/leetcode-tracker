<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold">{{ modalTitle }}</h3>
    </template>
    <p>{{ description }}</p>
    <template #footer>
      <div class="flex justify-end space-x-2">
        <UButton @click="closeModal" variant="ghost">Cancel</UButton>
        <UButton color="red" @click="submitToParent">{{ happyPathButtonName }}</UButton>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';

const props = defineProps(['title', 'description', 'happyPathButtonName'])
const modalTitle = ref(props.title);
const description = ref(props.description);
const happyPathButtonName = ref(props.happyPathButtonName);
const emit = defineEmits(['submit', 'close-modal']);

const submitToParent = () => {
  emit('submit');
}

const closeModal = () => {
  emit('close-modal');
}

watch(() => props.title, (updateValue: string) => {
  modalTitle.value = updateValue;
});

</script>