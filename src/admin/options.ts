import { AdminJSOptions } from "adminjs";

import componentLoader from "./component-loader";
import sequelize from "../db/AppConnection";

import User from "../models/User.model";
import Otp from "../models/Otp.model";

const options: AdminJSOptions = {
  componentLoader,
  rootPath: "/admin",
  resources: [User, Otp],
  databases: [sequelize],
};

export default options;
