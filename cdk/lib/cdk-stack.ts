import * as cdk from 'aws-cdk-lib';
import { Code, Function, FunctionUrlAuthType, HttpMethod, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { ApiGatewayToLambda } from '@aws-solutions-constructs/aws-apigateway-lambda';
import { WafwebaclToApiGateway } from "@aws-solutions-constructs/aws-wafwebacl-apigateway";
import { AuthorizationType, LambdaRestApiProps } from 'aws-cdk-lib/aws-apigateway';
import { WebACLConstruct } from './constructs/webACL';

const APP_NAME = "NasaAPOD"

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    
    // const discordFunc = new Function(this, `${APP_NAME}Function`, {
    //   runtime: Runtime.PROVIDED_AL2023,
    //   code: Code.fromAsset("../lambda.zip"),
    //   handler: "handler.handler",
    // });

    // const url = discordFunc.addFunctionUrl({
    //   authType: FunctionUrlAuthType.NONE,
    //   cors: {
    //     allowedOrigins: ["*"],
    //     allowedMethods: [HttpMethod.ALL],
    //     allowedHeaders: ["*"],
    //   },
    // });

    // new cdk.CfnOutput(this, "FunctionUrl", {
    //   value: url.url,
    // });

    const apiGatewayToLambda = new ApiGatewayToLambda(this, APP_NAME, {
      lambdaFunctionProps: {
        runtime: Runtime.PROVIDED_AL2023,
        code: Code.fromAsset("../lambda.zip"),
        handler: "handler.handler",
        environment: {
          // TODO: Lead in environment variables.
          NASA_API_KEY: process.env.NASA_API_KEY!,
          DISCORD_API_TOKEN: process.env.DISCORD_API_TOKEN!,
          DISCORD_API_CHANNEL: process.env.DISCORD_API_CHANNEL!,
          DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY!,
        }
      },
      apiGatewayProps: {
        defaultMethodOptions: {
          authorizationType: AuthorizationType.NONE,
        },
        defaultCorsPreflightOptions: {
          allowOrigins: ["*"],
          allowMethods: [HttpMethod.ALL],
          allowHeaders: ["*"],
        }
      },
    });

    const webAcl = new WebACLConstruct(this, `${APP_NAME}ACL`)
    
    new WafwebaclToApiGateway(this, `${APP_NAME}WafWebAclToApiGateway`, {
      existingApiGatewayInterface: apiGatewayToLambda.apiGateway,
      existingWebaclObj: webAcl.wafwebacl,
    });
  }
}
