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
 * @fileoverview Unit tests for TopicMasteryChallengeCardComponent.
 */

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

import {TopicMasteryChallengeCardComponent} from './topic-mastery-challenge-card.component';
import {UrlInterpolationService} from 'domain/utilities/url-interpolation.service';
import {WindowRef} from 'services/contextual/window-ref.service';
import {MockTranslatePipe} from 'tests/unit-test-utils';

class MockWindowRef {
  nativeWindow = {
    location: {
      assign: (url: string) => {},
    },
  };
}

describe('TopicMasteryChallengeCardComponent', () => {
  let component: TopicMasteryChallengeCardComponent;
  let fixture: ComponentFixture<TopicMasteryChallengeCardComponent>;
  let urlInterpolationService: jasmine.SpyObj<UrlInterpolationService>;
  let windowRef: WindowRef;

  beforeEach(waitForAsync(() => {
    const urlInterpolationServiceSpy = jasmine.createSpyObj(
      'UrlInterpolationService',
      ['getStaticImageUrl']
    );

    TestBed.configureTestingModule({
      declarations: [TopicMasteryChallengeCardComponent, MockTranslatePipe],
      providers: [
        {
          provide: UrlInterpolationService,
          useValue: urlInterpolationServiceSpy,
        },
        {
          provide: WindowRef,
          useClass: MockWindowRef,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TopicMasteryChallengeCardComponent);
    component = fixture.componentInstance;
    urlInterpolationService = TestBed.inject(
      UrlInterpolationService
    ) as jasmine.SpyObj<UrlInterpolationService>;
    windowRef = TestBed.inject(WindowRef);
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should use provided thumbnail url on initialization', () => {
    component.thumbnailUrl = '/assets/mastery-thumbnail.png';

    component.ngOnInit();

    expect(component.resolvedThumbnailUrl).toBe(
      '/assets/mastery-thumbnail.png'
    );
  });

  it('should use fallback thumbnail url when thumbnail url is empty', () => {
    urlInterpolationService.getStaticImageUrl.and.returnValue(
      '/assets/fallback-thumbnail.webp'
    );

    component.thumbnailUrl = '';

    component.ngOnInit();

    expect(urlInterpolationService.getStaticImageUrl).toHaveBeenCalledWith(
      '/splash/student_desk1x.webp'
    );
    expect(component.resolvedThumbnailUrl).toBe(
      '/assets/fallback-thumbnail.webp'
    );
  });

  it('should execute navigateTo when url is provided', () => {
    spyOn(windowRef.nativeWindow.location, 'assign');

    component.navigateTo('/practice/session');

    expect(windowRef.nativeWindow.location.assign).toHaveBeenCalledWith(
      '/practice/session'
    );
  });

  it('should execute navigateTo when url is empty', () => {
    expect(() => {
      component.navigateTo('');
    }).not.toThrowError();
  });

  it('should return thumbnail alt text with card title', () => {
    component.cardTitle = 'MASTERY CHALLENGE';

    expect(component.getThumbnailAltText()).toBe(
      'Mastery challenge thumbnail for MASTERY CHALLENGE'
    );
  });

  it('should return default thumbnail alt text when card title is empty', () => {
    component.cardTitle = '';

    expect(component.getThumbnailAltText()).toBe('Mastery challenge thumbnail');
  });
});
