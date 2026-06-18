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
 * @fileoverview Unit tests for ResumeLessonModal.
 */

import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {MockTranslatePipe} from 'tests/unit-test-utils';

import {ResumeLessonModal} from './resume-lesson-modal.component';

class MockNgbActiveModal {
  close(value?: string) {}
  dismiss(value?: string) {}
}

describe('ResumeLessonModal', () => {
  let component: ResumeLessonModal;
  let fixture: ComponentFixture<ResumeLessonModal>;
  let ngbActiveModal: MockNgbActiveModal;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ResumeLessonModal, MockTranslatePipe],
      providers: [
        {
          provide: NgbActiveModal,
          useClass: MockNgbActiveModal,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResumeLessonModal);
    component = fixture.componentInstance;
    ngbActiveModal = TestBed.inject(NgbActiveModal) as MockNgbActiveModal;
  }));

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should close modal with resume on resume button click', () => {
    spyOn(ngbActiveModal, 'close');
    component.confirm('resume');
    expect(ngbActiveModal.close).toHaveBeenCalledWith('resume');
  });

  it('should close modal with start_over on start over button click', () => {
    spyOn(ngbActiveModal, 'close');
    component.confirm('start_over');
    expect(ngbActiveModal.close).toHaveBeenCalledWith('start_over');
  });

  it('should dismiss modal on cancel', () => {
    spyOn(ngbActiveModal, 'dismiss');
    component.cancel();
    expect(ngbActiveModal.dismiss).toHaveBeenCalledWith('cancel');
  });
});
