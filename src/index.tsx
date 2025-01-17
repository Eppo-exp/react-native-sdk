import {
  IAssignmentLogger,
  IAssignmentEvent,
  validation,
  EppoClient,
  FlagConfigurationRequestParameters,
  IAssignmentDetails,
  EppoPrecomputedClient,
  IConfigurationStore,
  MemoryOnlyConfigurationStore,
  PrecomputedFlagsRequestParameters,
  Subject,
} from '@eppo/js-client-sdk-common';

import { EppoAsyncStorage } from './async-storage';
import { sdkName, sdkVersion } from './sdk-data';
import type {
  IClientConfig,
  IPrecomputedClientConfig,
} from './i-client-config';
import type {
  IObfuscatedPrecomputedBandit,
  PrecomputedFlag,
} from '@eppo/js-client-sdk-common/dist/interfaces';

export {
  IAssignmentDetails,
  IAssignmentLogger,
  IAssignmentEvent,
  EppoClient,
  IClientConfig,
  IPrecomputedClientConfig,
};

const asyncStorage = new EppoAsyncStorage();

const memoryOnlyPrecomputedFlagsStore: IConfigurationStore<PrecomputedFlag> =
  new MemoryOnlyConfigurationStore();
const memoryOnlyPrecomputedBanditsStore: IConfigurationStore<IObfuscatedPrecomputedBandit> =
  new MemoryOnlyConfigurationStore();

export class EppoReactNativeClient extends EppoClient {
  public static initialized = false;

  public static instance: EppoReactNativeClient = new EppoReactNativeClient({
    flagConfigurationStore: asyncStorage,
    isObfuscated: true,
  });
}

/**
 * Initializes the Eppo client with configuration parameters.
 * This method should be called once on application startup.
 * @param config client configuration
 * @public
 */
export async function init(config: IClientConfig): Promise<EppoClient> {
  validation.validateNotBlank(config.apiKey, 'API key required');

  try {
    // If any existing instances; ensure they are not polling
    if (EppoReactNativeClient.instance) {
      EppoReactNativeClient.instance.stopPolling();
    }

    const requestConfiguration: FlagConfigurationRequestParameters = {
      apiKey: config.apiKey,
      sdkName,
      sdkVersion,
      baseUrl: config.baseUrl ?? undefined,
      requestTimeoutMs: config.requestTimeoutMs ?? undefined,
      numInitialRequestRetries: config.numInitialRequestRetries ?? undefined,
      numPollRequestRetries: config.numPollRequestRetries ?? undefined,
      throwOnFailedInitialization: true, // always use true here as underlying instance fetch is surrounded by try/catch
      pollAfterSuccessfulInitialization:
        config.pollAfterSuccessfulInitialization ?? false,
      pollAfterFailedInitialization:
        config.pollAfterFailedInitialization ?? false,
      pollingIntervalMs: config.pollingIntervalMs ?? undefined,
    };

    EppoReactNativeClient.instance.setLogger(config.assignmentLogger);

    // by default use non-expiring assignment cache.
    EppoReactNativeClient.instance.useNonExpiringInMemoryAssignmentCache();
    EppoReactNativeClient.instance.setConfigurationRequestParameters(
      requestConfiguration
    );

    await asyncStorage.init();

    await EppoReactNativeClient.instance.fetchFlagConfigurations();

    EppoReactNativeClient.initialized = true;
    return EppoReactNativeClient.instance;
  } catch (error) {
    console.warn(
      'Eppo SDK encountered an error initializing, assignment calls will return the default value and not be logged.'
    );
    if (config.throwOnFailedInitialization ?? true) {
      throw error;
    }
    return EppoReactNativeClient.instance;
  }
}

/**
 * Used to access a singleton SDK client instance.
 * Use the method after calling init() to initialize the client.
 * @returns a singleton client instance
 */
export function getInstance(): EppoClient {
  return EppoReactNativeClient.instance;
}

export class EppoPrecomputedReactNativeClient extends EppoPrecomputedClient {
  public static initialized = false;

  public static instance: EppoPrecomputedReactNativeClient =
    new EppoPrecomputedReactNativeClient({
      precomputedFlagStore: memoryOnlyPrecomputedFlagsStore,
      subject: {
        subjectKey: '',
        subjectAttributes: {},
      },
    });
}

/**
 * Initializes the Eppo precomputed client with configuration parameters.
 * This method should be called once on application startup.
 * @param config - client configuration
 * @public
 */
export async function precomputedInit(
  config: IPrecomputedClientConfig
): Promise<EppoPrecomputedClient> {
  if (EppoPrecomputedReactNativeClient.initialized) {
    return EppoPrecomputedReactNativeClient.instance;
  }

  validation.validateNotBlank(config.apiKey, 'API key required');
  validation.validateNotBlank(
    config.precompute.subjectKey,
    'Subject key required'
  );

  const {
    apiKey,
    precompute: { subjectKey, subjectAttributes = {}, banditActions },
    baseUrl,
    requestTimeoutMs,
    numInitialRequestRetries,
    numPollRequestRetries,
    pollingIntervalMs,
    pollAfterSuccessfulInitialization = false,
    pollAfterFailedInitialization = false,
    skipInitialRequest = false,
  } = config;

  // Set up parameters for requesting updated configurations
  const requestParameters: PrecomputedFlagsRequestParameters = {
    apiKey,
    sdkName,
    sdkVersion,
    baseUrl,
    requestTimeoutMs,
    numInitialRequestRetries,
    numPollRequestRetries,
    pollAfterSuccessfulInitialization,
    pollAfterFailedInitialization,
    pollingIntervalMs,
    throwOnFailedInitialization: true, // always use true here as underlying instance fetch is surrounded by try/catch
    skipInitialPoll: skipInitialRequest,
  };

  const subject: Subject = { subjectKey, subjectAttributes };

  EppoPrecomputedReactNativeClient.instance =
    new EppoPrecomputedReactNativeClient({
      precomputedFlagStore: memoryOnlyPrecomputedFlagsStore,
      requestParameters,
      subject,
      precomputedBanditStore: memoryOnlyPrecomputedBanditsStore,
      banditActions,
    });

  EppoPrecomputedReactNativeClient.instance.setAssignmentLogger(
    config.assignmentLogger
  );
  if (config.banditLogger) {
    EppoPrecomputedReactNativeClient.instance.setBanditLogger(
      config.banditLogger
    );
  }
  await EppoPrecomputedReactNativeClient.instance.fetchPrecomputedFlags();

  EppoPrecomputedReactNativeClient.initialized = true;
  return EppoPrecomputedReactNativeClient.instance;
}
