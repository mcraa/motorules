export interface IRule {
    sensor: string,
    name: string,
    treshold: string,
    above: boolean,
    priority: number,
    targetPercent: number,
    targetMotorId: number
}

export interface IRuleModel {
    id: number
    sensor: string,
    name: string,
    treshold: string,
    above: boolean,
    priority: number,
    targetPercent: number,
    targetMotorId: number,
    isActive: boolean
    updatedAt: Date
}