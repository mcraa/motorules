import { IMotorModel, IMotorPositionDict } from "../interfaces"
import { Motor } from "../db/models"
import { FindOptions } from "sequelize/types"
import superagent from 'superagent';

async function setToPosition(wantedPositions: IMotorPositionDict): Promise<number> {
    const ids = Object.keys(wantedPositions).map(k => +k);
    const motors = await getAll({ where: { id: ids } });
    let result = 0

    // calc necessary steps and call motor driver
    const calls = ids.map(async (id) => {
        const { fullDistance, currentPosition, stepLength, layerNo, motorNo } = motors.find(m => m.id === id)
        const diff = currentPosition - wantedPositions[id]
        const steps = Math.round(-diff / ((stepLength / fullDistance) * 100))
        try {
            const move = await superagent
                .post(process.env.MOTORS_URL || 'http://motor-driver:8070')
                .send({ layer: layerNo, motor: motorNo, steps })

            return move.statusCode
        } catch (error) {
            return error
        }
    });
    // wait for all the calls
    const results = await Promise.all(calls);

    // update pos in db
    for (const motor of motors) {
        result = await updateById(motor.id, { currentPosition: wantedPositions[motor.id] })
    }

    // TODO: check if updates were successful
    // map results with inputs

    // tslint:disable-next-line
    console.log(results);

    return result;
}

async function getAll(opt?: FindOptions<any>): Promise<IMotorModel[]> {
    const motors = await Motor.findAll(opt)
    const result = motors.map((motor: any) => {
        return  {
            id: motor.id,
            name: motor.name,
            layerNo: motor.layerNo || 1,
            motorNo: motor.motorNo || 1,
            stepLength: motor.stepLength,
            currentPosition: motor.currentPosition || 1,
            fullDistance: motor.fullDistance,
            updatedAt: motor.updatedAt,
          }
    })

    return result;
}

async function getById(id: number): Promise<IMotorModel> {
    return (await getAll({ where: { id }}))[0]
}

async function insert(value: any): Promise<IMotorModel> {
    // add default starting pos
    value.currentPosition = 1

    return await Motor.create(value) as unknown as IMotorModel
}

async function remove(id: number): Promise<number> {
    return await Motor.destroy({where: { id }})
}

async function updateById(id: number, update: any): Promise<number> {
    const [count, result] = await Motor.update(update, {where: { id }})
    return count;
}

const MotorsService: {
    getAll: (opt?: FindOptions<any>) => Promise<IMotorModel[]>,
    getById: (opt?: number) => Promise<IMotorModel>,
    insert: (value: any) => Promise<IMotorModel>
    remove: (id: number) => Promise<number>,
    updateById: (id: number, update: any) => Promise<number>,
    setToPosition: (positions: IMotorPositionDict) => Promise<number>
} = {
    getAll,
    getById,
    insert,
    remove,
    updateById,
    setToPosition
}

export default MotorsService