import express from "express";
import StatusCodes from "../constants/StatusCodes";
import ApiError from "../utils/ApiError";

const notFoundRouter = express.Router();

notFoundRouter.all("*all", (req, _res, next) => {
  next(
    new ApiError(
      `Cannot find ${req.originalUrl} on this server!`,
      StatusCodes.NOT_FOUND
    )
  );
});

export default notFoundRouter;
