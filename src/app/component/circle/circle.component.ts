import { Component, ElementRef, inject, Input } from "@angular/core";
import { animate, AnimationBuilder, AnimationMetadata, AnimationPlayer, style, } from '@angular/animations';
import { CelestialObject, Vector } from "../../model/model";
import { AppService } from "../../service/app-service";


@Component({
  selector: 'app-circle',
  imports: [],
  templateUrl: './circle.component.html',
  styleUrl: './circle.component.css',
  standalone: true
})
export class CircleComponent {
  private player: AnimationPlayer | undefined;

  @Input() celestialObject!: CelestialObject
  @Input() isAnimationPaused!: boolean

  appService: AppService = inject(AppService)

   constructor(private builder: AnimationBuilder, private el: ElementRef) {
   }
    
  ngOnInit() {
    this.animateElement()
  }

  ngOnDestroy() {
    this.isAnimationPaused = true
    this.destroyPlayer()
  }

  destroyPlayer() {
    if (this.player) {
      this.player.destroy()
    }
  }

  animateElement() {
    if (this.player) {
      this.player.destroy();
    }
    const elementToAnimate = this.el.nativeElement.querySelector('.circle');

    if (this.celestialObject?.positionHistory?.length) {
      let animations = this.getAnimations();
      let myAnimation = this.builder.build(animations) 

      this.player = myAnimation.create(elementToAnimate);

      this.player.onDone(() => {
        if (!this.isAnimationPaused) {
          this.animateElement();
        }
      });

      this.player.play();
    }
  }

  getAnimations(): AnimationMetadata[] {
    let positionInitiale = this.celestialObject.positionHistory[0].normalizedPosition
    let translateVectors: AnimationMetadata[] = []
    translateVectors = translateVectors.concat(animate('0s', style({ opacity: 1, transform: 'translateX(' + positionInitiale?.x  + 'px) translateY(' + positionInitiale?.y  + 'px) translateZ(' + positionInitiale?.z + 'px)' })))

    if (!this.isAnimationPaused) {
      for (let i = 1 ; i < this.celestialObject.positionHistory.length ; ++i) {
        let position = this.celestialObject.positionHistory[i-1].normalizedPosition
        translateVectors = translateVectors.concat(animate('0.1s', style({ opacity: 1, transform: 'translateX(' + position?.x  + 'px) translateY(' + position?.y  + 'px) translateZ(' + position?.z + 'px)' })))
      }
    }
    return translateVectors;
  }
}

export { Vector };
