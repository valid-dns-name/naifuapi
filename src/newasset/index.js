const AWS = require('aws-sdk');
const uuid = require('uuid')
import { ddbHashMapParamsPushDAO, ddbHashMapParamsGetDAO } from "../utils/dao"
exports.handler = async (event, context) => {
  let tablemap = {
    "relic": { "key": "relic_id", "table": process.env.RELICS, "collections": process.env.RELIC_RARITIES},
    "naifu": { "key": "naifu_id", "table": process.env.BASE_NAIFUS, "collections": process.env.NAIFU_RARITIES},
    "card": { "key": "card_id", "table": process.env.CARDS, "collections": process.env.CARD_RARITIES }
  }
  // Generate the asset info for the table
  let new_asset_id = uuid()
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const bucketpath = "https://" + process.env.BUCKET_NAME + "/"
  let item = event.asset
  item.image = bucketpath + "lovely/" + event.asset_type + tablemap[event.asset_id] + ".png"
  item[tablemap[event.asset_type]["key"]] = new_asset_id

  try {
    // Grab the collections object
    let collection = JSON.parse(ddbHashMapParamsGetDAO("rarity", dynamodb, tablemap[event.asset_type]["collections"], event.asset.attributes.rarity))
    collection.push(new_asset_id)
    collection_string = JSON.stringify(collection)
    updated_collection = {
      rarity: event.asset.attributes.rarity,
      collection: updated_collection
    }
    console.log(`Writing new collection to the database: ${updated_collection}`)
    // Write new card to collection
    let collection_update = ddbHashMapParamsPushDAO("rarity", dynamodb, tablemap[event.asset_type]["collections"], updated_collection)
    console.log(`Collection update successful! ${collection_update}`)
    console.log(`Writing update to the asset(${event.asset_type}) table: ${item}`)
    // Writing new asset to the relevant table
    let table_update = ddbHashMapParamsPushDAO(tablemap[event.asset_type]["key"], dynamodb, tablemap[event.asset_type]["table"], item)
    console.log(`Asset table updated successfully: ${table_update}`)
  } catch (error) {
    console.log(`Error writing to table ${tablemap[event.asset_type["table"]]}. Make sure this function is running in the same environment as the table.`);
    throw new Error(error); // stop execution if dynamodb is not available
  }
  
  // Return a 200 response if no errors
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: { created_asset: new_asset_id }
  };

  return response;
};
