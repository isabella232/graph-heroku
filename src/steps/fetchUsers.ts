import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';
import { HerokuClient } from '../heroku';
import {
  HerokuTeamMember,
  HerokuEnterpriseMember,
  HerokuUser,
} from '../types/herokuTypes';
import { getIdsFromJobState } from '../util/getIdsFromJobState';

// note: No /users endpoint exists to fetch all users.
// WARNING: Heroku labels these APIs as in DEVELOPMENT
// https://devcenter.heroku.com/articles/platform-api-reference#team-member
// https://devcenter.heroku.com/articles/platform-api-reference#enterprise-account-member
//
// Heroku labels this API as in PRODUCTION
// https://devcenter.heroku.com/articles/platform-api-reference#account-info-by-user
const step: IntegrationStep = {
  id: 'fetch-users',
  name: 'Fetch Users',
  types: ['heroku_users'],
  dependsOn: ['fetch-teams', 'fetch-enterprise-accounts'],
  async executionHandler(context: IntegrationStepExecutionContext) {
    const { jobState } = context;

    const teamMembers = await getTeamMembers(context);
    const accountMembers = await getAccountMembers(context);
    const users = await getUsers(context, teamMembers, accountMembers);
    const fetchedUserIds = users.map((u) => u.id);

    const userEntities = users.map((e) => {
      return createIntegrationEntity({
        entityData: {
          source: {
            id: e.id,
            name: e.name,
            username: e.email, // no username available.
            email: e.email,
            verified: e.verified,
            allowTracking: e.allow_tracking,
            federated: e.federated,
            twoFactorAuthentication: e.two_factor_authentication,
            smsNumber: e.sms_number,
            createdAt: e.created_at,
            updatedAt: e.updated_at,
            suspendedAt: e.suspended_at,
            lastLogin: e.last_login,
            delinquentAt: e.delinquent_at,
            beta: e.beta,
            defaultTeamId: e.default_team ? e.default_team.id : null,
            defaultOrganizationId: e.default_organization
              ? e.default_organization.id
              : null,
            identityProviderId: e.identity_provider
              ? e.identity_provider.id
              : null,
          },
          assign: {
            _key: e.id,
            _type: 'heroku_user',
            _class: 'User',
          },
        },
      });
    });
    await jobState.addEntities(userEntities);

    const userToTeamRelationships = teamMembers
      .filter((r) => fetchedUserIds.includes(r.user.id))
      .map((r) => {
        return createIntegrationRelationship({
          _class: 'HAS',
          from: {
            _class: 'Team',
            _type: 'heroku_team',
            _key: r.teamId,
          },
          to: {
            _class: 'User',
            _type: 'heroku_user',
            _key: r.user.id,
          },
          properties: {
            role: r.role,
          },
        });
      });
    await jobState.addRelationships(userToTeamRelationships);

    const userToAccountRelationships = accountMembers
      .filter((r) => fetchedUserIds.includes(r.user.id))
      .map((r) => {
        return createIntegrationRelationship({
          _class: 'HAS',
          from: {
            _class: 'Account',
            _type: 'heroku_account',
            _key: r.enterprise_account.id,
          },
          to: {
            _class: 'User',
            _type: 'heroku_user',
            _key: r.user.id,
          },
          properties: {
            permissions: JSON.stringify(r.permissions),
          },
        });
      });
    await jobState.addRelationships(userToAccountRelationships);
  },
};

export default step;

interface HerokuTeamMemberWithId extends HerokuTeamMember {
  teamId: string;
}

async function getTeamMembers({
  logger,
  instance,
  jobState,
}: IntegrationStepExecutionContext): Promise<HerokuTeamMemberWithId[]> {
  const heroku = new HerokuClient(instance.config);

  logger.info('Retrieving heroku_teams from jobState...');
  const teamIds = await getIdsFromJobState('heroku_team', jobState);
  logger.info(`Retrieved ${teamIds.length} heroku_teams from jobState.`);

  logger.info('Calling /teams/:teamId/members APIs...');
  const teamsMembers = await Promise.all(
    teamIds.map(async (id) => {
      const teamMembers: HerokuTeamMember[] = await heroku.retryGet(
        `/teams/${id}/members`,
      );
      return teamMembers.map((m) => {
        return { ...m, teamId: id };
      });
    }),
  );
  const teamMembers = teamsMembers.flat(1);
  logger.info(`Retrieved ${teamMembers.length} heroku_users from teams.`);

  return teamMembers;
}

async function getAccountMembers({
  logger,
  instance,
  jobState,
}: IntegrationStepExecutionContext): Promise<HerokuEnterpriseMember[]> {
  const heroku = new HerokuClient(instance.config);

  logger.info('Retrieving heroku_accounts from jobState...');
  const accountIds = await getIdsFromJobState('heroku_account', jobState);
  logger.info(`Retrieved ${accountIds.length} heroku_accounts from jobState.`);

  logger.info('Calling /enterprise_accounts/:accountId/members APIs...');
  const accountsMembers = await Promise.all(
    accountIds.map(async (id) => {
      const accountMembers: HerokuEnterpriseMember[] = await heroku.retryGet(
        `/enterprise-accounts/${id}/members`,
      );
      return accountMembers;
    }),
  );
  const accountMembers = accountsMembers.flat(1);
  logger.info(`Retrieved ${accountMembers.length} heroku_users from teams.`);

  return accountMembers;
}

async function getUsers(
  { logger, instance }: IntegrationStepExecutionContext,
  teamMembers: HerokuTeamMember[],
  accountMembers: HerokuEnterpriseMember[],
): Promise<HerokuUser[]> {
  const heroku = new HerokuClient(instance.config);

  logger.info(
    'Collecting unique userIds from /teams and /enterprise-accounts APIs...',
  );
  const teamMemberIds = teamMembers.map((m) => m.user.id);
  const accountMemberIds = accountMembers.map((m) => m.user.id);
  const derivedUserIds = [...new Set(teamMemberIds.concat(accountMemberIds))];

  logger.info('Calling /users/:userId APIs...');
  const users = await Promise.all(
    derivedUserIds.map(async (id) => {
      let user: HerokuUser;
      try {
        user = await heroku.retryGet(`/users/${id}`);
      } catch (err) {
        // on 404, just return abridged user data from teamMember/accountMember
        if (teamMemberIds.includes(id)) {
          const teamMember = teamMembers.filter((m) => m.user.id === id)[0];
          user = teamMember.user;
        } else if (accountMemberIds.includes(id)) {
          const accountMember = accountMembers.filter(
            (m) => m.user.id === id,
          )[0];
          user = {
            ...accountMember.user,
            name: accountMember.user.email,
          };
        }
      }
      return user;
    }),
  );

  return users;
}
