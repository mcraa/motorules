import { IMotorPositionDict, IRuleModel } from "../interfaces"
import { Rule } from "../db/models"
import { FindOptions } from "sequelize"
import { CronJob } from "cron"
import Motors from './MotorsService'


const cronJobs: { [prioAndMotor: string]: CronJob } = {}

const addCron = (cron: IRuleModel) => {
    const id = `${cron.priority}_${cron.targetMotorId}`
    const target = {} as IMotorPositionDict
    target[cron.targetMotorId] = cron.targetPercent
    const job = new CronJob(cron.treshold, () => Motors.setToPosition(target))
    cronJobs[id] = job
    cronJobs[id].start();
  }

const removeCron = (id: string) => {
    cronJobs[id].stop();
    delete cronJobs[id]
  }

const initCronJobs = async () => {
    const storedCrons = await getAll({
      where: {
        sensor: 'cron'
      }
    })

    storedCrons.forEach(cron => {
      addCron(cron)
    });
  }

const checkAgainstMetrics = async (metrics: { [index: string] : string | number }): Promise<IMotorPositionDict> => {
    const allRules = await getAll({ order: [['priority', 'DESC']]});

    const rulesToActive = allRules.filter(r => (metrics[r.sensor] > r.treshold) === r.above)
    const rulesToInactive = allRules.filter(r => (metrics[r.sensor] > r.treshold) !== r.above).map(r => r.id)

    const rulesForMotors: IMotorPositionDict = {}
    const activeIds = rulesToActive.map(r => {
        if (!rulesForMotors[r.targetMotorId]) {
            rulesForMotors[r.targetMotorId] = r.targetPercent  // should be in priority order (top 1 gets in)
        }

        return r.id
    })

    // toActive rules to execution and set active
    await Rule.update({ isActive: true }, { where: { id: activeIds }})

    // set toInactive rules active col to false
    await Rule.update({ isActive: false }, { where: { id: rulesToInactive }})

    return rulesForMotors;
}

async function getAll(opt?: FindOptions<any>): Promise<IRuleModel[]> {
    const rules = await Rule.findAll(opt) as unknown[] as IRuleModel[]
    const result = rules.map((rule: any) => {
        return {
            id: rule.id,
            name: rule.name,
            sensor: rule.sensor,
            above: rule.above,
            priority: rule.priority || 1,
            targetMotorId: rule.targetMotorId,
            targetPercent: rule.targetPercent,
            updatedAt: rule.updatedAt,
            treshold: rule.treshold,
            isActive: rule.isActive
        }
    })

    return result;
}

async function getById(id: number): Promise<IRuleModel> {
    return (await getAll({ where: { id }}))[0]
}

const insert = async (value: any): Promise<IRuleModel> => {
    value.isActive = false
    const rule = await Rule.create(value) as unknown as IRuleModel

    if (rule.sensor === 'cron') {
        addCron(rule)
    }

    return rule
}

async function remove(id: number): Promise<number> {
    const rule = await getById(id);

    if (rule && rule.sensor === 'cron') {
        removeCron(`${rule.priority}_${rule.targetMotorId}`)
    }

    return await Rule.destroy({where: { id }})
}

const RulesService: {
    getAll: (opt?: FindOptions<any>) => Promise<IRuleModel[]>,
    getById: (opt?: number) => Promise<IRuleModel>,
    insert: (value: any) => Promise<IRuleModel>
    remove: (id: number) => Promise<number>,
    Cron: {
        add: (rule: IRuleModel) => void,
        remove: (id: string) => void,
        init: () => void
    },
    checkAgainstMetrics: (metrics: { [index: string] : string | number }) => Promise<IMotorPositionDict>
} = {
    getAll,
    getById,
    insert,
    remove,
    Cron: {
        add: addCron,
        remove: removeCron,
        init: initCronJobs
    },
    checkAgainstMetrics
}

export default RulesService