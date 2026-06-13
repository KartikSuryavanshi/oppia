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
 * @fileoverview Redesigned story section for the topic viewer page.
 */

import {Component, Input, OnInit} from '@angular/core';

import {ArcBackendDict} from 'domain/story/story-contents-object.model';
import {StoryNode} from 'domain/story/story-node.model';
import {UrlInterpolationService} from 'domain/utilities/url-interpolation.service';
import {UrlService} from 'services/contextual/url.service';
import {AssetsBackendApiService} from 'services/assets-backend-api.service';
import {AppConstants} from 'app.constants';
import {I18nLanguageCodeService} from 'services/i18n-language-code.service';

import './topic-story-section.component.css';

const PRIMARY_AVATAR_IMAGE_PATH = '/avatar/oppia_avatar_large_100px.svg';
const FALLBACK_AVATAR_IMAGE_PATH = '/general/collection_mascot.svg';

@Component({
  selector: 'topic-story-section',
  templateUrl: './topic-story-section.component.html',
  styleUrls: ['./topic-story-section.component.css'],
})
export class TopicStorySectionComponent implements OnInit {
  @Input() storyId: string = '';
  @Input() storyTitle!: string;
  @Input() storyDescription!: string;

  @Input() practiceCount: number = 0;
  @Input() lessonCount: number = 0;
  @Input() arcs: ArcBackendDict[] = [];
  @Input() nodes: StoryNode[] = [];
  @Input() storyUrlFragment: string = '';
  @Input() topicUrlFragment: string = '';
  @Input() classroomUrlFragment: string = '';

  oppiaAvatarImageUrl: string = '';
  studyGuideUrl: string = '#';

  collapsedArcIndices: Set<number> = new Set();

  constructor(
    private urlInterpolationService: UrlInterpolationService,
    private urlService: UrlService,
    private assetsBackendApiService: AssetsBackendApiService,
    private i18nLanguageCodeService: I18nLanguageCodeService
  ) {}

  ngOnInit(): void {
    this.oppiaAvatarImageUrl = this.getPrimaryAvatarImageUrl();
    this.studyGuideUrl = this.getStudyGuideUrl();
  }

  onAvatarImageError(): void {
    if (this.oppiaAvatarImageUrl !== this.getFallbackAvatarImageUrl()) {
      this.oppiaAvatarImageUrl = this.getFallbackAvatarImageUrl();
    }
  }

  toggleArc(index: number): void {
    if (this.collapsedArcIndices.has(index)) {
      this.collapsedArcIndices.delete(index);
    } else {
      this.collapsedArcIndices.add(index);
    }
  }

  isArcCollapsed(index: number): boolean {
    return this.collapsedArcIndices.has(index);
  }

  getLessonCountText(): string {
    return this.lessonCount === 1
      ? this.lessonCount + ' lesson'
      : this.lessonCount + ' lessons';
  }

  getPracticeCountText(): string {
    return this.practiceCount === 1
      ? this.practiceCount + ' practice'
      : this.practiceCount + ' practices';
  }

  getStoryMetaText(): string {
    return this.getLessonCountText() + ', ' + this.getPracticeCountText();
  }

  getStoryMetaAriaLabel(): string {
    return (
      this.getLessonCountText() +
      ' and ' +
      this.getPracticeCountText() +
      ' available'
    );
  }

  getNodesForArc(arc: ArcBackendDict): StoryNode[] {
    return this.nodes.filter(n => arc.node_ids.indexOf(n.getId()) !== -1);
  }

  getExplorationUrl(node: StoryNode): string {
    let result = '/explore/' + node.getExplorationId();
    result = this.urlService.addField(
      result,
      'topic_url_fragment',
      this.topicUrlFragment
    );
    result = this.urlService.addField(
      result,
      'classroom_url_fragment',
      this.classroomUrlFragment
    );
    result = this.urlService.addField(
      result,
      'story_url_fragment',
      this.storyUrlFragment
    );
    result = this.urlService.addField(result, 'node_id', node.getId());
    return result;
  }

  getThumbnailUrl(node: StoryNode): string {
    const filename = node.getThumbnailFilename();
    if (!filename) {
      return '';
    }
    return this.assetsBackendApiService.getThumbnailUrlForPreview(
      AppConstants.ENTITY_TYPE.STORY,
      this.storyId,
      filename
    );
  }

  isLanguageRTL(): boolean {
    return this.i18nLanguageCodeService.isCurrentLanguageRTL();
  }

  private getStudyGuideUrl(): string {
    return this.urlService.getLearnerTopicStudyGuideUrl();
  }

  private getPrimaryAvatarImageUrl(): string {
    return this.urlInterpolationService.getStaticImageUrl(
      PRIMARY_AVATAR_IMAGE_PATH
    );
  }

  private getFallbackAvatarImageUrl(): string {
    return this.urlInterpolationService.getStaticCopyrightedImageUrl(
      FALLBACK_AVATAR_IMAGE_PATH
    );
  }
}
