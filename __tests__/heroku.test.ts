import { handleError, HerokuClient } from '../src/heroku';
import { setupRecording } from '@jupiterone/integration-sdk/testing';

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
    expect(abortFunc).not.toHaveBeenCalled();
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

    const response = await heroku.retryGet(retryRoute);
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

    await expect(heroku.retryGet(retryRoute)).rejects.toThrow(
      'Expected response to be successful, got 401',
    );
    recording.stop();
  });
});
