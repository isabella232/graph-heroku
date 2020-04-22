import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk';
import { HerokuClient } from '../../heroku';
import { HerokuEnterpriseAccount } from '../../types/herokuTypes';
import keysToCamel from '../../util/keysToCamel';

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
    const enterpriseAccounts: HerokuEnterpriseAccount[] = await heroku.retryGet(
      '/enterprise-accounts',
    );

    const accountEntities = enterpriseAccounts.map((e) => {
      return createIntegrationEntity({
        entityData: {
          source: {
            ...keysToCamel(e),
          },
          assign: {
            _key: e.id,
            _type: 'heroku_account',
            _class: 'Account',
          },
        },
      });
    });

    await jobState.addEntities(accountEntities);
  },
};

export default step;
