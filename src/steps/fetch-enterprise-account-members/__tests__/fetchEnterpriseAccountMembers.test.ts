/* eslint-disable @typescript-eslint/camelcase */
import {
  createMockStepExecutionContext,
  setupRecording,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import fetchEnterpriseAccountMembers, { createAccountMemberEntity } from '..';
import { HerokuClient } from '../../../heroku';

import entities from './__fixtures__/entities.json';
import { HerokuIntegrationConfig } from '../../../types';

let recording: Recording;

afterEach(() => {
  recording.stop();
});

const partialMember = {
  enterprise_account: {
    id: 'enterprise-account-id-0000-0000-0000',
    name: 'example',
  },
  id: 'member-id-0000-0000-0000',
  permissions: [
    { description: 'View enterprise account members and teams.', name: 'view' },
  ],
  user: {
    email: 'username@example.com',
    id: 'user-id-0000-0000-0000',
  },
  two_factor_authentication: true,
  identity_provider: {
    id: 'identity-provider-id-0000-0000-0000',
    name: 'acme',
    redacted: false,
    owner: {
      id: 'owner-id-0000-0000-0000',
      name: 'acme',
      type: 'team',
    },
  },
};

test('should fetch members', async () => {
  recording = setupRecording({
    name: 'add-members',
    directory: __dirname,
    redactedRequestHeaders: ['authorization'],
    options: {
      recordFailedRequests: true,
    },
  });

  const context = createMockStepExecutionContext({
    entities,
    instanceConfig: {} as HerokuIntegrationConfig,
  });
  const heroku = new HerokuClient(context.instance.config);
  const results = await heroku.getEnterpriseAccountMembers(entities[0].id);

  expect(results).toEqual([partialMember]);
});

test('should convert members to entities', () => {
  const entity = createAccountMemberEntity(partialMember, entities[0].id);

  expect(entity).toMatchObject({
    _class: ['User'],
    _key: 'user-id-0000-0000-0000',
    _type: 'heroku_account_member',
    createdOn: undefined,
    updatedOn: undefined,
    displayName: 'username@example.com',
    id: 'user-id-0000-0000-0000',
    name: 'username@example.com',
    enterpriseAccountId: entities[0].id,
  });
});

test('should collect data during step', async () => {
  recording = setupRecording({
    name: 'add-members',
    directory: __dirname,
    redactedRequestHeaders: ['authorization'],
    options: {
      recordFailedRequests: true,
    },
  });

  const context = createMockStepExecutionContext({
    entities,
    instanceConfig: {} as HerokuIntegrationConfig,
  });
  await fetchEnterpriseAccountMembers.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(1);
  expect(context.jobState.collectedRelationships).toHaveLength(0);

  expect(context.jobState.collectedEntities).toEqual([
    expect.objectContaining({
      id: 'user-id-0000-0000-0000',
    }),
  ]);
});
