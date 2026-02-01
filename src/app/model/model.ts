export class Vector {
  x: number = 0
  y: number = 0
  z: number = 0
}

export class Simulation {
    id: number = 0
    title: string = ""
    duration: number = 0
    delta_t: number = 0
    writingRate: number = 0
    isDirty: boolean = false
    celestialObjects: CelestialObject[] = []
} 

export class CelestialObject {
    id: number = 0
    simulationId: number = 0
    name: string = ""
    mass: number = 0
    position: Vector = {x: 0, y: 0, z: 0}
    velocity: Vector = {x: 0, y: 0, z: 0}
    acceleration: Vector = {x: 0, y: 0, z: 0}
    positionHistory: PositionHistory[] = []
}

export class PositionHistory {
    id?: number
    celestialObjectId?: number
    time: number = 0
    position: Vector = {x: 0, y: 0, z: 0}
    normalizedPosition?: Vector
}

export enum UnitType {
    DISTANCE,
    TIME,
    VELOCITY
}