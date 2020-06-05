import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';

import step from '..';

import entities from './__fixtures__/entities.json';
import { HerokuIntegrationConfig } from '../../../types';

test('should create account-team relationship', async () => {
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
      _fromEntityKey: 'account-id',
      _key: 'account-id|has|user-id',
      _toEntityKey: 'user-id',
      _type: 'heroku_account_has_member',
      displayName: 'HAS',
    }),
  ]);
});
