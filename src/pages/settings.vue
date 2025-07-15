<template>
  <div class="mr-4">
    <UTabs :items="items" class="w-full mb-10">
      <!-- Preference settings form -->
      <template #Preferences="{ item }">
        <UCard>
          <template #header>
            <p class="text-base font-semibold leading- text-gray-900 dark:text-white">
              {{ item.label }}
            </p>
            <p class="mb-5 text-sm text-gray-500 dark:text-gray-400">
              Change your notification and inbox preferences here
            </p>
          </template>
          <div class="flex flex-col gap-5">
            <div class="flex flex row justify-between">
              <p>All Notifications</p>
              <UToggle v-model="isAllSelected" @change="handleAllToggle"></UToggle>
            </div>
            <UDivider></UDivider>
            <div class="flex flex row justify-between">
              <p>Auto Notifications</p>
              <UToggle v-model="isAutoSelected" @change="handleAutoToggle"></UToggle>
            </div>
            <div class="flex flex row justify-between ml-10 items-center">
              <p>Streak Days</p>
              <div class="flex flex row justify-end gap-5 m-0 items-center">
                <p>At:</p>
                <input 
                  id="autoStreakDatetime"
                  v-model="streakTimeInput" 
                  v-bind:disabled="!isStreakSelected"
                  @change="handleTimeInput" 
                  type="time" 
                  class="p-1 rounded-md border-2 border-green-300 bg-transparent"
                ></input>
                <UToggle v-model="isStreakSelected" @change="handleIndividualToggle('isStreakNotify', isStreakSelected)"></UToggle>
              </div>
            </div>
            <div class="flex flex row justify-between ml-10 items-center">
              <p>Check In Today</p>
              <div class="flex flex row justify-end gap-5 m-0 items-center">
                <p>At:</p>
                <input 
                  id="autoCheckinDatetime"
                  v-model="checkinTimeInput" 
                  v-bind:disabled="!isCheckInSelected"
                  @change="handleTimeInput"  
                  type="time" 
                  class="p-1 rounded-md border-2 border-green-300 bg-transparent"
                ></input>
                <UToggle v-model="isCheckInSelected" @change="handleIndividualToggle('isCheckinNotify', isCheckInSelected)"></UToggle>
              </div>
            </div>
            <div class="flex flex row justify-between ml-10 items-center">
              <p>Daily Leetcode Problem</p>
              <div class="flex flex row justify-end gap-5 m-0 items-center">
                <p>At:</p>
                <input 
                  id="autoProblemDatetime"
                  v-model="dailyTimeInput" 
                  v-bind:disabled="!isDailySelected" 
                  @change="handleTimeInput" 
                  type="time" 
                  class="p-1 rounded-md border-2 border-green-300 bg-transparent"
                ></input>
                <UToggle v-model="isDailySelected" @change="handleIndividualToggle('isProblemNotify', isDailySelected)"></UToggle>
              </div>
            </div>
            <UDivider></UDivider>
            <div class="flex flex row justify-between">
              <p>Notification Delivery Methods</p>
            </div>
            <div class="flex flex row justify-between ml-10">
              <p>Push to Inbox</p>
              <UToggle disabled v-model="isInboxSelected" @change="handleIndividualToggle('isInboxNotify', isInboxSelected)"></UToggle>
            </div>
            <div class="flex flex row justify-between ml-10">
              <p>Push to Email</p>
              <UToggle disabled v-model="isEmailSelected" @change="handleIndividualToggle('isEmailNotify', isEmailSelected)"></UToggle>
            </div>
            <div class="flex flex row justify-between ml-10">
              <p>Push to Browser Popup</p>
              <UToggle disabled v-model="isWebPushSelected" @change="handleIndividualToggle('isWebPushNotify', isWebPushSelected)"></UToggle>
            </div>
            <UDivider></UDivider>
            <div class="flex flex row justify-between">
              <p>Messages Delivery Methods</p>
            </div>
            <div class="flex flex row justify-between ml-10">
              <p>Send to Inbox</p>
              <UToggle disabled v-model="isInboxMessageSelected" @change="handleIndividualToggle('isInboxMessage', isInboxMessageSelected)"></UToggle>
            </div>
            <div class="flex flex row justify-between ml-10">
              <p>Send to Email</p>
              <UToggle disabled v-model="isEmailMessageSelected" @change="handleIndividualToggle('isEmailMessage', isEmailMessageSelected)"></UToggle>
            </div>
            <div class="flex flex row justify-between ml-10">
              <p>Send to Browser Popup</p>
              <UToggle disabled v-model="isWebPushMessageSelected" @change="handleIndividualToggle('isWebPushMessage', isWebPushMessageSelected)"></UToggle>
            </div>
          </div>
        </UCard>
      </template>

      <!-- Name settings form -->
      <template #Name="{ item }">
        <UCard @submit.prevent="onSubmitName">
          <template #header>
            <p class="text-base font-semibold leading- text-gray-900 dark:text-white">
              {{ item.label }}
            </p>
            <p class="mb-5 text-sm text-gray-500 dark:text-gray-400">
              Change your display name here. Click save when you're done to save your changes.
            </p>
          </template>

          <UFormGroup label="Display Name" name="newName" class="mb-3">
            <UInput v-model="nameForm.newName" :placeholder="name" required/>
          </UFormGroup>

          <template #footer>
            <UButton type="submit" name="form-submit-button">
              Save Name
            </UButton>
            <div v-if="nameError" style="color: red; font-weight: bold;">{{ nameError }}</div>
            
          </template>
        </UCard>
      </template>

      <!-- Email settings form -->
      <template #Email="{ item }">
        <UCard @submit.prevent="onSubmitEmail">
          <template #header>
            <p class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ item.label }}
            </p>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Change your login email here. Click save when you're done to save your changes.
            </p>
          </template>

          <UFormGroup label="Current Email" name="currentEmail" required class="mb-3">
            <UInput v-model="emailForm.currentEmail" type="email" required />
          </UFormGroup>
          <UFormGroup label="New Email" name="newEmail" required class="mb-3">
            <UInput v-model="emailForm.newEmail" type="email" required />
          </UFormGroup>
          <UFormGroup label="Confirm New Email" name="confirmNewEmail" required>
            <UInput v-model="emailForm.confirmedNewEmail" type="email" required />
          </UFormGroup>

          <template #footer>
            <UButton type="submit" name="form-submit-button">
              Save Email
            </UButton>
            <div v-if="emailError" style="color: red; font-weight: bold;">{{ emailError }}</div>
            
          </template>
        </UCard>
      </template>

      <!-- Password settings form -->
      <template #password="{ item }">
        <UCard @submit.prevent="onSubmitPassword">
          <template #header>
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ item.label }}
            </h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Change your password here. After saving, you'll be logged out. Make sure to keep a copy for your records!
            </p>
          </template>

          <UFormGroup label="Current Password" name="currentPassword" required class="mb-3">
            <UInput v-model="passwordForm.currentPassword" type="password" required />
          </UFormGroup>
          <UFormGroup label="New Password" name="newPassword" required class="mb-3">
            <UInput v-model="passwordForm.newPassword" type="password" required />
          </UFormGroup>
          <UFormGroup label="Confirm New Password" name="confirmNewPassword" required>
            <UInput v-model="passwordForm.confirmedNewPassword" type="password" required />
          </UFormGroup>

          <template #footer>
            <UButton type="submit" name="form-submit-button">
              Save password
            </UButton>
            <div v-if="passwordError" style="color: red; font-weight: bold;">{{ passwordError }}</div>
            
          </template>
        </UCard>
      </template>

      <!-- Deletion settings form -->
      <template #Deletion="{ item }">
        <UCard @submit.prevent="onDeleteAccount">
          <template #header>
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ item.label }}
            </h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Delete your account here. This action is irreversible. Make sure you want to delete your account before proceeding.
            </p>
          </template>

          <UFormGroup label="Email" name="Email" required class="mb-3">
            <UInput v-model="deletionForm.email" type="email" required />
          </UFormGroup>
          <UFormGroup label="Current Password" name="password" required class="mb-3">
            <UInput v-model="deletionForm.password" type="password" required />
          </UFormGroup>
          <UFormGroup label="Confirm Password" name="confirmPassword" required>
            <UInput v-model="deletionForm.confirmedPassword" type="password" required />
          </UFormGroup>

          <template #footer>
            <UButton type="submit" color="red">
              Delete Account
            </UButton>
            <div v-if="deletionError" style="color: red; font-weight: bold;">{{ deletionError }}</div>
            
          </template>
        </UCard>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { consola } from "consola";
import * as Sentry from "@sentry/nuxt";
import { useErrorLogger } from '~/composables/useErrorLogger';
const { reportError }= useErrorLogger();

definePageMeta({
  layout: 'default',
  middleware: 'require-auth'
});

const items = [
  { slot: 'Preferences', label: 'Preferences'},
  { slot: 'Name', label: 'Display Name' },
  { slot: 'Email', label: 'Email' },
  { slot: 'password', label: 'Password' },
  { slot: 'Deletion', label: 'Delete Account' }
];

//Variables for page
const displayName = useCookie('name').value;
const checkinToken = useCookie('latestCheckinToken');
const streakToken = useCookie('latestStreakToken');
const dailyProblemToken = useCookie('latestDailyProblemToken');
const userPreferences = useCookie('preference');
const name = ref<string | null>(displayName);


// Form variables
const emailForm = reactive({ currentEmail: '', newEmail: '', confirmedNewEmail: '' });
const nameForm = reactive({ newName: '' });
const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmedNewPassword: '' });
const deletionForm = reactive({ email: '', password: '', confirmedPassword: '' });

// Error variables
const emailError = ref<string | null>(null);
const nameError = ref<string | null>(null);
const passwordError = ref<string | null>(null);
const deletionError = ref<string | null>(null);

// Preference variables. Prefer individual rather than object for separations of control
const isAllSelected = ref(true);
const isAutoSelected = ref(true);
const isStreakSelected = ref(true);
const isCheckInSelected = ref(true);
const isDailySelected = ref(true);
const isInboxSelected = ref(true);
const isEmailSelected = ref(false);
const isWebPushSelected = ref(true);
const isInboxMessageSelected = ref(true);
const isEmailMessageSelected = ref(false);
const isWebPushMessageSelected = ref(true);
const streakTimeInput = ref('');
const checkinTimeInput = ref('');
const dailyTimeInput = ref('');

const token = useCookie('token') ;

onBeforeMount(async () => {
  try {
    const response = await $fetch(`api/user/preference`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }
    });

    assignPreferences(response);
  } catch(error: any) {
    reportError(error,{ section : 'settings/Name'});
  }
});

async function onSubmitName() {
  
  console.log('Submitted form:', nameForm);

  try {
    const response = await $fetch('/api/user/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(nameForm),
    });

    refreshCookie('name');
    refreshCookie('token');

    // Clear the error message for the "Name" tab
    nameError.value = null;

    // Redirect to welcome page
    navigateTo('/welcome');

  } catch (error: any) {
    // Set the error message for the "Name" tab only
    nameError.value = error.statusMessage;
    reportError(error,{ section : 'settings/Name'})
  }
}

async function onSubmitEmail() {
  consola.log('Submitted form:', emailForm);

  try {
    console.log(token);

    const response = await $fetch('/api/user/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(emailForm),
    });

    // Clear the error message for the "Email" tab
    emailError.value = null;

    // Redirect to login page
    navigateTo('/login');

  } catch (error: any) {
    emailError.value = error.statusMessage;
    reportError(error, {section: 'settings/email'});
  }
}

async function onSubmitPassword() {
  consola.log('Submitted form:', passwordForm);

  try {

    const response = await $fetch('/api/user/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(passwordForm),
    });

    // Clear the error message for the "Password" tab
    passwordError.value = null;

    // Redirect to login page
    navigateTo('/login');
    
  } catch (error: any) {
    passwordError.value = error.statusMessage;
    reportError(error, {section: 'settings/password'});
  }
}

async function onDeleteAccount() {
  try {

    const response = await $fetch('/api/user/me', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(deletionForm), // Ensure the body is included in the DELETE request
    });
    // Clear the error message for the "Delete Account" tab
    deletionError.value = null;

    // Redirect to login page
    navigateTo('/login');

  } catch (error: any) {
    deletionError.value = error.statusMessage;
    reportError(error, {section: 'settings/delete'});
  }
}

const handleTimeInput = async (event: any) => {
  const inputTime = event.target.value;
  const autoType = event.target.id;

  // Set datetime object
  const today = new Date();
  const hour = parseInt(inputTime.split(':')[0]);
  const minutes = parseInt(inputTime.split(':')[1]);

  today.setHours(hour);
  today.setMinutes(minutes);
  today.setSeconds(0);
  today.setMilliseconds(0);

  // Update the preferences
  try {
    const response = await $fetch(`api/user/preference`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: {
        autoTimeInputType: autoType,
        value: today
      }
    });

    // Update the tokens
    if (response.data) {
      if (autoType === 'autoStreakDatetime') {
        streakToken.value = inputTime;
      } else if (autoType === 'autoCheckinDatetime') {
        checkinToken.value = inputTime;
      } else {
        dailyProblemToken.value = inputTime;
      }
    }
  } catch (error: any) {
    reportError(error, {section: 'settings/preferences'});
  }
}

const handleAllToggle = async () => {
  //All notification captures all other ones
  isAutoSelected.value = isAllSelected.value;
  isStreakSelected.value = isAllSelected.value;
  isCheckInSelected.value = isAllSelected.value;
  isDailySelected.value = isAllSelected.value;
  isInboxSelected.value = isAllSelected.value;
  isEmailSelected.value = isAllSelected.value;
  isWebPushSelected.value = isAllSelected.value;
  isInboxMessageSelected.value = isAllSelected.value;
  isEmailMessageSelected.value = isAllSelected.value;
  isWebPushMessageSelected.value = isAllSelected.value;

  try {
    const response = await $fetch(`api/user/preference`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: {
        isNotify: isAllSelected.value,
        isAutoNotify: isAutoSelected.value,
        isStreakNotify: isStreakSelected.value,
        isCheckinNotify: isCheckInSelected.value,
        isProblemNotify: isDailySelected.value,
        isInboxNotify: isInboxSelected.value,
        isEmailNotify: isEmailSelected.value,
        isWebPushNotify: isWebPushSelected.value,
        isWebPushMessage: isWebPushMessageSelected.value,
        isInboxMessage: isInboxMessageSelected.value,
        isEmailMessage: isEmailMessageSelected.value,
      }
    });

    assignPreferences(response);

  } catch (error: any) {
    reportError(error, {section: 'settings/preferences'});
  }
}

const handleAutoToggle = async () => {
  isStreakSelected.value = isAutoSelected.value;
  isCheckInSelected.value = isAutoSelected.value;
  isDailySelected.value = isAutoSelected.value;

  try {
    const response = await $fetch(`api/user/preference`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: {
        isAutoNotify: isAutoSelected.value,
        isStreakNotify: isStreakSelected.value,
        isCheckinNotify: isCheckInSelected.value,
        isProblemNotify: isDailySelected.value,
      }
    });

    assignPreferences(response);
  } catch (error: any) {
    reportError(error, {section: 'settings/preferences'});
  }
}

const handleIndividualToggle = async (type: string, value: boolean) => {
  try {
    const response = await $fetch(`api/user/preference`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: {
        notificationType: type,
        value: value
      }
    });

    assignPreferences(response);
  } catch (error: any) {
    reportError(error, {section: 'settings/preferences'});
  }
}

// This will assign all the toggles bases on the user saved preferences.
function assignPreferences(response: any) {
  if (response !== null) {
    isAllSelected.value = response.data.isNotify ?? isAllSelected.value;
    isAutoSelected.value = response.data.isAutoNotify ?? isAutoSelected.value;
    isStreakSelected.value = response.data.isStreakNotify ?? isStreakSelected.value;
    isCheckInSelected.value = response.data.isCheckinNotify ?? isCheckInSelected.value;
    isDailySelected.value = response.data.isProblemNotify ?? isDailySelected.value;
    isInboxSelected.value = response.data.isInboxNotify ?? isInboxSelected.value;
    isEmailSelected.value = response.data.isEmailNotify ?? isEmailSelected.value;
    isWebPushSelected.value = response.data.isWebPushNotify ?? isWebPushSelected.value;
    isWebPushMessageSelected.value = response.data.isWebPushMessage ?? isWebPushMessageSelected.value;
    isInboxMessageSelected.value = response.data.isInboxMessage ?? isInboxMessageSelected.value;
    isEmailMessageSelected.value = response.data.isEmailMessage ?? isEmailMessageSelected.value;
    streakTimeInput.value = formatTimeDisplay(new Date(response.data.autoStreakDatetime ?? streakTimeInput.value));
    checkinTimeInput.value = formatTimeDisplay(new Date(response.data.autoCheckinDatetime ?? checkinTimeInput.value));
    dailyTimeInput.value = formatTimeDisplay(new Date(response.data.autoProblemDatetime ?? dailyTimeInput.value));

    // Update tokens for auto notification
    userPreferences.value = {
      daily: response.data.isProblemNotify,
      checkin: response.data.isCheckinNotify,
      streak: response.data.isStreakNotify
    };
  }
}

function formatTimeDisplay(datetime: Date) {
  return datetime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

</script>

<style scoped>
[role=tab] {
  visibility: visible;
}
.dark\:bg-gray-900:is(.dark *) {
  background-color: transparent;
}
.dark\:bg-gray-900:is(.light *) {
  background-color: transparent;
}
*, ::before, ::after {
  box-sizing:inherit;
}

button[name="form-submit-button"] {
  background-color: #4CAF50; 
  color: white;
}

button[name="form-submit-button"]:hover {
  color: black;
}


</style>
