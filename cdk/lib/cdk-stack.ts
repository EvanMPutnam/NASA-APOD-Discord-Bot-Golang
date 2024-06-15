import * as cdk from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

const APP_NAME = "NasaAPOD"

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    const discordFunc = new Function(this, `${APP_NAME}Function`, {
      runtime: Runtime.PROVIDED_AL2023,
      code: Code.fromAsset("../lambda.zip"),
      handler: "handler.handler",
    });

    const eventRule = new Rule(this, 'scheduleRule', {
      schedule: Schedule.cron({ minute: '0', hour: '12' }), // Every day at noon.
    });
    eventRule.addTarget(new LambdaFunction(discordFunc))
  }
}
