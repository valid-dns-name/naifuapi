function ddbHashMapParamsPushDAO(key, dynamodb, tablename, object) {
  let hashmapParams = {
    TableName: tablename,
    Item: object,
  };
  dynamodb.put(hashmapParams, (err, data) => {
    if (err) {
      console.log(err);
      throw new Error(err);
    } else {
      console.log(`Updated Data from ${tablename}, returned object: ${data}`);
      return data;
    }
  });
}

function ddbHashMapParamsGetDAO(id, dynamodb, tablename, target) {
  let hashmapParams = {
    TableName: tablename,
    Key: {
      id: target,
    },
  };
  dynamodb.get(hashmapParams, (err, data) => {
    if (err) {
      console.log(err);
      throw new Error(err);
    } else {
      console.log(`Got data from ${tablename}, returned object: ${data.Item}`);
      return data.Item;
    }
  });
}
function rollRarity() {
  let rarity = "";
  roll = Math.random() * 100;
  switch (roll) {
    case roll >= 99.98:
      rarity = "goddess";
      break;
    case roll >= 99.9:
      rarity = "angelic";
      break;
    case roll >= 99.0:
      rarity = "diva";
      break;
    case roll >= 90.0:
      rarity = "lovely";
      break;
    default:
      rarity = "cute";
  }
  return rarity;
}
export { ddbHashMapParamsGetDAO, ddbHashMapParamsPushDAO, rollRarity };
