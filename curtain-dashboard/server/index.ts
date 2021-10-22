import express from "express";
import path from "path";
import Api from "./Api";
import { MotorsController, RulesController, SensorDataController } from "./controllers";
import { Sequelize } from 'sequelize';
import { Repository } from "./db";

const PORT = +process.env.PORT || 80;

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './data/database.sqlite'
});
const repo = new Repository(sequelize);

repo.init().then(() => {
  const app = new Api(
    [
      new RulesController(),
      new MotorsController(),
      new SensorDataController()
    ],
    PORT
  )

  // serve the UI
  app.express.use(express.static(path.resolve(__dirname, '../ui/build')));
  app.express.get('*', (_, res) => {
    res.sendFile(path.resolve(__dirname, '../ui/build', 'index.html'));
  });

  app.listen();
});