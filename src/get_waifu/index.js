const AWS = require('aws-sdk');

exports.handler = async (event, context) => {
  console.log(JSON.stringify(event))
  // Use dynamodb to get items from the Item table
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const params = {
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: 'id = :hashKey',
    ExpressionAttributeValues: {
      ':hashKey': event.queryStringParameters.id
    },
  };

  let allItems = [];

  try {
    console.log(`Getting data from table ${process.env.TABLE_NAME}.`);
    const items = await dynamodb.query(params).promise(); // get items from DynamoDB
    items.Items.forEach((item) => allItems.push(item)); // put contents in an array for easier parsing
    allItems.forEach(item => console.log(`Item ${item.id}: ${item.content}\n`)); // log the contents
  } catch (error) {
    console.log(`Error getting data from table ${process.env.TABLE_NAME}. Make sure this function is running in the same environment as the table.`);
    throw new Error(error); // stop execution if data from dynamodb not available
  }
  var item = allItems[0]
  var waifu = {
    name: item.name,
    description: item.description,
    image: item.image,
  }

  // Return a 200 response if no errors
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(waifu)
  };

  return response;
};
