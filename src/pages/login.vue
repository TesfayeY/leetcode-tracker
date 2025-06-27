<template>
  <form @submit.prevent="login">
    <div class="w-full flex flex-col gap-y-4">
      <UCard :ui="{ body: { base: 'grid grid-cols-3' } }">
        <div class="space-y-4">
          <UFormGroup label="Email" required>
            <UInput v-model="email" type="email" placeholder="you@example.com" icon="i-heroicons-envelope" />
          </UFormGroup>

          <UFormGroup label="Password" required>
            <UInput v-model="password" type="password" icon="i-heroicons-lock-closed" />
          </UFormGroup>

          <UButton variant="soft" type="submit">Login</UButton>
            <div v-if="loginError" style="color: red; font-weight: bold;">{{ loginError }}</div>
        </div>

        <UDivider label="OR" orientation="vertical" />

        <div class="space-y-4 flex flex-col justify-center pr-40 text-primary">
          <UAlert
            icon="i-heroicons-command-line"
            description="These functions are temporarily unavailable."
            title="We're sorry!"
          />
          <ULink
            to="https://github.com/login"
            active-class="text-primary"
            inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <UButton disabled variant="outline" color="black" label="Login with GitHub" icon="i-logos-github-icon" block />
          </ULink>

          <ULink
            to="https://accounts.google.com"
            active-class="text-primary"
            inactive-class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <UButton disabled variant="outline" color="black" label="Login with Google" icon="i-simple-icons-google" block />
          </ULink>
        </div>
      </UCard>
    </div>
  </form>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import * as Sentry from "@sentry/nuxt";
import { useErrorLogger } from '~/composables/useErrorLogger';
const { reportError}= useErrorLogger();

definePageMeta({
        layout: 'public',
        middleware: 'no-auth-required'
    })

/// Define the form and error refs
const email = ref('');
const password = ref('');
const loginError = ref<string | null>(null);
const router = useRouter();


const login = async () => {
  Sentry.setUser({ email: email.value });// Sets user email immediately on client-side form submission.
  try {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    // TODO: In the future it would be good to move this type of log message to the debug level, but
    //   at the current setup, the verbose Vue / Nuxt logging makes it very hard to use the console
    //   in 'Verbose Level' because of the high level of chatter. 
    console.log('Received response from login API:', data);
    if (data.success) {

      //Set cookies
      useCookie('token').value = data.token;
      useCookie('name').value = data.name;
      useCookie('email').value = data.email;
      useCookie('id').value = data.id.toString();

      console.log('Redirecting to /welcome');
      router.push("/welcome");
    } 
  } catch (error: any) {
    loginError.value = error.statusMessage;
    reportError(error, {section: 'login'});
  }
};
</script>

<style>
button {
  margin-left: 0px;
}
</style>

