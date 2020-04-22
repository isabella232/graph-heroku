/* eslint-disable @typescript-eslint/camelcase */
import {
  createMockStepExecutionContext,
  Recording,
  setupRecording,
} from '@jupiterone/integration-sdk/testing';

import step from '../../src/steps/fetchUsers';
import { makeMockEntitiesWithIds } from '../../test/helpers/makeMockEntitiesWithIds';

let recording: Recording;

afterEach(() => {
  recording.stop();
});

describe('executionHandler', () => {
  describe('no accounts or teams', () => {
    test(`should add nothing if no teams or accounts returned from jobState`, async () => {
      // this test should not attempt to call an API.
      recording = setupRecording({
        name: 'INVALID_RECORDING',
        directory: __dirname,
        redactedRequestHeaders: ['authorization'],
      });
      const context = createMockStepExecutionContext();
      await step.executionHandler(context);

      expect(context.jobState.collectedEntities).toMatchObject([]);
      expect(context.jobState.collectedRelationships).toMatchObject([]);
    });
  });

  describe('/teams/:teamId/members', () => {
    test(`should add members returned by /users/:userId`, async () => {
      recording = setupRecording({
        name: 'team-member-add',
        directory: __dirname,
        redactedRequestHeaders: ['authorization'],
      });
      const teamId = '1e2fd576-c276-483d-8440-3c956e0fe015';

      const entities = makeMockEntitiesWithIds([
        { _type: 'heroku_team', id: teamId },
      ]);
      const context = createMockStepExecutionContext({ entities });
      await step.executionHandler(context);

      expect(context.jobState.collectedEntities).toMatchObject([
        // abridged member (/users/:userId returns 404)
        expect.objectContaining({
          _class: ['User'],
          _key: '2372b250-7a66-49db-88f6-14052ae638cc',
          _type: 'heroku_user',
          createdOn: undefined,
          displayName: 'Nick Dowmon',
          email: 'ndowmon@gmail.com',
          id: '2372b250-7a66-49db-88f6-14052ae638cc',
          name: 'Nick Dowmon',
          username: 'ndowmon@gmail.com',
        }),
        // full member (/users/:userId returns 200)
        expect.objectContaining({
          _class: ['User'],
          _key: 'fdc6ef12-ed55-44b7-83a9-09b1a9c35ea8',
          _type: 'heroku_user',
          createdOn: 1586812116000,
          displayName: 'Nick Dowmon',
          email: 'nick.dowmon@lifeomic.com',
          id: 'fdc6ef12-ed55-44b7-83a9-09b1a9c35ea8',
          name: 'Nick Dowmon',
          username: 'nick.dowmon@lifeomic.com',
        }),
      ]);
      expect(context.jobState.collectedRelationships).toMatchObject([
        expect.objectContaining({
          _class: 'HAS',
          _fromEntityKey: teamId,
          _toEntityKey: '2372b250-7a66-49db-88f6-14052ae638cc',
          _type: 'heroku_team_has_user',
          displayName: 'HAS',
          role: 'member',
        }),
        expect.objectContaining({
          _class: 'HAS',
          _fromEntityKey: teamId,
          _toEntityKey: 'fdc6ef12-ed55-44b7-83a9-09b1a9c35ea8',
          _type: 'heroku_team_has_user',
          displayName: 'HAS',
          role: 'admin',
        }),
      ]);
    });
  });

  describe('/enterprise-account/:accountId/members', () => {
    test(`should add members returned by /users/:userId`, async () => {
      recording = setupRecording({
        name: 'account-member-add',
        directory: __dirname,
        redactedRequestHeaders: ['authorization'],
      });
      const accountId = '01234567-89ab-cdef-0123-456789abcdef';

      const entities = makeMockEntitiesWithIds([
        { _type: 'heroku_account', id: accountId },
      ]);
      const context = createMockStepExecutionContext({ entities });
      await step.executionHandler(context);

      expect(context.jobState.collectedEntities).toMatchObject([
        expect.objectContaining({
          _class: ['User'],
          _key: '01234567-89ab-cdef-0123-456789abcdef',
          _type: 'heroku_user',
          createdOn: undefined,
          displayName: 'username@example.com',
          email: 'username@example.com',
          id: '01234567-89ab-cdef-0123-456789abcdef',
          name: 'username@example.com',
          username: 'username@example.com',
        }),
      ]);
      expect(context.jobState.collectedRelationships).toMatchObject([
        expect.objectContaining({
          _class: 'HAS',
          _fromEntityKey: accountId,
          _toEntityKey: '01234567-89ab-cdef-0123-456789abcdef',
          _type: 'heroku_account_has_user',
          displayName: 'HAS',
          permissions:
            '[{"description":"Viewenterpriseaccountmembersandteams.","name":"view"}]',
        }),
      ]);
    });
  });
});
