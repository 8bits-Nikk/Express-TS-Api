import express from "express";
import StatusCodes from "../constants/StatusCodes";
import ApiResponse from "../utils/ApiResponse";

const healthRouter = express.Router();

healthRouter.get("/", (_, res) => {
  res.status(StatusCodes.OK).json(ApiResponse.success("Server is running!"));
});

export default healthRouter;
