/* eslint-disable @typescript-eslint/camelcase */
import { createMockStepExecutionContext } from '@jupiterone/integration-sdk/testing';
import { Polly } from '@pollyjs/core';
import NodeHTTPAdapter = require('@pollyjs/adapter-node-http');
import { v4 as uuid } from 'uuid';

import step from '../../src/steps/fetchUsers';
import { makeMockEntitiesWithIds } from '../../test/helpers/makeMockEntitiesWithIds';

import {
  HerokuTeamMember,
  HerokuEnterpriseMember,
  HerokuUser,
} from '../../src/types/herokuTypes';

const instanceConfig = {
  apiKey: 'api-key',
};

Polly.register(NodeHTTPAdapter);
let polly: Polly;

function makeIdentityProvider() {
  return {
    id: uuid(),
    name: 'identityProviderName',
    owner: {
      id: uuid(),
      name: 'ownerName',
      type: 'type',
    },
  };
}

function makeHerokuMember(withNullFields: boolean) {
  return {
    id: uuid(),
    two_factor_authentication: withNullFields ? null : true,
    identity_provider: withNullFields ? null : makeIdentityProvider(),
  };
}

function makeHerokuTeamMember(withNullFields: boolean): HerokuTeamMember {
  return {
    ...makeHerokuMember(withNullFields),
    created_at: withNullFields ? null : 'created_at',
    email: withNullFields ? null : 'email@email.com',
    federated: withNullFields ? null : true,
    role: withNullFields ? null : 'role',
    updated_at: withNullFields ? null : 'updated_at',
    user: {
      email: 'email@email.com',
      id: uuid(),
      name: 'name',
    },
  };
}

function makeHerokuAccountMember(
  withNullFields: boolean,
  accountId: string,
): HerokuEnterpriseMember {
  return {
    ...makeHerokuMember(withNullFields),
    user: {
      email: 'email@email.com',
      id: uuid(),
    },
    enterprise_account: {
      id: accountId,
      name: 'enterpriseName',
    },
    permissions: withNullFields
      ? null
      : [
          {
            description: 'permissionDescription',
            name: 'permissionName',
          },
        ],
  };
}

function makeHerokuUser(
  options: {
    userId: string;
    defaultTeamId?: string;
    defaultOrgId?: string;
  },
  withNullFields: boolean,
): HerokuUser {
  const defaultTeamId = options.defaultTeamId ? options.defaultTeamId : uuid();
  const defaultOrgId = options.defaultOrgId ? options.defaultOrgId : uuid();
  return {
    id: options.userId,
    name: 'firstAndLastName',
    email: 'email@email.com',
    allow_tracking: withNullFields ? null : true,
    beta: withNullFields ? null : true,
    federated: withNullFields ? null : true,
    identity_provider: withNullFields ? null : makeIdentityProvider(),
    last_login: withNullFields ? null : 'last_login',
    sms_number: withNullFields ? null : 'sms_number',
    two_factor_authentication: withNullFields ? null : true,
    verified: withNullFields ? null : true,
    created_at: withNullFields ? null : 'created_at',
    updated_at: withNullFields ? null : 'updated_at',
    suspended_at: withNullFields ? null : 'suspended_at',
    default_organization: withNullFields
      ? null
      : {
          id: defaultOrgId,
          name: 'organizationName',
        },
    default_team: withNullFields
      ? null
      : {
          id: defaultTeamId,
          name: 'teamName',
        },
    delinquent_at: withNullFields ? null : 'delinquent_at',
  };
}

function makeUserEntity(herokuUser: HerokuUser) {
  return {
    id: herokuUser.id,
    name: herokuUser.name,
    username: herokuUser.email,
    createdOn: undefined,
    displayName: herokuUser.name,
    email: herokuUser.email,
    _key: herokuUser.id,
    _type: 'heroku_user',
    _class: ['User'],
    _rawData: [
      {
        name: 'default',
        rawData: {
          id: herokuUser.id,
          name: herokuUser.name,
          username: herokuUser.email,
          email: herokuUser.email,
          verified: herokuUser.verified,
          allowTracking: herokuUser.allow_tracking,
          federated: herokuUser.federated,
          twoFactorAuthentication: herokuUser.two_factor_authentication,
          smsNumber: herokuUser.sms_number,
          createdAt: herokuUser.created_at,
          updatedAt: herokuUser.updated_at,
          suspendedAt: herokuUser.suspended_at,
          lastLogin: herokuUser.last_login,
          delinquentAt: herokuUser.delinquent_at,
          beta: herokuUser.beta,
          defaultTeamId: herokuUser.default_team
            ? herokuUser.default_team.id
            : null,
          defaultOrganizationId: herokuUser.default_organization
            ? herokuUser.default_organization.id
            : null,
          identityProviderId: herokuUser.identity_provider
            ? herokuUser.identity_provider.id
            : null,
        },
      },
    ],
  };
}

function testAddingMembersFromAccounts(withNullFields) {
  test(`should add users ${
    withNullFields ? 'with' : 'without'
  } null fields returned by /enterprise-accounts/:accountId/members`, async () => {
    const accountId = uuid();
    const herokuAccountMember = makeHerokuAccountMember(
      withNullFields,
      accountId,
    );
    const herokuUser = makeHerokuUser(
      {
        userId: herokuAccountMember.user.id,
        defaultOrgId: accountId,
      },
      withNullFields,
    );

    polly.server
      .get(`https://api.heroku.com/enterprise-accounts/${accountId}/members`)
      .intercept((req, res) => res.status(200).json([herokuAccountMember]));
    polly.server
      .get(`https://api.heroku.com/users/${herokuAccountMember.user.id}`)
      .intercept((req, res) => res.status(200).json([herokuUser]));

    const entities = makeMockEntitiesWithIds([
      { _type: 'heroku_account', id: accountId },
    ]);
    const context = createMockStepExecutionContext({
      instanceConfig,
      entities,
    });
    const addEntities = jest.spyOn(context.jobState, 'addEntities');
    const addRelationships = jest.spyOn(context.jobState, 'addRelationships');
    await step.executionHandler(context);

    expect(addEntities).toHaveBeenCalledTimes(1);
    expect(addEntities).toHaveBeenCalledWith([makeUserEntity(herokuUser)]);
    expect(addRelationships).toHaveBeenCalledTimes(2);
    expect(addRelationships).toHaveBeenCalledWith([]);
    expect(addRelationships).toHaveBeenCalledWith([
      {
        _key: `${accountId}|has|${herokuUser.id}`,
        _type: 'heroku_account_has_user',
        _class: 'HAS',
        _fromEntityKey: accountId,
        _toEntityKey: herokuUser.id,
        displayName: 'HAS',
        permissions: withNullFields
          ? 'null'
          : JSON.stringify(herokuAccountMember.permissions),
      },
    ]);
  });
}

function testAddingMembersFromTeams(withNullFields) {
  test(`should add users ${
    withNullFields ? 'with' : 'without'
  } null fields returned by /teams/:teamId/members`, async () => {
    const teamId = uuid();
    const herokuTeamMember = makeHerokuTeamMember(withNullFields);
    const herokuUser = makeHerokuUser(
      {
        userId: herokuTeamMember.user.id,
        defaultTeamId: teamId,
      },
      withNullFields,
    );

    polly.server
      .get(`https://api.heroku.com/teams/${teamId}/members`)
      .intercept((req, res) => res.status(200).json([herokuTeamMember]));
    polly.server
      .get(`https://api.heroku.com/users/${herokuTeamMember.user.id}`)
      .intercept((req, res) => res.status(200).json([herokuUser]));

    const entities = makeMockEntitiesWithIds([
      { _type: 'heroku_team', id: teamId },
    ]);
    const context = createMockStepExecutionContext({
      instanceConfig,
      entities,
    });
    const addEntities = jest.spyOn(context.jobState, 'addEntities');
    const addRelationships = jest.spyOn(context.jobState, 'addRelationships');
    await step.executionHandler(context);

    expect(addEntities).toHaveBeenCalledTimes(1);
    expect(addEntities).toHaveBeenCalledWith([makeUserEntity(herokuUser)]);
    expect(addRelationships).toHaveBeenCalledTimes(2);
    expect(addRelationships).toHaveBeenCalledWith([]);
    expect(addRelationships).toHaveBeenCalledWith([
      {
        _key: `${teamId}|has|${herokuUser.id}`,
        _type: 'heroku_team_has_user',
        _class: 'HAS',
        _fromEntityKey: teamId,
        _toEntityKey: herokuUser.id,
        displayName: 'HAS',
        role: withNullFields ? null : 'role',
      },
    ]);
  });
}

beforeEach(() => {
  polly = new Polly('api.heroku.com', {
    adapters: ['node-http'],
  });
});

afterEach(() => {
  polly.stop();
});

describe('executionHandler', () => {
  describe('no accounts or teams', () => {
    test(`should add nothing if no teams or accounts returned from jobState`, async () => {
      const context = createMockStepExecutionContext({ instanceConfig });
      const addEntities = jest.spyOn(context.jobState, 'addEntities');
      const addRelationships = jest.spyOn(context.jobState, 'addRelationships');
      await step.executionHandler(context);

      expect(addEntities).toHaveBeenCalledTimes(1);
      expect(addEntities).toHaveBeenCalledWith([]);
      expect(addRelationships).toHaveBeenCalledTimes(2);
      expect(addRelationships).toHaveBeenNthCalledWith(1, []);
      expect(addRelationships).toHaveBeenNthCalledWith(2, []);
    });
  });

  describe('/teams/:teamId/members', () => {
    testAddingMembersFromTeams(true);

    testAddingMembersFromTeams(false);

    test(`should add nothing if no members returned`, async () => {
      const teamId = uuid();

      polly.server
        .get(`https://api.heroku.com/teams/${teamId}/members`)
        .intercept((req, res) => res.status(200).json([]));

      const entities = makeMockEntitiesWithIds([
        { _type: 'heroku_team', id: teamId },
      ]);
      const context = createMockStepExecutionContext({
        instanceConfig,
        entities,
      });
      const addEntities = jest.spyOn(context.jobState, 'addEntities');
      const addRelationships = jest.spyOn(context.jobState, 'addRelationships');
      await step.executionHandler(context);

      expect(addEntities).toHaveBeenCalledTimes(1);
      expect(addEntities).toHaveBeenCalledWith([]);
      expect(addRelationships).toHaveBeenCalledTimes(2);
      expect(addRelationships).toHaveBeenNthCalledWith(1, []);
      expect(addRelationships).toHaveBeenNthCalledWith(2, []);
    });

    test(`should not add member if not returned by /users/:userId`, async () => {
      const teamId = uuid();

      const teamMember = makeHerokuTeamMember(false);

      polly.server
        .get(`https://api.heroku.com/teams/${teamId}/members`)
        .intercept((req, res) => res.status(200).json([teamMember]));
      polly.server
        .get(`https://api.heroku.com/users/${teamMember.user.id}`)
        .intercept((req, res) => res.status(200).json([]));

      const entities = makeMockEntitiesWithIds([
        { _type: 'heroku_team', id: teamId },
      ]);
      const context = createMockStepExecutionContext({
        instanceConfig,
        entities,
      });
      const addEntities = jest.spyOn(context.jobState, 'addEntities');
      const addRelationships = jest.spyOn(context.jobState, 'addRelationships');
      await step.executionHandler(context);

      expect(addEntities).toHaveBeenCalledTimes(1);
      expect(addEntities).toHaveBeenCalledWith([]);
      expect(addRelationships).toHaveBeenCalledTimes(2);
      expect(addRelationships).toHaveBeenNthCalledWith(1, []);
      expect(addRelationships).toHaveBeenNthCalledWith(2, []);
    });
  });

  describe('/enterprise-account/:accountId/members', () => {
    testAddingMembersFromAccounts(true);

    testAddingMembersFromAccounts(false);

    test(`should add nothing if no members returned`, async () => {
      const accountId = uuid();

      polly.server
        .get(`https://api.heroku.com/enterprise-accounts/${accountId}/members`)
        .intercept((req, res) => res.status(200).json([]));

      const entities = makeMockEntitiesWithIds([
        { _type: 'heroku_account', id: accountId },
      ]);
      const context = createMockStepExecutionContext({
        instanceConfig,
        entities,
      });
      const addEntities = jest.spyOn(context.jobState, 'addEntities');
      const addRelationships = jest.spyOn(context.jobState, 'addRelationships');
      await step.executionHandler(context);

      expect(addEntities).toHaveBeenCalledTimes(1);
      expect(addEntities).toHaveBeenCalledWith([]);
      expect(addRelationships).toHaveBeenCalledTimes(2);
      expect(addRelationships).toHaveBeenNthCalledWith(1, []);
      expect(addRelationships).toHaveBeenNthCalledWith(2, []);
    });

    test(`should not add member if not returned by /users/:userId`, async () => {
      const accountId = uuid();

      const accountMember = makeHerokuAccountMember(false, accountId);

      polly.server
        .get(`https://api.heroku.com/enterprise-accounts/${accountId}/members`)
        .intercept((req, res) => res.status(200).json([accountMember]));
      polly.server
        .get(`https://api.heroku.com/users/${accountMember.user.id}`)
        .intercept((req, res) => res.status(200).json([]));

      const entities = makeMockEntitiesWithIds([
        { _type: 'heroku_account', id: accountId },
      ]);
      const context = createMockStepExecutionContext({
        instanceConfig,
        entities,
      });
      const addEntities = jest.spyOn(context.jobState, 'addEntities');
      const addRelationships = jest.spyOn(context.jobState, 'addRelationships');
      await step.executionHandler(context);

      expect(addEntities).toHaveBeenCalledTimes(1);
      expect(addEntities).toHaveBeenCalledWith([]);
      expect(addRelationships).toHaveBeenCalledTimes(2);
      expect(addRelationships).toHaveBeenNthCalledWith(1, []);
      expect(addRelationships).toHaveBeenNthCalledWith(2, []);
    });
  });
});
