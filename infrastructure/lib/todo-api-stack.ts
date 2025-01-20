import {Stack, StackProps, RemovalPolicy, Duration} from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import * as path from 'path';

interface TodoApiStackProps extends StackProps {
  userPool: cognito.UserPool;
}

export class TodoApiStack extends Stack {
  constructor(scope: Construct, id: string, props: TodoApiStackProps) {
    super(scope, id, props);

    // DynamoDB
    const listItemsTable = new dynamodb.Table(this, 'ListItemsTable', {
      tableName: 'ListItems',
      partitionKey: { name: 'listId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'itemId', type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const listsTable = new dynamodb.Table(this, 'ListsTable', {
      tableName: 'Lists',
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'listId', type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Lambdas
    const itemsFunction = new lambda.Function(this, 'ItemsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'items.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda')),
      environment: {
        ITEMS_TABLE_NAME: listItemsTable.tableName,
      },
    });

    const listsFunction = new lambda.Function(this, 'ListsFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'lists.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../lambda')),
      environment: {
        LISTS_TABLE_NAME: listsTable.tableName,
      },
    });

    // Permissions
    listItemsTable.grantReadWriteData(itemsFunction);
    listsTable.grantReadWriteData(listsFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, 'ListApi', {
      restApiName: 'TODOMF API',
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token'],
        allowCredentials: true,
        maxAge: Duration.days(1),
      },
    });

    // Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'TodoApiAuthorizer', {
      cognitoUserPools: [props.userPool],
    });

    // Default authorization
    const authorizerConfig = {
      authorizer: authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    // Api resources
    const items = api.root.addResource('items');
    const itemsIntegration = new apigateway.LambdaIntegration(itemsFunction);
    items.addMethod('GET', itemsIntegration, authorizerConfig);
    items.addMethod('POST', itemsIntegration, authorizerConfig);
    items.addMethod('PUT', itemsIntegration, authorizerConfig);
    items.addMethod('DELETE', itemsIntegration, authorizerConfig);

    const lists = api.root.addResource('lists');
    const listsIntegration = new apigateway.LambdaIntegration(listsFunction);
    lists.addMethod('GET', listsIntegration, authorizerConfig);
    lists.addMethod('POST', listsIntegration, authorizerConfig);
    lists.addMethod('PUT', listsIntegration, authorizerConfig);
    lists.addMethod('DELETE', listsIntegration, authorizerConfig);
  }
}