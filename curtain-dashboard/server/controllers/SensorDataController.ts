import * as express from 'express';

import { HttpMethod, IController } from '../interfaces';
import Rules from '../services/RulesService'
import Sensors from '../services/SensorsService'
import Motors from '../services/MotorsService';

export class SensorDataController implements IController {
  public path = '/sensor-data';

  public routes = [
    // receive sensor data
    {
      METHOD: HttpMethod.POST,
      handler: async (request: express.Request, response: express.Response) => {
        const { metrics } = request.body

        Sensors.parseMetricsTostore(metrics)
        const motorUpdates = await Rules.checkAgainstMetrics(Sensors.getStoredData())
        const result = await Motors.setToPosition(motorUpdates)

        response.status(200).json({ moved: result });
      }
    },

    // list available sensor data
    {
      METHOD: HttpMethod.GET,
      handler: (request: express.Request, response: express.Response) => {
        const currentTime = new Date(Date.now())
        const hours = `${currentTime.getHours()}`.padStart(2,'0')
        const mins = `${currentTime.getMinutes()}`.padStart(2,'0')
        response.json({ ...Sensors.getStoredData(), server_time: `${hours}:${mins}`});
      }
    }
  ]
}