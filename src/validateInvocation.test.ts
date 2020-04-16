import validateInvocation from './validateInvocation';
import { mockLogger } from '../test/logging';
import nock from 'nock';

const context = {
  instance: {
    config: {
      apiKey: 'api-key',
    },
    id: 'id',
    accountId: 'accountId',
    name: 'name',
    integrationDefinitionId: 'integrationDefinitionId',
  },
  logger: mockLogger,
  jobState: null,
};

function mockHerokuApi(response: number): void {
  const validationRoute = '/account';
  const validationBody = {};
  nock('https://api.heroku.com')
    .get(validationRoute)
    .reply(response, validationBody);
}

describe('validateInvocation', () => {
  test('should validate if heroku call passes', async () => {
    mockHerokuApi(200);
    await expect(() => validateInvocation(context)).not.toThrow();
  });

  test('should throw if heroku call fails', async () => {
    mockHerokuApi(404);
    await expect(validateInvocation(context)).rejects.toThrow(
      'Failed to authenticate with provided credentials',
    );
  });
});
