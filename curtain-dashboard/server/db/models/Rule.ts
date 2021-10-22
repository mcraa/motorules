import { DataTypes, Model, ModelAttributes } from "sequelize";

export class Rule extends Model {

}

export const RuleType: ModelAttributes<Rule> = {
    name: DataTypes.STRING,
    sensor: DataTypes.STRING,
    treshold: DataTypes.STRING,
    above: DataTypes.BOOLEAN,
    priority: DataTypes.TINYINT,
    targetPercent: DataTypes.TINYINT,
    targetMotorId: DataTypes.INTEGER,
    isActive: DataTypes.BOOLEAN
  }
