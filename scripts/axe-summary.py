import json,re,collections,sys
d=json.load(open(sys.argv[1]))
agg=collections.defaultdict(lambda:{'routes':set(),'samples':set(),'impact':''})
fails=[0]
def walk(s):
    for sp in s.get('specs',[]):
        for t in sp['tests']:
            for r in t['results']:
                if r['status']!='passed':
                    fails[0]+=1
                    for e in r.get('errors',[]):
                        m=re.sub(r'\x1b\[[0-9;]*m','',e.get('message',''))
                        found=re.findall(r'"id": "([^"]+)",\s*\+?\s*"impact": "([^"]+)",[\s\S]*?"sample": Array \[([^\]]*)\]',m)
                        if not found: print('FAIL',sp['title'],m[:300])
                        for vid,imp,samp in found:
                            agg[vid]['impact']=imp; agg[vid]['routes'].add(sp['title'].replace('@a11y axe ',''))
                            agg[vid]['samples'].update(x.strip().lstrip('+').strip().strip(',').strip('"') for x in samp.split('\n') if x.strip().lstrip('+').strip())
    for c in s.get('suites',[]): walk(c)
for s in d['suites']: walk(s)
print('stats', {k:d['stats'][k] for k in ('expected','unexpected','flaky','skipped')})
for k,v in agg.items(): print('\n##',k,v['impact'],len(v['routes']),'\n ',sorted(v['routes'])[:40],'\n ',list(v['samples'])[:10])
