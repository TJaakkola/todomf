const { DynamoDB } = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

async function handler(event) {
  try {
    switch (event.httpMethod) {
      case 'POST':
        return await createTodo(event);
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

async function createTodo(event) {
  const requestBody = JSON.parse(event.body || '{}');
  const userId = event.requestContext.authorizer?.claims?.sub || 'default-user'; // We'll update this when we add authentication
  
  const todo = {
    userId,
    todoId: uuidv4(),
    title: requestBody.title,
    description: requestBody.description,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  await dynamodb.put({
    TableName: TABLE_NAME,
    Item: todo,
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify(todo),
  };
}

module.exports = { handler };