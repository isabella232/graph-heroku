import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  Entity,
  createDirectRelationship,
  JobState,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import {
  STEP_ID as APPLICATION_STEP,
  APPLICATION_TYPE,
} from '../fetch-team-apps';
import { STEP_ID as ADDON_STEP, ADDON_TYPE } from '../fetch-app-addons';

const step: IntegrationStep = {
  id: 'build-application-to-addon-relationships',
  name: 'Build Application-to-Addon Relationships',
  entities: [],
  relationships: [
    {
      _type: 'heroku_application_has_addon',
      sourceType: APPLICATION_TYPE,
      _class: RelationshipClass.HAS,
      targetType: ADDON_TYPE,
    },
  ],
  dependsOn: [ADDON_STEP, APPLICATION_STEP],
  async executionHandler({ jobState }: IntegrationStepExecutionContext) {
    const appIdMap = await createAppIdMap(jobState);

    await jobState.iterateEntities({ _type: ADDON_TYPE }, async (addon) => {
      const application = appIdMap.get(addon.applicationId as string);

      if (application) {
        await jobState.addRelationships([
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: application,
            to: addon,
          }),
        ]);
      }
    });
  },
};

export default step;

async function createAppIdMap(
  jobState: JobState,
): Promise<Map<string, Entity>> {
  const appIdMap = new Map<string, Entity>();
  await jobState.iterateEntities({ _type: APPLICATION_TYPE }, (application) => {
    // unfortunately need to cast because of EntityPropertyValue type
    appIdMap.set(application.id as string, application);
  });
  return appIdMap;
}
