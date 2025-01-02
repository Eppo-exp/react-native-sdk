import {
  IAssignmentLogger,
  IAssignmentEvent,
  validation,
  EppoClient,
  FlagConfigurationRequestParameters,
  IAssignmentDetails,
} from '@eppo/js-client-sdk-common';

import { EppoAsyncStorage } from './async-storage';
import { sdkName, sdkVersion } from './sdk-data';

/**
 * Configuration used for initializing the Eppo client
 * @public
 */
export interface IClientConfig {
  /**
   * Eppo API key
   */
  apiKey: string;

  /**
   * Base URL of the Eppo API.
   * Clients should use the default setting in most cases.
   */
  baseUrl?: string;

  /**
   * Pass a logging implementation to send variation assignments to your data warehouse.
   */
  assignmentLogger: IAssignmentLogger;

  /***
   * Timeout in milliseconds for the HTTPS request for the experiment configuration. (Default: 5000)
   */
  requestTimeoutMs?: number;

  /**
   * Number of additional times the initial configuration request will be attempted if it fails.
   * This is the request typically synchronously waited (via await) for completion. A small wait will be
   * done between requests. (Default: 1)
   */
  numInitialRequestRetries?: number;

  /**
   * Throw an error if unable to fetch an initial configuration during initialization. (default: true)
   */
  throwOnFailedInitialization?: boolean;

  /**
   * Number of additional times polling for updated configurations will be attempted before giving up.
   * Polling is done after a successful initial request. Subsequent attempts are done using an exponential
   * backoff. (Default: 7)
   */
  numPollRequestRetries?: number;

  /**
   * Poll for new configurations even if the initial configuration request failed. (default: false)
   */
  pollAfterFailedInitialization?: boolean;

  /**
   * Poll for new configurations (every `pollingIntervalMs`) after successfully requesting the initial configuration. (default: false)
   */
  pollAfterSuccessfulInitialization?: boolean;

  /**
   * Amount of time to wait between API calls to refresh configuration data. Default of 30_000 (30 seconds).
   */
  pollingIntervalMs?: number;
}

export { IAssignmentDetails, IAssignmentLogger, IAssignmentEvent, EppoClient };

const asyncStorage = new EppoAsyncStorage();

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
