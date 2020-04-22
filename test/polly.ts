import { Polly } from '@pollyjs/core';
import NodeHTTPAdapter from '@pollyjs/adapter-node-http';

Polly.register(NodeHTTPAdapter);

export { Polly } from '@pollyjs/core';
