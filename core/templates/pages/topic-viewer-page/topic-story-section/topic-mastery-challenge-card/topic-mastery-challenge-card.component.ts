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
 * @fileoverview End-of-topic mastery challenge card for the topic viewer story section.
 */

import {Component, Input, OnInit} from '@angular/core';
import {UrlInterpolationService} from 'domain/utilities/url-interpolation.service';
import {WindowRef} from 'services/contextual/window-ref.service';

import './topic-mastery-challenge-card.component.css';

const FALLBACK_THUMBNAIL_IMAGE_PATH = '/splash/student_desk1x.webp';

@Component({
  selector: 'topic-mastery-challenge-card',
  templateUrl: './topic-mastery-challenge-card.component.html',
  styleUrls: ['./topic-mastery-challenge-card.component.css'],
})
export class TopicMasteryChallengeCardComponent implements OnInit {
  @Input() cardTitle: string = 'MASTERY CHALLENGE';
  @Input() cardDescription: string =
    "Test your knowledge with a challenge that covers everything you've learned in this topic.";
  @Input() thumbnailUrl: string = '';
  @Input() actionUrl: string = '#';
  @Input() actionLabel: string = 'Take the Mastery Challenge';
  @Input() skillLabels: string[] = [];

  resolvedThumbnailUrl: string = '';

  constructor(
    private urlInterpolationService: UrlInterpolationService,
    private windowRef: WindowRef
  ) {}

  ngOnInit(): void {
    this.resolvedThumbnailUrl =
      this.thumbnailUrl || this.getFallbackThumbnailUrl();
  }

  navigateTo(url: string): void {
    if (url) {
      this.windowRef.nativeWindow.location.assign(url);
    }
  }

  getThumbnailAltText(): string {
    return this.cardTitle
      ? 'Mastery challenge thumbnail for ' + this.cardTitle
      : 'Mastery challenge thumbnail';
  }

  private getFallbackThumbnailUrl(): string {
    return this.urlInterpolationService.getStaticImageUrl(
      FALLBACK_THUMBNAIL_IMAGE_PATH
    );
  }
}
