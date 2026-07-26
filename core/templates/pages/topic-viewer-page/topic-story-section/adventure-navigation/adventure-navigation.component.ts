// Copyright 2026 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Top adventure navigation bar shown above story arcs.
 */

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

interface AdventureNavigationGroup {
  lessons: {
    lessonNumber: number;
  }[];
  accentColor: string;
  showPractice: boolean;
}

@Component({
  selector: 'topic-adventure-navigation',
  templateUrl: './adventure-navigation.component.html',
  styleUrls: ['./adventure-navigation.component.css'],
})
export class AdventureNavigationComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() adventureGroups: AdventureNavigationGroup[] = [];
  @Input() activeLessonNumber: number | null = null;
  @Input() selectedPracticeAdventureIndex: number | null = null;
  @Input() isPinned: boolean = false;
  @Output() lessonSelected = new EventEmitter<number>();
  @Output() practiceSelected = new EventEmitter<number>();

  @ViewChild('scrollWrapper') scrollWrapper!: ElementRef<HTMLElement>;

  showLeftArrow: boolean = false;
  showRightArrow: boolean = false;
  hasHorizontalOverflow: boolean = false;
  isDraggingToScroll: boolean = false;
  isDesktopWideLayout: boolean = false;

  private scrollCheckTimeouts: ReturnType<typeof setTimeout>[] = [];
  private dragStartClientX: number = 0;
  private dragStartScrollLeft: number = 0;

  ngAfterViewInit(): void {
    this.updateLayoutMode();
    // Defer checks to allow DOM to fully render.
    this.scrollCheckTimeouts.push(setTimeout(() => this.updateArrows(), 50));
    this.scrollCheckTimeouts.push(setTimeout(() => this.updateArrows(), 200));
    this.scrollCheckTimeouts.push(setTimeout(() => this.updateArrows(), 500));
    this.scrollCheckTimeouts.push(
      setTimeout(() => this.centerSelectedNodeInView(), 220)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.adventureGroups) {
      // When adventureGroups changes, schedule arrow updates.
      this.scrollCheckTimeouts.push(setTimeout(() => this.updateArrows(), 100));
      this.scrollCheckTimeouts.push(setTimeout(() => this.updateArrows(), 300));
    }

    if (
      changes.activeLessonNumber ||
      changes.selectedPracticeAdventureIndex ||
      changes.adventureGroups
    ) {
      this.scrollCheckTimeouts.push(
        setTimeout(() => this.centerSelectedNodeInView(), 100)
      );
    }
  }

  ngOnDestroy(): void {
    this.scrollCheckTimeouts.forEach(timeout => clearTimeout(timeout));
    this.scrollCheckTimeouts = [];
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.updateLayoutMode();
    this.updateArrows();
  }

  @HostListener('window:mouseup')
  onGlobalMouseUp(): void {
    this.isDraggingToScroll = false;
  }

  onScroll(): void {
    this.updateArrows();
  }

  onWrapperMouseDown(event: MouseEvent): void {
    if (
      this.shouldForceAllNodesVisibleOnDesktop() ||
      !this.hasHorizontalOverflow ||
      event.button !== 0
    ) {
      return;
    }

    this.isDraggingToScroll = true;
    this.dragStartClientX = event.clientX;
    this.dragStartScrollLeft = this.scrollWrapper.nativeElement.scrollLeft;
  }

  onWrapperMouseMove(event: MouseEvent): void {
    if (!this.isDraggingToScroll) {
      return;
    }

    const wrapperEl = this.scrollWrapper?.nativeElement;
    if (!wrapperEl) {
      return;
    }

    const deltaX = event.clientX - this.dragStartClientX;
    wrapperEl.scrollLeft = this.dragStartScrollLeft - deltaX;
    this.updateArrows();
  }

  onWrapperMouseUp(): void {
    this.isDraggingToScroll = false;
  }

  scrollLeft(): void {
    if (this.shouldForceAllNodesVisibleOnDesktop()) {
      return;
    }
    const el = this.scrollWrapper?.nativeElement;
    if (el) {
      el.scrollBy({left: -200, behavior: 'smooth'});
      this.scrollCheckTimeouts.push(setTimeout(() => this.updateArrows(), 500));
    }
  }

  scrollRight(): void {
    if (this.shouldForceAllNodesVisibleOnDesktop()) {
      return;
    }
    const el = this.scrollWrapper?.nativeElement;
    if (el) {
      el.scrollBy({left: 200, behavior: 'smooth'});
      this.scrollCheckTimeouts.push(setTimeout(() => this.updateArrows(), 500));
    }
  }

  isActiveLesson(lessonNumber: number): boolean {
    // Badge is colored when it's the currently selected lesson in navbar.
    if (this.activeLessonNumber === null) {
      return lessonNumber === 1;
    }
    return lessonNumber === this.activeLessonNumber;
  }

  onLessonClick(lessonNumber: number): void {
    this.lessonSelected.emit(lessonNumber);
  }

  onPracticeClick(adventureIndex: number): void {
    this.practiceSelected.emit(adventureIndex);
  }

  shouldForceAllNodesVisibleOnDesktop(): boolean {
    return this.isDesktopWideLayout;
  }

  private centerSelectedNodeInView(): void {
    if (this.shouldForceAllNodesVisibleOnDesktop()) {
      return;
    }

    const wrapperEl = this.scrollWrapper?.nativeElement;
    if (!wrapperEl || typeof wrapperEl.querySelector !== 'function') {
      return;
    }

    let selectedNode: HTMLElement | null = null;
    if (this.selectedPracticeAdventureIndex !== null) {
      selectedNode = wrapperEl.querySelector(
        `[data-practice-index="${this.selectedPracticeAdventureIndex}"]`
      );
    } else if (this.activeLessonNumber !== null) {
      selectedNode = wrapperEl.querySelector(
        `[data-lesson-number="${this.activeLessonNumber}"]`
      );
    }

    if (!selectedNode) {
      return;
    }

    const targetLeft =
      selectedNode.offsetLeft -
      (wrapperEl.clientWidth - selectedNode.clientWidth) / 2;
    if (typeof wrapperEl.scrollTo === 'function') {
      wrapperEl.scrollTo({left: Math.max(targetLeft, 0), behavior: 'smooth'});
    } else {
      wrapperEl.scrollLeft = Math.max(targetLeft, 0);
    }
    this.scrollCheckTimeouts.push(setTimeout(() => this.updateArrows(), 220));
  }

  private updateLayoutMode(): void {
    this.isDesktopWideLayout = window.innerWidth >= 1280;
  }

  private shouldShowHorizontalOverflowControls(): boolean {
    return !this.shouldForceAllNodesVisibleOnDesktop();
  }

  private updateArrows(): void {
    const el = this.scrollWrapper?.nativeElement;
    if (!el) {
      this.hasHorizontalOverflow = false;
      return;
    }

    if (!this.shouldShowHorizontalOverflowControls()) {
      this.hasHorizontalOverflow = false;
      this.showLeftArrow = false;
      this.showRightArrow = false;
      return;
    }

    const hasOverflow = el.scrollWidth > el.clientWidth;
    this.hasHorizontalOverflow = hasOverflow;

    if (!hasOverflow) {
      // No overflow, hide both arrows.
      this.showLeftArrow = false;
      this.showRightArrow = false;
      return;
    }

    const maxScroll = el.scrollWidth - el.clientWidth;
    const currentScroll = el.scrollLeft;

    this.showLeftArrow = currentScroll > 5;
    this.showRightArrow = currentScroll < maxScroll - 5;
  }
}
