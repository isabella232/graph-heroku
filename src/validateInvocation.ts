import { IntegrationExecutionContext } from '@jupiterone/integration-sdk';
import { getHerokuClient } from './heroku';

export default async function validateInvocation(
  context: IntegrationExecutionContext,
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
  context: IntegrationExecutionContext,
): Promise<boolean> {
  const heroku = getHerokuClient(context.instance.config);

  context.logger.info('Calling heroku api with provided api key...');
  try {
    await heroku.retryGet('/account');
    return true;
  } catch (error) {
    context.logger.error({ error });
    return false;
  }
}
