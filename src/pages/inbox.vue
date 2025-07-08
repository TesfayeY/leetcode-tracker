<template>
  <div class="flex flex-row justify-start gap-5 h-[5vh] items-center">
    <UButton class="p-2 px-3 text-md h-full" to="/welcome">Return</UButton>
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
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { NUM_INBOX_DEFAULT_DISPLAY } from '~/constants/appConst';
import { useErrorLogger } from '~/composables/useErrorLogger';

const { reportError }= useErrorLogger();
const token = useCookie('token');
const page = ref(1);
const pageCount = NUM_INBOX_DEFAULT_DISPLAY; 

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
    class: 'w-[10vw]'
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
    click: () => handleReadInbox(row),
    disabled: row.acknowledgement === 'VIEWED'
  },  
  {
    label: 'Archive',
    icon: 'i-heroicons-archive-box-20-solid',
    click: () => handleArchiveInbox(row),
    disabled: row.acknowledgement === 'ARCHIVED'
  }, 
  {
    label: 'Delete',
    icon: 'i-heroicons-trash-solid',
    click: () => handleADeleteInbox(row)
  }]
];

onBeforeMount(async () => {
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
    reportError(error, { section : `inbox`});
  }
});

const handleAcceptInvitation = (inbox: any) => {
  console.log(inbox);
}

const handleReadInbox = async (inbox: any) => {
  const requestBody = {
    acknowledgement: 'VIEWED'
  };
  
  await fetchUserInbox('POST', inbox, requestBody);
}

const handleArchiveInbox = (inbox: any) => {
  console.log(inbox);
}

const handleADeleteInbox = async (inbox: any) => {
  await fetchUserInbox('DELETE', inbox);
}

async function fetchUserInbox(method: 'POST' | 'GET' | 'PUT' | 'DELETE', inbox: any, body: any = {}) {
  try {
    const response = await $fetch(`api/inbox?inboxId=${inbox.id}`, {
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
  }
  catch (error: any) {
    reportError(error, { section : `inbox`});
  }
}
</script>