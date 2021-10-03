import validateInvocation from '../validateInvocation';
import {
  createMockExecutionContext,
  Recording,
  setupRecording,
} from '@jupiterone/integration-sdk-testing';
import { HerokuIntegrationConfig } from '../types';

const context = createMockExecutionContext<HerokuIntegrationConfig>();

let recording: Recording;

afterEach(() => {
  recording.stop();
});

describe('validateInvocation', () => {
  test('should validate if heroku call passes', async () => {
    recording = setupRecording({
      name: 'validate-invocation-pass',
      directory: __dirname,
      redactedRequestHeaders: ['authorization'],
    });

    const response = await validateInvocation(context);
    expect(response).toBe(undefined);
  });

  test('should throw if heroku call fails', async () => {
    recording = setupRecording({
      name: 'validate-invocation-fail',
      directory: __dirname,
      redactedRequestHeaders: ['authorization'],
    });

    await expect(validateInvocation(context)).rejects.toThrow(
      'Provider API failed at https://api.heroku.com/account: 401 Invalid credentials provided.',
    );
  });
});
