import { Polly } from '@pollyjs/core';
import NodeHTTPAdapter = require('@pollyjs/adapter-node-http');
import { handleError, HerokuClient } from '../src/heroku';

Polly.register(NodeHTTPAdapter);
let polly: Polly;

jest.useFakeTimers();

beforeEach(() => {
  polly = new Polly('api.heroku.com', {
    adapters: ['node-http'],
  });
});

afterEach(() => {
  polly.stop();
});

describe('handleError', () => {
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
      statusCode: 500,
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

describe('heroku.retryGet', () => {
  test('should return if no exception is thrown', async () => {
    const heroku = new HerokuClient({ apiKey: 'api-key ' });
    const mockRoute = '/account';
    const mockResponseBody = {
      name: 'name',
    };

    polly.server
      .get(`https://api.heroku.com${mockRoute}`)
      .intercept((req, res) => res.status(200).json(mockResponseBody));

    const response = await heroku.retryGet(mockRoute);
    expect(response).toMatchObject(mockResponseBody);
  });

  test('should handle error if exception is thrown', async () => {
    const heroku = new HerokuClient({ apiKey: 'api-key ' });
    const mockRoute = '/account';

    polly.server
      .get(`https://api.heroku.com${mockRoute}`)
      .intercept((req, res) => res.status(401).json({}));

    await expect(heroku.retryGet(mockRoute)).rejects.toThrow(
      'Expected response to be successful, got 401',
    );
  });
});
