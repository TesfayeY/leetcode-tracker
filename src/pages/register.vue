<template>
  <div>
    <h1 class="font-default pb-2">Please enter...</h1>
    <form @submit.prevent="register"> <!--Register form-->
      <div>
        <UFormGroup label="Name" required class="pb-1" >
          <UInput v-model="name" type="text" icon="i-heroicons-lock-closed"/>
        </UFormGroup>
      </div>
      <div>
        <UFormGroup label="Email" required class="pb-1">
          <UInput v-model="email" type="email" icon="i-heroicons-envelope" placeholder="you@example.com" />
        </UFormGroup>
      </div>
      <div>
        <UFormGroup label="Password" name="password" required class="pb-1"> 
          <UInput v-model="password" type="password" icon="i-heroicons-lock-closed" />
        </UFormGroup>
      </div>
      <div>
        <UFormGroup label="Confirm Password" name="confirmPassword" required>
          <UInput v-model="confirmPassword" type="password" icon="i-heroicons-lock-closed" />
        </UFormGroup>
      </div>
      <UButton variant="soft" type="submit">Register</UButton>
    </form>
    <div v-if="registerError" style="color: red; font-weight: bold;">{{ registerError }}</div>        
  </div>
</template>


<script setup lang="ts">

definePageMeta({
        layout: 'public',
        middleware: 'no-auth-required'
    })

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { consola } from "consola"
import * as Sentry from "@sentry/nuxt";
import { useErrorLogger } from '~/composables/useErrorLogger';

const {reportError}= useErrorLogger();
//Define the form and error variables
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const registerError = ref<string | null>(null);
const router = useRouter();

const register = async () => {
  
  await $fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value,
        confirmPassword: confirmPassword.value
      })
    }).then((data: any) => { 
      if (data.success) {
        router.push('/login');
      } else {
        registerError.value = data.message;
      }
    }).catch((error: any) => {
      registerError.value = error.statusMessage;
      reportError(error, {section: 'register'})
    });
  }
</script>

<style>
div {
  margin-left: 4px;
  margin-right: 4px;
}

button {
  margin-top: 10px;
  margin-left: 20px;
}
</style>
