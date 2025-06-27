<template>
  <div class="mr-4">
    <UTabs :items="items" class="w-full">
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
import { ref, reactive } from 'vue';
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
  { slot: 'Name', label: 'Display Name' },
  { slot: 'Email', label: 'Email' },
  { slot: 'password', label: 'Password' },
  { slot: 'Deletion', label: 'Delete Account' }
];

//Variables for page
const displayName = useCookie('name').value;
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

const token = useCookie('token') ;

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
