import {
  IntegrationStep,
  IntegrationStepExecutionContext,
  createIntegrationEntity,
  createIntegrationRelationship,
} from '@jupiterone/integration-sdk';
import { HerokuClient } from '../../heroku';
import { HerokuTeam } from '../../types/herokuTypes';
import keysToCamel from '../../util/keysToCamel';

// WARNING: Heroku labels this API as in DEVELOPMENT
// https://devcenter.heroku.com/articles/platform-api-reference#team
const step: IntegrationStep = {
  id: 'fetch-teams',
  name: 'Fetch Teams',
  types: ['heroku_teams'],
  dependsOn: ['fetch-enterprise-accounts'],
  async executionHandler({
    logger,
    instance,
    jobState,
  }: IntegrationStepExecutionContext) {
    const heroku = new HerokuClient(instance.config);
    logger.info('Calling /teams API...');
    const teams: HerokuTeam[] = await heroku.retryGet('/teams');

    const teamEntities = teams.map((e) => {
      return createIntegrationEntity({
        entityData: {
          source: {
            ...keysToCamel(e),
          },
          assign: {
            _key: e.id,
            _type: 'heroku_team',
            _class: 'Team',
          },
        },
      });
    });
    await jobState.addEntities(teamEntities);

    const teamToAccountRelationships = teams
      .filter((r) => r.enterprise_account)
      .map((r) => {
        return createIntegrationRelationship({
          _class: 'HAS',
          from: {
            _class: 'Account',
            _type: 'heroku_account',
            _key: r.enterprise_account.id,
          },
          to: {
            _class: 'Team',
            _type: 'heroku_team',
            _key: r.id,
          },
        });
      });
    await jobState.addRelationships(teamToAccountRelationships);
  },
};

export default step;
