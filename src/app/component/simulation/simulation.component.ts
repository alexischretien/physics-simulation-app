import { Component, inject } from '@angular/core';
import { CircleComponent, Vector } from "../circle/circle.component";
import { ApiService } from '../../service/api-service';
import { CelestialObject, Simulation, UnitType } from '../../model/model';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from "@angular/material/card";
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table'
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { AppService } from '../../service/app-service';



const SCENE_SCALE = 460
const SUPERSCRIPT_ARRAY = [['0','⁰'],['1','¹'],['2','²'],['3','³'],['4','⁴'],['5','⁵'],
    ['6','⁶'],['7','⁷'],['8','⁸'],['9','⁹'],['-','⁻'],['8','⁸'],['+', '']]

@Component({
  selector: 'app-simulation',
  imports: [CircleComponent, MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatSelectModule, FormsModule,
    MatExpansionModule, MatTableModule, MatRadioModule, MatButtonModule, MatIconModule, MatDividerModule, 
    TranslateModule, MatDialogModule],
  templateUrl: './simulation.component.html',
  styleUrl: './simulation.component.css',
})
export class SimulationComponent {


  displayedColumns: string[] = ["Time", "X", "Y", "Z"]
  distanceUnits = [
    {id: 0, i18n: "simulation.unit.metre", conversionRate: 1}, 
    {id: 1, i18n: "simulation.unit.kilometre", conversionRate: 1000}, 
    {id: 2, i18n: "simulation.unit.astronomicalUnit", conversionRate: 149597870700},
  ]
  timeUnits = [
    {id: 0, i18n: "simulation.unit.second", conversionRate: 1}, 
    {id: 1, i18n: "simulation.unit.hour", conversionRate: 3600}, 
    {id: 2, i18n: "simulation.unit.day", conversionRate: 86400}, 
    {id: 3, i18n: "simulation.unit.year", conversionRate: 31556736}, 
  ]

  simulations!: Simulation[]
  selectedSimulation: Simulation = new Simulation()
  createModifySimulation: Simulation = new Simulation()
  selectedDistanceUnit: any
  selectedTimeUnit: any
  UnitType = UnitType
  isCreateMode = false
  isModifyMode = false

  private apiService = inject(ApiService)
  private appService = inject(AppService)
  private translateService = inject(TranslateService)
  readonly dialog = inject(MatDialog);
  
  constructor() {
  }

  ngOnInit(): void {
    this.selectedDistanceUnit = this.distanceUnits[0]
    this.selectedTimeUnit = this.timeUnits[0]
    this.isCreateMode = false
    this.isModifyMode = false
    this.populateSimulationDropdown()
  }

  populateSimulationDropdown() {
      this.apiService.getSimulations().subscribe( {
      next: (simulations) => {
          this.simulations = simulations as Simulation[]
        }      
      ,
      error: (error) => {
        this.selectedSimulation = new Simulation()
        console.error(error);
      }
    });
  }

  selectSimulation(event: any) {
    if(event.isUserInput) {
      this.selectSimulationById(event.source.value)
    }
  }

  selectSimulationById(id: number) {
    this.apiService.getSimulationByIdNested(id).subscribe( {
      next: (simulation) => {
        this.selectedSimulation = this.normalizeSimulationData(simulation)
      } 
      ,
      error: (error) => {
        this.selectedSimulation = new Simulation()
        console.error(error);
      }
    });
    this.isCreateMode = false
    this.isModifyMode = false
  }

  normalizeSimulationData(simulation: Simulation): Simulation {
    if (simulation.celestialObjects?.length > 0) {
      if (simulation.isDirty) {
        simulation.celestialObjects.forEach(c => c.positionHistory = [{time: 0, position: {x: c.position.x, y: c.position.y, z: c.position.z}, normalizedPosition: new Vector()}])
      }
      let max = this.findMaxPositionValues(simulation.celestialObjects);
      let min = this.findMinPositionValues(simulation.celestialObjects);

      let rangeMinMax: Vector = {x: Math.abs(max.x - min.x), y: Math.abs(max.y - min.y), z: Math.abs(max.z - min.z)}
      let sceneAjustementCoefficient = SCENE_SCALE / Math.max(rangeMinMax.x, rangeMinMax.y, rangeMinMax.z)

      simulation.celestialObjects.sort((a, b) => a.id - b.id)

      for (let i of simulation.celestialObjects) {
        i.positionHistory.sort((a, b) => a.time - b.time)

        for (let j of i.positionHistory) {
          j.normalizedPosition = {
            x: (j.position.x - min.x) * sceneAjustementCoefficient, 
            y: (j.position.y - min.y) * sceneAjustementCoefficient, 
            z: (j.position.z - min.z) * sceneAjustementCoefficient
          }
        }
      }
    }
    return simulation
  }

  findMaxPositionValues(celestialObject: CelestialObject[]): Vector {
    let max: Vector = {x: Number.MIN_VALUE, y: Number.MIN_VALUE, z: Number.MIN_VALUE};
    for (let i of celestialObject) {
      for (let j of i.positionHistory) {
        if (j.position.x > max.x) max.x = j.position.x
        if (j.position.y > max.y) max.y = j.position.y
        if (j.position.z > max.z) max.z = j.position.z
      }
    }
    return max
  }

  findMinPositionValues(celestialObject: CelestialObject[]): Vector {
    let min: Vector = {x: Number.MAX_VALUE, y: Number.MAX_VALUE, z: Number.MAX_VALUE};
    for (let i of celestialObject) {
      for (let j of i.positionHistory) {
        if (j.position.x < min.x) min.x = j.position.x
        if (j.position.y < min.y) min.y = j.position.y
        if (j.position.z < min.z) min.z = j.position.z
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
      case UnitType.TIME: return this.getSymbol(this.selectedTimeUnit);
      case UnitType.DISTANCE: return this.getSymbol(this.selectedDistanceUnit);
      case UnitType.VELOCITY: return this.getSymbol(this.selectedDistanceUnit) + "/" + this.getSymbol(this.selectedTimeUnit);
    }
  }

  getSymbol(unit: any): string {
    return this.translateService.instant(unit.i18n + '.symbol')
  }

  onSelectedDistanceUnitChange(value: any) {
    this.selectedDistanceUnit = this.distanceUnits[value]
  }

  onSelectedTimeUnitChange(value: any) {
    this.selectedTimeUnit = this.timeUnits[value]
  }

  onClickNewEdit(isCreate: boolean) {
    this.createModifySimulation = isCreate ? new Simulation() : this.newDirtySimulation(this.selectedSimulation)
    this.createModifySimulation.celestialObjects
    this.isCreateMode = isCreate
    this.isModifyMode = !isCreate
  }

  cancelCreateModify() {
    this.isCreateMode = false
    this.isModifyMode = false
  }

  newDirtySimulation(simulation: Simulation): Simulation {
    let sim = structuredClone(simulation)
    sim.isDirty = true
    sim = this.normalizeSimulationData(sim)
    return sim
  }

  isSaveDisabled(): boolean {
    //TODO
    return false;
  }

  isEditionMode(): boolean {
    return this.isCreateMode || this.isModifyMode
  }

  saveSimulation(isCreate: boolean) {
    if (!this.isSaveDisabled()) {
      if (isCreate) {
        this.apiService.postSimulation(this.createModifySimulation).subscribe({
          next: (simulation) => {
            this.onSuccessfulSave(simulation.id)
          },
          error: (error) => {
            this.selectedSimulation = new Simulation()
            console.error(error);
          }
        });
      } else {
        this.apiService.patchSimulation(this.createModifySimulation).subscribe({
          next: (simulation) => {
            this.onSuccessfulSave(simulation.id)
          } ,
          error: (error) => {
            this.selectedSimulation = new Simulation()
            console.error(error);
          }
        });
      }
    }
  }

  onSuccessfulSave(id: number) {
    this.populateSimulationDropdown()
    this.selectSimulationById(id)
    this.isCreateMode = false
    this.isModifyMode = false
  }


  runSimulation() {
    if (this.selectedSimulation.isDirty && !this.isEditionMode()) {
       this.apiService.runSimulation(this.selectedSimulation.id).subscribe({
          next: () => {
            console.log("next")
            this.selectSimulationById(this.selectedSimulation.id)
          } ,
          error: (error) => {
            console.log("error")
            console.error(error);
          }
        });
        console.log("end")
    }
  }

  onClickAdd() {
    if (this.isEditionMode()) {
      this.createModifySimulation.celestialObjects = this.createModifySimulation.celestialObjects.concat(new CelestialObject())
    }
  }

  deleteCelestialObject(index: number) {
    if (this.isEditionMode()) {
      this.createModifySimulation.celestialObjects.splice(index, 1)
    }
  }
}
export { UnitType };