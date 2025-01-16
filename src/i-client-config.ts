import type {
  AttributeType,
  BanditActions,
  IAssignmentLogger,
  IBanditLogger,
} from '@eppo/js-client-sdk-common';

export type ServingStoreUpdateStrategy = 'always' | 'expired' | 'empty';

/**
 * Base configuration for API requests and polling behavior
 */
interface IBaseRequestConfig {
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
   * Pass a logging implementation to send bandit assignments to your data warehouse.
   */
  banditLogger?: IBanditLogger;

  /**
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

  /**
   * Number of additional times polling for updated configurations will be attempted before giving up.
   * Polling is done after a successful initial request. Subsequent attempts are done using an exponential
   * backoff. (Default: 7)
   */
  numPollRequestRetries?: number;

  /**
   * Skip the request for new configurations during initialization. (default: false)
   */
  skipInitialRequest?: boolean;
}

/**
 * Configuration for precomputed flag assignments
 */
interface IPrecompute {
  /**
   * Subject key to use for precomputed flag assignments.
   */
  subjectKey: string;

  /**
   * Subject attributes to use for precomputed flag assignments.
   */
  subjectAttributes?: Record<string, AttributeType>;

  /**
   * Bandit actions to use for precomputed flag assignments.
   */
  banditActions?: BanditActions;
}

/**
 * Configuration for Eppo precomputed client initialization
 * @public
 */
export interface IPrecomputedClientConfig extends IBaseRequestConfig {
  precompute: IPrecompute;
}

/**
 * Configuration for regular client initialization
 * @public
 */
export interface IClientConfig extends IBaseRequestConfig {
  /**
   * Throw an error if unable to fetch an initial configuration during initialization. (default: true)
   */
  throwOnFailedInitialization?: boolean;
}
