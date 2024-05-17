#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as dotenv from 'dotenv';
import { CdkStack } from '../lib/cdk-stack';

const configureEnvironment = () => {
  dotenv.config()
  const awsAccount = process.env.AWS_ACCOUNT;
  if (!awsAccount) {
    throw new Error("Did not load environment file");
  }
}

const configureStack = () => {
  configureEnvironment();
  const app = new cdk.App();
  new CdkStack(app, 'CdkStack', {
    env: { account: process.env.AWS_ACCOUNT!, region: "us-west-2" },
  });
}

configureStack();