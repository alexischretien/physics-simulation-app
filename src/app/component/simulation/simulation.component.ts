import { Component, inject } from '@angular/core';
import { CircleComponent, Vector } from "../circle/circle.component";
import { ApiService } from '../../service/api-service';
import { CelestialObject, Simulation, UnitType } from '../../model/model';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table'
import { MatRadioModule } from '@angular/material/radio';

const SCENE_SCALE = 400
const SUPERSCRIPT_ARRAY = [['0','⁰'],['1','¹'],['2','²'],['3','³'],['4','⁴'],['5','⁵'],
    ['6','⁶'],['7','⁷'],['8','⁸'],['9','⁹'],['-','⁻'],['8','⁸'],['+', '']]

@Component({
  selector: 'app-simulation',
  imports: [CircleComponent, MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatSelectModule, MatExpansionModule, MatTableModule, MatRadioModule],
  templateUrl: './simulation.component.html',
  styleUrl: './simulation.component.css',
})
export class SimulationComponent {


  displayedColumns: string[] = ["Time", "X", "Y", "Z"]
  distanceUnits = [
    {id: 0, label: "Metre (m)", symbol: "m", conversionRate: 1}, 
    {id: 1, label: "Kilometre (km)", symbol: "km", conversionRate: 1000}, 
    {id: 2, label: "Astronomical unit (AU)", symbol: "AU", conversionRate: 149597870700},
  ]
  timeUnits = [
    {id: 0, label: "Second (s)", symbol: "s", conversionRate: 1}, 
    {id: 1, label: "Hour (h)", symbol: "h", conversionRate: 3600}, 
    {id: 2, label: "Day", symbol: "day", conversionRate: 86400}, 
    {id: 3, label: "Year", symbol: "year", conversionRate: 31556736}, 
  ]

  simulations!: Simulation[]
  selectedSimulation: Simulation = new Simulation()
  selectedDistanceUnit: any;
  selectedTimeUnit: any;
  UnitType = UnitType;

  private apiService = inject(ApiService)

  constructor() {
  }

  ngOnInit(): void {
    this.selectedDistanceUnit = this.distanceUnits[0]
    this.selectedTimeUnit = this.timeUnits[0]
      this.apiService.getSimulations().subscribe( {
      next: (simulations) => {
          this.simulations = simulations as Simulation[]
        }      
      ,
      error: (error) => {
        this.selectedSimulation = new Simulation()
        console.error(error);
      },
      complete: () => {
      }
    });
  }

  selectSimulation(event: any) {
    if(event.isUserInput) {
      this.apiService.getSimulationByIdNested(event.source.value).subscribe( {
        next: (simulation) => {
          this.selectedSimulation =  this.normalizeSimulationData(simulation)
        } 
        ,
        error: (error) => {
          this.selectedSimulation = new Simulation()
          console.error(error);
        },
        complete: () => {
        }
      });
    }
  }

  normalizeSimulationData(simulation: Simulation): Simulation {
    let max = this.findMaxPositionValues(simulation.CelestialObjects);
    let min = this.findMinPositionValues(simulation.CelestialObjects);

    let rangeMinMax: Vector = {X: Math.abs(max.X - min.X), Y: Math.abs(max.Y - min.Y), Z: Math.abs(max.Z - min.Z)}
    
    simulation.CelestialObjects.sort((a, b) => a.Id - b.Id)

    for (let i of simulation.CelestialObjects) {
      i.PositionHistory.sort((a, b) => a.Time - b.Time)

      for (let j of i.PositionHistory) {
        j.normalizedPosition = {
          X: (j.Position.X - min.X) * SCENE_SCALE / rangeMinMax.X, 
          Y: (j.Position.Y - min.Y) * SCENE_SCALE / rangeMinMax.Y, 
          Z: (j.Position.Z - min.Z) * SCENE_SCALE / rangeMinMax.Z
        }
      }
    }
    return simulation
  }

  findMaxPositionValues(celestialObject: CelestialObject[]): Vector {
    let max: Vector = {X: Number.MIN_VALUE, Y: Number.MIN_VALUE, Z: Number.MIN_VALUE};
    for (let i of celestialObject) {
      for (let j of i.PositionHistory) {
        if (j.Position.X && max.X && j.Position.X > max.X) max.X = j.Position.X
        if (j.Position.Y && max.Y && j.Position.Y > max.Y) max.Y = j.Position.Y
        if (j.Position.Z && max.Z && j.Position.Z > max.Z) max.Z = j.Position.Z
      }
    }
    return max
  }

  findMinPositionValues(celestialObject: CelestialObject[]): Vector {
    let min: Vector = {X: Number.MAX_VALUE, Y: Number.MAX_VALUE, Z: Number.MAX_VALUE};
    for (let i of celestialObject) {
      for (let j of i.PositionHistory) {
        if (j.Position.X && min.X && j.Position.X < min.X) min.X = j.Position.X
        if (j.Position.Y && min.Y && j.Position.Y < min.Y) min.Y = j.Position.Y
        if (j.Position.Z && min.Z && j.Position.Z < min.Z) min.Z = j.Position.Z
      }
    }
    return min
  }

  removeTrailingDecimalZeroes(num: string) {
    return num.replace(/(?<=\.\d*)0+$/, '').replace(/\.$/, '')
  }

  scientificNotation(number: number, precision?: number): string {
    if (!precision) {
      precision = 4
    }
    let numberString = number.toPrecision(precision)
    let numbers = numberString.split("e")
    numbers[0] = this.removeTrailingDecimalZeroes(numbers[0])

    if (numbers.length === 1 || numbers[1].length === 0) {
      return numbers[0]
    }
    return numbers[0] + " × 10" + SUPERSCRIPT_ARRAY.reduce((x, y) => x.replaceAll(y[0], y[1]), numbers[1])
  }

  scientificNotationConvertFromSelectedUnits(number: number, unitType: UnitType, ommitUnit?: boolean, precision?: number): string {
    number = this.convertNumberAccordingToSelectedUnits(number, unitType)
    return this.scientificNotation(number, precision) +  (ommitUnit ? "" : " " + this.getSelectedUnitSymbol(unitType))
  }

  convertNumberAccordingToSelectedUnits(number: number, unitType: UnitType): number {
    switch (unitType) {
      case UnitType.TIME: return number / this.selectedTimeUnit.conversionRate;
      case UnitType.DISTANCE: return number / this.selectedDistanceUnit.conversionRate;
      case UnitType.VELOCITY: return number / this.selectedDistanceUnit.conversionRate * this.selectedTimeUnit.conversionRate;
    }
  }

  getSelectedUnitSymbol(unitType: UnitType): string {
    switch (unitType) {
      case UnitType.TIME: return this.selectedTimeUnit.symbol;
      case UnitType.DISTANCE: return this.selectedDistanceUnit.symbol;
      case UnitType.VELOCITY: return this.selectedDistanceUnit.symbol + "/" + this.selectedTimeUnit.symbol;
    }
  }

  onSelectedDistanceUnitChange(value: any) {
    this.selectedDistanceUnit = this.distanceUnits[value]
  }

  onSelectedTimeUnitChange(value: any) {
    this.selectedTimeUnit = this.timeUnits[value]
  }
}

export { UnitType };