/* eslint-disable @typescript-eslint/camelcase */
import {
  createMockStepExecutionContext,
  setupRecording,
  Recording,
} from '@jupiterone/integration-sdk/testing';
import fetchEnterpriseAccountMembers, { createApplicationEntity } from '..';
import { HerokuClient } from '../../../heroku';

import entities from './__fixtures__/entities.json';

let recording: Recording;

beforeEach(() => {
  recording = setupRecording({
    name: 'fetch-team-apps',
    directory: __dirname,
    redactedRequestHeaders: ['authorization'],
    options: {
      recordFailedRequests: true,
    },
  });
});

afterEach(() => {
  recording.stop();
});

const partialApp = {
  acm: true,
  created_at: '2020-04-24T17:53:13Z',
  git_url: 'https://git.heroku.com/ndowmon-gmail-test-app.git',
  id: '2a089907-da73-49d6-b569-5f4a89c65ba9',
  name: 'ndowmon-gmail-test-app',
  organization: {
    id: '1e2fd576-c276-483d-8440-3c956e0fe015',
    name: 'ndowmon-lifeomic-test',
  },
  owner: {
    email: 'ndowmon-lifeomic-test@herokumanager.com',
    id: '1e2fd576-c276-483d-8440-3c956e0fe015',
  },
  region: {
    id: '59accabd-516d-4f0e-83e6-6e3757701145',
    name: 'us',
  },
  released_at: '2020-04-24T17:53:13Z',
  updated_at: '2020-04-24T18:18:26Z',
  web_url: 'https://ndowmon-gmail-test-app.herokuapp.com/',
};

test('should fetch members', async () => {
  const context = createMockStepExecutionContext({ entities });
  const heroku = new HerokuClient(context.instance.config);
  const results = await heroku.getTeamApps(entities[0].id);

  expect(results).toEqual([
    expect.objectContaining(partialApp),
    expect.objectContaining({
      acm: true,
      created_at: '2020-04-14T13:23:01Z',
      git_url: 'https://git.heroku.com/damp-falls-40058.git',
      id: 'e3af0e11-ea32-475e-a36f-e20f48e83136',
      name: 'damp-falls-40058',
      organization: {
        id: '1e2fd576-c276-483d-8440-3c956e0fe015',
        name: 'ndowmon-lifeomic-test',
      },
      owner: {
        email: 'ndowmon-lifeomic-test@herokumanager.com',
        id: '1e2fd576-c276-483d-8440-3c956e0fe015',
      },
      region: {
        id: '59accabd-516d-4f0e-83e6-6e3757701145',
        name: 'us',
      },
      released_at: '2020-04-14T15:27:24Z',
      updated_at: '2020-04-24T17:40:37Z',
      web_url: 'https://damp-falls-40058.herokuapp.com/',
    }),
  ]);
});

test('should convert members to entities', () => {
  const entity = createApplicationEntity(partialApp, entities[0].id);

  expect(entity).toMatchObject({
    _class: ['Application'],
    _key: '2a089907-da73-49d6-b569-5f4a89c65ba9',
    _type: 'heroku_application',
    createdOn: 1587750793000,
    displayName: 'ndowmon-gmail-test-app',
    id: '2a089907-da73-49d6-b569-5f4a89c65ba9',
    name: 'ndowmon-gmail-test-app',
    updatedOn: 1587752306000,
  });
});

test('should collect data during step', async () => {
  const context = createMockStepExecutionContext({ entities });
  await fetchEnterpriseAccountMembers.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(2);
  expect(context.jobState.collectedRelationships).toHaveLength(0);

  expect(context.jobState.collectedEntities).toEqual([
    expect.objectContaining({
      id: '2a089907-da73-49d6-b569-5f4a89c65ba9',
    }),
    expect.objectContaining({
      id: 'e3af0e11-ea32-475e-a36f-e20f48e83136',
    }),
  ]);
});
