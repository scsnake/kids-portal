// Pure catalog assembly, shared by the browser and release tools.
export const topicId = value => typeof value === 'string' && /^[a-z][a-z0-9-]*$/.test(value);
const requireValue = (condition, message) => { if (!condition) throw new Error(message); };

export function assembleCourse(base, entries = [], { allowDrafts = false } = {}) {
  const units = [...base.units];
  const stages = base.stages.map(stage => ({ ...stage, units: [...stage.units] }));
  const widgets = { ...base.widgets };
  const styles = [];
  for (const { topic, releasedAt } of entries) {
    const { unit, placement, readme, changelog } = topic;
    requireValue(unit && topicId(unit.id), 'Each topic needs a stable, lowercase unit ID.');
    requireValue(allowDrafts || topic.ready === true, `${unit.id}: mark the reviewed topic ready before release.`);
    requireValue(!units.some(other => other.id === unit.id), `Duplicate unit ID: ${unit.id}`);
    for (const key of ['title', 'en', 'desc', 'icon', 'color']) {
      requireValue(typeof unit[key] === 'string' && unit[key].trim(), `${unit.id}: missing ${key}.`);
    }
    requireValue(typeof readme === 'string' && readme.trim(), `${unit.id}: missing README summary.`);
    requireValue(typeof changelog === 'string' && changelog.trim(), `${unit.id}: missing changelog summary.`);
    requireValue(/^\d{4}-\d{2}-\d{2}$/.test(releasedAt || ''), `${unit.id}: missing release date.`);
    requireValue(Array.isArray(unit.slides) && unit.slides.length >= 2 && unit.slides.length <= 7,
      `${unit.id}: use 2 to 7 slides.`);
    const anchor = units.findIndex(other => other.id === placement?.after);
    requireValue(anchor >= 0, `${unit.id}: unknown preceding unit ${placement?.after}.`);
    const names = new Set();
    for (const slide of unit.slides) {
      requireValue(topicId(slide.id) && !names.has(slide.id), `${unit.id}: missing or duplicate slide ID.`);
      names.add(slide.id);
      requireValue(slide.title && (slide.widget || slide.art), `${unit.id}/${slide.id}: missing title or content.`);
    }
    for (const [name, widget] of Object.entries(topic.widgets || {})) {
      requireValue(typeof widget === 'function' && !Object.hasOwn(widgets, name), `${unit.id}: duplicate or invalid widget ${name}.`);
      widgets[name] = widget;
    }
    let stage = stages.find(other => other.id === placement.stage);
    if (!stage) {
      const definition = placement.newStage;
      requireValue(definition && definition.id === placement.stage && topicId(definition.id), `${unit.id}: unknown stage ${placement.stage}.`);
      const previous = stages.findIndex(other => other.id === definition.after);
      requireValue(previous >= 0, `${unit.id}: unknown preceding stage.`);
      for (const key of ['title', 'en', 'icon', 'part']) requireValue(definition[key], `${unit.id}: new stage needs ${key}.`);
      stage = { ...definition, units: [] };
      delete stage.after;
      stages.splice(previous + 1, 0, stage);
    }
    requireValue(stage.part === unit.part, `${unit.id}: unit and stage parts differ.`);
    const position = stage.units.indexOf(placement.after);
    if (position >= 0) stage.units.splice(position + 1, 0, unit.id);
    else stage.units.push(unit.id);
    const added = { ...unit, added: releasedAt,
      slides: unit.slides.map(slide => ({ ...slide, progressKey: `${unit.id}/${slide.id}` })) };
    units.splice(anchor + 1, 0, added);
    stage.units.sort((a, b) => units.findIndex(unit => unit.id === a) - units.findIndex(unit => unit.id === b));
    for (const dependency of topic.prerequisites || []) {
      const dependencyIndex = units.findIndex(other => other.id === dependency);
      requireValue(dependencyIndex >= 0 && dependencyIndex < units.indexOf(added), `${unit.id}: prerequisite ${dependency} must come first.`);
    }
    if (topic.css) styles.push({ id: unit.id, css: topic.css });
  }
  validateCourse({ ...base, units, stages, widgets }, { allowDrafts });
  return { ...base, units, stages, widgets, styles };
}

export function validateCourse(course, { allowDrafts = false } = {}) {
  const ids = new Set();
  const assigned = new Set();
  const stageIds = new Set();
  const partIds = new Set(course.parts.map(part => part.id));
  for (const unit of course.units) {
    requireValue(topicId(unit.id) && !ids.has(unit.id), `Duplicate or invalid unit ID: ${unit.id}`);
    ids.add(unit.id);
    requireValue(partIds.has(unit.part), `${unit.id}: unknown part.`);
    requireValue(unit.slides.length >= 2 && unit.slides.length <= 7, `${unit.id}: use 2 to 7 slides.`);
    const keys = new Set();
    for (const slide of unit.slides) {
      const key = slide.progressKey || (slide.title === '考考你' ? 'Q:' + slide.params?.question : slide.title);
      requireValue(key && !keys.has(key), `${unit.id}: duplicate or missing progress key.`);
      keys.add(key);
      if (slide.widget) requireValue(Object.hasOwn(course.widgets, slide.widget) && typeof course.widgets[slide.widget] === 'function', `${unit.id}: unknown widget ${slide.widget}.`);
    }
  }
  for (const stage of course.stages) {
    requireValue(topicId(stage.id) && !stageIds.has(stage.id), `Duplicate or invalid stage ID: ${stage.id}`);
    stageIds.add(stage.id);
    requireValue(stage.units.length >= (allowDrafts ? 1 : 2) && stage.units.length <= 5, `${stage.id}: use 2 to 5 units.`);
    let previous = -1;
    for (const id of stage.units) {
      const index = course.units.findIndex(unit => unit.id === id);
      requireValue(index >= 0 && !assigned.has(id), `${stage.id}: unknown or repeated unit ${id}.`);
      requireValue(course.units[index].part === stage.part && index > previous, `${stage.id}: incorrect part or unit order.`);
      assigned.add(id);
      previous = index;
    }
  }
  requireValue(assigned.size === ids.size, 'Every unit must appear in exactly one stage.');
  requireValue(course.stages.flatMap(stage => stage.units).join('|') === course.units.map(unit => unit.id).join('|'),
    'Stage order must match the course unit order.');
  return course;
}
