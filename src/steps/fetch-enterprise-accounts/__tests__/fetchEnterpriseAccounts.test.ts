import {
  createMockStepExecutionContext,
  setupRecording,
  Recording,
} from '@jupiterone/integration-sdk/testing';
import step from '..';

let recording: Recording;

afterEach(() => {
  recording.stop();
});

describe('executionHandler', () => {
  test('should add accounts returned by /enterprise-accounts', async () => {
    recording = setupRecording({
      name: 'add-accounts',
      directory: __dirname,
      redactedRequestHeaders: ['authorization'],
    });

    const context = createMockStepExecutionContext();
    await step.executionHandler(context);

    expect(context.jobState.collectedEntities).toEqual([
      expect.objectContaining({
        _class: ['Account'],
        _key: '01234567-89ab-cdef-0123-456789abcdef',
        _type: 'heroku_account',
        createdOn: 1325419200000,
        displayName: 'example',
        id: '01234567-89ab-cdef-0123-456789abcdef',
        name: 'example',
      }),
    ]);

    expect(context.jobState.collectedRelationships).toEqual([]);
  });

  test('should add nothing if no accounts returned by /enterprise-accounts', async () => {
    recording = setupRecording({
      name: 'no-accounts',
      directory: __dirname,
      redactedRequestHeaders: ['authorization'],
    });

    const context = createMockStepExecutionContext();
    await step.executionHandler(context);

    expect(context.jobState.collectedEntities).toEqual([]);
    expect(context.jobState.collectedRelationships).toEqual([]);
  });
});
