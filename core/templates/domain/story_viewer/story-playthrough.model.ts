// Copyright 2015 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Frontend Model for story playthrough.
 */

import {
  ReadOnlyStoryNode,
  StoryNodeBackendDict,
} from 'domain/story_viewer/read-only-story-node.model';

export interface ArcBackendDict {
  title: string;
  node_ids: string[];
  description: string;
}

export class Arc {
  constructor(
    public title: string,
    public nodeIds: string[],
    public description: string
  ) {}

  static createFromBackendDict(backendDict: ArcBackendDict): Arc {
    return new Arc(
      backendDict.title,
      [...backendDict.node_ids],
      backendDict.description
    );
  }
}

export interface StoryPlaythroughBackendDict {
  story_id: string;
  story_nodes: StoryNodeBackendDict[];
  story_title: string;
  story_description: string;
  topic_name: string;
  meta_tag_content: string;
  arcs: ArcBackendDict[];
}

export class StoryPlaythrough {
  id: string;
  nodes: ReadOnlyStoryNode[];
  arcs: Arc[];
  title: string;
  description: string;
  topicName: string;
  metaTagContent: string;

  constructor(
    id: string,
    nodes: ReadOnlyStoryNode[],
    arcs: Arc[],
    title: string,
    description: string,
    topicName: string,
    metaTagContent: string
  ) {
    this.id = id;
    this.nodes = nodes;
    this.arcs = arcs;
    this.title = title;
    this.description = description;
    this.topicName = topicName;
    this.metaTagContent = metaTagContent;
  }

  static createFromBackendDict(
    storyPlaythroughBackendDict: StoryPlaythroughBackendDict
  ): StoryPlaythrough {
    var nodeObjects = storyPlaythroughBackendDict.story_nodes.map(
      storyNodeDict => ReadOnlyStoryNode.createFromBackendDict(storyNodeDict)
    );

    var arcs = (storyPlaythroughBackendDict.arcs || []).map(arcDict =>
      Arc.createFromBackendDict(arcDict)
    );

    return new StoryPlaythrough(
      storyPlaythroughBackendDict.story_id,
      nodeObjects,
      arcs,
      storyPlaythroughBackendDict.story_title,
      storyPlaythroughBackendDict.story_description,
      storyPlaythroughBackendDict.topic_name,
      storyPlaythroughBackendDict.meta_tag_content
    );
  }

  getInitialNode(): ReadOnlyStoryNode {
    return this.nodes[0];
  }

  getStoryNodeCount(): number {
    return this.nodes.length;
  }

  getStoryNodes(): ReadOnlyStoryNode[] {
    return this.nodes;
  }

  hasFinishedStory(): boolean {
    return this.nodes.slice(-1)[0].isCompleted();
  }

  getNextPendingNodeId(): string {
    for (var i = 0; i < this.nodes.length; i++) {
      if (!this.nodes[i].isCompleted()) {
        return this.nodes[i].getId();
      }
    }
    throw new Error('No story nodes found!');
  }

  hasStartedStory(): boolean {
    return this.nodes[0].isCompleted();
  }

  getStoryId(): string {
    return this.id;
  }

  getMetaTagContent(): string {
    return this.metaTagContent;
  }

  getArcs(): Arc[] {
    return this.arcs;
  }

  getNodesInArc(arcIndex: number): ReadOnlyStoryNode[] {
    var arc = this.arcs[arcIndex];
    if (!arc) {
      return [];
    }
    var nodeMap: Record<string, ReadOnlyStoryNode> = {};
    for (var i = 0; i < this.nodes.length; i++) {
      nodeMap[this.nodes[i].getId()] = this.nodes[i];
    }
    return arc.nodeIds
      .map(nodeId => nodeMap[nodeId])
      .filter(node => node !== undefined) as ReadOnlyStoryNode[];
  }

  getArcIndexForNode(nodeId: string): number {
    for (var i = 0; i < this.arcs.length; i++) {
      if (this.arcs[i].nodeIds.indexOf(nodeId) !== -1) {
        return i;
      }
    }
    return -1;
  }

  getArcCompletionCount(arcIndex: number): number {
    var nodes = this.getNodesInArc(arcIndex);
    var count = 0;
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].isCompleted()) {
        count++;
      }
    }
    return count;
  }
}
