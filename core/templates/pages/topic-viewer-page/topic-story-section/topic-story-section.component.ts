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

import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
} from '@angular/core';

import {AppConstants} from 'app.constants';
import {StoryNode} from 'domain/story/story-node.model';
import {StoryDomainConstants} from 'domain/story/story-domain.constants';
import {StorySummary} from 'domain/story/story-summary.model';
import {UrlInterpolationService} from 'domain/utilities/url-interpolation.service';
import {PracticeSessionPageConstants} from 'pages/practice-session-page/practice-session-page.constants';
import {AssetsBackendApiService} from 'services/assets-backend-api.service';
import {I18nLanguageCodeService} from 'services/i18n-language-code.service';
import {UrlService} from 'services/contextual/url.service';
import {WindowRef} from 'services/contextual/window-ref.service';
import {ChapterProgressLoaderService} from 'services/chapter-progress-loader.service';

import './topic-story-section.component.css';

const PRIMARY_AVATAR_IMAGE_PATH = '/avatar/oppia_avatar_large_100px.svg';
const FALLBACK_AVATAR_IMAGE_PATH = '/general/collection_mascot.svg';
const FALLBACK_LESSON_THUMBNAIL_PATH = '/splash/student_desk1x.webp';

interface LessonCardData {
  lessonNumber: number;
  lessonTitle: string;
  lessonDescription: string;
  thumbnailUrl: string;
  startUrl: string;
  nodeId: string;
  lessonProgressStatus:
    | 'not_started'
    | 'in_progress'
    | 'completed'
    | 'coming_soon';
  totalCheckpointsCount: number;
  visitedCheckpointsCount: number;
}

interface ArcGroupData {
  arcTitle: string;
  arcDescription: string;
  lessonCards: LessonCardData[];
  arcTestCard: ArcTestCardData | null;
  arcPalette: (typeof StoryDomainConstants.ARC_COLOR_PALETTE)[number];
}

interface ArcTestCardData {
  cardTitle: string;
  cardDescription: string;
  actionLabel: string;
  thumbnailUrl: string;
  actionUrl: string;
}

interface LessonProgressNavItem {
  nodeId: string;
  lessonNumber: number;
  arcPalette: (typeof StoryDomainConstants.ARC_COLOR_PALETTE)[number];
  lessonProgressStatus:
    | 'not_started'
    | 'in_progress'
    | 'completed'
    | 'coming_soon';
}

@Component({
  selector: 'topic-story-section',
  templateUrl: './topic-story-section.component.html',
  styleUrls: ['./topic-story-section.component.css'],
})
export class TopicStorySectionComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() storySummary!: StorySummary;
  @Input() storyTitle!: string;
  @Input() storyDescription!: string;
  @Input() classroomUrlFragment: string = '';
  @Input() topicUrlFragment: string = '';
  @Input() practiceSubtopicIds: number[] = [];
  @Input() skillIdToSubtopicId: {[skillId: string]: number} = {};

  @Input() practiceCount: number = 0;
  @Input() lessonCount: number = 0;

  oppiaAvatarImageUrl: string = '';
  studyGuideUrl: string = '#';
  lessonCards: LessonCardData[] = [];
  arcGroups: ArcGroupData[] = [];
  progressNavItems: LessonProgressNavItem[] = [];
  masteryChallengeCard!: ArcTestCardData;
  isMasteryChallengeVisible: boolean = false;
  activeLessonNodeId: string | null = null;
  _expandedArcIndices: Set<number> = new Set();

  @ViewChildren('lessonCardAnchor') lessonCardAnchors!: QueryList<ElementRef>;
  @ViewChild('progressTrack') progressTrack!: ElementRef;

  private readonly LESSON_SCROLL_OFFSET_PX = 160;

  isArcExpanded(index: number): boolean {
    return this._expandedArcIndices.has(index);
  }

  toggleArc(index: number): void {
    if (this._expandedArcIndices.has(index)) {
      this._expandedArcIndices.delete(index);
    } else {
      this._expandedArcIndices.add(index);
    }
  }

  private setDefaultExpandedArc(): void {
    this._expandedArcIndices.clear();
    if (this.arcGroups.length > 0) {
      this._expandedArcIndices.add(0);
    }
  }

  constructor(
    private assetsBackendApiService: AssetsBackendApiService,
    private urlInterpolationService: UrlInterpolationService,
    private urlService: UrlService,
    private i18nLanguageCodeService: I18nLanguageCodeService,
    private chapterProgressLoaderService: ChapterProgressLoaderService,
    private windowRef: WindowRef
  ) {}

  ngOnInit(): void {
    this.populateFromInputs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.storySummary ||
      changes.storyTitle ||
      changes.storyDescription ||
      changes.classroomUrlFragment ||
      changes.topicUrlFragment ||
      changes.skillIdToSubtopicId ||
      changes.lessonCount ||
      changes.practiceCount
    ) {
      this.populateFromInputs();
    }
  }

  ngAfterViewInit(): void {
    if (!this.activeLessonNodeId && this.lessonCards.length > 0) {
      this.activeLessonNodeId = this.lessonCards[0].nodeId;
    }
  }

  onAvatarImageError(): void {
    if (this.oppiaAvatarImageUrl !== this.getFallbackAvatarImageUrl()) {
      this.oppiaAvatarImageUrl = this.getFallbackAvatarImageUrl();
    }
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

  isLanguageRTL(): boolean {
    return this.i18nLanguageCodeService.isCurrentLanguageRTL();
  }

  getArcCompletedText(arcGroup: ArcGroupData): string {
    const completedLessonsCount = arcGroup.lessonCards.filter(lessonCard => {
      return lessonCard.lessonProgressStatus === 'completed';
    }).length;

    return (
      completedLessonsCount +
      ' of ' +
      arcGroup.lessonCards.length +
      ' completed'
    );
  }

  isProgressNodeActive(nodeId: string): boolean {
    return this.activeLessonNodeId === nodeId;
  }

  getProgressNodeAriaLabel(navItem: LessonProgressNavItem): string {
    return 'Go to Lesson ' + navItem.lessonNumber;
  }

  scrollProgressTrack(direction: 'left' | 'right'): void {
    if (!this.progressTrack) {
      return;
    }

    const delta = direction === 'left' ? -240 : 240;
    this.progressTrack.nativeElement.scrollBy({
      left: delta,
      behavior: 'smooth',
    });
  }

  scrollToLesson(nodeId: string): void {
    this.activeLessonNodeId = nodeId;
    const lessonCardAnchor = this.lessonCardAnchors.find(anchor => {
      return anchor.nativeElement?.dataset?.nodeId === nodeId;
    });

    if (!lessonCardAnchor) {
      return;
    }

    const boundingRect = lessonCardAnchor.nativeElement.getBoundingClientRect();
    const scrollTop = this.windowRef.nativeWindow.pageYOffset;
    const targetTop =
      boundingRect.top + scrollTop - this.LESSON_SCROLL_OFFSET_PX;

    this.windowRef.nativeWindow.scrollTo({
      top: Math.max(targetTop, 0),
      behavior: 'smooth',
    });
  }

  getProgressSegmentWidth(arcGroup: ArcGroupData): string {
    return Math.max(arcGroup.lessonCards.length - 1, 0) * 72 + 'px';
  }

  private getArcPalette(
    arcIndex: number
  ): (typeof StoryDomainConstants.ARC_COLOR_PALETTE)[number] {
    const palette = StoryDomainConstants.ARC_COLOR_PALETTE;
    return palette[arcIndex % palette.length];
  }

  private getLessonProgressStatus(
    node: StoryNode
  ): 'not_started' | 'in_progress' | 'completed' | 'coming_soon' {
    const nodeTitle = node.getTitle();
    if (this.storySummary.isNodeCompleted(nodeTitle)) {
      return 'completed';
    }

    const visitedChapterTitles = this.storySummary.getVisitedChapterTitles();
    if (
      visitedChapterTitles &&
      visitedChapterTitles.indexOf(nodeTitle) !== -1
    ) {
      return 'in_progress';
    }

    return 'not_started';
  }

  private async loadChapterProgress(): Promise<void> {
    const explorationIds = this.storySummary
      .getAllNodes()
      .map(node => node.getExplorationId())
      .filter(id => id !== null) as string[];

    if (explorationIds.length === 0) {
      return;
    }

    try {
      await this.chapterProgressLoaderService.loadChapterProgressForStory(
        this.storySummary.getId(),
        explorationIds
      );
    } catch {
      return;
    }

    this.lessonCards = this.storySummary
      .getAllNodes()
      .map((node: StoryNode, index: number) => {
        const explorationId = node.getExplorationId();
        let totalCheckpoints = 0;
        let visitedCheckpoints = 0;

        if (explorationId) {
          const summary =
            this.chapterProgressLoaderService.getChapterProgressSummary(
              explorationId
            );
          if (summary) {
            totalCheckpoints = summary.totalCheckpoints;
            visitedCheckpoints = summary.visitedCheckpoints;
          }
        }

        return {
          lessonNumber: index + 1,
          lessonTitle: 'Lesson ' + (index + 1) + ': ' + node.getTitle(),
          lessonDescription: node.getDescription(),
          thumbnailUrl: this.getLessonThumbnailUrl(node),
          startUrl: this.getLessonStartUrl(node),
          lessonProgressStatus: this.getLessonProgressStatus(node),
          totalCheckpointsCount: totalCheckpoints,
          visitedCheckpointsCount: visitedCheckpoints,
          nodeId: node.getId(),
        };
      });

    const allNodes = this.storySummary.getAllNodes();
    this.arcGroups = this.buildArcGroups(allNodes);
    this.setDefaultExpandedArc();
    this.isMasteryChallengeVisible = this.lessonCards.length > 0;
    this.masteryChallengeCard = this.getMasteryChallengeCardData();
  }

  private buildArcGroups(allNodes: StoryNode[]): ArcGroupData[] {
    const arcs = this.storySummary.getArcs();
    if (!arcs || arcs.length === 0) {
      return [];
    }

    const nodeIndexMap = new Map<string, number>();
    allNodes.forEach((node, index) => {
      nodeIndexMap.set(node.getId(), index);
    });

    const arcGroups = arcs.map((arc, arcIndex) => {
      const arcLessonCards: LessonCardData[] = [];
      const arcNodes: StoryNode[] = [];
      arc.node_ids.forEach(nodeId => {
        const nodeIndex = nodeIndexMap.get(nodeId);
        if (nodeIndex !== undefined && this.lessonCards[nodeIndex]) {
          arcLessonCards.push(this.lessonCards[nodeIndex]);
          arcNodes.push(allNodes[nodeIndex]);
        }
      });
      const nextArc = arcs[arcIndex + 1];
      const arcPracticeSubtopicIds =
        this.getPracticeSubtopicIdsForNodes(arcNodes);
      return {
        arcTitle: arc.title,
        arcDescription: arc.description,
        lessonCards: arcLessonCards,
        arcPalette: this.getArcPalette(arcIndex),
        arcTestCard: arcLessonCards.length
          ? this.getArcTestCardData(
              arc.title,
              nextArc ? nextArc.title : null,
              arcPracticeSubtopicIds
            )
          : null,
      };
    });

    this.progressNavItems = arcGroups.flatMap(arcGroup => {
      return arcGroup.lessonCards.map(lessonCard => {
        return {
          nodeId: lessonCard.nodeId,
          lessonNumber: lessonCard.lessonNumber,
          arcPalette: arcGroup.arcPalette,
          lessonProgressStatus: lessonCard.lessonProgressStatus,
        };
      });
    });

    return arcGroups;
  }

  private populateFromInputs(): void {
    if (!this.classroomUrlFragment) {
      this.classroomUrlFragment =
        this.urlService.getClassroomUrlFragmentFromLearnerUrl();
    }
    if (!this.topicUrlFragment) {
      this.topicUrlFragment =
        this.urlService.getTopicUrlFragmentFromLearnerUrl();
    }

    this.oppiaAvatarImageUrl = this.getPrimaryAvatarImageUrl();
    this.studyGuideUrl = this.getStudyGuideUrl();

    this.storyTitle = this.storySummary.getTitle();
    this.storyDescription = this.storySummary.getDescription() || '';
    this.lessonCount = this.storySummary.getNodeTitles().length;
    const allNodes = this.storySummary.getAllNodes();
    this.lessonCards = allNodes.map((node: StoryNode, index: number) => {
      return {
        lessonNumber: index + 1,
        lessonTitle: 'Lesson ' + (index + 1) + ': ' + node.getTitle(),
        lessonDescription: node.getDescription(),
        thumbnailUrl: this.getLessonThumbnailUrl(node),
        startUrl: this.getLessonStartUrl(node),
        nodeId: node.getId(),
        lessonProgressStatus: this.getLessonProgressStatus(node),
        totalCheckpointsCount: 0,
        visitedCheckpointsCount: 0,
      };
    });

    this.arcGroups = this.buildArcGroups(allNodes);
    this.setDefaultExpandedArc();
    if (this.lessonCards.length > 0 && !this.activeLessonNodeId) {
      this.activeLessonNodeId = this.lessonCards[0].nodeId;
    }
  }

  private getArcTestCardData(
    arcTitle: string,
    nextArcTitle: string | null,
    practiceSubtopicIds: number[]
  ): ArcTestCardData {
    const cardDescription = nextArcTitle
      ? "Test what you've learned in " +
        arcTitle +
        ' to unlock ' +
        nextArcTitle +
        '.'
      : "Test what you've learned in " + arcTitle + '.';

    return {
      cardTitle: arcTitle + ' Review & Test',
      cardDescription,
      actionLabel: 'Practice',
      thumbnailUrl: this.getFallbackLessonThumbnailUrl(),
      actionUrl: this.getPracticeSessionUrl(practiceSubtopicIds),
    };
  }

  private getMasteryChallengeCardData(): ArcTestCardData {
    return {
      cardTitle: 'MASTERY CHALLENGE',
      cardDescription:
        "Test your knowledge with a challenge that covers everything you've learned in this topic.",
      actionLabel: 'Take the Mastery Challenge',
      thumbnailUrl: this.getFallbackLessonThumbnailUrl(),
      actionUrl: this.getPracticeSessionUrl(this.practiceSubtopicIds),
    };
  }

  private getPracticeSessionUrl(practiceSubtopicIds: number[]): string {
    if (!this.classroomUrlFragment || !this.topicUrlFragment) {
      return '#';
    }

    if (practiceSubtopicIds.length === 0) {
      return '#';
    }

    return this.urlInterpolationService.interpolateUrl(
      PracticeSessionPageConstants.PRACTICE_SESSIONS_URL,
      {
        classroom_url_fragment: this.classroomUrlFragment,
        topic_url_fragment: this.topicUrlFragment,
        stringified_subtopic_ids: JSON.stringify(practiceSubtopicIds),
      }
    );
  }

  private getPracticeSubtopicIdsForNodes(nodes: StoryNode[]): number[] {
    const subtopicIds = new Set<number>();

    nodes.forEach(node => {
      node.getAcquiredSkillIds().forEach(skillId => {
        const subtopicId = this.skillIdToSubtopicId[skillId];
        if (subtopicId !== undefined) {
          subtopicIds.add(subtopicId);
        }
      });
    });

    return Array.from(subtopicIds);
  }

  private getLessonThumbnailUrl(node: StoryNode): string {
    const thumbnailFilename = node.getThumbnailFilename();
    const storyId = this.storySummary.getId();
    if (thumbnailFilename) {
      if (!storyId) {
        return this.getFallbackLessonThumbnailUrl();
      }
      return this.assetsBackendApiService.getThumbnailUrlForPreview(
        AppConstants.ENTITY_TYPE.STORY,
        storyId,
        thumbnailFilename
      );
    }
    return this.getFallbackLessonThumbnailUrl();
  }

  private getLessonStartUrl(node: StoryNode): string {
    const explorationId = node.getExplorationId();
    if (
      !explorationId ||
      !this.classroomUrlFragment ||
      !this.topicUrlFragment
    ) {
      return '#';
    }

    let lessonUrl = this.urlInterpolationService.interpolateUrl(
      '/explore/<exp_id>',
      {exp_id: explorationId}
    );
    lessonUrl = this.urlService.addField(
      lessonUrl,
      'topic_url_fragment',
      this.topicUrlFragment
    );
    lessonUrl = this.urlService.addField(
      lessonUrl,
      'classroom_url_fragment',
      this.classroomUrlFragment
    );
    lessonUrl = this.urlService.addField(
      lessonUrl,
      'story_url_fragment',
      this.storySummary.getUrlFragment()
    );
    lessonUrl = this.urlService.addField(lessonUrl, 'node_id', node.getId());
    return lessonUrl;
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

  private getFallbackLessonThumbnailUrl(): string {
    return this.urlInterpolationService.getStaticImageUrl(
      FALLBACK_LESSON_THUMBNAIL_PATH
    );
  }
}
