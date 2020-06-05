import {
  IntegrationStep,
  createIntegrationEntity,
  Entity,
  getTime,
} from '@jupiterone/integration-sdk-core';
import { HerokuClient } from '../../heroku';

import {
  STEP_ID as APPLICATION_STEP,
  APPLICATION_TYPE,
} from '../fetch-team-apps';
import { HerokuIntegrationConfig } from '../../types';

export const STEP_ID = 'fetch-app-addons';
export const ADDON_TYPE = 'heroku_addon';

const step: IntegrationStep<HerokuIntegrationConfig> = {
  id: STEP_ID,
  name: 'Fetch app addons',
  types: [ADDON_TYPE],
  dependsOn: [APPLICATION_STEP],
  async executionHandler({
    logger,
    instance,
    jobState,
  }) {
    const heroku = new HerokuClient(instance.config);

    logger.info('Calling /apps/:id/addons API...');
    await jobState.iterateEntities(
      { _type: APPLICATION_TYPE },
      async (application) => {
        const addons = await heroku.getAppAddons(application.id as string);

        await jobState.addEntities(
          addons.map((addon) => createAddonEntity(addon, application.id)),
        );
      },
    );
  },
};

export default step;

export function createAddonEntity(addon, applicationId): Entity {
  return createIntegrationEntity({
    entityData: {
      source: addon,
      assign: {
        _key: addon.id,
        _type: ADDON_TYPE,
        _class: 'Service',
        id: addon.id,
        createdOn: getTime(addon.created_at),
        updatedOn: getTime(addon.updated_at),
        applicationId: applicationId,
        category: ['platform'],
        endpoints: [addon.web_url],
      },
    },
  });
}
