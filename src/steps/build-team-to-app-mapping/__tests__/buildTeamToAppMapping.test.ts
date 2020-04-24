import { createMockStepExecutionContext } from '@jupiterone/integration-sdk/testing';

import step from '..';

import entities from './__fixtures__/entities.json';

test('should create team-application relationship', async () => {
  const context = createMockStepExecutionContext({ entities });
  await step.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(0);
  expect(context.jobState.collectedRelationships).toHaveLength(1);

  expect(context.jobState.collectedRelationships).toEqual([
    expect.objectContaining({
      _class: 'OWNS',
      _fromEntityKey: '1e2fd576-c276-483d-8440-3c956e0fe015',
      _key:
        '1e2fd576-c276-483d-8440-3c956e0fe015|owns|2a089907-da73-49d6-b569-5f4a89c65ba9',
      _toEntityKey: '2a089907-da73-49d6-b569-5f4a89c65ba9',
      _type: 'heroku_team_owns_application',
      displayName: 'OWNS',
    }),
  ]);
});
