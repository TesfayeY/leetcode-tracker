<template>
  <div class="flex flex-row justify-start gap-5 h-[5vh] items-center">
    <UButton class="p-2 px-3 text-md h-full" to="/welcome">Return</UButton>
    <UButton class="p-2 px-3 text-md h-full" @click="isMessageModalOpen = true">Send Message</UButton>
  </div>
  <UCard class="mt-5">
    <template #header>
      <div class="flex flex-row justify-start items-center gap-5">
        <p class="text-left text-3xl">Inbox</p>
        <UInput v-model="searchQuery" placeholder="Filter message..." />
      </div>
    </template>
    <div class="h-[400px]">
      <UTable :rows="filteredRows" :columns="columns" :empty-state="{ icon: 'i-heroicons-inbox', label: 'No inbox' }">
        <template #actions-data="{ row }">
          <UDropdown :items="actionItems(row)">
            <UButton color="gray" icon="i-heroicons-ellipsis-horizontal-20-solid"></UButton>
          </UDropdown>
        </template>
      </UTable>
    </div>
    <template #footer>
      <div class="flex felx-row justify-end">
        <UPagination v-model="page" :page-count="pageCount" :total="toRaw(inboxes.value).length"></UPagination>
      </div>
    </template>
  </UCard>

  <!-- Modal to Send Message to User -->
  <UModal v-model="isMessageModalOpen">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Send Message</h3>
      </template>
      <UFormGroup required>
        <div class="flex flex-row gap-4">
          <p class="text-lg">To: </p>
          <UInput v-model="userInputField" type="text" required class="mb-2 w-full"></UInput>
        </div>
        <UDivider size="sm"  class="mt-2 w-full"></UDivider>
        <UTextarea v-model="messageInputField" size="xl" variant="outline" placeholder="Message..." required class="mt-2"></UTextarea>
      </UFormGroup>
      <p v-if="errorInfo !== null" class="font-bold mt-5" style="color: red;">{{ errorInfo.statusMessage }}</p>
      <template #footer>
        <div class="flex justify-end space-x-2">
          <UButton @click="closeModal" variant="ghost">Cancel</UButton>
          <UButton v-bind:disabled="messageInputField.length === 0 && userInputField.length === 9" color="green" @click="handleSendMessage">Send</UButton>
        </div>
      </template>
    </UCard>
  </UModal>

  <!-- Confirmation Modal-->
  <UModal v-model="isReadMessageModalOpen">
    <ConfirmationModal
      :title="'Mark Message as Read'"
      :description="'Are you sure to mark this message?'"
      :happyPathButtonName="'Mark'"
      @close-modal="closeModal"
      @submit="handleReadInbox"
    >
    </ConfirmationModal>
  </UModal>
  <UModal v-model="isArchivedMessageModalOpen">
    <ConfirmationModal
      :title="'Archive Message'"
      :description="'Are you sure to archive this message?'"
      :happyPathButtonName="'Archive'"
      @close-modal="closeModal"
      @submit="handleArchiveInbox"
    >
    </ConfirmationModal>
  </UModal>
  <UModal v-model="isDeleteMessageModalOpen">
    <ConfirmationModal
      :title="'Delete Message'"
      :description="'Are you sure to delete this message?'"
      :happyPathButtonName="'Delete'"
      @close-modal="closeModal"
      @submit="handleDeleteInbox"
    >
    </ConfirmationModal>
  </UModal>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { NUM_INBOX_DEFAULT_DISPLAY } from '~/constants/appConst';
import { useErrorLogger } from '~/composables/useErrorLogger';
import ConfirmationModal from '~/components/confirmationModal.vue';

const { reportError }= useErrorLogger();
const token = useCookie('token');
const page = ref(1);
const pageCount = NUM_INBOX_DEFAULT_DISPLAY; 

const userInputField = ref('');
const messageInputField = ref('');
const errorInfo = ref({});
const currentMessage = ref(null);
const isMessageModalOpen = ref(false);
const isDeleteMessageModalOpen = ref(false);
const isArchivedMessageModalOpen = ref(false);
const isReadMessageModalOpen = ref(false);

const inboxes = reactive([
  {
    id: undefined,
    senderId: undefined,
    recipientId: undefined,
    context: '',
    isInvitation: true,
    acknowledgement: ''
  }
]);

const columns = ref([
  {
    key: 'sender.name',
    label: 'From',
    class: 'w-[10vw]',
  },
  {
    key: 'context',
    label: 'Message',
    class: 'w-[80vw]'
  },
  {
    key: 'acknowledgement',
    label: 'Status',
    class: 'w-[10vw]'
  },
  { 
    key: 'actions',
    label: '',
    class: ''
  }
]);

const searchQuery = ref('')
const filteredRows = computed(() => {
  if (!searchQuery.value) {
    return toRaw(inboxes.value).slice((page.value - 1) * pageCount, (page.value) * pageCount);
  }

  const filter = toRaw(inboxes.value).filter((inbox) => {
    return Object.values(inbox).some((value) => {
      return String(value).toLowerCase().includes(searchQuery.value.toLowerCase());
    });
  });

  return filter.slice((page.value - 1) * pageCount, (page.value) * pageCount);
});

const actionItems = (row: any) => [
  [{
    label: 'Accept',
    icon: 'i-heroicons-check-20-solid',
    click: () => handleAcceptInvitation(row),
    disabled: !row.isInvitation
  },
  {
    label: 'Mark as Read',
    icon: 'i-heroicons-eye-20-solid',
    click: () => {
      isReadMessageModalOpen.value = true;
      currentMessage.value = row;
    },
    disabled: row.acknowledgement === 'VIEWED'
  },  
  {
    label: 'Archive',
    icon: 'i-heroicons-archive-box-20-solid',
    click: () => {
      isArchivedMessageModalOpen .value = true;
      currentMessage.value = row;
    },
    disabled: row.acknowledgement === 'ARCHIVED'
  }, 
  {
    label: 'Delete',
    icon: 'i-heroicons-trash-solid',
    click: () => {
      isDeleteMessageModalOpen.value = true;
      currentMessage.value = row;
    }
  }]
];

const closeModal = () => {
  userInputField.value = '';
  messageInputField.value = '';
  currentMessage.value = null;
  errorInfo.value = null;
  isMessageModalOpen.value = false;
  isDeleteMessageModalOpen.value = false;
  isArchivedMessageModalOpen.value = false;
  isReadMessageModalOpen.value = false;
}

onBeforeMount(async () => {
  await fetchUserInbox();
});

const handleAcceptInvitation = (inbox: any) => {
  console.log(inbox);
}

const handleReadInbox = async () => {
  const requestBody = {
    acknowledgement: 'VIEWED'
  };

  if (currentMessage.value !== null) {
    await fetchUserMessage('PUT', toRaw(currentMessage.value), requestBody);
    currentMessage.value = null;
    closeModal();
  }
}

const handleArchiveInbox = async () => {
  const requestBody = {
    acknowledgement: 'ARCHIVED'
  };

  if (currentMessage.value !== null) {
    await fetchUserMessage('PUT', toRaw(currentMessage.value), requestBody);
    currentMessage.value = null;
    closeModal();
  }
}

const handleDeleteInbox = async () => {
  if (currentMessage.value !== null) {
    await fetchUserMessage('DELETE', toRaw(currentMessage.value));
    currentMessage.value = null;
    closeModal();
  }
}

const handleSendMessage = async () => {
  try {
    if (messageInputField.value.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'Message must not be empty' })
    }
    
    await fetchUserMessage('POST', null, {
      recipientUsername: userInputField.value,
      messageContent: messageInputField.value,
      isInvitation: false
    });
    
  } catch(error: any) {
    errorInfo.value = error;
  }
}

async function fetchUserInbox() {
  try {
    const response = await $fetch(`api/inbox`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response === null) {
      throw createError({ statusCode: 400, message: 'Bad request' });
    }

    inboxes.value = response.data;
    // console.log(toRaw(inboxes.value));
  }
  catch (error: any) {
    errorInfo.value = error;
    reportError(error, { section : `inbox`});
  }
}

async function fetchUserMessage(method: 'POST' | 'GET' | 'PUT' | 'DELETE', inbox: any, body: any = {}) {
  const inboxId = inbox !== null ? inbox.id : 0;

  try {
    const response = await $fetch(`api/inbox/message?inboxId=${inboxId}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: body
    });

    if (response === null) {
      throw createError({ statusCode: 400, message: 'Bad request' });
    }

    inboxes.value = response.data;
    closeModal();
  }
  catch (error: any) {
    errorInfo.value = error;
    reportError(error, { section : `inbox`});
  }
}
</script>