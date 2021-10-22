import * as express from 'express';

import { IController, HttpMethod } from '../interfaces';
import Rules from '../services/RulesService';
import Motors from '../services/MotorsService';

export class RulesController implements IController {
  public path = '/rules';

  constructor() {
    Rules.Cron.init()
  }

  public routes = [
    // List all rules
    {
      METHOD: HttpMethod.GET,
      handler: async (request: express.Request, response: express.Response) => {
        const res = await Rules.getAll()
        response.json(res)
      }
    },

    // Create one rule
    {
      METHOD: HttpMethod.POST,
      handler: async (request: express.Request, response: express.Response) => {
        // tslint:disable-next-line
        if (request.body.priority == undefined) { request.body.priority = 1 }
        // tslint:disable-next-line
        if (request.body.sensor == 'cron') { request.body.above = false }
        const { sensor, treshold, above, targetPercent, priority, targetMotorId } = request.body

        // tslint:disable-next-line
        if (!sensor || !treshold || above == undefined  || !targetPercent || !targetMotorId) {
          response.status(406).send({ error: "Fields sensor, treshold, above, targetPercent, motorNo are required."})
          return;
        }

        const motor = await Motors.getById(targetMotorId)
        if (!motor) {
          response.status(406).send({ error: `Can't find motor with id ${targetMotorId}. Select an existing motor pls.`})
          return;
        }

        const existing = await Rules.getAll({
          where: {
            targetMotorId,
            priority
          }
        })

        if (existing.length > 0) {
          response.status(406).send({ error: `Rule for motor "${motor.name}" with priority ${priority} already exists`})
          return;
        }

        const rule = await Rules.insert(request.body)

        response.send(rule);
      }
    },

    // delete rule by id
    {
      METHOD: HttpMethod.DELETE,
      slug: "/:id",
      handler: async (request: express.Request, response: express.Response) => {

        const delCount = await Rules.remove(+request.params.id);
        if (delCount) {
          response.status(202).json(delCount)
          return;
        }

        response.status(404).send();
      }
    }
  ]
}
