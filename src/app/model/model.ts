export class Vector {
  X: number = 0
  Y: number = 0
  Z: number = 0
}

export class Simulation {
    Id: number = 0
    Title: string = ""
    Duration: number = 0
    Delta_t: number = 0
    WritingRate: number = 0
    IsDirty: boolean = false
    CelestialObjects: CelestialObject[] = []
} 

export class CelestialObject {
    Id: number = 0
    SimulationId: number = 0
    Name: string = ""
    Mass: number = 0
    Position: Vector = {X: 0, Y: 0, Z: 0}
    Velocity: Vector = {X: 0, Y: 0, Z: 0}
    Acceleration: Vector = {X: 0, Y: 0, Z: 0}
    PositionHistory: PositionHistory[] = []
}

export class PositionHistory {
    Id: number = 0
    CelestialObjectId: number = 0
    Time: number = 0
    Position: Vector = {X: 0, Y: 0, Z: 0}
    normalizedPosition: Vector = {X: 0, Y: 0, Z: 0}
}

export enum UnitType {
    DISTANCE,
    TIME,
    VELOCITY
}