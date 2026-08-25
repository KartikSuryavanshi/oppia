// Copyright 2026 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Unit tests for MasteryChallengeCardComponent.
 */

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {MockTranslateModule} from 'tests/unit-test-utils';
import {MasteryChallengeCardComponent} from './mastery-challenge-card.component';
import {WindowRef} from 'services/contextual/window-ref.service';

class MockWindowRef {
  nativeWindow = {
    location: {
      assign: (url: string) => {},
    },
  };
}

describe('MasteryChallengeCardComponent', () => {
  let component: MasteryChallengeCardComponent;
  let fixture: ComponentFixture<MasteryChallengeCardComponent>;
  let windowRef: WindowRef;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MasteryChallengeCardComponent],
      imports: [MockTranslateModule],
      providers: [
        {
          provide: WindowRef,
          useClass: MockWindowRef,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MasteryChallengeCardComponent);
    component = fixture.componentInstance;
    windowRef = TestBed.inject(WindowRef);
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should default to locked state', () => {
    expect(component.isUnlocked).toBeFalse();
  });

  it('should return mastery challenge as the display title', () => {
    expect(component.displayTitle).toBe('Mastery Challenge');
  });

  it('should navigate when action URL is provided and unlocked', () => {
    spyOn(windowRef.nativeWindow.location, 'assign');
    component.actionUrl = '/practice/session/1';
    component.isUnlocked = true;

    component.onChallengeButtonClick();

    expect(windowRef.nativeWindow.location.assign).toHaveBeenCalledWith(
      '/practice/session/1'
    );
  });

  it('should navigate when clicked while locked', () => {
    spyOn(windowRef.nativeWindow.location, 'assign');
    component.actionUrl = '/practice/session/1';
    component.isUnlocked = false;

    component.onChallengeButtonClick();

    expect(windowRef.nativeWindow.location.assign).toHaveBeenCalledWith(
      '/practice/session/1'
    );
  });

  it('should emit masteryClicked when clicked while locked', () => {
    spyOn(component.masteryClicked, 'emit');
    component.actionUrl = '/practice/session/1';
    component.isUnlocked = false;

    component.onChallengeButtonClick();

    expect(component.masteryClicked.emit).toHaveBeenCalled();
  });

  it('should not emit masteryClicked when clicked while unlocked', () => {
    spyOn(component.masteryClicked, 'emit');
    component.actionUrl = '/practice/session/1';
    component.isUnlocked = true;

    component.onChallengeButtonClick();

    expect(component.masteryClicked.emit).not.toHaveBeenCalled();
  });

  it('should not navigate when action URL is empty', () => {
    spyOn(windowRef.nativeWindow.location, 'assign');
    component.actionUrl = '';

    component.navigateToAction();

    expect(windowRef.nativeWindow.location.assign).not.toHaveBeenCalled();
  });

  it('should not navigate when action URL is the default placeholder', () => {
    spyOn(windowRef.nativeWindow.location, 'assign');
    component.actionUrl = '#';

    component.navigateToAction();

    expect(windowRef.nativeWindow.location.assign).not.toHaveBeenCalled();
  });

  it('should not disable the button when an action URL is available', () => {
    component.actionUrl = '/practice/session/1';

    component.isUnlocked = false;
    expect(component.isActionDisabled()).toBeFalse();

    component.isUnlocked = true;
    expect(component.isActionDisabled()).toBeFalse();
  });

  it('should show tooltip on mouse enter when locked', () => {
    component.isUnlocked = false;

    component.onCardMouseEnter();

    expect(component.showLockedTooltip).toBeTrue();
  });

  it('should not show tooltip on mouse enter when unlocked', () => {
    component.isUnlocked = true;

    component.onCardMouseEnter();

    expect(component.showLockedTooltip).toBeFalse();
  });

  it('should hide tooltip on mouse leave', () => {
    component.isUnlocked = false;
    component.showLockedTooltip = true;

    component.onCardMouseLeave();

    expect(component.showLockedTooltip).toBeFalse();
  });
});
