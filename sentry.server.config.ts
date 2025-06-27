import * as Sentry from "@sentry/nuxt";
import packageJson from "./package.json";

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
 
Sentry.init({
  dsn: useRuntimeConfig().public.sentry.dsnApi,
  environment: useRuntimeConfig().public.sentry.environment.toString(),
  release: packageJson.version.toString(),

  // This controls all the trace sampling rate, determined by the env value
  tracesSampler: (samplingContext: any) => {
    const { name, attributes, inheritOrSampleWith } = samplingContext;
    const currentEnvironment = useRuntimeConfig().public.sentry.environment.toString();
    const defaultSamplingRate = defaultTraceRate();

    // Default sampling rate
    return inheritOrSampleWith(defaultSamplingRate);
  },
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: !(useRuntimeConfig().public.sentry.isDebugging.length === 0 || useRuntimeConfig().public.sentry.isDebugging === "false"),
});