import Heroku from 'heroku-client';
import { retry } from '@lifeomic/attempt';

interface HerokuIntegrationConfig {
  apiKey: string;
}

// 4500 requests allowed per hour, per API.
const API_REQUESTS_PER_HOUR = 4500;
const API_REQUESTS_PER_SECOND = API_REQUESTS_PER_HOUR / 60 / 60;
const SECONDS_PER_API_REQUEST = 1 / API_REQUESTS_PER_SECOND;

const rateLimitErrorCode = 429;

export async function handleError(err, attemptContext): Promise<void> {
  if (err.statusCode) {
    if (err.statusCode !== rateLimitErrorCode && err.statusCode < 500) {
      attemptContext.abort();
    }
  }
}

export function getHerokuClient(config: HerokuIntegrationConfig) {
  const heroku = new Heroku({
    token: config.apiKey,
  });

  return {
    retryGet: async (route: string): Promise<any[]> => {
      return retry(async () => heroku.get(route), {
        handleError,
        delay: Math.ceil(SECONDS_PER_API_REQUEST),
        factor: 2,
        maxAttempts: 5,
      });
    },
  };
}
