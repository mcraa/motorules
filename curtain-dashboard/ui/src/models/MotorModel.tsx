export type MotorModel = NewMotorModel & {    
    id: number,
    currentPosition: number,    
    createdAt: Date,
    updatedAt: Date
}

export interface NewMotorModel {
    name: string,
    fullDistance: number,
    stepLength: number,
    motorNo: number,
    layerNo: number,
}