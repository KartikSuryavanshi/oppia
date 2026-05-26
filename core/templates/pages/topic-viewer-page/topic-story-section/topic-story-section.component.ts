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
 * @fileoverview Component for the topic story section.
 */

import {Component, Input, OnInit} from '@angular/core';

import {ClassroomDomainConstants} from 'domain/classroom/classroom-domain.constants';
import {TopicViewerDomainConstants} from 'domain/topic_viewer/topic-viewer-domain.constants';
import {UrlInterpolationService} from 'domain/utilities/url-interpolation.service';
import {StorySummary} from 'domain/story/story-summary.model';
import {StoryNode} from 'domain/story/story-node.model';
import {UrlService} from 'services/contextual/url.service';
import {I18nLanguageCodeService} from 'services/i18n-language-code.service';

import './topic-story-section.component.css';

@Component({
  selector: 'topic-story-section',
  templateUrl: './topic-story-section.component.html',
  styleUrls: ['./topic-story-section.component.css'],
})
export class TopicStorySectionComponent implements OnInit {
  // These properties are initialized using Angular lifecycle hooks
  // and we need to do non-null assertion. For more information, see
  // https://github.com/oppia/oppia/wiki/Guide-on-defining-types#ts-7-1
  @Input() storySummary!: StorySummary;
  @Input() classroomUrlFragment!: string;
  @Input() topicUrlFragment!: string;
  @Input() practiceCount: number = 0;

  lessonCount: number = 0;

  private readonly EXPLORE_PAGE_PREFIX = '/explore/';

  constructor(
    private i18nLanguageCodeService: I18nLanguageCodeService,
    private urlInterpolationService: UrlInterpolationService,
    private urlService: UrlService
  ) {}

  ngOnInit(): void {
    this.lessonCount = this.storySummary.getNodeTitles().length;
  }

  isLanguageRTL(): boolean {
    return this.i18nLanguageCodeService.isCurrentLanguageRTL();
  }

  getStudySkillsUrl(): string {
    return this.urlInterpolationService.interpolateUrl(
      ClassroomDomainConstants.TOPIC_VIEWER_STUDYGUIDE_URL_TEMPLATE,
      {
        classroom_url_fragment: this.classroomUrlFragment,
        topic_url_fragment: this.topicUrlFragment,
      }
    );
  }

  getStoryViewerUrl(): string {
    return this.urlInterpolationService.interpolateUrl(
      TopicViewerDomainConstants.STORY_VIEWER_URL_TEMPLATE,
      {
        classroom_url_fragment: this.classroomUrlFragment,
        topic_url_fragment: this.topicUrlFragment,
        story_url_fragment: this.storySummary.getUrlFragment(),
      }
    );
  }

  getChapterUrl(node: StoryNode): string {
    const explorationId = node.getExplorationId();
    if (!explorationId) {
      return '#';
    }
    let urlParams = this.urlService.addField(
      '',
      'story_url_fragment',
      this.storySummary.getUrlFragment()
    );
    urlParams = this.urlService.addField(
      urlParams,
      'topic_url_fragment',
      this.topicUrlFragment
    );
    urlParams = this.urlService.addField(
      urlParams,
      'classroom_url_fragment',
      this.classroomUrlFragment
    );
    urlParams = this.urlService.addField(urlParams, 'node_id', node.getId());
    return `${this.EXPLORE_PAGE_PREFIX}${explorationId}${urlParams}`;
  }

  isChapterCompleted(node: StoryNode): boolean {
    return this.storySummary.isNodeCompleted(node.getTitle());
  }
}
