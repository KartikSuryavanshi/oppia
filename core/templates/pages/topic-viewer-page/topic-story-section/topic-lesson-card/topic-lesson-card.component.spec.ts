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
 * @fileoverview Unit tests for TopicLessonCardComponent.
 */

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';

import {TopicLessonCardComponent} from './topic-lesson-card.component';
import {UrlInterpolationService} from 'domain/utilities/url-interpolation.service';
import {WindowRef} from 'services/contextual/window-ref.service';
import {MockTranslatePipe} from 'tests/unit-test-utils';
import {ResumeLessonModal} from './resume-lesson-modal.component';

class MockWindowRef {
  nativeWindow = {
    location: {
      assign: (url: string) => {},
    },
  };
}

describe('TopicLessonCardComponent', () => {
  let component: TopicLessonCardComponent;
  let fixture: ComponentFixture<TopicLessonCardComponent>;
  let urlInterpolationService: jasmine.SpyObj<UrlInterpolationService>;
  let windowRef: WindowRef;
  let ngbModal: jasmine.SpyObj<NgbModal>;

  beforeEach(waitForAsync(() => {
    const urlInterpolationServiceSpy = jasmine.createSpyObj(
      'UrlInterpolationService',
      ['getStaticImageUrl']
    );
    const ngbModalSpy = jasmine.createSpyObj('NgbModal', ['open']);

    TestBed.configureTestingModule({
      declarations: [TopicLessonCardComponent, MockTranslatePipe],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: UrlInterpolationService,
          useValue: urlInterpolationServiceSpy,
        },
        {
          provide: WindowRef,
          useClass: MockWindowRef,
        },
        {
          provide: NgbModal,
          useValue: ngbModalSpy,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TopicLessonCardComponent);
    component = fixture.componentInstance;
    urlInterpolationService = TestBed.inject(
      UrlInterpolationService
    ) as jasmine.SpyObj<UrlInterpolationService>;
    windowRef = TestBed.inject(WindowRef);
    ngbModal = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should use provided thumbnail url on initialization', () => {
    component.thumbnailUrl = '/assets/lesson-thumbnail.png';

    component.ngOnInit();

    expect(component.resolvedThumbnailUrl).toBe('/assets/lesson-thumbnail.png');
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

  it('should generate fallback thumbnail url through UrlInterpolationService', () => {
    urlInterpolationService.getStaticImageUrl.and.returnValue(
      '/assets/generated-fallback.webp'
    );

    component.thumbnailUrl = '';

    component.ngOnInit();

    expect(urlInterpolationService.getStaticImageUrl).toHaveBeenCalledTimes(1);
    expect(component.resolvedThumbnailUrl).toBe(
      '/assets/generated-fallback.webp'
    );
  });

  it('should not call UrlInterpolationService when thumbnail url is provided', () => {
    component.thumbnailUrl = '/assets/custom-thumbnail.png';

    component.ngOnInit();

    expect(urlInterpolationService.getStaticImageUrl).not.toHaveBeenCalled();
    expect(component.resolvedThumbnailUrl).toBe('/assets/custom-thumbnail.png');
  });

  it('should execute navigateTo when url is provided', () => {
    spyOn(windowRef.nativeWindow.location, 'assign');

    component.navigateTo('/explore/123');

    expect(windowRef.nativeWindow.location.assign).toHaveBeenCalledWith(
      '/explore/123'
    );
  });

  it('should execute navigateTo when url is empty', () => {
    expect(() => {
      component.navigateTo('');
    }).not.toThrowError();
  });

  it('should return thumbnail alt text with lesson title', () => {
    component.lessonTitle = 'Introduction to Fractions';

    expect(component.getThumbnailAltText()).toBe(
      'Lesson thumbnail for Introduction to Fractions'
    );
  });

  it('should return default thumbnail alt text when lesson title is empty', () => {
    component.lessonTitle = '';

    expect(component.getThumbnailAltText()).toBe('Lesson thumbnail');
  });

  describe('showCheckpointBar', () => {
    it('should return true when not coming_soon and totalCheckpointsCount > 0', () => {
      component.lessonProgressStatus = 'not_started';
      component.totalCheckpointsCount = 5;
      expect(component.showCheckpointBar).toBeTrue();

      component.lessonProgressStatus = 'in_progress';
      component.totalCheckpointsCount = 3;
      expect(component.showCheckpointBar).toBeTrue();

      component.lessonProgressStatus = 'completed';
      component.totalCheckpointsCount = 1;
      expect(component.showCheckpointBar).toBeTrue();
    });

    it('should return false when lesson is coming_soon', () => {
      component.lessonProgressStatus = 'coming_soon';
      component.totalCheckpointsCount = 5;
      expect(component.showCheckpointBar).toBeFalse();
    });

    it('should return false when totalCheckpointsCount is 0', () => {
      component.lessonProgressStatus = 'not_started';
      component.totalCheckpointsCount = 0;
      expect(component.showCheckpointBar).toBeFalse();
    });
  });

  describe('onLessonAction', () => {
    it('should navigate directly when lesson is not_started', () => {
      spyOn(component, 'navigateTo');
      component.startUrl = '/explore/123';
      component.lessonProgressStatus = 'not_started';

      component.onLessonAction();

      expect(component.navigateTo).toHaveBeenCalledWith('/explore/123');
    });

    it('should open resume modal when lesson is in_progress', () => {
      component.lessonProgressStatus = 'in_progress';
      component.onLessonAction();
      expect(ngbModal.open).toHaveBeenCalledWith(ResumeLessonModal, {
        centered: true,
        backdrop: 'static',
      });
    });

    it('should emit resetProgress and navigate when resume modal returns start_over', () => {
      const modalRef = jasmine.createSpyObj('NgbModalRef', ['result']);
      modalRef.result = Promise.resolve('start_over');
      ngbModal.open.and.returnValue(modalRef);

      spyOn(component, 'navigateTo');
      spyOn(component.resetProgress, 'emit');
      component.startUrl = '/explore/123';
      component.lessonProgressStatus = 'in_progress';

      component.onLessonAction();

      // Wait for promise to resolve.
      fixture.whenStable().then(() => {
        expect(component.resetProgress.emit).toHaveBeenCalled();
        expect(component.navigateTo).toHaveBeenCalledWith('/explore/123');
      });
    });

    it('should navigate without resetting when resume modal returns resume', () => {
      const modalRef = jasmine.createSpyObj('NgbModalRef', ['result']);
      modalRef.result = Promise.resolve('resume');
      ngbModal.open.and.returnValue(modalRef);

      spyOn(component, 'navigateTo');
      spyOn(component.resetProgress, 'emit');
      component.startUrl = '/explore/123';
      component.lessonProgressStatus = 'in_progress';

      component.onLessonAction();

      fixture.whenStable().then(() => {
        expect(component.resetProgress.emit).not.toHaveBeenCalled();
        expect(component.navigateTo).toHaveBeenCalledWith('/explore/123');
      });
    });

    it('should do nothing when modal is dismissed', () => {
      const modalRef = jasmine.createSpyObj('NgbModalRef', ['result']);
      modalRef.result = Promise.reject();
      ngbModal.open.and.returnValue(modalRef);

      spyOn(component, 'navigateTo');
      spyOn(component.resetProgress, 'emit');
      component.startUrl = '/explore/123';
      component.lessonProgressStatus = 'in_progress';

      component.onLessonAction();
      // Catch the rejection so it doesn't bubble.
      modalRef.result.catch(() => {});

      expect(component.resetProgress.emit).not.toHaveBeenCalled();
      expect(component.navigateTo).not.toHaveBeenCalled();
    });

    it('should emit resetProgress without navigating when lesson is completed', () => {
      spyOn(component, 'navigateTo');
      spyOn(component.resetProgress, 'emit');
      component.startUrl = '/explore/123';
      component.lessonProgressStatus = 'completed';

      component.onLessonAction();

      expect(component.resetProgress.emit).toHaveBeenCalled();
      expect(component.navigateTo).not.toHaveBeenCalled();
    });
  });
});
