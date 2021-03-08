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
    let oldNaifu = lodash.cloneDeep(naifu_response);
    try {
      let naifu = naifu_response;
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
      if (!validateStateUpdate(oldNaifu, naifu, 50)) {
        let invalidCardsResponse = {
          statusCode: 500,
          headers: {
            "Content-Type": "application/json",
          },
          body: `The card pack applicator failed to correctly apply cards, no database updates were tried. DO NOT BURN TOKENS`,
        };
        return invalidCardsResponse;
      }
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

function validateStateUpdate(oldNaifu, newNaifu, newCards) {
  oldAttributes = JSON.parse(oldNaifu.attributes);
  newAttributes = JSON.parse(newNaifu.attributes);
  oldAttributes.sort((a, b) => {
    a.trait_type > b.trait_type;
  });
  newAttributes.sort((a, b) => {
    a.trait_type > b.trait_type;
  });
  if (oldAttributes.length != newAttributes.length) {
    console.log(
      `Incorrect length of old and new attributes, Old: ${oldAttributes}. New: ${newAttributes}`
    );
    return false;
  }
  let library_index = -1;
  for (let i = 0; i < oldAttributes.length; i++) {
    if (oldAttributes[i].trait_type === "library") {
      libraryIndex = i;
      continue;
    }
    if (
      oldAttributes[i].trait_type === newAttributes[i].trait_type &&
      oldAttributes[i].value === newAttributes[i].value
    ) {
      continue;
    } else {
      console.log(
        `Attribute values that were not card libraries were updated incorrectly, oldvalues: type: ${oldAttributes[i].trait_type}, value: ${oldAttributes[i].value}. newValues: type: ${newAttributes[i].trait_type}, value: ${newAttributes[i].value}`
      );
      return false;
    }
  }
  let oldLibrary = JSON.parse(oldAttributes[libraryIndex]);
  let newLibrary = JSON.parse(newAttributes[libraryIndex]);
  let oldQty = 0;
  let newQty = 0;
  let seen = new Set();
  Object.entries(oldLibrary).map((key, value) => {
    if (!(key in newLibrary)) {
      console.log(
        `The user would lose a card from this update, bailing. Oldlibrary: ${oldLibrary}. NewLibrary: ${newLibrary}`
      );
    } else {
      oldQty += value;
      newQty += newLibrary[key].value;
      seen.add(key);
    }
  });
  Object.entries(newLibrary).map((key, value) => {
    if (!(key in seen)) {
      newQty += value;
    }
  });
  if (newQty - oldQty !== newCards) {
    console.log(
      `The user has not gotten the sufficient amount of cards for a pack buy, bailing. newQty: ${newQty}. oldQty: ${oldQty}`
    );
  }
}
