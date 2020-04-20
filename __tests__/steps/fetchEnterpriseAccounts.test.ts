/* eslint-disable @typescript-eslint/camelcase */
import { createMockStepExecutionContext } from '@jupiterone/integration-sdk/testing';
import { Polly } from '../../test/polly';
import { v4 as uuid } from 'uuid';
import step from '../../src/steps/fetchEnterpriseAccounts';

let polly: Polly;

const instanceConfig = {
  apiKey: 'api-key',
};

beforeEach(() => {
  polly = new Polly('api.heroku.com', {
    adapters: ['node-http'],
  });
});

afterEach(() => {
  polly.stop();
});

describe('executionHandler', () => {
  test('should add accounts returned by /enterprise-accounts', async () => {
    const responseBody = [
      {
        id: uuid(),
        name: 'name',
        created_at: 'created_at',
        updated_at: 'updated_at',
        permissions: ['1', '2'],
        trial: true,
        identity_provider: {
          id: uuid(),
          name: 'name',
          owner: {
            id: uuid(),
            name: 'name',
            type: 'type',
          },
        },
      },
    ];

    polly.server
      .get('https://api.heroku.com/enterprise-accounts')
      .intercept((req, res) => {
        res.status(200).json(responseBody);
      });

    const context = createMockStepExecutionContext({ instanceConfig });
    const addEntities = jest.spyOn(context.jobState, 'addEntities');
    const addRelationships = jest.spyOn(context.jobState, 'addRelationships');
    await step.executionHandler(context);

    expect(addEntities).toHaveBeenCalledTimes(1);
    expect(addEntities).toHaveBeenCalledWith([
      {
        _class: ['Account'],
        _key: responseBody[0].id,
        _rawData: [
          {
            name: 'default',
            rawData: {
              createdAt: 'created_at',
              id: responseBody[0].id,
              identityProviderId: responseBody[0].identity_provider.id,
              name: 'name',
              permissions: '1,2',
              trial: true,
              updatedAt: 'updated_at',
            },
          },
        ],
        _type: 'heroku_account',
        createdOn: undefined,
        displayName: 'name',
        id: responseBody[0].id,
        name: 'name',
      },
    ]);
    expect(addRelationships).not.toHaveBeenCalled();
  });

  test('should add accounts with null fields returned by /enterprise-accounts', async () => {
    const responseBody = [
      {
        id: uuid(),
        name: 'name',
        created_at: null,
        updated_at: null,
        permissions: null,
        trial: null,
        identity_provider: null,
      },
    ];

    polly.server
      .get('https://api.heroku.com/enterprise-accounts')
      .intercept((req, res) => {
        res.status(200).json(responseBody);
      });

    const context = createMockStepExecutionContext({ instanceConfig });
    const addEntities = jest.spyOn(context.jobState, 'addEntities');
    const addRelationships = jest.spyOn(context.jobState, 'addRelationships');
    await step.executionHandler(context);

    expect(addEntities).toHaveBeenCalledTimes(1);
    expect(addEntities).toHaveBeenCalledWith([
      {
        _class: ['Account'],
        _key: responseBody[0].id,
        _rawData: [
          {
            name: 'default',
            rawData: {
              createdAt: null,
              id: responseBody[0].id,
              identityProviderId: null,
              name: 'name',
              permissions: null,
              trial: null,
              updatedAt: null,
            },
          },
        ],
        _type: 'heroku_account',
        createdOn: undefined,
        displayName: 'name',
        id: responseBody[0].id,
        name: 'name',
      },
    ]);
    expect(addRelationships).not.toHaveBeenCalled();
  });

  test('should add nothing if no accounts returned by /enterprise-accounts', async () => {
    const responseBody = [];

    polly.server
      .get('https://api.heroku.com/enterprise-accounts')
      .intercept((req, res) => {
        res.status(200).json(responseBody);
      });

    const context = createMockStepExecutionContext({ instanceConfig });
    const addEntities = jest.spyOn(context.jobState, 'addEntities');
    const addRelationships = jest.spyOn(context.jobState, 'addRelationships');
    await step.executionHandler(context);

    expect(addEntities).toHaveBeenCalledTimes(1);
    expect(addEntities).toHaveBeenCalledWith([]);
    expect(addRelationships).not.toHaveBeenCalled();
  });
});
