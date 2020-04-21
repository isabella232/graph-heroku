interface HerokuIdentityProvider {
  id: string;
  name: string;
  owner: {
    id: string;
    name: string;
    type: string;
  };
}

interface HerokuPermission {
  description: string;
  name: string;
}

export interface HerokuEnterpriseAccount {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  permissions: string[];
  trial: boolean;
  identity_provider: HerokuIdentityProvider | null;
}

export interface HerokuTeam {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  default: boolean;
  credit_card_collections: boolean;
  enterprise_account: Partial<HerokuEnterpriseAccount> | null;
  identity_provider: Partial<HerokuIdentityProvider> | null;
  membership_limit: number;
  provisioned_licenses: boolean;
  role: string;
  type: string;
}

export interface HerokuUser {
  allow_tracking?: boolean;
  beta?: boolean;
  created_at?: string;
  email: string;
  federated?: boolean;
  id: string;
  identity_provider?: Partial<HerokuIdentityProvider> | null;
  last_login?: string;
  name: string;
  sms_number?: string;
  suspended_at?: string | null;
  delinquent_at?: string | null;
  two_factor_authentication?: boolean;
  updated_at?: string;
  verified?: boolean;
  default_organization?: Partial<HerokuTeam> | null;
  default_team?: Partial<HerokuTeam> | null;
}

interface HerokuMember {
  id: string;
  two_factor_authentication: boolean;
  identity_provider: Partial<HerokuIdentityProvider> | null;
}

export interface HerokuTeamMember extends HerokuMember {
  created_at: string;
  email: string;
  federated: boolean;
  role: string;
  updated_at: string;
  user: {
    name: string;
    email: string;
    id: string;
  };
}

export interface HerokuEnterpriseMember extends HerokuMember {
  enterprise_account: {
    id: string;
    name: string;
  };
  permissions: HerokuPermission[];
  user: {
    email: string;
    id: string;
  };
}

export interface HerokuApp {
  acm: boolean;
  archived_at: string | null;
  buildpack_provided_description: string;
  build_stack: {
    id: string;
    name: string;
  };
  created_at: string;
  id: string;
  git_url: string;
  maintenance: boolean;
  name: string;
  owner: {
    email: string;
    id: string;
  };
  region: {
    id: string;
    name: string;
  };
  organization: {
    id: string;
    name: string;
  };
  team: {};
}
