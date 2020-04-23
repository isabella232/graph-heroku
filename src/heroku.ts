import Heroku from 'heroku-client';
import { retry } from '@lifeomic/attempt';
import {
  HerokuEnterpriseAccount,
  HerokuEnterpriseAccountTeam,
  HerokuEnterpriseAccountMember,
  HerokuUser,
} from './types/herokuTypes';

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

export class HerokuClient {
  heroku: Heroku;

  constructor(config: HerokuIntegrationConfig) {
    this.heroku = new Heroku({
      token: config.apiKey,
    });
  }

  retryGet(route: string): Promise<object[]> {
    return retry(async () => this.heroku.get(route), {
      handleError,
      delay: Math.ceil(SECONDS_PER_API_REQUEST),
      factor: 2,
      maxAttempts: 5,
    });
  }

  getEnterpriseAccounts(): Promise<HerokuEnterpriseAccount[]> {
    return this.retryGet('/enterprise-accounts');
  }

  getEnterpriseAccountTeams(
    enterpriseAccountId: string,
  ): Promise<HerokuEnterpriseAccountTeam[]> {
    return this.retryGet(`/enterprise-accounts/${enterpriseAccountId}/teams`);
  }

  getEnterpriseAccountMembers(
    enterpriseAccountId: string,
  ): Promise<HerokuEnterpriseAccountMember[]> {
    return this.retryGet(`/enterprise-accounts/${enterpriseAccountId}/members`);
  }

  getUser(userId: string): Promise<HerokuUser[]> {
    return this.retryGet(`/users/${userId}`);
  }
}
