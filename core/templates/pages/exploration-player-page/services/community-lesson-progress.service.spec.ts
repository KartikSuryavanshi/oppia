import {TestBed} from '@angular/core/testing';
import {CommunityLessonProgressService} from './community-lesson-progress.service';

describe('CommunityLessonProgressService', () => {
  let service: CommunityLessonProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommunityLessonProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit progress updates when a checkpoint is completed', done => {
    service.progress$.subscribe(progress => {
      expect(progress.has('cp1')).toBeTrue();
      done();
    });
    service.markCheckpointCompleted('cp1');
  });

  it('should not emit duplicate progress for the same checkpoint', () => {
    let emitCount = 0;
    service.progress$.subscribe(() => emitCount++);
    service.markCheckpointCompleted('cp1');
    service.markCheckpointCompleted('cp1');
    expect(emitCount).toBe(1);
  });

  it('should reset progress', () => {
    service.markCheckpointCompleted('cp1');
    service.resetProgress();
    service.progress$.subscribe(progress => {
      expect(progress.size).toBe(0);
    });
  });
});
