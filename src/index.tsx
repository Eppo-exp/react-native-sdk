import axios from 'axios';

import {
  IAssignmentLogger,
  IAssignmentEvent,
  validation,
  constants,
  ExperimentConfigurationRequestor,
  IEppoClient,
  EppoClient,
  HttpClient,
} from '@eppo/js-client-sdk-common';

import { EppoAsyncStorage } from './async-storage';
import { sdkName, sdkVersion } from './sdk-data';

const DEFAULT_ASSIGNMENT_CACHE_BEHAVIOR = 'non-expiring';
const DEFAULT_EXPIRING_ASSIGNMENT_CACHE_SIZE = 10_000;

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

  /**
   * Assignment cache
   */
  assignmentCacheBehavior?: 'non-expiring' | 'expiring' | 'disabled';
  assigmentExpiringCacheSize?: number;
}

export { IAssignmentLogger, IAssignmentEvent, IEppoClient };

const asyncStorage = new EppoAsyncStorage();

export class EppoReactNativeClient extends EppoClient {
  public static instance: EppoReactNativeClient = new EppoReactNativeClient(
    asyncStorage
  );
}

/**
 * Initializes the Eppo client with configuration parameters.
 * This method should be called once on application startup.
 * @param config client configuration
 * @public
 */
export async function init(config: IClientConfig): Promise<IEppoClient> {
  validation.validateNotBlank(config.apiKey, 'API key required');
  const axiosInstance = axios.create({
    baseURL: config.baseUrl || constants.BASE_URL,
    timeout: constants.REQUEST_TIMEOUT_MILLIS,
  });

  const httpClient = new HttpClient(axiosInstance, {
    apiKey: config.apiKey,
    sdkName,
    sdkVersion,
  });

  // by default use non-expiring assignment cache.
  // this is the recommended setting for most clients.
  const assignmentCacheBehavior =
    config.assignmentCacheBehavior || DEFAULT_ASSIGNMENT_CACHE_BEHAVIOR;
  switch (assignmentCacheBehavior) {
    case 'disabled':
      EppoReactNativeClient.instance.disableAssignmentCache();
      break;
    case 'expiring':
      const cacheSize =
        config.assigmentExpiringCacheSize ||
        DEFAULT_EXPIRING_ASSIGNMENT_CACHE_SIZE;
      EppoReactNativeClient.instance.useLRUAssignmentCache(cacheSize);
      break;
    case 'non-expiring':
      EppoReactNativeClient.instance.useNonExpiringAssignmentCache();
      break;
  }

  await asyncStorage.init();

  EppoReactNativeClient.instance.setLogger(config.assignmentLogger);
  const configurationRequestor = new ExperimentConfigurationRequestor(
    asyncStorage,
    httpClient
  );
  await configurationRequestor.fetchAndStoreConfigurations();

  return EppoReactNativeClient.instance;
}

/**
 * Used to access a singleton SDK client instance.
 * Use the method after calling init() to initialize the client.
 * @returns a singleton client instance
 */
export function getInstance(): IEppoClient {
  return EppoReactNativeClient.instance;
}
