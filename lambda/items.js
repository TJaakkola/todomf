const { DynamoDB } = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.ITEMS_TABLE_NAME;

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
        return await getItems(event);
      case 'POST':
        return await createItem(event);
      case 'PUT':
        return await updateItem(event);
      case 'DELETE':
        return await deleteItem(event);
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
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
}

async function getItems(event) {
  const listId = event.queryStringParameters?.listId;
  
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: 'listId = :listId',
    ExpressionAttributeValues: {
      ':listId': listId
    }
  };

  const result = await dynamodb.query(params).promise();
  
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(result.Items)
  };
}

async function createItem(event) {
  const requestBody = JSON.parse(event.body);
  
  const item = {
    listId: requestBody.listId,
    itemId: uuidv4(),
    itemName: requestBody.itemName,
  };

  await dynamodb.put({
    TableName: TABLE_NAME,
    Item: item,
  }).promise();

  return {
    statusCode: 201,
    headers: CORS_HEADERS,
    body: JSON.stringify(item),
  };
}

async function updateItem(event) {
  const requestBody = JSON.parse(event.body);
  
  const params = {
    TableName: TABLE_NAME,
    Key: {
      listId: requestBody.listId,
      itemId: requestBody.itemId
    },
    UpdateExpression: 'set itemName = :itemName',
    ExpressionAttributeValues: {
      ':itemName': requestBody.itemName
    },
    ReturnValues: 'ALL_NEW'
  };

  const result = await dynamodb.update(params).promise();
  
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(result.Attributes)
  };
}

async function deleteItem(event) {
  const requestBody = JSON.parse(event.body);
  
  await dynamodb.delete({
    TableName: TABLE_NAME,
    Key: {
      listId: requestBody.listId,
      itemId: requestBody.itemId
    }
  }).promise();

  return {
    statusCode: 204,
    headers: CORS_HEADERS,
    body: JSON.stringify({ message: 'Item deleted successfully' })
  };
}

module.exports = { handler }; 