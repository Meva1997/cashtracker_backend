import {
  Table, // Table is used to define a database table
  Column, // Column is used to define a column in the table
  DataType, // DataType is used to specify the type of data in a column
  HasMany, // HasMany is used to define one-to-many relationships
  Model, // Model is the base class for all models
  AllowNull, // AllowNull is used to specify if a column can be null
  BelongsTo, // BelongsTo is used to define many-to-one relationships
  ForeignKey, // ForeignKey is used to define foreign key relationships
} from "sequelize-typescript"; // Import decorators from sequelize-typescript
import Expense from "./Expense";
import User from "./User";

// Define the Budget model with table name "budgets"
@Table({
  tableName: "budgets",
})
class Budget extends Model {
  // Define Budget model
  @AllowNull(false) // This column cannot be null
  @Column({
    // Primary key column
    type: DataType.STRING(100), // String type with max length of 100
  })
  declare name: string; // Budget name

  @AllowNull(false) // This column cannot be null
  @Column({
    // Amount column
    type: DataType.DECIMAL(10, 2), // Decimal type for currency values
  })
  declare amount: number; // Budget amount

  @HasMany(() => Expense, {
    onUpdate: "CASCADE", // Cascade updates this makes sure changes propagate to the related expenses
    onDelete: "CASCADE", // Cascade deletes this ensures that if a budget is deleted, its associated expenses are also deleted
  }) // One-to-many relationship with Expense model
  declare expenses: Expense[]; // A budget can have multiple expenses

  @ForeignKey(() => User) // Foreign key relationship with User model
  declare userId: number; // Foreign key column to reference the User model

  @BelongsTo(() => User) // Many-to-one relationship with Expense model
  declare user: User; // Each budget belongs to a single user
}

export default Budget;
