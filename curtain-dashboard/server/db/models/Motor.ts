import { DataTypes, Model, ModelAttributes } from "sequelize";

export class Motor extends Model {

}

export const MotorType: ModelAttributes<Motor> = {
    name: DataTypes.STRING,
    stepLength: DataTypes.TINYINT,
    fullDistance: DataTypes.INTEGER,
    motorNo: DataTypes.TINYINT,
    layerNo: DataTypes.TINYINT,
    currentPosition: DataTypes.INTEGER
  }
