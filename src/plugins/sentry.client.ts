// This plugin enhances Sentry error logs on the client-side
// It adds user context (from cookies) and route tagging for better filtering and analysis

import { defineNuxtPlugin, useRouter, useCookie } from '#app';
import * as Sentry from '@sentry/nuxt';

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();

  // Add user context from cookies
  const userId = useCookie('id').value;
  const email = useCookie('email').value;
  if (userId || email) {
    Sentry.setUser({ id: userId, email });
  }

  // Add stable route name as a tag for filtering;
  // avoid tagging full paths to reduce tag noise
  router.afterEach((to) => {
    if (to.name) {
      Sentry.setTag('route_path', to.path.toString());
    }

    // Add full route details as additional context 
    Sentry.withScope((scope) => {
      scope.setContext('route', {
        name: to.name,
        path: to.fullPath,
        params: to.params,
        query: to.query,
      });
      
    });
  });

});
