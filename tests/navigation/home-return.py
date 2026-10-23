"""Check return-to-unit scrolling without changing saved progress identities."""
import argparse
import asyncio
import json
from pathlib import Path
import runpy

from playwright.async_api import async_playwright

MUTE = runpy.run_path(str(Path(__file__).parents[1] / 'topics/browser.py'))['MUTE']
SIZES = [
    ('desktop', 1280, 800, False, 'no-preference'),
    ('short', 1280, 680, False, 'no-preference'),
    ('portrait', 820, 1180, True, 'no-preference'),
    ('landscape', 1180, 820, True, 'no-preference'),
    ('reduced', 1180, 820, True, 'reduce'),
]


async def lesson_ready(page):
    await page.locator('.lesson').wait_for()
    if await page.locator('.tip-veil').count():
        await page.locator('[data-go]').click()


async def enter(page, unit, stages):
    stage = next(stage for stage in stages if unit['id'] in stage['units'])
    box = page.locator(f'[data-stage="{stage["id"]}"]')
    if not await box.evaluate('node => node.open'):
        await box.locator('summary').click()
    await page.locator(f'.unit-card[data-unit="{unit["id"]}"]').click()
    await lesson_ready(page)
    assert await page.evaluate('scrollY') == 0, 'Lesson must start at the top.'


async def returned(page, uid):
    await page.locator('.home').wait_for()
    await page.wait_for_timeout(100)
    card = page.locator(f'.unit-card[data-unit="{uid}"]')
    assert await card.evaluate('node => node.closest("details").open')
    assert await card.evaluate('node => document.activeElement === node')
    bounds = await card.evaluate('''node => {
        const r = node.getBoundingClientRect();
        return {top:r.top, bottom:r.bottom, height:innerHeight};
    }''')
    assert bounds['top'] >= -1 and bounds['bottom'] <= bounds['height'] + 1, bounds


async def run(engine, args):
    browser = await engine.launch(args=['--mute-audio'] if engine.name == 'chromium' else [])
    cases = 0
    errors = []
    for name, width, height, touch, motion in SIZES:
        context = await browser.new_context(viewport={'width': width, 'height': height},
                                            has_touch=touch, reduced_motion=motion)
        await context.add_init_script(MUTE)
        page = await context.new_page()
        page.set_default_timeout(8000)
        page.set_default_navigation_timeout(30000)
        page.on('pageerror', lambda error: errors.append(str(error)))
        await page.goto(args.base, wait_until='networkidle')
        assert await page.evaluate('scrollY') == 0
        course = await page.evaluate(r'''async () => {
            const v = document.querySelector('script[type=module][src]').src.match(/v=(\d+)/)[1];
            const {UNITS, STAGES} = await import('./js/course.js?v=' + v);
            return {units:UNITS, stages:STAGES};
        }''')
        units, stages = course['units'], course['stages']
        targets = [units[0], next(u for u in reversed(units) if u['part'] == 'basic'),
                   next(u for u in units if u['part'] == 'adv'),
                   next(u for u in units if u['id'] == 'ipports'), units[-1]]
        for unit in targets:
            await enter(page, unit, stages)
            await page.locator('.back-units').click()
            await returned(page, unit['id'])
            cases += 1

        # A newly viewed unit no longer matches "not opened yet".
        unseen = next(u for u in units if u['id'] not in {t['id'] for t in targets})
        await page.locator('[data-filter="todo"]').click()
        await enter(page, unseen, stages)
        await page.locator('.back-units').click()
        await returned(page, unseen['id'])
        assert await page.locator('[data-filter="all"]').get_attribute('aria-pressed') == 'true'
        cases += 1

        # Browser back and completion use the same return context.
        await enter(page, units[-1], stages)
        await page.go_back()
        await returned(page, units[-1]['id'])
        cases += 1
        await page.goto(args.base + '#/done/' + units[-1]['id'])
        await page.locator('.finish-btns a[href="#/"]').click()
        await returned(page, units[-1]['id'])
        cases += 1

        # Direct links work without a previous home visit.
        await page.goto(args.base + '#/u/ipports/1')
        await lesson_ready(page)
        await page.locator('.back-units').click()
        await returned(page, 'ipports')
        cases += 1
        if args.screenshots and engine.name == 'chromium' and name in ('desktop', 'portrait', 'landscape'):
            args.screenshots.mkdir(parents=True, exist_ok=True)
            await page.screenshot(path=str(args.screenshots / f'home-return-{name}.png'))

        # A finished "new" unit disappears from that filter, but remains findable on return.
        ipports = next(u for u in units if u['id'] == 'ipports')
        def slide_key(slide):
            return slide.get('progressKey') or ('Q:' + slide['params']['question']
                                               if slide['title'] == '考考你' else slide['title'])
        seed = {'since': '2026-10-18', 'done': [],
                'seen': [slide_key(s) for s in [*units[0]['slides'], *ipports['slides'][1:]]],
                'last': None, 'lastIn': {}, 'secs': 0}
        # Seed after the old document's pagehide handler saves its progress.
        await context.add_init_script('localStorage.setItem("tech-explorer.v2", JSON.stringify(' + json.dumps(seed) + '));')
        await page.reload(wait_until='networkidle')
        await page.locator('[data-filter="new"]').click()
        await enter(page, ipports, stages)
        await page.locator('.back-units').click()
        await returned(page, 'ipports')
        assert await page.locator('[data-filter="all"]').get_attribute('aria-pressed') == 'true'
        cases += 1

        # Keep a filter when the current unit still matches it.
        await page.locator('[data-filter="new"]').click()
        await enter(page, units[-1], stages)
        await page.locator('.back-units').click()
        await returned(page, units[-1]['id'])
        assert await page.locator('[data-filter="new"]').get_attribute('aria-pressed') == 'true'
        cases += 1
        await context.close()
    await browser.close()
    assert not errors, errors
    return {'engine': engine.name, 'cases': cases, 'errors': errors}


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', default='http://127.0.0.1:8767/')
    parser.add_argument('--screenshots', type=Path)
    args = parser.parse_args()
    async with async_playwright() as playwright:
        results = await asyncio.gather(*(run(engine, args) for engine in [playwright.chromium, playwright.webkit]))
    print(json.dumps({'passed': True, 'results': results}))


if __name__ == '__main__':
    asyncio.run(main())
