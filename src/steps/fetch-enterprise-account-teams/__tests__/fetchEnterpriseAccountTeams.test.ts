/* eslint-disable @typescript-eslint/camelcase */
import {
  createMockStepExecutionContext,
  setupRecording,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import fetchEnterpriseAccountTeams, { createTeamEntity } from '..';
import { HerokuClient } from '../../../heroku';

import entities from './__fixtures__/entities.json';
import { HerokuIntegrationConfig } from '../../../types';

let recording: Recording;

afterEach(() => {
  recording.stop();
});

const partialTeam = {
  id: '01234567-89ab-cdef-0123-456789abcdef',
  created_at: '2012-01-01T12:00:00Z',
  credit_card_collections: true,
  default: true,
  enterprise_account: {
    id: '01234567-89ab-cdef-0123-456789abcdef',
    name: 'example',
  },
  identity_provider: {
    id: '01234567-89ab-cdef-0123-456789abcdef',
    slug: 'acme-sso',
  },
  membership_limit: 25,
  name: 'example',
  provisioned_licenses: true,
  role: 'admin',
  type: 'team',
  updated_at: '2012-01-01T12:00:00Z',
};

test('should fetch teams', async () => {
  recording = setupRecording({
    name: 'add-teams',
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
  const results = await heroku.getEnterpriseAccountTeams(entities[0].id);

  expect(results).toEqual([partialTeam]);
});

test('should convert accounts to entities', () => {
  const entity = createTeamEntity(partialTeam, entities[0].id);

  expect(entity).toMatchObject({
    _class: ['Team'],
    _key: '01234567-89ab-cdef-0123-456789abcdef',
    _type: 'heroku_team',
    createdOn: 1325419200000,
    updatedOn: 1325419200000,
    displayName: 'example',
    id: '01234567-89ab-cdef-0123-456789abcdef',
    name: 'example',
    enterpriseAccountId: entities[0].id,
  });
});

test('should collect data during step', async () => {
  recording = setupRecording({
    name: 'add-teams',
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
  await fetchEnterpriseAccountTeams.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(1);
  expect(context.jobState.collectedRelationships).toHaveLength(0);

  expect(context.jobState.collectedEntities).toEqual([
    expect.objectContaining({
      id: '01234567-89ab-cdef-0123-456789abcdef',
    }),
  ]);
});
