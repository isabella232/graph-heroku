export interface HerokuIntegrationConfig {
  apiKey: string;
}

export type HerokuClientError = {
  statusCode: number;
  body: {
    id: string;
    message: string;
  };
};
