import { IMessage } from "../interfaces/message.interface";
const validator = require("validator");

export const messageValidator = (message: IMessage) => {
  const errors = [];

  if (!validator.isLength(message.message, { min: 1, max: 300 })) {
    errors.push(
      "Message text is required and must be between 1 and 300 characters"
    );
  } else {
    message.message = validator.escape(message.message);
  }

  if (!validator.isString(message.senderId)) {
    errors.push("There must be a sender");
  }

  if (!validator.isString(message.messageClientId)) {
    errors.push("There must be a message client id");
  }

  if (!validator.isString(message.room)) {
    errors.push("Room name is required");
  }

  return errors;
};
