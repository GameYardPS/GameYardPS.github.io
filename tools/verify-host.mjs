import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const revision = 'auto-v7-20261114';
const baseline = JSON.parse(fs.readFileSync(path.join(root,'tools/host-baseline.json'),'utf8'));
let checks = 0;
function test(name, fn) { fn(); checks++; console.log('PASS ' + name); }
function harness({fw = '13.52', status = 1, noCache = false, localFail = false, hash = '', group = 'slopkit', local = {}, session = {}} = {}) {
  let now = 0, seq = 0;
  const timers = new Map(), listeners = new Map(), elements = new Map(), scripts = [], navigations = [];
  function storage(values, fail = false) {
    return { getItem(k) { if (fail) throw Error('storage denied'); return values[k] ?? null; }, setItem(k,v) { if (fail) throw Error('storage denied'); values[k] = String(v); }, removeItem(k) { if (fail) throw Error('storage denied'); delete values[k]; } };
  }
  function element(id) {
    if (!elements.has(id)) elements.set(id, {id, textContent:'', className:'', hidden:true, disabled:false, style:{}, addEventListener(){}, focus(){}});
    return elements.get(id);
  }
  const acEvents = new Map();
  const ac = { status, swaps:0, UNCACHED:0, IDLE:1, CHECKING:2, DOWNLOADING:3, UPDATEREADY:4, OBSOLETE:5,
    addEventListener(n,fn){if(!acEvents.has(n))acEvents.set(n,new Set());acEvents.get(n).add(fn);},
    removeEventListener(n,fn){acEvents.get(n)?.delete(fn);},
    swapCache(){this.swaps++;this.status=1;}
  };
  let href = '';
  const location = {hash, pathname:'/index.html', search:'', origin:'https://hazzazstore.github.io', replace(url){navigations.push(url);}, reload(){navigations.push('RELOAD');}, get href(){return href;}, set href(url){href=url;navigations.push(url);} };
  const sandbox = { document:{getElementById:element, createElement(){return {};}, head:{appendChild(node){scripts.push(node);}}, body:{getAttribute(){return group;}}},
    navigator:{userAgent:fw ? 'Mozilla/5.0 (PlayStation 4/' + fw + ') AppleWebKit/605.1.15' : 'Desktop browser'},
    location, history:{replaceState(){location.hash='';}}, applicationCache:noCache?null:ac,
    localStorage:storage(local,localFail), sessionStorage:storage(session),
    setTimeout(fn,delay){const id=++seq;timers.set(id,{fn,at:now+(delay||0)});return id;}, clearTimeout(id){timers.delete(id);},
    addEventListener(name,fn){listeners.set(name,fn);}, console,
    doJb(){sandbox.cssRuns=(sandbox.cssRuns||0)+1;}
  };
  sandbox.window=sandbox;
  const context=vm.createContext(sandbox);
  return {ac, elements, scripts, navigations, local, session, sandbox,
    run(file){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});},
    advance(ms){const end=now+ms;for(let count=0;count<100;count++){const next=[...timers.entries()].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at||a[0]-b[0])[0];if(!next){now=end;return;}timers.delete(next[0]);now=next[1].at;next[1].fn();}throw Error('Timer loop');},
    emit(type,nextStatus=ac.status,extra={}){ac.status=nextStatus;for(const fn of [...(acEvents.get(type)||[])])fn({type,...extra});},
    event(name){listeners.get(name)?.();}, element
  };
}
function home(h) { h.run('auto-cache.js'); h.run('host.js'); }

const routes = [
  ['7.00','700','700/alert.js'],['8.52','700','700/alert.js'],['9.00','900','900/alert.js'],['9.60','900','900/alert.js'],
  ['10.00','css','css/main.js'],['11.02','css','css/main.js'],['11.50','slopkit','slopkit/chain_lapse.js'],['12.02','slopkit','slopkit/chain_lapse.js'],
  ['12.50','slopkit','slopkit/chain_poops.js'],['13.00','slopkit','slopkit/chain_poops.js'],['13.02','slopkit','slopkit/jb.js?v=19'],['13.52','slopkit','slopkit/jb.js?v=19']
];
for (const [fw,group,src] of routes) test('cached '+fw+' starts its original engine without a click',()=>{
  const h=harness({fw,local:{['gameyard-cache-'+group]:revision}});home(h);h.advance(700);
  assert.equal(h.scripts.length,1);assert.equal(h.scripts[0].src,src);
  if(group==='css'){h.scripts[0].onload();h.advance(500);assert.equal(h.sandbox.cssRuns,1);}
});
test('first visit automatically enters the firmware cache page',()=>{const h=harness({status:0});home(h);h.advance(500);assert.deepEqual(h.navigations,['cacheslopkit.html']);assert.equal(h.scripts.length,0);});
test('old shared cache marker cannot skip the new firmware cache',()=>{const h=harness({local:{'multifw-cache-v2':'1'}});home(h);h.advance(500);assert.deepEqual(h.navigations,['cacheslopkit.html']);});
test('cache page waits for completion, shows progress and continues once',()=>{
  const h=harness({status:3});h.run('auto-cache.js');h.run('cache-flow.js');h.advance(800);assert.equal(h.navigations.length,0);
  h.emit('progress',3,{loaded:5,total:10});assert.equal(h.element('percent').textContent,'50%');
  h.emit('cached',1);h.emit('noupdate',1);h.advance(500);assert.deepEqual(h.navigations,['index.html#cache-ready=slopkit-'+revision]);assert.equal(h.local['gameyard-cache-slopkit'],revision);
});
test('cache return works with localStorage blocked',()=>{const h=harness({localFail:true,hash:'#cache-ready=slopkit-'+revision});home(h);h.advance(700);assert.equal(h.scripts[0].src,'slopkit/jb.js?v=19');assert.equal(h.navigations.length,0);});
test('cache page returns without relying on localStorage',()=>{const h=harness({localFail:true,status:3});h.run('auto-cache.js');h.run('cache-flow.js');h.emit('cached',1);h.advance(500);assert.equal(h.navigations.length,1);});
test('cached home waits throughout an active download',()=>{const h=harness({status:3,local:{'gameyard-cache-slopkit':revision}});home(h);h.advance(10000);assert.equal(h.scripts.length,0);h.emit('cached',1);assert.equal(h.scripts.length,1);});
test('ready update swaps cache and starts only once',()=>{const h=harness({status:3,local:{'gameyard-cache-slopkit':revision}});home(h);h.emit('updateready',4);h.emit('cached',1);h.advance(1000);assert.equal(h.ac.swaps,1);assert.equal(h.scripts.length,1);});
test('cache failure does not launch or claim completion',()=>{const h=harness({status:3,local:{'gameyard-cache-slopkit':revision}});home(h);h.emit('error',0);h.advance(10000);assert.equal(h.scripts.length,0);assert.equal(h.element('retry').hidden,false);assert.equal(h.element('msgs').className,'bad');});
test('missing AppCache runs online without a cache redirect loop',()=>{const h=harness({noCache:true});home(h);h.advance(0);assert.equal(h.scripts.length,1);assert.equal(h.navigations.length,0);assert.match(h.element('cache').textContent,/غير متاح/);});
test('desktop and unsupported firmware never start an engine',()=>{for(const fw of [null,'14.01','14.03','15.00','6.72']){const h=harness({fw});home(h);h.advance(2000);assert.equal(h.scripts.length+h.navigations.length,0);}});
test('14.00 and 14.02 automatically select separate existing/new routes',()=>{for(const [fw,page] of [['14.00','afterglow/index.html'],['14.02','webkitty/index.html']]){const h=harness({fw,session:{['gameyard-'+fw.replace('.','')+'-run']:'complete'}});home(h);h.advance(500);assert.deepEqual(h.navigations,[page]);assert.equal(h.scripts.length,0);}});
test('14.02 waits for cache, selects the pinned GoldHEN and navigates without a click',()=>{
  const h=harness({fw:'14.02',status:3,local:{GHVer:'GHv2.4b18.8'}});h.run('auto-cache.js');h.run('webkitty/launch.js');h.advance(1000);assert.equal(h.navigations.length,0);
  h.emit('cached',1);h.emit('noupdate',1);assert.deepEqual(h.navigations,['exploit.html']);assert.equal(h.session.payload_path,'./includes/payloads/HEN/goldhen_v2.4b18.14.bin');assert.equal(h.session['gameyard-1402-run'],'running');
});
test('14.02 download error prevents execution',()=>{const h=harness({fw:'14.02',status:3});h.run('auto-cache.js');h.run('webkitty/launch.js');h.emit('error',0);assert.equal(h.navigations.length,0);assert.equal(h.element('retry').hidden,false);});
test('14.02 guard prevents another automatic run after browser restoration',()=>{const h=harness({fw:'14.02',session:{'gameyard-1402-run':'running'}});h.run('auto-cache.js');h.run('webkitty/launch.js');h.advance(1000);assert.equal(h.navigations.length,0);assert.equal(h.element('retry').hidden,false);});
test('14.02 adapter imports its engine only on the supported armed path',()=>{
  const h=harness({fw:'14.02',session:{'gameyard-1402-run':'running',payload_path:'./includes/payloads/HEN/goldhen_v2.4b18.14.bin'}});h.run('webkitty/bridge.js');assert.equal(h.scripts.length,0);h.event('load');assert.equal(h.scripts[0].src,'./src/slopkit-afterglow/jb.js');assert.equal(h.sandbox.isPayloadElf(),false);h.sandbox.jailbreakSuccess();assert.equal(h.session['gameyard-1402-run'],'complete');
  const bad=harness({fw:'14.00'});bad.run('webkitty/bridge.js');bad.event('load');assert.equal(bad.scripts.length,0);assert.deepEqual(bad.navigations,['index.html']);
});
test('14.00 ignores old manual settings and automatically selects GoldHEN',()=>{const h=harness({fw:'14.00',local:{'afterglow.choice':JSON.stringify({payload:'hen',autostart:false})}});h.run('auto-cache.js');h.run('afterglow/auto-launch.js');h.advance(700);assert.deepEqual(h.navigations,['jb.html?log=1&afterglow=run&mode=goldhen']);});

test('upstream engine and binary bytes match the pinned published source',()=>{
  const upstream=JSON.parse(fs.readFileSync(path.join(root,'webkitty/UPSTREAM.json'),'utf8'));
  for(const [file,expected] of Object.entries(upstream.upstream_git_blobs)){
    const b=fs.readFileSync(path.join(root,'webkitty',file));const sha=crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex');assert.equal(sha,expected,file);
  }
  const payload=fs.readFileSync(path.join(root,'webkitty/includes/payloads/HEN/goldhen_v2.4b18.14.bin'));assert.equal(payload[0],0xe9);assert.equal(crypto.createHash('sha256').update(payload).digest('hex'),upstream.goldhen_sha256);
});
test('earlier engine, payload and image files are byte-identical to production',()=>{
  const changed=new Set(['700.manifest','900.manifest','README.md','afterglow/cache.appcache','afterglow/index.html','cache.appcache','cache700.html','cache900.html','cachecss.html','cacheslopkit.html','css.manifest','index.html','slopkit.manifest']);
  const base=baseline.base_commit;const files=execFileSync('git',['ls-tree','-r','--name-only',base],{cwd:root,encoding:'utf8'}).trim().split('\n');
  let preserved=0;for(const file of files){if(changed.has(file))continue;const original=execFileSync('git',['show',base+':'+file],{cwd:root,maxBuffer:10*1024*1024});assert.deepEqual(fs.readFileSync(path.join(root,file)),original,file);preserved++;}assert.equal(preserved,baseline.preserved_original_files);
});
test('all cache manifests resolve to real files and include automatic controllers',()=>{
  for(const file of ['700.manifest','900.manifest','css.manifest','slopkit.manifest','cache.appcache','afterglow/cache.appcache','webkitty/cache.appcache']){
    const source=fs.readFileSync(path.join(root,file),'utf8');let section='CACHE';const entries=[];
    for(let line of source.split('\n')){line=line.trim();if(!line||line.startsWith('#')||line==='CACHE MANIFEST')continue;if(line.endsWith(':')){section=line.slice(0,-1);continue;}if(section!=='CACHE')continue;const name=line.split(/\s+/)[0].split('?')[0];let target=path.resolve(root,path.dirname(file),name);assert.ok(target===root||target.startsWith(root+path.sep));if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');assert.ok(fs.existsSync(target),file+' -> '+name);entries.push(name);}
    assert.ok(entries.includes(file.includes('/')?'../auto-cache.js':'auto-cache.js'),file);assert.ok(entries.includes(file.includes('/')?'../':'./'),file+' must cache the bookmarked root URL');
  }
  const manifest=fs.readFileSync(path.join(root,'webkitty/cache.appcache'),'utf8');for(const file of ['index.html','launch.js','exploit.html','bridge.js','src/slopkit-afterglow/afterglow.js','includes/payloads/HEN/goldhen_v2.4b18.14.bin'])assert.ok(manifest.split('\n').includes(file));
});
test('automatic pages contain no required install or launch buttons',()=>{
  for(const name of ['index.html','cache700.html','cache900.html','cachecss.html','cacheslopkit.html','afterglow/index.html','webkitty/index.html']){
    const html=fs.readFileSync(path.join(root,name),'utf8');for(const button of html.matchAll(/<button\b[^>]*>/g))assert.match(button[0],/\bhidden\b/,name);
    for(const match of html.matchAll(/<script\b[^>]*src="([^"]+)"/g))assert.ok(fs.existsSync(path.resolve(root,path.dirname(name),match[1])),name+' script '+match[1]);
  }
});
test('14.xx routes preserve the current shop branding and cache its assets',()=>{
  const landing=fs.readFileSync(path.join(root,'webkitty/index.html'),'utf8');
  assert.ok(landing.includes(baseline.brand));assert.ok(landing.includes(baseline.expected_repo));
  assert.ok(!landing.includes('hazzazstore.github.io'));assert.ok(!landing.includes('hazzaz-store-banner'));
  for(const file of ['afterglow/cache.appcache','webkitty/cache.appcache']){
    const cache=fs.readFileSync(path.join(root,file),'utf8');
    for(const asset of baseline.brand_assets)assert.ok(cache.split('\n').some(line=>line.split(' #')[0]==='../'+asset),file+' missing '+asset);
  }
});
console.log('\n'+checks+' checks passed. Physical-console execution remains unverified.');
