import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  Entity,
  Relationship,
  createIntegrationRelationship,
  JobState,
} from '@jupiterone/integration-sdk';
import {
  STEP_ID as TEAM_STEP,
  TEAM_TYPE,
} from '../fetch-enterprise-account-teams';
import {
  STEP_ID as ACCOUNT_STEP,
  ACCOUNT_TYPE,
} from '../fetch-enterprise-accounts';

const step: IntegrationStep = {
  id: 'build-account-to-team-relationships',
  name: 'Build Account-to-Team Relationships',
  types: [],
  dependsOn: [ACCOUNT_STEP, TEAM_STEP],
  async executionHandler({ jobState }: IntegrationStepExecutionContext) {
    const accountIdMap = await createAccountIdMap(jobState);

    await jobState.iterateEntities({ _type: TEAM_TYPE }, async (team) => {
      const account = accountIdMap.get(team.enterpriseAccountId as string);

      if (account) {
        await jobState.addRelationships([
          createAccountToTeamRelationship(account, team),
        ]);
      }
    });
  },
};

export default step;

async function createAccountIdMap(
  jobState: JobState,
): Promise<Map<string, Entity>> {
  const accountIdMap = new Map<string, Entity>();
  await jobState.iterateEntities({ _type: ACCOUNT_TYPE }, (account) => {
    // unfortunately need to cast because of EntityPropertyValue type
    accountIdMap.set(account.id as string, account);
  });
  return accountIdMap;
}

export function createAccountToTeamRelationship(
  account: Entity,
  team: Entity,
): Relationship {
  return createIntegrationRelationship({
    _class: 'HAS',
    from: account,
    to: team,
  });
}
