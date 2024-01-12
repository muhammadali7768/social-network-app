import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/custom.error";
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
   return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  res.status(400).send({
    //TODO: Update the error to a general type of error in Production
    errors: [{ message: "Something went wrong :"+ err.message }],
  });
};
