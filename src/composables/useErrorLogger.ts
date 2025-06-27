/**
 * Fuction to replace Sentry.captureException(error) redundency and improve reusablity 
 * Logs an error to Sentry with optional additional context
 */
import * as Sentry from '@sentry/nuxt';

export const useErrorLogger = () => {
  const reportError = (error: unknown, context?: Record<string, unknown>) => {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('custom', context);
      }
      Sentry.captureException(error);
    });
  };

  return { reportError };
};
