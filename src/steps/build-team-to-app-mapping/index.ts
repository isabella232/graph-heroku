import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  Entity,
  createIntegrationRelationship,
  JobState,
} from '@jupiterone/integration-sdk-core';
import {
  STEP_ID as TEAM_STEP,
  TEAM_TYPE,
} from '../fetch-enterprise-account-teams';
import {
  STEP_ID as APPLICATION_STEP,
  APPLICATION_TYPE,
} from '../fetch-team-apps';

const step: IntegrationStep = {
  id: 'build-team-to-application-relationships',
  name: 'Build Team-to-Application Relationships',
  types: [],
  dependsOn: [APPLICATION_STEP, TEAM_STEP],
  async executionHandler({ jobState }: IntegrationStepExecutionContext) {
    const teamIdMap = await createTeamIdMap(jobState);

    await jobState.iterateEntities(
      { _type: APPLICATION_TYPE },
      async (application) => {
        const team = teamIdMap.get(application.teamId as string);

        if (team) {
          await jobState.addRelationships([
            createIntegrationRelationship({
              _class: 'OWNS',
              from: team,
              to: application,
            }),
          ]);
        }
      },
    );
  },
};

export default step;

async function createTeamIdMap(
  jobState: JobState,
): Promise<Map<string, Entity>> {
  const teamIdMap = new Map<string, Entity>();
  await jobState.iterateEntities({ _type: TEAM_TYPE }, (team) => {
    // unfortunately need to cast because of EntityPropertyValue type
    teamIdMap.set(team.id as string, team);
  });
  return teamIdMap;
}
