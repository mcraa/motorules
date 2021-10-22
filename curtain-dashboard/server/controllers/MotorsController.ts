import * as express from 'express';

import { IController, HttpMethod, IMotorPositionDict } from '../interfaces';
import Motors from '../services/MotorsService'

export class MotorsController implements IController {
  public path = '/motors';

  public routes = [
    // GET all motors
    {
      METHOD: HttpMethod.GET,
      handler: async (request: express.Request, response: express.Response) => {
        const res = await Motors.getAll()
        response.json(res)
      }
    },

    // Create one motor
    {
      METHOD: HttpMethod.POST,
      handler: async (request: express.Request, response: express.Response) => {
        // tslint:disable-next-line
        if (request.body.layerNo == undefined) { request.body.layerNo = 1 }
        // tslint:disable-next-line
        if (request.body.motorNo == undefined) { request.body.motorNo = 1 }
        const { name, fullDistance, stepLength, layerNo, motorNo } = request.body

        // tslint:disable-next-line
        if (!fullDistance || !stepLength || !name ) {
          response.status(406).send({ error: "Fields stepLength, fullDistance, name are required."})
          return;
        }

        const existing = await Motors.getAll({
          where: {
            layerNo,
            motorNo
          }
        })

        if (existing.length > 0) {
          response.status(406).send({ error: `Motor #${motorNo} on layer "${layerNo}" already exists`})
          return;
        }

        const motor = await Motors.insert(request.body)
        response.send(motor);
      }
    },

    // update motor by id
    {
      METHOD: HttpMethod.PUT,
      slug: "/:id",
      handler: async (request: express.Request, response: express.Response) => {
        const updateCount = await Motors.updateById(+request.params.id, {...request.body});
        if (updateCount) {
          response.status(202).json({ count: updateCount })
          return;
        }

        response.status(404).send();
      }
    },

    // update motor position by id
    {
      METHOD: HttpMethod.PUT,
      slug: "/:id/position",
      handler: async (request: express.Request, response: express.Response) => {
        const update = {} as IMotorPositionDict
        update[+request.params.id] = request.body.currentPosition
        const count = await Motors.setToPosition(update)

        if (count) {
          response.status(202).json({ count })
          return;
        }

        response.status(404).send();
      }
    },

    // delete motor by id
    {
      METHOD: HttpMethod.DELETE,
      slug: "/:id",
      handler: async (request: express.Request, response: express.Response) => {
        const delCount = await Motors.remove(+request.params.id);
        if (delCount) {
          response.status(202).json(delCount)
          return;
        }

        response.status(404).send();
      }
    }
  ]
}
