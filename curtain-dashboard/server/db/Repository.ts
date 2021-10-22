import { Sequelize } from "sequelize";
import { Motor, MotorType, Rule, RuleType } from "./models";



export class Repository {

    constructor(private db: Sequelize) { }

    async init() {
        try {
          await this.db.authenticate();
          // tslint:disable-next-line
          console.log('Connection has been established successfully.');
        }
        catch (error) {
          // tslint:disable-next-line
          console.error('Unable to connect to the database:', error);
        }

        // Define tables
        Rule.init(RuleType, { sequelize: this.db });
        Motor.init(MotorType, { sequelize: this.db });

        this.db.sync()
    }
}