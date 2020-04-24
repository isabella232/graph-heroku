import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  Entity,
  Relationship,
  createIntegrationRelationship,
  JobState,
} from '@jupiterone/integration-sdk';
import {
  STEP_ID as MEMBER_STEP,
  ACCOUNT_MEMBER_TYPE,
} from '../fetch-enterprise-account-members';
import {
  STEP_ID as ACCOUNT_STEP,
  ACCOUNT_TYPE,
} from '../fetch-enterprise-accounts';

const step: IntegrationStep = {
  id: 'build-account-to-member-relationships',
  name: 'Build Account-to-Member Relationships',
  types: [],
  dependsOn: [ACCOUNT_STEP, MEMBER_STEP],
  async executionHandler({ jobState }: IntegrationStepExecutionContext) {
    const accountIdMap = await createAccountIdMap(jobState);

    await jobState.iterateEntities(
      { _type: ACCOUNT_MEMBER_TYPE },
      async (member) => {
        const account = accountIdMap.get(member.enterpriseAccountId as string);

        if (account) {
          await jobState.addRelationships([
            createAccountToMemberRelationship(account, member),
          ]);
        }
      },
    );
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

export function createAccountToMemberRelationship(
  account: Entity,
  member: Entity,
): Relationship {
  return createIntegrationRelationship({
    _class: 'HAS',
    from: account,
    to: member,
  });
}
