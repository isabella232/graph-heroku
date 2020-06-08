import { IntegrationExecutionContext } from '@jupiterone/integration-sdk-core';
import { HerokuClient } from './heroku';
import { HerokuIntegrationConfig } from './types';

export default async function validateInvocation(
  context: IntegrationExecutionContext<HerokuIntegrationConfig>,
): Promise<void> {
  context.logger.info(
    {
      instance: context.instance,
    },
    'Validating integration config...',
  );

  if (await isConfigurationValid(context)) {
    context.logger.info('Integration instance is valid!');
  } else {
    throw new Error('Failed to authenticate with provided credentials');
  }
}

async function isConfigurationValid(
  context: IntegrationExecutionContext<HerokuIntegrationConfig>,
): Promise<boolean> {
  const heroku = new HerokuClient(context.instance.config);

  context.logger.info('Calling heroku api with provided api key...');
  try {
    await heroku.retryGet('/account');
    return true;
  } catch (error) {
    context.logger.error({ error });
    return false;
  }
}
