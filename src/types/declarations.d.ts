declare module 'heroku-client' {
  interface HerokuConstructorOptions {
    token: string;
    cache?: {
      store: any;
      encryptor: any;
    };
  }

  interface HerokuRequestOptions {
    auth?: string;
    token?: string;
    rejectUnauthorized?: string;
    body?: object;
    headers?: object;
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
    ): Promise<object>;

    request(herokuRequestObject: HerokuRequestObject): Promise<object>;
  }
}
