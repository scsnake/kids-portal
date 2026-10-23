import { UNITS as units, STAGES as stages, PARTS as parts, COMING as coming } from './units.js?v=28';
import { WIDGETS as widgets } from './widgets.js?v=28';
import { TOPICS } from './topic-registry.js?v=28';
import { assembleCourse } from './topic-model.js?v=28';

// Draft snapshots use this renderer too; the release validator enforces ready topics.
const course = assembleCourse({ units, stages, parts, coming, widgets }, TOPICS, { allowDrafts: true });
export const UNITS = course.units;
export const STAGES = course.stages;
export const PARTS = course.parts;
export const COMING = course.coming;
export const WIDGETS = course.widgets;

export function installTopicStyles() {
  for (const { id, css } of course.styles) {
    const style = document.createElement('style');
    style.dataset.topic = id;
    style.textContent = css;
    document.head.append(style);
  }
}
