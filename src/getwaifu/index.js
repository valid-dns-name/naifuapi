
const AWS = require("aws-sdk");
import { ddbHashMapParamsPushDAO, ddbHashMapParamsGetDAO, rollRarity } from "../utils/dao";
exports.handler = async (event, context) => {
  console.log(JSON.stringify(event))
  // Use dynamodb to get items from the Item table
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  item = ddbHashMapParamsGetDAO("token_id", dynamodb, process.env.NAIFU_TABLE, event.queryStringParameters.token_id)
  if (item) {
  let waifu = {
    name: item.name,
    description: item.description,
    image: item.image,
    attributes: item.attributes
  }
} else {
  let rarity = rollRarity()
  let naifu_rarities = getNaifuRarityCollection(rarity, dynamodb)
  let new_naifu = getBaseNaifuForRarity(naifu_rarities, dynamodb)
  while (new_naifu.used) {
    new_naifu = getBaseNaifuForRarity(naifu_rarities, dynamodb)
  }
  new_naifu.used = true
  new_naifu.token_id = event.queryStringParameters.token_id
  let update_used_naifu = ddbHashMapParamsPushDAO("naifu_id", dynamodb, )
  let ddb_update = ddbHashMapParamsPushDAO("token_id", dynamodb, process.env.NAIFU_TABLE, new_naifu)
  console.log(`Successfully linked new token with base naifu: ${response}`)
  let waifu = new_naifu

  }

  // Return a 200 response if no errors
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(waifu)
  };

  return response;
};

function getNaifuRarityCollection(rarity, dynamodb) {
    let rarity = ddbHashMapParamsGetDAO("rarity", dynamodb, process.env.RARITIES, rarity)
    return JSON.parse(rarity.collection)
  };

function getBaseNaifuForRarity(collection, dynamodb) {
  let naifu_id = collection[Math.floor((Math.random() * collection.length))]
  let naifu = ddbHashMapParamsGetDAO("naifu_id", dynamodb, process.env.BASE_NAIFUS, naifu_id)
  return naifu
};
