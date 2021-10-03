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

  const heroku = new HerokuClient(context.instance.config);
  await heroku.request('/account');
}
