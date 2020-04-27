import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  Entity,
  createIntegrationRelationship,
  JobState,
} from '@jupiterone/integration-sdk';
import {
  STEP_ID as APPLICATION_STEP,
  APPLICATION_TYPE,
} from '../fetch-team-apps';
import { STEP_ID as ADDON_STEP, ADDON_TYPE } from '../fetch-app-addons';

const step: IntegrationStep = {
  id: 'build-application-to-addon-relationships',
  name: 'Build Application-to-Addon Relationships',
  types: [],
  dependsOn: [ADDON_STEP, APPLICATION_STEP],
  async executionHandler({ jobState }: IntegrationStepExecutionContext) {
    const appIdMap = await createAppIdMap(jobState);

    await jobState.iterateEntities({ _type: ADDON_TYPE }, async (addon) => {
      const application = appIdMap.get(addon.applicationId as string);

      if (application) {
        await jobState.addRelationships([
          createIntegrationRelationship({
            _class: 'HAS',
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
