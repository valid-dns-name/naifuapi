const AWS = require("aws-sdk");
const lodash = require("lodash");
import {
  ddbHashMapParamsGetDAO,
  ddbHashMapParamsPushDAO,
  rollRarity,
} from "../utils/dao";
exports.handler = async (event, context) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  // Log the event argument for debugging and for use in local development.
  console.log(JSON.stringify(event, undefined, 2));
  naifu_id = event.naifu_id;
  let naifu_response = ddbHashMapParamsGetDAO(
    "token_id",
    dynamodb,
    process.env.USER_NAIFUS,
    naifu_id
  );
  if (naifu_response) {
    let old_naifu = lodash.cloneDeep(naifu_response);
    try {
      let naifu = naifu_response
      let cardrarities = {};
      for (let i = 0; i < 51; i++) {
        new_card_rarity = rollRarity();
        if (new_card_rarity in cardrarities) {
          cardrarities[new_card_rarity]++;
        } else {
          cardrarities[new_card_rarity] = 1;
        }
      }
      let minted_cards = [];
      for (const [rarity, quantity] of Object.entries(cardrarities)) {
        rarity_collection = JSON.parse(
          ddbHashMapParamsGetDAO(
            "rarity",
            dynamodb,
            process.env.CARD_RARITIES,
            rarity
          )
        );
        for (let i = 0; i < quantity; i++) {
          minted_cards.push(getCardForRarity(rarity_collection));
        }
      }
      naifu_attributes = JSON.parse(naifu.attributes);
      naifu_attributes.forEach((attribute) => {
        if (attribute.trait_type === "library") {
          let library = JSON.parse(attribute.value);
          minted_cards.forEach((card_id) => {
            if (card_id in library) {
              library.card_id++;
            } else {
              library.card_id = 1;
            }
          });
          attribute.value = JSON.stringify(library);
        }
      });
      updated_attributes = JSON.stringify(naifu_attributes);
      naifu.attributes = updated_attributes;
      let ddb_naifu_update = ddbHashMapParamsPushDAO(
        "token_id",
        dynamodb,
        process.env.USER_NAIFUS,
        naifu
      );
      let successresponse = {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: `Succesfully updated NAIFU ${naifu_id}`,
      };
      return successresponse;
    } catch (error) {
      try {
        let rollback_update = ddbHashMapParamsPushDAO(
          "token_id",
          dynamodb,
          process.env.USER_NAIFUS,
          old_naifu
        );
      } catch (error) {
        console.log(error);
        logging_naifu = JSON.stringify(old_naifu);
        console.log(
          `We really broke this naifu, naifu old_state, please roll it back ASAP ${logging_naifu}`
        );
        let rollbackfailureresponse = {
          statusCode: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: "Rollback failed!",
            rollback: false,
          }),
        };
        return rollbackfailureresponse;
      }
      let failureresponse = {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Failed to write new naifu",
          old_naifu: JSON.stringify(old_naifu),
          new_naifu: JSON.stringify(naifu),
          rollback: true,
        }),
      };
      return failureresponse;
    }
  } else {
    const response = {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: `Failed to retrieve NAIFU, please double-check the NAIFU ID. NAIFU ID: ${naifu_id}`,
    };
    return response;
  }
};
function getCardForRarity(collection) {
  let card_id = collection[Math.floor(Math.random() * collection.length)];
  return card_id;
}

function validateStateUpdate(oldnaifu, newnaifu) {
  old_attributes = JSON.parse(oldNaifu.attributes);
  new_attributes = JSON.parse(newNaifu.attributes);
}
