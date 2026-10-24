"""Exercise the approved legacy replacements in the production renderer."""
import argparse
import asyncio
import json
from pathlib import Path
import runpy

from playwright.async_api import async_playwright

suite = runpy.run_path(str(Path(__file__).parents[1] / 'topics/browser.py'))
TARGETS = {'juicebox', 'phonepeek', 'hddseek', 'flashtrap', 'cpuchefs', 'gpusimd', 'aimath',
           'otpdefense', 'packetsniff', 'realwallet', 'kickhacker', 'voiceclone', 'dnslookup', 'ifcondition'}
MEDIUM_MANIFEST = json.loads((Path(__file__).parent / 'medium/manifest.json').read_text())
MEDIUM_CHECKS = json.loads((Path(__file__).parent / 'medium/checks.json').read_text())
MEDIUM_TARGETS = {target['widget'] for target in MEDIUM_MANIFEST['targets']}


async def click(page, selector):
    await page.locator(selector).click()


async def play(page, widget):
    if widget in MEDIUM_TARGETS:
        await suite['actions'](page, MEDIUM_CHECKS[widget])
        if widget == 'sensorheroes':
            assert await page.locator('.b2-sh-siri-response').evaluate('''node => {
              const screen = node.closest('.b2-sh-phone-screen').getBoundingClientRect();
              const response = node.getBoundingClientRect();
              return response.top >= screen.top && response.bottom <= screen.bottom;
            }'''), 'Sensor reply is clipped inside the phone.'
    elif widget == 'juicebox':
        for fruit in ['apple', 'orange', 'carrot']:
            await click(page, f'[data-fruit="{fruit}"]')
            await page.locator(f'[data-fruit="{fruit}"].done').wait_for()
    elif widget == 'phonepeek':
        for chip in await page.locator('.hw-pp-chip').all():
            await chip.click()
        await page.locator('.hw-pp-shrink-range').focus()
        await page.locator('.hw-pp-shrink-range').press('Home')
    elif widget == 'hddseek':
        for button in await page.locator('.hw-hdd-file-btn').all():
            await button.click()
        await click(page, '.hw-hdd-shock-btn')
    elif widget == 'flashtrap':
        await click(page, '.hw-ft-write-btn')
        await click(page, '.hw-ft-shake-btn')
    elif widget == 'cpuchefs':
        for _ in range(4):
            await click(page, '.hw-cc-order-btn')
    elif widget == 'gpusimd':
        await click(page, '.hw-simd-chef-btn')
        await page.wait_for_function("!document.querySelector('.hw-simd-chef-btn').disabled")
        await click(page, '.hw-simd-ants-btn')
        await click(page, '.hw-simd-stamp-btn')
    elif widget == 'aimath':
        await click(page, '.hw-ai-cpu-btn')
        await page.wait_for_function("!document.querySelector('.hw-ai-gpu-btn').disabled")
        await click(page, '.hw-ai-gpu-btn')
    elif widget == 'otpdefense':
        await click(page, '#btnSendOtp')
        await click(page, '#btnRetry')
        await click(page, '#btnBlockScam')
    elif widget == 'packetsniff':
        await click(page, '#btnWeather')
        await click(page, '#btnHttp')
        await click(page, '#btnHttps')
    elif widget == 'realwallet':
        await click(page, '#btnBuySkin')
        await click(page, '#btnXRay')
        await click(page, '#btnApplyShield')
        await click(page, '#btnBuySkin')
        await click(page, '#btnParentDeny')
    elif widget == 'kickhacker':
        for selector in ['#btnStep1', '#btnStep2', '#btnStep3']:
            await click(page, selector)
    elif widget == 'voiceclone':
        for selector in ['#btnAnswer', '#btnSecretWord', '#btnCallback']:
            await click(page, selector)
    elif widget == 'dnslookup':
        for selector in ['#btnDnsQuery', '#btnStamp', '#btnSendPacket']:
            await click(page, selector)
    elif widget == 'ifcondition':
        for index, tab in enumerate(await page.locator('.ws-tab-btn').all()):
            await tab.click()
            assert await tab.get_attribute('aria-pressed') == 'true'
            await click(page, '#btnCondFalse')
            assert await page.locator('#btnCondFalse').get_attribute('aria-pressed') == 'true'
            assert ['出太陽', '道路暢通', '電量滿滿'][index] in await page.locator('#actionDesc').inner_text()
            await click(page, '#btnCondTrue')
            assert await page.locator('#btnCondTrue').get_attribute('aria-pressed') == 'true'
            assert ['下雨', '障礙', '電量不足'][index] in await page.locator('#actionDesc').inner_text()
        assert await page.locator('#actionDesc').get_attribute('aria-live') == 'polite'
    else:
        raise AssertionError(widget)
    await page.locator('.star-note.got').wait_for()


async def run(engine, args):
    browser = await engine.launch(args=['--mute-audio'] if engine.name == 'chromium' else [])
    played, issues, errors = 0, [], []
    for width, height, touch, motion in (suite['SIZES'][:1] if args.smoke else suite['SIZES']):
        context = await browser.new_context(viewport={'width':width, 'height':height}, has_touch=touch, reduced_motion=motion)
        await context.add_init_script(suite['MUTE'])
        page = await context.new_page()
        page.set_default_timeout(8000)
        page.set_default_navigation_timeout(30000)
        page.on('pageerror', lambda error: errors.append(str(error)))
        await page.goto(args.base, wait_until='networkidle')
        units = await page.evaluate("""async () => {
          const version = document.querySelector('script[type=module][src]').src.match(/v=(\\d+)/)[1];
          return (await import('./js/course.js?v=' + version)).UNITS;
        }""")
        groups = {'high': TARGETS, 'medium': MEDIUM_TARGETS, 'all': TARGETS | MEDIUM_TARGETS}
        selected = set(args.widgets or groups[args.group])
        targets = [(u, i, s) for u in units for i, s in enumerate(u['slides']) if s.get('widget') in selected]
        assert len(targets) == len(selected)
        for unit, index, slide in targets:
            label = f'{engine.name}:{width}x{height}:{motion}:{unit["id"]}/{index}:{slide["widget"]}'
            await suite['open_slide'](page, args.base, unit, index)
            for phase in ['before', 'after']:
                if phase == 'after':
                    try:
                        await page.locator('.star-note').evaluate("node => node.classList.remove('got')")
                        await play(page, slide['widget'])
                        await click(page, '.redo')
                        await page.locator('.star-note').evaluate("node => node.classList.remove('got')")
                        await play(page, slide['widget'])
                        await page.wait_for_timeout(400)
                        played += 1
                    except Exception as error:
                        issues.append({'slide':label, 'actionError':str(error)})
                        break
                measured = await page.evaluate(suite['MEASURE'])
                if slide['widget'] in MEDIUM_TARGETS:
                    panel_overflow = await page.locator('.b1-panel, .b2-panel, .wb3-panel').evaluate(
                        'node => Math.max(0, node.scrollHeight - node.clientHeight)')
                    measured['overflow'] = max(measured['overflow'], panel_overflow)
                if measured['overflow'] > 1 or (touch and (measured['tiny'] or measured['small'])):
                    issues.append({'slide':label, 'phase':phase, **measured})
        await context.close()
        print(f'{engine.name} {width}x{height} {motion}: exercised', flush=True)
    await browser.close()
    return {'engine':engine.name, 'played':played, 'issues':issues, 'errors':errors}


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--base', default='http://127.0.0.1:8770/')
    parser.add_argument('--report', type=Path, required=True)
    parser.add_argument('--widgets', nargs='+', choices=sorted(TARGETS | MEDIUM_TARGETS))
    parser.add_argument('--group', choices=['high', 'medium', 'all'], default='high')
    parser.add_argument('--smoke', action='store_true')
    args = parser.parse_args()
    async with async_playwright() as p:
        results = await asyncio.gather(run(p.chromium,args), run(p.webkit,args))
    groups = {'high': TARGETS, 'medium': MEDIUM_TARGETS, 'all': TARGETS | MEDIUM_TARGETS}
    expected = len(args.widgets or groups[args.group]) * (1 if args.smoke else len(suite['SIZES']))
    report = {'passed':all(not r['issues'] and not r['errors'] and r['played']==expected for r in results), 'smoke':args.smoke, 'results':results}
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
    print(json.dumps({**report, 'results':[{**r, 'issues':len(r['issues'])} for r in results]}))
    if not report['passed']:
        raise SystemExit(1)


if __name__ == '__main__':
    asyncio.run(main())
