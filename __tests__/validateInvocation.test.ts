import { Polly } from '@pollyjs/core';
import NodeHTTPAdapter = require('@pollyjs/adapter-node-http');
import validateInvocation from '../src/validateInvocation';
import { createMockExecutionContext } from '@jupiterone/integration-sdk/testing';

const context = createMockExecutionContext({
  instanceConfig: {
    apiKey: 'api-key',
  },
});

Polly.register(NodeHTTPAdapter);
let polly: Polly;

beforeEach(() => {
  polly = new Polly('api.heroku.com', {
    adapters: ['node-http'],
  });
});

afterEach(() => {
  polly.stop();
});

describe('validateInvocation', () => {
  test('should validate if heroku call passes', async () => {
    polly.server
      .get('https://api.heroku.com/account')
      .intercept((req, res) => res.status(200).json({}));
    await expect(() => validateInvocation(context)).not.toThrow();
  });

  test('should throw if heroku call fails', async () => {
    polly.server
      .get('https://api.heroku.com/account')
      .intercept((req, res) => res.status(401).json({}));
    await expect(validateInvocation(context)).rejects.toThrow(
      'Failed to authenticate with provided credentials',
    );
  });
});
