export default defineNuxtPlugin({
  enforce: 'pre',
  async setup() {
    onNuxtReady(async () => {
      const { reportError } = useErrorLogger();
      const runtimeConfig = useRuntimeConfig();

      // Check and create system worker
      await $fetch('/api/auth/registerWorker', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        }
      }).catch((error: any) => {
        reportError(error, {section: 'register'})
      });
    });
  }
});