import { Component, ElementRef, Input } from "@angular/core";
import { animate, AnimationBuilder, AnimationMetadata, AnimationPlayer, style, } from '@angular/animations';
import { CelestialObject, Vector } from "../../model/model";


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

   constructor(private builder: AnimationBuilder, private el: ElementRef) {
   }
    
  ngOnInit() {
    this.animateElement()
  }

  animateElement() {
    if (this.player) {
      this.player.destroy();
    }

    let animations = this.getAnimations();
    let myAnimation = this.builder.build(animations) 

    const elementToAnimate = this.el.nativeElement.querySelector('.circle');
    this.player = myAnimation.create(elementToAnimate);

    this.player.onDone(() => {
        this.animateElement();
    });

    this.player.play();
  }

  getAnimations(): AnimationMetadata[] {

    let positionInitiale = this.celestialObject.PositionHistory[0].normalizedPosition
    let translateVectors: AnimationMetadata[] = [animate('0.0001s', style({ opacity: 1, transform: 'translateX(' + positionInitiale.X + 'px) translateY(' + positionInitiale.Y + 'px) translateZ(' + positionInitiale.Z + 'px)' }))]

    for (let i = 1 ; i < this.celestialObject.PositionHistory.length ; ++i) {
      let x = this.celestialObject.PositionHistory[i-1].normalizedPosition.X
      let y = this.celestialObject.PositionHistory[i-1].normalizedPosition.Y
      let z = this.celestialObject.PositionHistory[i-1].normalizedPosition.Z
      translateVectors = translateVectors.concat(animate('0.1s', style({ opacity: 1, transform: 'translateX(' + x  + 'px) translateY(' + y  + 'px) translateZ(' + z + 'px)' })))
    }
    return translateVectors;
  }
}

export { Vector };
