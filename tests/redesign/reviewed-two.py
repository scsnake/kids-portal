"""Check animation cleanup, zoom alignment, keyboard input, and recipe races."""
import argparse
import asyncio
import json
from pathlib import Path
import runpy

from playwright.async_api import async_playwright

suite = runpy.run_path(str(Path(__file__).parents[1] / 'topics/browser.py'))


async def aligned(page, selector):
    return await page.locator('.b1-flying-token').evaluate('''(token, selector) => {
      const a = token.getBoundingClientRect();
      const b = document.querySelector(selector).getBoundingClientRect();
      return Math.abs(a.x+a.width/2-b.x-b.width/2)<2 &&
             Math.abs(a.y+a.height/2-b.y-b.height/2)<2;
    }''', selector)


async def run(engine, base):
    browser = await engine.launch(args=['--mute-audio'] if engine.name=='chromium' else [])
    cases, errors = [], []
    for width,height,touch,motion in [suite['SIZES'][2],suite['SIZES'][3],suite['SIZES'][4]]:
        context = await browser.new_context(viewport={'width':width,'height':height},has_touch=touch,reduced_motion=motion)
        await context.add_init_script(suite['MUTE'])
        page = await context.new_page()
        page.set_default_timeout(8000)
        page.on('pageerror',lambda error:errors.append(str(error)))
        await page.goto(base,wait_until='networkidle')
        units = await page.evaluate(r'''async()=>{
          const version=document.querySelector('script[type=module][src]').src.match(/v=(\d+)/)[1];
          return (await import('./js/course.js?v='+version)).UNITS;
        }''')
        waste=next(u for u in units if u['id']=='ewaste')
        password=next(u for u in units if u['id']=='passwordattacks')
        hash_index=next(i for i,s in enumerate(password['slides']) if s.get('widget')=='hashblender')
        label=f'{engine.name}:{width}x{height}:{motion}'
        await suite['open_slide'](page,base,waste,0)
        for selector,bg in [('.b1-chute-green .b1-chute-title',[211,249,216]),('.b1-chute-green .b1-chute-subtitle',[211,249,216]),('.b1-chute-yellow .b1-chute-title',[255,236,153]),('.b1-chute-yellow .b1-chute-subtitle',[255,236,153]),('.b1-counter',[255,249,219])]:
            assert await contrast(page,selector,bg)>=4.5,label+': '+selector
        await page.locator('[data-item="battery"]').focus()
        await page.keyboard.press('Enter')
        await page.locator('[data-chute="yellow"]').focus()
        await page.keyboard.press('Space')
        if motion!='reduce':
            token=page.locator('.b1-flying-token')
            await token.evaluate('node=>{const a=node.getAnimations()[0];a.pause();a.currentTime=0;}')
            assert await aligned(page,'[data-item="battery"]'),label+': launch alignment'
            await token.evaluate('node=>node.getAnimations()[0].finish()')
            await page.locator('#mouth-yellow.open').wait_for()
            await token.evaluate('node=>{const a=node.getAnimations().find(a=>a.playState==="running");a.pause();a.currentTime=0;}')
            assert await aligned(page,'#mouth-yellow'),label+': chute alignment'
            await token.evaluate('node=>node.getAnimations().filter(a=>a.playState==="paused").forEach(a=>a.play())')
        await page.wait_for_function('document.querySelector("#ewCounter").textContent.includes("1 / 4")')
        cases.append(label+': keyboard and zoom alignment')

        await page.locator('.redo').click()
        await page.locator('[data-item="battery"]').click()
        await page.locator('[data-chute="yellow"]').click()
        await page.locator('.redo').click()
        await page.locator('[data-item="tissue"]').click()
        await page.locator('[data-chute="red"]').click()
        await page.wait_for_function('document.querySelector("#ewCounter").textContent.includes("1 / 4")')
        assert await page.locator('.b1-flying-token').count()==0,label+': replay cleanup'
        await page.locator('[data-item="phone"]').click()
        await page.locator('[data-chute="green"]').click()
        await suite['open_slide'](page,base,password,hash_index)
        await page.wait_for_function('!document.querySelector(".b1-flying-token")')
        cases.append(label+': replay and navigation cleanup')
        assert await contrast(page,'#btnReverse',[245,159,0])>=4.5,label+': reverse contrast'
        assert await contrast(page,'.wb3-db-row span',[52,58,64])>=4.5,label+': disclaimer contrast'
        assert await page.locator('.wb3-pitcher-base span').evaluate('''e=>{
          const text=e.getBoundingClientRect(),base=e.parentElement.getBoundingClientRect();
          return text.bottom<=base.bottom && text.top>=base.top && text.width<=base.width;
        }'''),label+': base label clipped'
        cases.append(label+': scoped contrast and base label')

        for index,hash_value in [(1,'3d71ba82'),(2,'9f02c65a')]:
            await page.locator(f'.wb3-fruit-opt[data-idx="{index}"]').click()
            await page.locator('#btnBlend').click()
            assert await page.locator('.wb3-fruit-opt:disabled').count()==3,label+': blend lock'
            await page.wait_for_function('(value)=>document.querySelector("#dbHashValue").textContent.includes(value)',arg=hash_value)
            await page.locator('#btnReverse').click()
            assert await page.locator('.wb3-fruit-opt:disabled').count()==3,label+': reverse lock'
            await page.locator('#blenderStatus.good').wait_for()
            assert await page.locator('.wb3-fruit-opt:disabled').count()==0,label+': recipe unlock'
        assert '一組一組猜' in await page.locator('#blenderStatus').inner_text()
        assert await page.locator('.star-note.got').count()==1
        cases.append(label+': recipe race and alternate values')
        await context.close()
    await browser.close()
    assert not errors,errors
    return {'engine':engine.name,'cases':cases,'errors':errors}


async def contrast(page, selector, background):
    return await page.locator(selector).evaluate('''(e,bg)=>{
      const linear=c=>{c/=255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4};
      const luminance=rgb=>rgb.map(linear).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
      const rgb=getComputedStyle(e).color.match(/[\\d.]+/g).slice(0,3).map(Number);
      const a=luminance(rgb),b=luminance(bg);
      return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    }''',background)


async def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--base',required=True)
    parser.add_argument('--report',type=Path,required=True)
    args=parser.parse_args()
    report={'passed':False}
    try:
        async with async_playwright() as p:
            report['results']=await asyncio.gather(run(p.chromium,args.base),run(p.webkit,args.base))
        report['passed']=True
    except Exception as error:
        report['error']=str(error)
    args.report.write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report))
    if not report['passed']:
        raise SystemExit(1)


if __name__=='__main__':
    asyncio.run(main())
