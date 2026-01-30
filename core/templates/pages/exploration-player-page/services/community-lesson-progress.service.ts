import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({providedIn: 'root'})
export class CommunityLessonProgressService {
  private completedCheckpoints = new Set<string>();
  private progressSubject = new BehaviorSubject<Set<string>>(new Set());
  public progress$: Observable<Set<string>> =
    this.progressSubject.asObservable();

  markCheckpointCompleted(checkpointId: string): void {
    if (!this.completedCheckpoints.has(checkpointId)) {
      this.completedCheckpoints.add(checkpointId);
      this.progressSubject.next(new Set(this.completedCheckpoints));
    }
  }

  getCompletedCheckpoints(): Set<string> {
    return new Set(this.completedCheckpoints);
  }

  resetProgress(): void {
    this.completedCheckpoints.clear();
    this.progressSubject.next(new Set());
  }
}
