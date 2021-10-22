export type RuleModel = NewRuleModel & {    
    id: number,    
    createdAt: Date,
    updatedAt: Date
}

export interface NewRuleModel {
    name: string,
    sensor: string,
    treshold: string,
    above: boolean,
    priority: number,
    targetPercent: number,
    targetMotorId: number
}