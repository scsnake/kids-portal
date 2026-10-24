"""Browser release checks. Every failure returns a nonzero exit status."""
import argparse
import asyncio
import json
import re
from html import unescape
from pathlib import Path

from playwright.async_api import async_playwright

MUTE = r'''(() => {
  for (const name of ['AudioContext', 'webkitAudioContext']) {
    const C = window[name];
    if (!C) continue;
    window[name] = class extends C {
      constructor(...args) {
        super(...args);
        const gain = this.createGain(); gain.gain.value = 0;
        gain.connect(super.destination);
        Object.defineProperty(this, 'destination', {value: gain});
      }
    };
  }
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { this.muted = true; return play.call(this); };
  try { speechSynthesis.speak = u => setTimeout(() => u.onend?.(new Event('end')), 50); } catch {}
})();'''
SIZES = [(1180, 820, True, 'no-preference'), (820, 1180, True, 'no-preference'),
         (1280, 800, False, 'no-preference'), (1280, 680, False, 'no-preference'),
         (1180, 820, True, 'reduce')]
MEASURE = '''() => {
  const slide = document.querySelector('.slide'), doc = document.scrollingElement;
  const rect = element => element.getBoundingClientRect();
  const visible = element => {const r = rect(element); return r.width && r.height && getComputedStyle(element).visibility !== 'hidden';};
  const label = element => (element.textContent || '').trim().slice(0, 35);
  return {
    overflow: Math.max(0, slide.scrollHeight - slide.clientHeight, doc.scrollHeight - innerHeight, doc.scrollWidth - innerWidth),
    small: [...document.querySelectorAll('.stage button, .stage [role=button], .stage input, .stage a')]
      .filter(visible).filter(element => rect(element).width < 44 || rect(element).height < 44).map(label),
    tiny: [...document.querySelectorAll('.stage *')].filter(visible).filter(element =>
      !element.closest('svg, .en') && [...element.childNodes].some(node => node.nodeType === 3 && node.textContent.trim()) &&
      parseFloat(getComputedStyle(element).fontSize) < 15).map(label),
  };
}'''


async def open_slide(page, base, unit, index):
    await page.goto(base + f'#/u/{unit["id"]}/{index}')
    await page.wait_for_function('(title) => document.querySelector(".slide h2")?.textContent === title', arg=unit['slides'][index]['title'])
    if await page.locator('.tip-veil').count():
        await page.locator('[data-go]').click()
    await page.evaluate('() => document.fonts.ready')
    await page.evaluate('() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')


async def actions(page, steps):
    for step in steps:
        kind = step.get('action')
        selector = step.get('selector')
        if kind == 'click':
            await page.locator(selector).click()
        elif kind == 'fill':
            await page.locator(selector).fill(step['value'])
        elif kind == 'waitFor':
            await page.locator(selector).wait_for(state=step.get('state', 'visible'))
        elif kind == 'expectText':
            await page.wait_for_function('({s, text}) => document.querySelector(s)?.textContent.includes(text)', arg={'s': selector, 'text': step['text']})
        elif kind == 'expectCount':
            await page.wait_for_function('({s, n}) => document.querySelectorAll(s).length === n', arg={'s': selector, 'n': step['count']})
        else:
            raise AssertionError(f'Unknown check action: {kind}')


async def complete(page, slide, custom):
    widget = slide.get('widget')
    if not widget:
        return
    # Stars persist after replay. Observe a fresh api.done() call on this run.
    await page.locator('.star-note').evaluate("element => element.classList.remove('got')")
    if custom:
        await actions(page, custom)
    elif widget == 'choice':
        answer = next(option['text'] for option in slide['params']['options'] if option.get('correct'))
        answer = unescape(re.sub(r'<[^>]+>', '', answer))
        await page.locator('.stage').get_by_role('button', name=answer, exact=True).click()
    elif widget == 'sort':
        for item in slide['params']['items']:
            chip = page.locator('.tray .chip').filter(has_text=item['label'])
            if await chip.count():
                await chip.click()
                await page.locator(f'.bin[data-zone="{item["bin"]}"] .bin-head').click()
    elif widget == 'order':
        for item in slide['params']['items']:
            await page.locator('.pool .chip:not(.placed)').filter(has_text=item['label']).click()
    else:
        raise AssertionError(f'Missing checks for widget {widget}')
    await page.locator('.star-note.got').wait_for()


async def run_engine(pw, name, args, plan):
    browser = await getattr(pw, name).launch(args=['--mute-audio'] if name == 'chromium' else [])
    errors, existing = [], []
    played = 0
    for width, height, touch, motion in ([*SIZES[:2], SIZES[-1]] if args.quick else SIZES):
        context = await browser.new_context(viewport={'width': width, 'height': height}, has_touch=touch, reduced_motion=motion)
        await context.add_init_script(MUTE)
        page = await context.new_page()
        baseline = await context.new_page()
        page.set_default_timeout(8000)
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
        await page.goto(args.base, wait_until='networkidle')
        units = await page.evaluate('''async () => {
          const version = document.querySelector('script[type=module][src*="js/main.js?v="]').src.match(/v=(\d+)/)[1];
          return (await import('./js/course.js?v=' + version)).UNITS;
        }''')
        ids = {unit['id'] for unit in units}
        assert set(plan['topics']) <= ids, 'A reviewed topic is missing from the course.'
        await page.locator('[data-index]').click()
        for uid in plan['topics']:
            assert await page.locator(f'#book-index a[href="#/u/{uid}/0"]').count() == 1, uid
        await page.locator('[data-tab="terms"]').click()
        links = await page.locator('.ix-list a').evaluate_all("elements => elements.map(element => element.getAttribute('href'))")
        by_id = {unit['id']: unit for unit in units}
        for link in links:
            _, _, uid, index = link.split('/')
            assert uid in by_id and int(index) < len(by_id[uid]['slides']), link
        for unit in units:
            if unit['id'] in plan['topics']:
                for slide in unit['slides']:
                    for term in re.findall(r'<b class="term">([^<]+)<span class="en"', slide.get('text', '')):
                        assert await page.locator('.ix-list b').filter(has_text=term).count(), term
        await page.locator('#book-index [data-close]').last.click()
        for unit in units:
            is_new = unit['id'] in plan['topics']
            if (args.quick or motion == 'reduce') and not is_new:
                continue
            for index, slide in enumerate(unit['slides']):
                label = f'{name}:{width}x{height}:{motion}:{unit["id"]}/{index}'
                await open_slide(page, args.base, unit, index)
                before = await page.evaluate(MEASURE)
                if before['overflow'] > 1:
                    assert not is_new, f'{label}: new slide overflow {before["overflow"]}px'
                    await open_slide(baseline, args.baseline, unit, index)
                    old = await baseline.evaluate(MEASURE)
                    assert before['overflow'] <= old['overflow'], f'{label}: overflow increased from {old["overflow"]} to {before["overflow"]}'
                    existing.append({'slide': label, 'overflow': before['overflow']})
                if is_new:
                    if touch:
                        assert not before['small'], (label, 'small targets', before['small'])
                        assert not before['tiny'], (label, 'small text', before['tiny'])
                    custom = plan['checks'].get(unit['id'], {}).get(slide['id'], [])
                    await complete(page, slide, custom)
                    after = await page.evaluate(MEASURE)
                    assert after['overflow'] <= 1, (label, after)
                    if slide.get('widget'):
                        await page.locator('.redo').click()
                        await complete(page, slide, custom)
                    played += 1
        await context.close()
    await browser.close()
    assert not errors, errors
    return {'engine': name, 'played': played, 'existingOverflow': existing}


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', required=True)
    parser.add_argument('--baseline', required=True)
    parser.add_argument('--plan', type=Path, required=True)
    parser.add_argument('--report', type=Path, required=True)
    parser.add_argument('--quick', action='store_true')
    args = parser.parse_args()
    plan = json.loads(args.plan.read_text())
    report = {'passed': False, 'quick': args.quick, 'results': []}
    try:
        async with async_playwright() as pw:
            report['results'] = await asyncio.gather(*(run_engine(pw, name, args, plan) for name in ['chromium', 'webkit']))
        report['passed'] = True
        print(json.dumps(report))
    except Exception as error:
        report['error'] = str(error)
        raise
    finally:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, indent=2) + '\n')


if __name__ == '__main__':
    asyncio.run(main())
