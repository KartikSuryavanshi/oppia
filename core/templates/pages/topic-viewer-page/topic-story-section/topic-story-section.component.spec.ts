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
 * @fileoverview Unit tests for TopicStorySectionComponent.
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {I18nLanguageCodeService} from 'services/i18n-language-code.service';
import {UrlInterpolationService} from 'domain/utilities/url-interpolation.service';
import {UrlService} from 'services/contextual/url.service';
import {StorySummary} from 'domain/story/story-summary.model';
import {MockTranslatePipe} from 'tests/unit-test-utils';
import {TopicStorySectionComponent} from './topic-story-section.component';

describe('TopicStorySectionComponent', () => {
  let component: TopicStorySectionComponent;
  let fixture: ComponentFixture<TopicStorySectionComponent>;
  let i18nLanguageCodeService: I18nLanguageCodeService;
  let urlInterpolationService: UrlInterpolationService;
  let urlService: UrlService;

  const nodeDict = {
    id: 'node_1',
    thumbnail_filename: 'image.png',
    title: 'What are place values?',
    description: 'Jaime learns the place value of each digit in a big number.',
    prerequisite_skill_ids: [],
    acquired_skill_ids: ['skill_1'],
    destination_node_ids: ['node_2'],
    outline: 'Outline',
    exploration_id: 'exp_1',
    outline_is_finalized: false,
    thumbnail_bg_color: '#a33f40',
    status: 'Published',
    planned_publication_date_msecs: null,
    last_modified_msecs: null,
    first_publication_date_msecs: null,
    unpublishing_reason: null,
  };

  const sampleStorySummaryBackendDict = {
    id: 'story_1',
    title: 'Help Jaime win the Arcade Game',
    node_titles: ['What are place values?'],
    thumbnail_filename: 'image.svg',
    thumbnail_bg_color: '#F8BF74',
    description: 'A story about place values.',
    story_is_published: true,
    completed_node_titles: [],
    url_fragment: 'help-jaime',
    all_node_dicts: [nodeDict],
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TopicStorySectionComponent, MockTranslatePipe],
      providers: [UrlInterpolationService, UrlService],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    i18nLanguageCodeService = TestBed.inject(I18nLanguageCodeService);
    urlInterpolationService = TestBed.inject(UrlInterpolationService);
    urlService = TestBed.inject(UrlService);

    spyOn(i18nLanguageCodeService, 'isCurrentLanguageRTL').and.returnValue(
      false
    );

    fixture = TestBed.createComponent(TopicStorySectionComponent);
    component = fixture.componentInstance;
    component.storySummary = StorySummary.createFromBackendDict(
      sampleStorySummaryBackendDict
    );
    component.classroomUrlFragment = 'math';
    component.topicUrlFragment = 'place-values';
    component.practiceCount = 3;
    fixture.detectChanges();
  });

  it('should initialize lessonCount on ngOnInit', () => {
    component.ngOnInit();
    expect(component.lessonCount).toBe(1);
  });

  it('should render story title in an h2', () => {
    const el: HTMLElement = fixture.nativeElement;
    const h2 = el.querySelector('.tss-story-title');
    expect(h2?.tagName).toBe('H2');
    expect(h2?.textContent).toContain('Help Jaime win the Arcade Game');
  });

  it('should render lesson count in story counts', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.tss-story-counts')?.textContent).toContain(
      '1 lessons'
    );
  });

  it('should render practice count when practiceCount > 0', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.tss-story-counts')?.textContent).toContain(
      '3 practices'
    );
  });

  it('should render a lesson card for each story node', () => {
    const el: HTMLElement = fixture.nativeElement;
    const cards = el.querySelectorAll('.tss-lesson-card');
    expect(cards.length).toBe(1);
  });

  it('should render the lesson title with the lesson number', () => {
    const el: HTMLElement = fixture.nativeElement;
    const title = el.querySelector('.tss-lesson-title');
    expect(title?.textContent).toContain('Lesson 1:');
    expect(title?.textContent).toContain('What are place values?');
  });

  it('should render the lesson description', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.tss-lesson-description')?.textContent).toContain(
      'Jaime learns the place value of each digit in a big number.'
    );
  });

  it('should show "Start" for incomplete lessons', () => {
    const el: HTMLElement = fixture.nativeElement;
    const btn = el.querySelector('.tss-lesson-start-btn');
    expect(btn?.textContent?.trim()).toBe('Start');
  });

  it('should show "Continue" for completed lessons', () => {
    const completedDict = {
      ...sampleStorySummaryBackendDict,
      completed_node_titles: ['What are place values?'],
    };
    component.storySummary = StorySummary.createFromBackendDict(completedDict);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const btn = el.querySelector('.tss-lesson-start-btn');
    expect(btn?.textContent?.trim()).toBe('Continue');
  });

  it('should return study skills URL correctly', () => {
    const url = component.getStudySkillsUrl();
    expect(url).toContain('/learn/math/place-values/studyguide');
  });

  it('should return story viewer URL correctly', () => {
    const url = component.getStoryViewerUrl();
    expect(url).toContain('/learn/math/place-values/story/help-jaime');
  });

  it('should return chapter URL for a node with an exploration ID', () => {
    spyOn(urlService, 'addField').and.callFake(
      (url: string, key: string, value: string) => {
        return url + (url ? '&' : '?') + key + '=' + value;
      }
    );
    const nodes = component.storySummary.getAllNodes();
    const url = component.getChapterUrl(nodes[0]);
    expect(url).toContain('/explore/exp_1');
    expect(url).toContain('story_url_fragment=help-jaime');
  });

  it('should return "#" for a node with no exploration ID', () => {
    const nullExpDict = {
      ...nodeDict,
      exploration_id: null,
    };
    const storyDict = {
      ...sampleStorySummaryBackendDict,
      all_node_dicts: [nullExpDict],
    };
    component.storySummary = StorySummary.createFromBackendDict(storyDict);
    fixture.detectChanges();
    const nodes = component.storySummary.getAllNodes();
    expect(component.getChapterUrl(nodes[0])).toBe('#');
  });

  it('should delegate RTL check to I18nLanguageCodeService', () => {
    expect(component.isLanguageRTL()).toBeFalse();
    (
      i18nLanguageCodeService.isCurrentLanguageRTL as jasmine.Spy
    ).and.returnValue(true);
    expect(component.isLanguageRTL()).toBeTrue();
  });

  it('should render Study Skills link in the header', () => {
    const el: HTMLElement = fixture.nativeElement;
    const link = el.querySelector<HTMLAnchorElement>('.tss-study-skills-btn');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toContain('studyguide');
  });
});
