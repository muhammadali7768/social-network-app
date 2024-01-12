import { IMessage } from "../interfaces/message.interface";

export const messageValidator = (message: IMessage) => {
  const errors = [];

  if (message.message.trim()==="" || message.message.length < 1 || message.message.length > 300) {
    errors.push(
      "Message text is required and must be between 1 and 300 characters"
    );
  } else {
    message.message = sanitizeInput(message.message);
  }



  return {errors, sanitizedMessage:message};
};

const sanitizeInput=(input:string)=> {
  return input.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
