
const AWS = require('aws-sdk');
import { ddbHashMapParamsPushDAO, ddbHashMapParamsGetDAO } from '../utils/dao';
exports.handler = async (event, context) => {
  console.log(JSON.stringify(event))
  // Use dynamodb to get items from the Item table
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  item = ddbHashMapParamsGetDAO('token_id', dynamodb, process.env.NAIFU_TABLE, event.queryStringParameters.token_id)
  if (item) {
  var waifu = {
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
      rarity = 'diva'
      break;
    case roll >= 90.0:
      rarity = 'lovely'
      break;
    default:
      rarity = 'cute'

    };
  let naifu_rarities = getNaifuRarityCollection(rarity, dynamodb)
  let new_naifu = getBaseNaifuForRarity(naifu_rarities, dynamodb)
  new_naifu.token_id = event.queryStringParameters.token_id
  let response = ddbHashMapParamsPushDAO('token')
  console.log(`Successfully linked new token with base naifu: ${response}`)
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

function getNaifuRarityCollection(rarity, dynamodb) {
    let rarity = ddbHashMapParamsGetDAO("rarity", dynamodb, process.env.RARITIES, rarity)
    return JSON.parse(rarity.collection)
  };

function getBaseNaifuForRarity(collection, dynamodb) {
  let naifu_id = collection[Math.floor((Math.random() * collection.length))]
  let naifu = ddbHashMapParamsGetDAO("naifu_id", dynamodb, process.env.BASE_NAIFUS, naifu_id)
  return naifu
};
