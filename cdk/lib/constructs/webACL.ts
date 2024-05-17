import { CfnWebACL } from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';

/**
 * This does what the CDK solutions construct does but removes
 * the bot command since we will be integrating with a bot, and need a little more control.
 */
export class WebACLConstruct extends Construct {

    public readonly wafwebacl: CfnWebACL;

    constructor(scope: Construct, id: string) {
        super(scope, id);
        const wafwebacl = new CfnWebACL(this, "WebAcl", {
            defaultAction: { allow: {} },
            rules: [
                {
                    priority: 1,
                    overrideAction: { count: {} },
                    visibilityConfig: {
                        sampledRequestsEnabled: true,
                        cloudWatchMetricsEnabled: true,
                        metricName: "AWS-AWSManagedRulesKnownBadInputsRuleSet",
                    },
                    name: "AWS-AWSManagedRulesKnownBadInputsRuleSet",
                    statement: {
                        managedRuleGroupStatement: {
                            vendorName: "AWS",
                            name: "AWSManagedRulesKnownBadInputsRuleSet",
                        },
                    },
                },
                {
                    priority: 2,
                    overrideAction: { count: {} },
                    visibilityConfig: {
                        sampledRequestsEnabled: true,
                        cloudWatchMetricsEnabled: true,
                        metricName: "AWS-AWSManagedRulesCommonRuleSet",
                    },
                    name: "AWS-AWSManagedRulesCommonRuleSet",
                    statement: {
                        managedRuleGroupStatement: {
                            vendorName: "AWS",
                            name: "AWSManagedRulesCommonRuleSet",
                        },
                    },
                },
                {
                    priority: 3,
                    overrideAction: { count: {} },
                    visibilityConfig: {
                        sampledRequestsEnabled: true,
                        cloudWatchMetricsEnabled: true,
                        metricName: "AWS-AWSManagedRulesAnonymousIpList",
                    },
                    name: "AWS-AWSManagedRulesAnonymousIpList",
                    statement: {
                        managedRuleGroupStatement: {
                            vendorName: "AWS",
                            name: "AWSManagedRulesAnonymousIpList",
                        },
                    },
                },
                {
                    priority: 4,
                    overrideAction: { count: {} },
                    visibilityConfig: {
                        sampledRequestsEnabled: true,
                        cloudWatchMetricsEnabled: true,
                        metricName: "AWS-AWSManagedRulesAmazonIpReputationList",
                    },
                    name: "AWS-AWSManagedRulesAmazonIpReputationList",
                    statement: {
                        managedRuleGroupStatement: {
                            vendorName: "AWS",
                            name: "AWSManagedRulesAmazonIpReputationList",
                        },
                    },
                },
                {
                    priority: 5,
                    overrideAction: { count: {} },
                    visibilityConfig: {
                        sampledRequestsEnabled: true,
                        cloudWatchMetricsEnabled: true,
                        metricName: "AWS-AWSManagedRulesAdminProtectionRuleSet",
                    },
                    name: "AWS-AWSManagedRulesAdminProtectionRuleSet",
                    statement: {
                        managedRuleGroupStatement: {
                            vendorName: "AWS",
                            name: "AWSManagedRulesAdminProtectionRuleSet",
                        },
                    },
                },
                {
                    priority: 6,
                    overrideAction: { count: {} },
                    visibilityConfig: {
                        sampledRequestsEnabled: true,
                        cloudWatchMetricsEnabled: true,
                        metricName: "AWS-AWSManagedRulesSQLiRuleSet",
                    },
                    name: "AWS-AWSManagedRulesSQLiRuleSet",
                    statement: {
                        managedRuleGroupStatement: {
                            vendorName: "AWS",
                            name: "AWSManagedRulesSQLiRuleSet",
                        },
                    },
                }
            ],
            scope: 'REGIONAL',
            visibilityConfig: {
                sampledRequestsEnabled: true,
                cloudWatchMetricsEnabled: true,
                metricName: "web-acl",
            },
        });
        this.wafwebacl = wafwebacl;
    }
}