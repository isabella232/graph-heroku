import {
  createMockStepExecutionContext,
  Recording,
  setupRecording,
} from '@jupiterone/integration-sdk/testing';
import step from '../../src/steps/fetchTeams';

let recording: Recording;

afterEach(() => {
  recording.stop();
});

describe('executionHandler', () => {
  test('should add teams-with-enterpriseAccount returned by /teams', async () => {
    recording = setupRecording({
      name: 'teams-with-enterpriseAccount',
      directory: __dirname,
      redactedRequestHeaders: ['authorization'],
    });

    const context = createMockStepExecutionContext();
    await step.executionHandler(context);

    expect(context.jobState.collectedEntities).toEqual([
      expect.objectContaining({
        _class: ['Team'],
        _key: '1e2fd576-c276-483d-8440-3c956e0fe015',
        _type: 'heroku_team',
        createdOn: 1586992452000,
        displayName: 'ndowmon-lifeomic-test',
        id: '1e2fd576-c276-483d-8440-3c956e0fe015',
        name: 'ndowmon-lifeomic-test',
      }),
    ]);

    expect(context.jobState.collectedRelationships).toEqual([
      {
        _class: 'HAS',
        _fromEntityKey: '01234567-89ab-cdef-0123-456789abcdef',
        _key:
          '01234567-89ab-cdef-0123-456789abcdef|has|1e2fd576-c276-483d-8440-3c956e0fe015',
        _toEntityKey: '1e2fd576-c276-483d-8440-3c956e0fe015',
        _type: 'heroku_account_has_team',
        displayName: 'HAS',
      },
    ]);
  });

  test('should add teams-without-enterpriseAccount returned by /teams', async () => {
    recording = setupRecording({
      name: 'teams-without-enterpriseAccount',
      directory: __dirname,
      redactedRequestHeaders: ['authorization'],
    });

    const context = createMockStepExecutionContext();
    await step.executionHandler(context);

    expect(context.jobState.collectedEntities).toEqual([
      expect.objectContaining({
        _class: ['Team'],
        _key: '1e2fd576-c276-483d-8440-3c956e0fe015',
        _type: 'heroku_team',
        createdOn: 1586992452000,
        displayName: 'ndowmon-lifeomic-test',
        id: '1e2fd576-c276-483d-8440-3c956e0fe015',
        name: 'ndowmon-lifeomic-test',
      }),
    ]);
    expect(context.jobState.collectedRelationships).toEqual([]);
  });

  test('should add nothing if no-teams-returned by /teams', async () => {
    recording = setupRecording({
      name: 'no-teams',
      directory: __dirname,
      redactedRequestHeaders: ['authorization'],
    });

    const context = createMockStepExecutionContext();
    await step.executionHandler(context);

    expect(context.jobState.collectedEntities).toEqual([]);
    expect(context.jobState.collectedRelationships).toEqual([]);
  });
});
