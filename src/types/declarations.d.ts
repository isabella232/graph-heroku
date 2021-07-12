declare module 'heroku-client' {
  interface HerokuConstructorOptions {
    token: string;
  }

  interface HerokuRequestOptions {
    auth?: string;
    token?: string;
    rejectUnauthorized?: string;
    body?: any;
    headers?: any;
    json?: boolean;
    timeout?: number; // timeout in ms
  }

  interface HerokuRequestObject extends HerokuRequestOptions {
    path: string;
    method: string;
  }

  export default class Heroku {
    constructor(options: HerokuConstructorOptions);

    get(
      route: string,
      herokuRequestOptions?: HerokuRequestOptions,
    ): Promise<any[]>;

    request(herokuRequestObject: HerokuRequestObject): Promise<any>;
  }
}
