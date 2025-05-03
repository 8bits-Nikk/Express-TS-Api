import { DataTypes } from "sequelize";
import sequelize from "../db/AppConnection";
import SQLModel from "../types/sqlModel";

class User extends SQLModel<User, { omit: "id" | "createdAt" | "updatedAt" }> {
  declare fullName: string;
  declare email: string;
  declare password: string;
  declare emailVerifiedAt: Date | null;
  declare profileImage: string;
  // default columns
  declare id: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Users",
    underscored: true,
  }
);

export default User;
