import { createMockStepExecutionContext } from '@jupiterone/integration-sdk/testing';
import { v4 as uuid } from 'uuid';
import { getIdsFromJobState } from '../getIdsFromJobState';

test('should return a list of ids from jobState', async () => {
  const key1 = uuid();
  const key2 = uuid();
  const mockStepExecutionContext = createMockStepExecutionContext({
    entities: [
      {
        _class: 'class',
        _key: 'key',
        _type: 'type',
        _rawData: [
          {
            name: 'name',
            rawData: {
              id: key1,
            },
          },
        ],
      },
      {
        _class: 'class',
        _key: 'key',
        _type: 'type',
        _rawData: [
          {
            name: 'name',
            rawData: {
              id: key2,
            },
          },
        ],
      },
    ],
  });

  const response = await getIdsFromJobState(
    'type',
    mockStepExecutionContext.jobState,
  );
  expect(response).toMatchObject([key1, key2]);
});
