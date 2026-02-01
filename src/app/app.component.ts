import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { /*RouterLink, RouterLinkActive, */RouterOutlet } from '@angular/router';
import { SimulationComponent } from './component/simulation/simulation.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, /*RouterLink, RouterLinkActive,*/ CommonModule, SimulationComponent, TranslateModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  translate: TranslateService = inject(TranslateService)

  switchLanguage(lang: string) {
    this.translate.use(lang);
  }
}
