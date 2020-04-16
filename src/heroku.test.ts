import { handleError, getHerokuClient, retryHerokuGet } from './heroku';
import nock from 'nock';
import { retry } from '@lifeomic/attempt';

jest.useFakeTimers();

describe('handleError', () => {
  test('should sleep if statusCode == rate_limit', async () => {
    const abortFunc = jest.fn();
    const attemptContext = {
      abort: abortFunc,
    };

    const err = {
      statusCode: 429,
    };

    handleError(err, attemptContext);
    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(abortFunc).not.toHaveBeenCalled();
  });

  test('should abort if statusCode is not retryable', async () => {
    const abortFunc = jest.fn();
    const attemptContext = {
      abort: abortFunc,
    };

    const err = {
      statusCode: 401,
    };

    handleError(err, attemptContext);
    expect(setTimeout).not.toHaveBeenCalled();
    expect(abortFunc).toHaveBeenCalledTimes(1);
  });

  test('should do nothing if error is not nonRetryable', async () => {
    const abortFunc = jest.fn();
    const attemptContext = {
      abort: abortFunc,
    };

    const err = {
      statusCode: 499,
    };

    handleError(err, attemptContext);
    expect(setTimeout).not.toHaveBeenCalled();
    expect(abortFunc).not.toHaveBeenCalled();
  });

  test('should do nothing if error has no statusCode', async () => {
    const abortFunc = jest.fn();
    const attemptContext = {
      abort: abortFunc,
    };

    const err = {
      property: 'property',
    };

    handleError(err, attemptContext);
    expect(setTimeout).not.toHaveBeenCalled();
    expect(abortFunc).not.toHaveBeenCalled();
  });
});

describe('createHerokuClient', () => {
  test('should throw if client does not exist and config not passed', async () => {
    const config = {
      apiKey: 'my-api-key',
    };

    expect(() => getHerokuClient()).toThrow(
      'Cannot get heroku client; client has not been initialized!',
    );
  });

  test('should create client if none exists', async () => {
    const config = {
      apiKey: 'my-api-key',
    };

    const client = getHerokuClient(config);
    expect(client).toBeTruthy();
  });
});

describe('retryHerokuGet', () => {
  test('should return if no exception is thrown', async () => {
    const mockRoute = '/account';
    const mockResponseBody = {
      name: 'name',
    };
    nock('https://api.heroku.com').get(mockRoute).reply(200, mockResponseBody);

    const response = await retryHerokuGet(mockRoute);
    expect(response).toMatchObject(mockResponseBody);
  });

  test('should handle error if exception is thrown', async () => {
    const mockRoute = '/account';
    const mockResponseBody = {
      name: 'name',
    };
    nock('https://api.heroku.com').get(mockRoute).reply(404, mockResponseBody);

    await expect(retryHerokuGet(mockRoute)).rejects.toThrow(
      'Expected response to be successful, got 404',
    );
  });
});
