/* eslint-disable @typescript-eslint/camelcase */
import {
  createMockStepExecutionContext,
  setupRecording,
  Recording,
} from '@jupiterone/integration-sdk/testing';
import fetchEnterpriseAccountMembers, { createAccountMemberEntity } from '..';
import { HerokuClient } from '../../../heroku';

import entities from './__fixtures__/entities.json';

let recording: Recording;

afterEach(() => {
  recording.stop();
});

const partialMember = {
  enterprise_account: {
    id: '01234567-89ab-cdef-0123-456789abcdef',
    name: 'example',
  },
  id: '01234567-89ab-cdef-0123-456789abcdef',
  permissions: [
    { description: 'View enterprise account members and teams.', name: 'view' },
  ],
  user: {
    email: 'username@example.com',
    id: '01234567-89ab-cdef-0123-456789abcdef',
  },
  two_factor_authentication: true,
  identity_provider: {
    id: '01234567-89ab-cdef-0123-456789abcdef',
    name: 'acme',
    redacted: false,
    owner: {
      id: '01234567-89ab-cdef-0123-456789abcdef',
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

  const context = createMockStepExecutionContext({ entities });
  const heroku = new HerokuClient(context.instance.config);
  const results = await heroku.getEnterpriseAccountMembers(entities[0].id);

  expect(results).toEqual([partialMember]);
});

test('should convert members to entities', () => {
  const entity = createAccountMemberEntity(partialMember, entities[0].id);

  expect(entity).toMatchObject({
    _class: ['User'],
    _key: '01234567-89ab-cdef-0123-456789abcdef',
    _type: 'heroku_account_member',
    createdOn: undefined,
    updatedOn: undefined,
    displayName: 'username@example.com',
    id: '01234567-89ab-cdef-0123-456789abcdef',
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

  const context = createMockStepExecutionContext({ entities });
  await fetchEnterpriseAccountMembers.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(1);
  expect(context.jobState.collectedRelationships).toHaveLength(0);

  expect(context.jobState.collectedEntities).toEqual([
    expect.objectContaining({
      id: '01234567-89ab-cdef-0123-456789abcdef',
    }),
  ]);
});
