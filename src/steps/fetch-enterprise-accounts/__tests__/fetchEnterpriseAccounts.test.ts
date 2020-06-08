/* eslint-disable @typescript-eslint/camelcase */
import {
  createMockStepExecutionContext,
  setupRecording,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import fetchEnterpriseAccount, { createAccountEntity } from '..';
import { HerokuClient } from '../../../heroku';
import { HerokuIntegrationConfig } from '../../../types';

let recording: Recording;

afterEach(() => {
  recording.stop();
});

const partialEnterpriseAccount = {
  created_at: '2012-01-01T12:00:00Z',
  id: '01234567-89ab-cdef-0123-456789abcdef',
  identity_provider: {
    id: '01234567-89ab-cdef-0123-456789abcdef',
    name: 'acme-sso',
    owner: {
      id: '01234567-89ab-cdef-0123-456789abcdef',
      name: 'acme',
      type: 'team',
    },
  },
  name: 'example',
  permissions: ['view'],
  trial: false,
  updated_at: '2012-01-01T12:00:00Z',
};

test('should fetch accounts', async () => {
  recording = setupRecording({
    name: 'add-accounts',
    directory: __dirname,
    redactedRequestHeaders: ['authorization'],
    options: {
      recordFailedRequests: true,
    },
  });

  const context = createMockStepExecutionContext<HerokuIntegrationConfig>();
  const heroku = new HerokuClient(context.instance.config);
  const results = await heroku.getEnterpriseAccounts();

  expect(results).toEqual([expect.objectContaining(partialEnterpriseAccount)]);
});

test('should convert accounts to entities', () => {
  const entity = createAccountEntity(partialEnterpriseAccount);

  expect(entity).toMatchObject({
    _class: ['Account'],
    _key: '01234567-89ab-cdef-0123-456789abcdef',
    _type: 'heroku_account',
    createdOn: 1325419200000,
    updatedOn: 1325419200000,
    displayName: 'example',
    id: '01234567-89ab-cdef-0123-456789abcdef',
    name: 'example',
  });
});

test('should collect data during step', async () => {
  recording = setupRecording({
    name: 'add-accounts',
    directory: __dirname,
    redactedRequestHeaders: ['authorization'],
  });

  const context = createMockStepExecutionContext<HerokuIntegrationConfig>();
  await fetchEnterpriseAccount.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(1);
  expect(context.jobState.collectedRelationships).toHaveLength(0);

  expect(context.jobState.collectedEntities).toEqual([
    expect.objectContaining({
      id: '01234567-89ab-cdef-0123-456789abcdef',
    }),
  ]);
});
