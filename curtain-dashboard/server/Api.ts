import express  from 'express';
import { IncomingMessage } from "http";
import { IController } from './interfaces';
import cors from 'cors';

class Api {
  public express: express.Application;
  public router: express.Router;
  public port: number;

  constructor(controllers: IController[], port: number) {
    this.express = express();
    this.router = express.Router()
    this.port = port;

    this.initializeMiddlewares();
    this.mountControllers(controllers);
  }

  private initializeMiddlewares() {
    if (process.env.NODE_ENV === 'development') {
      this.express.use(cors())
    }
    this.express.use(express.urlencoded({ extended: false }))

    this.express.use(express.json({
        type(req: IncomingMessage){
          if (req.url.includes('api/sensor-data'))
            return true;

          if (req.headers["content-type"] === 'application/json')
            return true;

          return false
        }
    })
    );
  }

  private mountControllers(controllers: IController[]) {
    controllers.forEach((controller) => {
      controller.routes.forEach((route) => {
        this.router[route.METHOD](`${controller.path}${route.slug ? route.slug : ''}`, route.handler)
      })
    });
    this.express.use('/api', this.router);
  }

  public listen() {
    this.express.listen(this.port, () => {
      // tslint:disable-next-line
      console.log(`App [${process.env.NODE_ENV}] listening on the port ${this.port}`);
    });
  }
}

export default Api;