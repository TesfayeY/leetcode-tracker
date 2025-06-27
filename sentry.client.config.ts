import * as Sentry from "@sentry/nuxt";
import packageJson from "./package.json";

// Set replay integration to hide certain data on replay
const replay = Sentry.replayIntegration({
  maskAllText: true,
  blockAllMedia: true,
});

// Set global handler to capture unhandled exception
const globalHandler = Sentry.globalHandlersIntegration({
   onerror: true, 
   onunhandledrejection: true 
});

// Parse default trace rate
const defaultTraceRate = () => {
  let defaultTraceRate = 0;

  try {
    defaultTraceRate = parseFloat(useRuntimeConfig().public.sentry.traceConfig.defaultSamplingRate.toString());
  } catch {
    defaultTraceRate = 0;
  }

  return defaultTraceRate;
}

// Parse error session replay rate
const errorReplayRate = () => {
  let errorReplayRate: number;

  try {
    errorReplayRate = parseFloat(useRuntimeConfig().public.sentry.replaySessionConfig.errorSamplingRate);
  } catch (error: any) {
    errorReplayRate = 0;
  }

  return errorReplayRate;
}

// Parse user session replay rate
const userReplayRate = () => {
  let userReplayRate: number;

  try {
    userReplayRate = parseFloat(useRuntimeConfig().public.sentry.replaySessionConfig.userSamplingRate);
  } catch (user: any) {
    userReplayRate = 0;
  }

  return userReplayRate;
}

// Start initialize
Sentry.init({
  dsn: useRuntimeConfig().public.sentry.dsnClient,
  environment: useRuntimeConfig().public.sentry.environment.toString(),
  release: packageJson.version.toString(),

  // This will run just before sending any report to Sentry.io
  // Notes on these denied status code:
  //   100-103: these are informational code
  //   200-203: these are OK status code, and request process are healthy
  //   300-304: these are route redirected status code
  //   401-404: these are resource info code 
  //   (400 is reported because there is a case where the client side receives the input
  //    but for some error it does not send enough data to the server)
  beforeSend(event: Sentry.Event) {
    const deniedStatusCodeList = [
      100, 101, 102, 103,
      200, 201, 202, 203,
      300, 301, 302, 303, 304,
      401, 402, 403, 404
    ];

    const eventStatusCode = event.breadcrumbs.slice(-1)[0].data.status_code;
    const isFilterStatus = useRuntimeConfig().public.sentry.isStatusFilter === "false";

    return isFilterStatus || deniedStatusCodeList.indexOf(eventStatusCode) === -1 ? event : null;
  },

  // This will filter some log trace that are not necessary
  beforeBreadcrumb(breadcrumb: any) {
    const deniedBreadcrumbType = useRuntimeConfig().public.sentry.breadcrumbFilterList.toString().split(",");

    return deniedBreadcrumbType.length === 0 || deniedBreadcrumbType.indexOf(breadcrumb.category) === -1 ? breadcrumb : null;
  },

  // This controls all the trace sampling rate, determined by the env value
  tracesSampler: (samplingContext: any) => {
    const { name, attributes, inheritOrSampleWith } = samplingContext;
    const currentEnvironment = useRuntimeConfig().public.sentry.environment.toString();
    const defaultSamplingRate = defaultTraceRate();

    // Default sampling rate
    return inheritOrSampleWith(defaultSamplingRate);
  },

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  // tracesSampleRate: 1.0,

  // This sets the sample rate of the session replay
  replaysSessionSampleRate: userReplayRate(),
  
  // The below sample rate is to sample sessions when an error occurs.
  replaysOnErrorSampleRate: errorReplayRate(),
  
  // Put all integrations
  integrations: [replay, globalHandler],
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: !(useRuntimeConfig().public.sentry.isDebugging.length === 0 || useRuntimeConfig().public.sentry.isDebugging === "false"),
});

