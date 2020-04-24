import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
  Entity,
  getTime,
} from '@jupiterone/integration-sdk';
import { HerokuClient } from '../../heroku';
import {
  STEP_ID as ACCOUNT_STEP,
  ACCOUNT_TYPE,
} from '../fetch-enterprise-accounts';

export const STEP_ID = 'fetch-account-members';
export const ACCOUNT_MEMBER_TYPE = 'heroku_account_member';

const step: IntegrationStep = {
  id: STEP_ID,
  name: 'Fetch account members',
  types: [ACCOUNT_MEMBER_TYPE],
  dependsOn: [ACCOUNT_STEP],
  async executionHandler({
    logger,
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    const heroku = new HerokuClient(instance.config);

    logger.info('Calling /enterprise-accounts/:id/members API...');
    await jobState.iterateEntities({ _type: ACCOUNT_TYPE }, async (account) => {
      const members = await heroku.getEnterpriseAccountMembers(
        account.id as string,
      );

      await jobState.addEntities(
        members.map((member) => createAccountMemberEntity(member, account.id)),
      );
    });
  },
};

export default step;

export function createAccountMemberEntity(member, accountId): Entity {
  return createIntegrationEntity({
    entityData: {
      source: member,
      assign: {
        _key: member.user.id,
        _type: ACCOUNT_MEMBER_TYPE,
        _class: 'User',
        id: member.user.id,
        createdOn: getTime(member.created_at),
        updatedOn: getTime(member.updated_at),
        enterpriseAccountId: accountId,
        username: member.user.email,
        name: member.user.email,
      },
    },
  });
}
