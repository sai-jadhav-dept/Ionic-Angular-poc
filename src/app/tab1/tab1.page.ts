import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { createAnimation, Animation } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnDestroy {

  @ViewChild('box', { read: ElementRef }) box!: ElementRef;

  private floatingAnimation!: Animation;
  private reducedMotionQuery: MediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
  private reducedMotionChangeHandler = () => this.syncAnimationWithAccessibility();
  private classChangeObserver?: MutationObserver;

  ionViewDidEnter() {

    this.floatingAnimation = createAnimation()
      .addElement(this.box.nativeElement)
      .duration(2000)
      .iterations(Infinity) // 🔥 Infinite loop
      .direction('alternate') // up and down effect
      .easing('ease-in-out')
      .fromTo('transform', 'translateY(0px)', 'translateY(-20px)');

    this.syncAnimationWithAccessibility();
    this.reducedMotionQuery.addEventListener('change', this.reducedMotionChangeHandler);

    this.classChangeObserver = new MutationObserver(() => this.syncAnimationWithAccessibility());
    this.classChangeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    this.classChangeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  ionViewWillLeave() {
    this.cleanupAccessibilityWatchers();
  }

  ngOnDestroy() {
    this.cleanupAccessibilityWatchers();
    this.floatingAnimation?.destroy();
  }

  private syncAnimationWithAccessibility() {
    if (!this.floatingAnimation) {
      return;
    }

    if (this.shouldPauseAnimations()) {
      this.floatingAnimation.pause();
      return;
    }

    this.floatingAnimation.stop();
    this.floatingAnimation.play();
  }

  private shouldPauseAnimations(): boolean {
    return this.reducedMotionQuery.matches
      || document.documentElement.classList.contains('pause-animation')
      || document.body.classList.contains('pause-animation');
  }

  private cleanupAccessibilityWatchers() {
    this.reducedMotionQuery.removeEventListener('change', this.reducedMotionChangeHandler);
    this.classChangeObserver?.disconnect();
    this.classChangeObserver = undefined;
  }

}