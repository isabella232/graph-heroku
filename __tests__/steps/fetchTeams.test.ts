/* eslint-disable @typescript-eslint/camelcase */
import { createMockStepExecutionContext } from '@jupiterone/integration-sdk/testing';
import { Polly } from '../../test/polly';
import { v4 as uuid } from 'uuid';
import step from '../../src/steps/fetchTeams';

const instanceConfig = {
  apiKey: 'api-key',
};

let polly: Polly;

beforeEach(() => {
  polly = new Polly('api.heroku.com', {
    adapters: ['node-http'],
  });
});

afterEach(() => {
  polly.stop();
});

describe('executionHandler', () => {
  test('should add teams returned by /teams', async () => {
    const responseBody = [
      {
        id: uuid(),
        name: 'name',
        created_at: 'created_at',
        updated_at: 'updated_at',
        default: true,
        credit_card_collections: true,
        enterprise_account: {
          id: uuid(),
          name: 'enterprise_account_name',
        },
        membership_limit: 100,
        identity_provider: {
          id: uuid(),
          name: 'name',
          owner: {
            id: uuid(),
            name: 'name',
            type: 'type',
          },
        },
        provisioned_licenses: true,
        role: 'role',
        type: 'type',
      },
    ];

    polly.server
      .get('https://api.heroku.com/teams')
      .intercept((req, res) => res.status(200).json(responseBody));

    const context = createMockStepExecutionContext({ instanceConfig });
    await step.executionHandler(context);

    expect(context.jobState.collectedEntities).toMatchObject([
      {
        _class: ['Team'],
        _key: responseBody[0].id,
        _rawData: [
          {
            name: 'default',
            rawData: {
              createdAt: 'created_at',
              creditCardCollections: true,
              default: true,
              enterpriseAccountId: responseBody[0].enterprise_account.id,
              id: responseBody[0].id,
              identityProviderId: responseBody[0].identity_provider.id,
              membershipLimit: 100,
              name: 'name',
              provisionedLicenses: true,
              type: 'type',
              role: 'role',
              updatedAt: 'updated_at',
            },
          },
        ],
        _type: 'heroku_team',
        createdOn: undefined,
        displayName: 'name',
        id: responseBody[0].id,
        name: 'name',
      },
    ]);

    expect(context.jobState.collectedRelationships).toMatchObject([
      {
        _class: 'HAS',
        _fromEntityKey: responseBody[0].enterprise_account.id,
        _key: `${responseBody[0].enterprise_account.id}|has|${responseBody[0].id}`,
        _toEntityKey: responseBody[0].id,
        _type: 'heroku_account_has_team',
        displayName: 'HAS',
      },
    ]);
  });

  test('should add teams with null fields returned by /teams', async () => {
    const responseBody = [
      {
        id: uuid(),
        name: 'name',
        created_at: null,
        updated_at: null,
        default: null,
        credit_card_collections: null,
        enterprise_account: null,
        membership_limit: null,
        identity_provider: null,
        provisioned_licenses: null,
        role: null,
        type: null,
      },
    ];

    polly.server
      .get('https://api.heroku.com/teams')
      .intercept((req, res) => res.status(200).json(responseBody));

    const context = createMockStepExecutionContext({ instanceConfig });
    await step.executionHandler(context);

    expect(context.jobState.collectedEntities).toMatchObject([
      {
        _class: ['Team'],
        _key: responseBody[0].id,
        _rawData: [
          {
            name: 'default',
            rawData: {
              createdAt: null,
              creditCardCollections: null,
              default: null,
              enterpriseAccountId: null,
              id: responseBody[0].id,
              identityProviderId: null,
              membershipLimit: null,
              name: 'name',
              provisionedLicenses: null,
              type: null,
              role: null,
              updatedAt: null,
            },
          },
        ],
        _type: 'heroku_team',
        createdOn: undefined,
        displayName: 'name',
        id: responseBody[0].id,
        name: 'name',
      },
    ]);
    expect(context.jobState.collectedRelationships).toMatchObject([]);
  });

  test('should add nothing if no teams returned by /teams', async () => {
    const responseBody = [];

    polly.server
      .get('https://api.heroku.com/teams')
      .intercept((req, res) => res.status(200).json(responseBody));

    const context = createMockStepExecutionContext({ instanceConfig });
    await step.executionHandler(context);

    expect(context.jobState.collectedEntities).toMatchObject([]);
    expect(context.jobState.collectedRelationships).toMatchObject([]);
  });
});
