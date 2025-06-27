// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  telemetry: false,
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@sentry/nuxt/module"],

  devServer: {
    port: Number(process.env.APP_PORT),
  },

  srcDir: "src/",

  typescript: {
    strict: false,
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET,
    public: {
      sentry: {
        dsnClient: process.env.SENTRY_DSN_FRONTEND,
        dsnApi: process.env.SENTRY_DSN_BACKEND,
        environment: process.env.SENTRY_ENV,
        isStatusFilter: process.env.SENTRY_IS_FILTER_STATUS,
        breadcrumbFilterList: process.env.SENTRY_LIST_FILTER_BREADCRUMB,
        traceConfig: {
          defaultSamplingRate: process.env.SENTRY_DEFAULT_TRACE_RATE,
        },
        replaySessionConfig: {
          userSamplingRate: process.env.SENTRY_USER_REPLAY_RATE,
          errorSamplingRate: process.env.SENTRY_ERROR_REPLAY_RATE,
        },
        isDebugging: process.env.SENTRY_IS_DEBUG,
      }
    }
  },

  hooks: {
    'build:done': () => {
      // Add post-build hooks here (IF needed)
    }
  },

  // This add the client source map of the code to Sentry for stack tracing. 
  sentry: {
    sourceMapsUploadOptions: {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_CLIENT_PROJECT,
    },
  },

  // Sentry enable source map for server by default (hidden)
  // true: send sourcemap; 
  // false: do not send sourcemap; 
  // hidden: send sourcemap but prevent source map reference comments.
  sourcemap: {
    server: "hidden",
    client: "hidden",
  },
});