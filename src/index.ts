import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk';

import instanceConfigFields from './instanceConfigFields';
import validateInvocation from './validateInvocation';

import buildAccountToMemberMapping from './steps/build-account-to-member-mapping';
import buildAccountToTeamMapping from './steps/build-account-to-team-mapping';
import buildAppToAddonMapping from './steps/build-app-to-addon-mapping';
import buildTeamToAppMapping from './steps/build-team-to-app-mapping';
import buildTeamToMemberMapping from './steps/build-team-to-member-mapping';
import fetchAppAddons from './steps/fetch-app-addons';
import fetchEnterpriseAccountMembers from './steps/fetch-enterprise-account-members';
import fetchEnterpriseAccountTeams from './steps/fetch-enterprise-account-teams';
import fetchEnterpriseAccounts from './steps/fetch-enterprise-accounts';
import fetchTeamApps from './steps/fetch-team-apps';

export const invocationConfig: IntegrationInvocationConfig = {
  instanceConfigFields,
  validateInvocation,
  integrationSteps: [
    buildAccountToMemberMapping,
    buildAccountToTeamMapping,
    buildAppToAddonMapping,
    buildTeamToAppMapping,
    buildTeamToMemberMapping,
    fetchAppAddons,
    fetchEnterpriseAccountMembers,
    fetchEnterpriseAccountTeams,
    fetchEnterpriseAccounts,
    fetchTeamApps,
  ],
};
