import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { UserPool, UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export class AuthStack extends Stack {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

     // Create the Cognito User Pool
     this.userPool = new UserPool(this, 'UserPool', {
       userPoolName: 'todo-mf-user-pool',
       selfSignUpEnabled: true,
       signInAliases: {
         email: true,
       },
       autoVerify: {
         email: true,
       },
       standardAttributes: {
         email: {
           required: true,
           mutable: true,
         },
       },
       passwordPolicy: {
         minLength: 8,
         requireLowercase: true,
         requireUppercase: true,
         requireDigits: true,
         requireSymbols: true,
       },
     });
 
     // Create a User Pool Client
     this.userPoolClient = new UserPoolClient(this, 'UserPoolClient', {
       userPool: this.userPool,
       authFlows: {
         userPassword: true,
         userSrp: true,
       },
     });
 
     // Output User Pool details
     new CfnOutput(this, 'UserPoolId', {
       value: this.userPool.userPoolId,
       description: 'The ID of the Cognito User Pool',
     });
 
     new CfnOutput(this, 'UserPoolClientId', {
       value: this.userPoolClient.userPoolClientId,
       description: 'The ID of the Cognito User Pool Client',
     });

  }

}
