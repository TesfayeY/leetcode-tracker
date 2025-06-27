import * as Sentry from "@sentry/nuxt";
import { useErrorLogger } from '~/composables/useErrorLogger';
const {reportError} = useErrorLogger();
export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    reportError(error, {
      section: 'app-global',
      context_type: 'vue_error_handler', 
      component_info: info // 'info' provides context like lifecycle hook where error originated
  });
  };
  nuxtApp.hook('vue:error', (error, info) => {
    reportError(error, {section: 'app-global',
      context_type: 'vue_error_handler', 
      component_info: info
  });
  });
});
