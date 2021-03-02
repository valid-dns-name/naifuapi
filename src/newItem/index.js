const AWS = require('aws-sdk');

exports.handler = async (event, context) => {
  console.log("EVENT: \N" + JSON.stringify(event, null, 2))
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const bucketpath = "https://s3.us-west-2.amazonaws.com/waifus/"
  const params = {
    TableName: process.env.TABLE_NAME, // get the table name from the automatically populated environment variables
    Item: {
      id:  '1', // modify with each invoke so the id does not repeat
      content: 'This is my content' // modify content here
      name: "DefaultString"
      
    },
    ConditionExpression: 'attribute_not_exists(id)', // do not overwrite existing entries
    ReturnConsumedCapacity: 'TOTAL'
  };

  try {
    // Write a new item to the Item table
    await dynamodb.put(params).promise();
    console.log(`Writing item ${params.Item.id} to table ${process.env.TABLE_NAME}.`);
  } catch (error) {
    console.log(`Error writing to table ${process.env.TABLE_NAME}. Make sure this function is running in the same environment as the table.`);
    throw new Error(error); // stop execution if dynamodb is not available
  }
  
  // Return a 200 response if no errors
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: 'Success!'
  };

  return response;
};
