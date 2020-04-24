import {
  createMockStepExecutionContext,
  setupRecording,
} from '@jupiterone/integration-sdk/testing';

import step from '..';

import entities from './__fixtures__/entities.json';

test('should create team-member relationship', async () => {
  const recording = setupRecording({
    name: 'map-team-to-member',
    directory: __dirname,
    redactedRequestHeaders: ['authorization'],
    options: {
      recordFailedRequests: true,
    },
  });

  const context = createMockStepExecutionContext({ entities });
  await step.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(0);
  expect(context.jobState.collectedRelationships).toHaveLength(2);

  expect(context.jobState.collectedRelationships).toEqual([
    expect.objectContaining({
      _class: 'HAS',
      _fromEntityKey: '1e2fd576-c276-483d-8440-3c956e0fe015',
      _key:
        '1e2fd576-c276-483d-8440-3c956e0fe015|has|2372b250-7a66-49db-88f6-14052ae638cc',
      _toEntityKey: '2372b250-7a66-49db-88f6-14052ae638cc',
      _type: 'heroku_team_has_account_member',
      displayName: 'HAS',
      role: 'member',
    }),
    expect.objectContaining({
      _class: 'HAS',
      _fromEntityKey: '1e2fd576-c276-483d-8440-3c956e0fe015',
      _key:
        '1e2fd576-c276-483d-8440-3c956e0fe015|has|fdc6ef12-ed55-44b7-83a9-09b1a9c35ea8',
      _toEntityKey: 'fdc6ef12-ed55-44b7-83a9-09b1a9c35ea8',
      _type: 'heroku_team_has_account_member',
      displayName: 'HAS',
      role: 'admin',
    }),
  ]);
  recording.stop();
});
