#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AuthStack } from '../lib/auth-stack';
import { TodoApiStack } from '../lib/todo-api-stack';

const env = { account: '948623537435', region: 'eu-north-1' }

const app = new cdk.App();
const authStack = new AuthStack(app, 'AuthStack', { env });
new TodoApiStack(app, 'TodoApiStack', {
  env,
  userPool: authStack.userPool
});
