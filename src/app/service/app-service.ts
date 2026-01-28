import { Injectable } from "@angular/core"
import { Subject } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class AppService {

  constructor() {}

  simulationCelestialObjects$ = new Subject<any>();

  getSimulationCelestialObjects() {
    return this.simulationCelestialObjects$.asObservable();
  }

  setSimulationCelestialObjects(value: any) {
    this.simulationCelestialObjects$.next(value);
  }
}