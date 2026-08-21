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
 * @fileoverview Unit tests for MasteryChallengeCardComponent.
 */

import {TestBed, waitForAsync} from '@angular/core/testing';

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

    const fixture = TestBed.createComponent(MasteryChallengeCardComponent);
    component = fixture.componentInstance;
    windowRef = TestBed.inject(WindowRef);
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should default to locked state', () => {
    expect(component.isUnlocked).toBeFalse();
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

  it('should navigate when clicked while locked (skip topic)', () => {
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
    component.isUnlocked = true;

    component.onChallengeButtonClick();

    expect(windowRef.nativeWindow.location.assign).not.toHaveBeenCalled();
  });

  it('should not navigate when the default action URL placeholder is used', () => {
    spyOn(windowRef.nativeWindow.location, 'assign');
    component.actionUrl = '#';
    component.isUnlocked = true;

    component.onChallengeButtonClick();

    expect(windowRef.nativeWindow.location.assign).not.toHaveBeenCalled();
  });

  it('should report that the default placeholder is not an action URL', () => {
    expect(component.actionUrl).toBe('#');
    expect(component.hasActionUrl()).toBeFalse();
    component.actionUrl = '';
    expect(component.hasActionUrl()).toBeFalse();
    component.actionUrl = '/practice/session/1';
    expect(component.hasActionUrl()).toBeTrue();
  });

  it('should report the action button as disabled for an unlocked placeholder URL', () => {
    component.isUnlocked = true;
    component.actionUrl = '#';

    expect(component.isActionDisabled()).toBeTrue();

    component.actionUrl = '/practice/session/1';
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

  it('should return display title with topic name when topicName is set', () => {
    component.topicName = 'Fractions';

    expect(component.displayTitle).toBe('Mastery Challenge: Fractions');
  });

  it('should return default display title when topicName is empty', () => {
    component.topicName = '';

    expect(component.displayTitle).toBe('Mastery Challenge');
  });
});
