import {
  Table, // Table is used to define a database table
  Column, // Column is used to define a column in the table
  DataType, // DataType is used to specify the type of data in a column
  Model, // Model is the base class for all models
  BelongsTo,
  ForeignKey,
  AllowNull, // AllowNull is used to specify if a column can be null
} from "sequelize-typescript"; // Import decorators from sequelize-typescript
import Budget from "./Budget";

// Define the Budget model with table name "budgets"
@Table({
  tableName: "expenses",
})
class Expense extends Model {
  // Define expenses model
  @AllowNull(false) // This column cannot be null
  @Column({
    type: DataType.STRING(100), // String type with max length of 100
  })
  declare name: string; // Expense name

  @AllowNull(false) // This column cannot be null
  @Column({
    type: DataType.DECIMAL, // Decimal type for currency values
  })
  declare amount: number; // Expense amount

  @ForeignKey(() => Budget) // Foreign key relationship to Budget model
  declare budgetId: number; // Foreign key column for budget ID

  @BelongsTo(() => Budget) // Define relationship to Budget model
  declare budget: Budget; // Each expense belongs to a budget
}

export default Expense;
