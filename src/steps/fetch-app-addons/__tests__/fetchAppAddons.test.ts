/* eslint-disable @typescript-eslint/camelcase */
import {
  createMockStepExecutionContext,
  setupRecording,
  Recording,
} from '@jupiterone/integration-sdk/testing';
import fetchEnterpriseAccountMembers, { createAddonEntity } from '..';
import { HerokuClient } from '../../../heroku';

import entities from './__fixtures__/entities.json';

let recording: Recording;

beforeEach(() => {
  recording = setupRecording({
    name: 'fetch-app-addons',
    directory: __dirname,
    options: {
      recordFailedRequests: true,
    },
  });
});

afterEach(() => {
  recording.stop();
});

const partialAddon = {
  app: {
    id: 'e3af0e11-ea32-475e-a36f-e20f48e83136',
    name: 'damp-falls-40058',
  },
  created_at: '2020-04-14T13:58:00Z',
  id: '2bb23a70-3da0-4a76-aa8e-31219fcc2b22',
  name: 'papertrail-solid-67022',
  state: 'provisioned',
  updated_at: '2020-04-14T13:58:03Z',
  web_url:
    'https://addons-sso.heroku.com/apps/e3af0e11-ea32-475e-a36f-e20f48e83136/addons/2bb23a70-3da0-4a76-aa8e-31219fcc2b22',
};

test('should fetch addons', async () => {
  const context = createMockStepExecutionContext({ entities });
  const heroku = new HerokuClient(context.instance.config);
  const results = await heroku.getAppAddons(entities[0].id);

  expect(results).toEqual([
    expect.objectContaining(partialAddon),
    expect.anything(),
  ]);
});

test('should convert addons to entities', () => {
  const entity = createAddonEntity(partialAddon, entities[0].id);

  expect(entity).toMatchObject({
    _class: ['Service'],
    _key: '2bb23a70-3da0-4a76-aa8e-31219fcc2b22',
    _type: 'heroku_addon',
    createdOn: 1586872680000,
    displayName: 'papertrail-solid-67022',
    id: '2bb23a70-3da0-4a76-aa8e-31219fcc2b22',
    name: 'papertrail-solid-67022',
    updatedOn: 1586872683000,
  });
});

test('should collect data during step', async () => {
  const context = createMockStepExecutionContext({ entities });
  await fetchEnterpriseAccountMembers.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(2);
  expect(context.jobState.collectedRelationships).toHaveLength(0);

  expect(context.jobState.collectedEntities).toEqual([
    expect.objectContaining({
      id: '2bb23a70-3da0-4a76-aa8e-31219fcc2b22',
    }),
    expect.objectContaining({
      id: 'd2e8f23d-ba46-47df-a002-94ff641a0747',
    }),
  ]);
});
