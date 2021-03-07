const AWS = require("aws-sdk");
import { ddbHashMapParamsPushDAO, ddbHashMapParamsGetDAO } from "../utils/dao";
exports.handler = async (event, context) => {
  console.log(JSON.stringify(event))
  // Use dynamodb to get items from the Item table
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  item = ddbHashMapParamsGetDAO("relic_id", dynamodb, process.env.RELICS, event.queryStringParameters.token_id)
  if (item) {
  let relic = {
    name: item.name,
    description: item.description,
    image: item.image,
    attributes: item.attributes
  }
} else {
  roll = Math.random() * 100
  switch(roll) {
    case roll >= 99.98:
      rarity = "goddess"
      break;
    case roll >= 99.9:
      rarity = "angelic"
      break;
    case roll >= 99.0:
      rarity = "diva"
      break;
    case roll >= 90.0:
      rarity = "lovely"
      break;
    default:
      rarity = "cute"

    };
  let relic_rarities = getRelicRarityCollection(rarity, dynamodb)
  let relic = getRelicForRarity(relic_rarities, dynamodb)
  while (relic.used) {
    relic = getRelicForRarity(relic_rarities, dynamodb)
  }
  relic.used = true
  relic.token_id = event.queryStringParameters.token_id
  let update_used_relic = ddbHashMapParamsPushDAO("relic_id", dynamodb, process.env.RELICS, relic_id)
  let ddb_update = ddbHashMapParamsPushDAO("token_id", dynamodb, process.env.RELIC_TOKENS, relic)
  console.log(`Successfully linked new token with base naifu: ${response}`)

  }

  // Return a 200 response if no errors
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(relic)
  };

  return response;
};

function getRelicRarityCollection(rarity, dynamodb) {
    let rarity = ddbHashMapParamsGetDAO("rarity", dynamodb, process.env.RELIC_COLLECTIONS, rarity)
    return JSON.parse(rarity.collection)
  };

function getRelicForRarity(collection, dynamodb) {
  let relic_id = collection[Math.floor((Math.random() * collection.length))]
  let relic = ddbHashMapParamsGetDAO("relic_id", dynamodb, process.env.RELICS, relic_id)
  return relic
};