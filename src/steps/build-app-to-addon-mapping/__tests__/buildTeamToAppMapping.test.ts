import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';

import step from '..';

import entities from './__fixtures__/entities.json';
import { HerokuIntegrationConfig } from '../../../types';

test('should create team-application relationship', async () => {
  const context = createMockStepExecutionContext({
    entities,
    instanceConfig: {} as HerokuIntegrationConfig,
  });
  await step.executionHandler(context);

  expect(context.jobState.collectedEntities).toHaveLength(0);
  expect(context.jobState.collectedRelationships).toHaveLength(1);

  expect(context.jobState.collectedRelationships).toEqual([
    expect.objectContaining({
      _class: 'HAS',
      _fromEntityKey: 'e3af0e11-ea32-475e-a36f-e20f48e83136',
      _key:
        'e3af0e11-ea32-475e-a36f-e20f48e83136|has|2bb23a70-3da0-4a76-aa8e-31219fcc2b22',
      _toEntityKey: '2bb23a70-3da0-4a76-aa8e-31219fcc2b22',
      _type: 'heroku_application_has_addon',
      displayName: 'HAS',
    }),
  ]);
});
