function ddbHashMapParamsPushDAO(key, dynamodb, tablename, object) {
    let hashmapParams = {
      TableName: tablename,
      Item: object
    }
      try {
        console.log(`Getting data from table ${tablename}.`)
        let response = await dynamodb.put(hashmapParams).promise(); // get items from DynamoDB
        console.log(`Got data from dynamodb, returned object: ${response.Item}.`)
      } catch (error) {
        console.log(`Error getting data from table ${tablename}. Make sure this function is running in the same environment as the table.`);
        throw new Error(error); // stop execution if data from dynamodb not available
      }
      return response.Item
  };
  
function ddbHashMapParamsGetDAO(id, dynamodb, tablename, target) {
    let hashmapParams = {
      TableName: tablename,
      Key: {
        id: target
      }
    }
      try {
        console.log(`Getting data from table ${tablename}.`)
        let response = await dynamodb.get(hashmapParams).promise(); // get items from DynamoDB
        console.log(`Got data from dynamodb, returned object: ${response.Item}.`)
      } catch (error) {
        console.log(`Error getting data from table ${tablename}. Make sure this function is running in the same environment as the table.`);
        throw new Error(error); // stop execution if data from dynamodb not available
      }
      return response
    };
export { ddbHashMapParamsGetDAO, ddbHashMapParamsPushDAO }