import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  Default,
  Unique,
  AllowNull,
} from "sequelize-typescript";
import Budget from "./Budget";

@Table({
  tableName: "users",
})
class User extends Model {
  @AllowNull(false) // This column cannot be null
  @Column({
    type: DataType.STRING(50),
  })
  declare name: string;

  @AllowNull(false) // This column cannot be null
  @Column({
    type: DataType.STRING(60),
  })
  declare password: string;

  @Unique(true) // Ensure email is unique
  @AllowNull(false) // This column cannot be null
  @Column({
    type: DataType.STRING(50),
  })
  declare email: string;

  @Column({
    type: DataType.STRING(6),
  })
  declare token: string;

  @Default(false) // Default value is false it applies  to the column below
  @Column({
    type: DataType.BOOLEAN,
  })
  declare confirmed: boolean;

  @HasMany(() => Budget, {
    // One-to-many relationship with Budget model
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
  })
  declare budgets: Budget[]; // A user can have multiple budgets
}

export default User;
