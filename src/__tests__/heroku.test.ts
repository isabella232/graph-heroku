import { createRequestError, HerokuClient, routeToEndpoint } from '../heroku';
import { setupRecording } from '@jupiterone/integration-sdk-testing';
import {
  IntegrationProviderAPIError,
  IntegrationProviderAuthorizationError,
} from '@jupiterone/integration-sdk-core';
import { HerokuClientError } from '../types';

describe('#createRequestError', () => {
  test('should return IntegrationProviderAuthorizationError if 403', async () => {
    const originalError = new Error('mock error');
    const endpoint = routeToEndpoint('/enterprise-accounts');

    const herokuClientError: HerokuClientError = {
      statusCode: 403,
      body: {
        id: 'forbidden',
        message:
          'The scope of this OAuth authorization does not allow access to this resource.',
      },
    };

    expect(createRequestError(endpoint, herokuClientError)).toEqual(
      new IntegrationProviderAuthorizationError({
        cause: originalError,
        endpoint,
        status: herokuClientError.statusCode,
        statusText: herokuClientError.body.message,
      }),
    );
  });

  test('should return IntegrationProviderAPIError if non-403', async () => {
    const endpoint = routeToEndpoint('/enterprise-accounts');

    const herokuClientError: HerokuClientError = {
      statusCode: 500,
      body: {
        id: 'some-server-error',
        message: 'some server error',
      },
    };

    expect(createRequestError(endpoint, herokuClientError)).toEqual(
      new IntegrationProviderAPIError({
        code: 'UNKNOWN_HEROKU_API_ERROR',
        endpoint,
        status: herokuClientError.statusCode,
        statusText: herokuClientError.body.message,
        fatal: false,
      }),
    );
  });
});

describe('heroku.retryGet', () => {
  test('should return if no exception is thrown', async () => {
    const heroku = new HerokuClient({ apiKey: 'api-key' });
    const retryRoute = '/account';

    const recording = setupRecording({
      name: 'heroku-get-return',
      directory: __dirname,
      redactedRequestHeaders: ['authorization'],
    });

    const response = await heroku.request(retryRoute);
    expect(response).toMatchObject({ name: 'Nick Dowmon' });
    recording.stop();
  });

  test('should handle error if exception is thrown', async () => {
    const heroku = new HerokuClient({ apiKey: 'api-key ' });
    const retryRoute = '/account';

    const recording = setupRecording({
      name: 'heroku-get-throw',
      directory: __dirname,
      redactedRequestHeaders: ['authorization'],
    });

    await expect(heroku.request(retryRoute)).rejects.toThrow(
      'Provider API failed at https://api.heroku.com/account: 401 Invalid credentials provided.',
    );
    recording.stop();
  });
});
