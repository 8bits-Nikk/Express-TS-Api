import SQLModel from "../types/sqlModel";
import sequelize from "../db/AppConnection";
import { DataTypes } from "sequelize";

class Otp extends SQLModel<Otp, { omit: "id" | "createdAt" | "updatedAt" }> {
  declare email: string;
  declare otp: string;
  declare userId: string;
  // default columns
  declare id: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Otp.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Otp",
  }
);

export default Otp;
