import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
} from '@jupiterone/integration-sdk';
import { getHerokuClient } from '../heroku';
import { HerokuEnterpriseAccount } from '../types/herokuTypes';

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
    const heroku = getHerokuClient(instance.config);
    logger.info('Calling /enterprise-accounts API...');
    const enterpriseAccounts: HerokuEnterpriseAccount[] = await heroku.retryGet(
      '/enterprise-accounts',
    );

    const accountEntities = enterpriseAccounts.map((e) => {
      return createIntegrationEntity({
        entityData: {
          source: {
            id: e.id,
            name: e.name,
            createdAt: e.created_at,
            updatedAt: e.updated_at,
            trial: e.trial,
            permissions: e.permissions ? e.permissions.toString() : null, // parse list to string?
            identityProviderId: e.identity_provider
              ? e.identity_provider.id
              : null,
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
