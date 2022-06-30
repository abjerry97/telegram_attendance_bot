let Id = require("valid-objectid");
const stringIsEqual = (firstString, secondString) => {
    return (
      new String(firstString).valueOf() == new String(secondString).valueOf()
    );
  };
  let isValidMongoObjectId = (str) => {
    let finalValue = false;
    if (str) {
      finalValue = Id.isValid(str);
      return finalValue;
    }
    return finalValue;
  };
  let isValidMongoObject = (mongoObject) => {
    let finalValue =
      mongoObject !== null &&
      mongoObject !== undefined &&
      mongoObject !== {} &&
      mongoObject._id !== null &&
      mongoObject._id !== undefined &&
      isValidMongoObjectId(mongoObject._id);
    return finalValue;
  };
  
  module.exports={stringIsEqual,isValidMongoObject,isValidMongoObjectId}