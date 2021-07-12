import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  Entity,
  createDirectRelationship,
  JobState,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
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
  entities: [],
  relationships: [
    {
      _type: 'heroku_account_has_team',
      sourceType: ACCOUNT_TYPE,
      _class: RelationshipClass.HAS,
      targetType: TEAM_TYPE,
    },
  ],
  dependsOn: [ACCOUNT_STEP, TEAM_STEP],
  async executionHandler({ jobState }: IntegrationStepExecutionContext) {
    const accountIdMap = await createAccountIdMap(jobState);

    await jobState.iterateEntities({ _type: TEAM_TYPE }, async (team) => {
      const account = accountIdMap.get(team.enterpriseAccountId as string);

      if (account) {
        await jobState.addRelationships([
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: account,
            to: team,
          }),
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
