import { InferAttributes, InferCreationAttributes, Model } from "sequelize";

class SQLModel<
  T extends Model,
  X extends { omit: keyof T } = {
    omit: never;
  }
> extends Model<InferAttributes<T>, InferCreationAttributes<T, X>> {}

export default SQLModel;
