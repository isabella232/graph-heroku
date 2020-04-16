import Heroku from 'heroku-client';
import { retry } from '@lifeomic/attempt';

interface HerokuIntegrationConfig {
  apiKey: string;
}

let heroku: Heroku = undefined;

export function getHerokuClient(config?: HerokuIntegrationConfig): Heroku {
  if (heroku === undefined) {
    if (config === undefined) {
      throw new Error(
        'Cannot get heroku client; client has not been initialized!',
      );
    }
    heroku = new Heroku({
      token: config.apiKey,
    });
  }
  return heroku;
}

const herokuErrorCodes = [
  400, // bad_request: request invalid, validate usage and try again
  401, // unauthorized: request not authenticated, API token is missing, invalid or expired
  402, // delinquent: either the account has become delinquent as a result of non-payment, or the account’s payment method must be confirmed to continue
  403, // forbidden: request not authorized, provided credentials do not provide access to specified resource
  403, // suspended: request not authorized, account or application was suspended.
  404, // not_found: request failed, the specified resource does not exist
  406, // not_acceptable: request failed, set Accept: application/vnd.heroku+json; version=3 header and try again
  409, // conflict: request failed, see response body for suggested resolution
  410, // gone: requested resource can no longer be found at this location, see the Platform API Reference for alternatives.
  416, // requested_range_not_satisfiable: request failed, validate Content-Range header and try again
  422, // invalid_params: request failed, validate parameters try again
  422, // verification_needed: request failed, enter billing information in the Heroku Dashboard before utilizing resources.
  429, // rate_limit: request failed, wait for rate limits to reset and try again, see rate limits
];

const rateLimitErrorCode = 429;
const retryableHerokuErrorCodes = [rateLimitErrorCode];

const nonRetryableHerokuErrorCodes = herokuErrorCodes.filter(
  (e) => !retryableHerokuErrorCodes.includes(e),
);

// 4500 requests allowed per hour, per API.
const API_REQUESTS_PER_HOUR = 4500;
const API_REQUESTS_PER_SECOND = API_REQUESTS_PER_HOUR / 60 / 60;
const SECONDS_PER_API_REQUEST = 1 / API_REQUESTS_PER_SECOND;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retryHerokuGet(route: string): Promise<any> {
  return retry(async () => heroku.get(route), {
    handleError: handleError,
  });
}

export async function handleError(err, attemptContext): Promise<void> {
  if (err.statusCode) {
    if (nonRetryableHerokuErrorCodes.includes(err.statusCode)) {
      attemptContext.abort();
    } else if (err.statusCode === rateLimitErrorCode) {
      await sleep(SECONDS_PER_API_REQUEST * 5 * 1000);
    }
  }
}
