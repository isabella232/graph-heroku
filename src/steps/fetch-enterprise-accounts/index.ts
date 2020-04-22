import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
  Entity,
  getTime,
} from '@jupiterone/integration-sdk';
import { HerokuClient } from '../../heroku';

// WARNING: Heroku labels this API as in DEVELOPMENT
// https://devcenter.heroku.com/articles/platform-api-reference#enterprise-account-member
const step: IntegrationStep = {
  id: 'fetch-enterprise-accounts',
  name: 'Fetch Enterprise Accounts',
  types: ['heroku_enterprise_account'],
  async executionHandler({
    logger,
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    const heroku = new HerokuClient(instance.config);

    logger.info('Calling /enterprise-accounts API...');
    const enterpriseAccounts = await heroku.getEnterpriseAccounts();

    await jobState.addEntities(enterpriseAccounts.map(createAccountEntity));
  },
};

export default step;

interface EnterpriseAccount {
  id: string;
  created_at: string;
  updated_at: string;
}

export function createAccountEntity(
  enterpriseAccount: EnterpriseAccount,
): Entity {
  return createIntegrationEntity({
    entityData: {
      source: enterpriseAccount,
      assign: {
        _key: enterpriseAccount.id,
        _type: 'heroku_account',
        _class: 'Account',
        createdOn: getTime(enterpriseAccount.created_at),
        updatedOn: getTime(enterpriseAccount.updated_at),
      },
    },
  });
}
