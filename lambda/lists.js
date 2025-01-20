const { DynamoDB } = require('aws-sdk');

const dynamodb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.LISTS_TABLE_NAME;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
};

async function handler(event) {
  try {
    switch (event.httpMethod) {
      case 'GET':
        return await getLists(event);
      case 'POST':
        return await createList(event);
      case 'DELETE':
        return await deleteList(event);
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Unsupported HTTP method' }),
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
}

async function getLists(event) {
  const email = event.queryStringParameters?.email;
  
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email,
    },
  };

  const result = await dynamodb.query(params).promise();
  
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(result.Items)
  };
}

async function createList(event) {
  const requestBody = JSON.parse(event.body);
  
  const list = {
    email: requestBody.email,
    listId: requestBody.listId,
    name: requestBody.name
  };

  await dynamodb.put({
    TableName: TABLE_NAME,
    Item: list,
  }).promise();

  return {
    statusCode: 201,
    headers: CORS_HEADERS,
    body: JSON.stringify(list),
  };
}

async function deleteList(event) {
  const requestBody = JSON.parse(event.body);
  
  await dynamodb.delete({
    TableName: TABLE_NAME,
    Key: {
      email: requestBody.email,
      listId: requestBody.listId
    }
  }).promise();

  return {
    statusCode: 204,
    headers: CORS_HEADERS,
    body: JSON.stringify({ message: 'List deleted successfully' })
  };
}

module.exports = { handler }; 