export interface IMotor {
    name: string,
    stepLength: number,
    fullDistance: number,
    motorNo: 1 | 2
    layerNo: 1 | 2 | 3 | 4
}

export interface IMotorModel {
    id: number
    name: string,
    stepLength: number,
    fullDistance: number,
    motorNo: 1 | 2
    layerNo: 1 | 2 | 3 | 4
    currentPosition: number,
    updatedAt: Date
}

export interface IMotorPositionDict {
    [motorId: string]: number
}