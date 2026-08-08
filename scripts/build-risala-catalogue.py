"""Extract the selected public-domain devotional texts from the user's Risala edition.

Usage: python scripts/build-risala-catalogue.py <saved-public-html>
Requires beautifulsoup4. No runtime scraping, inferred grading, or generated supplications.
"""
import hashlib
import json
import re
import sys
from pathlib import Path
from bs4 import BeautifulSoup

root=Path(__file__).resolve().parents[1]
raw=Path(sys.argv[1]).read_bytes()
soup=BeautifulSoup(raw,'html.parser'); paragraphs=soup.find_all('p')
assert len(paragraphs)==910, 'Source structure changed; review before importing'
plain=lambda i: paragraphs[i].get_text('',strip=False).strip()
assert 'أَذْكَارُ الصَّبَاحِ' in plain(143) and '591' in plain(676) and '6314' in plain(601)
entries=[]
books={'البخاري في الأدب المفرد':'Al-Bukhari, Al-Adab Al-Mufrad','البخاري':'Al-Bukhari','مسلم':'Muslim','أبو داود':'Abu Dawud','الترمذي':'At-Tirmidhi','النسائي':'An-Nasai','ابن ماجه':'Ibn Majah','أحمد':'Ahmad','الحاكم':'Al-Hakim','الطبراني':'At-Tabarani','ابن السني':'Ibn As-Sunni'}
book_pattern=re.compile('|'.join(map(re.escape,books)))
def note(n):return re.sub(r'^\(\)\s*','',plain(590+n))
def clean(indices):
    parts=[]
    for i in indices:
        p=BeautifulSoup(str(paragraphs[i]),'html.parser')
        for a in p.select('a.NoteRef'):a.decompose()
        parts.append(re.sub(r'\(\s*\)','',p.get_text('',strip=False)))
    return re.sub(r'\s+',' ','\n'.join(parts)).strip()
def citation(refs):
    results=[]
    for ref in refs:
        text=note(ref);matches=list(book_pattern.finditer(text))
        for j,m in enumerate(matches):
            segment=text[m.end():matches[j+1].start() if j+1<len(matches) else len(text)]
            number=re.search(r'برقم\s*\((\d+)\)',segment)
            pair=(m.group(),number[1] if number else '')
            if pair not in results:results.append(pair)
    return {'ar':'؛ '.join(b+(' '+n if n else '') for b,n in results[:3]),'en':'; '.join(books[b]+(' '+n if n else '') for b,n in results[:3])}
def add(indices,categories,repeat=1,suffix='',text=None,refs=None,instruction='',daily=False,quran=None):
    refs=refs or list(dict.fromkeys(int(a.get_text()) for i in indices for a in paragraphs[i].select('a.NoteRef')))
    assert refs
    source=clean(indices)
    if text is None:
        text=source
        if source.startswith('«') and '»' in source:
            end=source.rfind('»');text=source[1:end];instruction=instruction or source[end+1:].strip(' .')
    entry={'id':f'r{refs[-1]}'+('-'+suffix if suffix else ''),'categories':categories,'text':text,'repeat':repeat,'specifiedRepeat':repeat>1,'instruction':instruction,'reference':citation(refs),'sourceNotes':refs,'sourceParagraphs':indices,'sourceTextSha256':hashlib.sha256(source.encode()).hexdigest()}
    if daily:entry['daily']=True
    if quran:entry['quran']=quran
    assert entry['id'] not in [e['id'] for e in entries]
    entries.append(entry)
    return entry

# Complete source sections: waking, morning/evening, bedtime, after prayer.
for i in range(40,44):add([i],['waking'])
add([144],['morning','evening'])
add([146],['morning','evening'])
add([147,148,149],['morning','evening'],3)
variants={150:[98,99,100],151:[101,102],153:[105,106],154:[107,108],162:[116,117,118],163:[119,120]}
repeats={153:4,155:3,156:7,159:3,160:3,164:100,165:10,166:100,167:3,169:100,170:3,171:10}
for i in range(150,172):
    if i in variants:
        morning=add([i],['morning'],repeats.get(i,1),suffix='morning')
        text=morning['text']
        if i==150:
            text=text.replace('أَصْبَحْنَا وَأَصْبَحَ','أَمْسَيْنَا وَأَمْسَى')
            text=text.replace('هَذَا اليَوْمِ','هَذِهِ اللَّيْلَةِ').replace('مَا بَعْدَهُ','مَا بَعْدَهَا')
        elif i==151:text=re.search('«(.*?)»',note(101))[1]
        elif i==153:text=text.replace('أَصْبَحْتُ','أَمْسَيْتُ')
        elif i==154:text=text.replace('أَصْبَحَ بِي','أَمْسَى بِي')
        elif i==162:text=re.search('«(.*?)»',note(116))[1]+'، '+re.search('«(.*?)»',note(117))[1]
        elif i==163:text=text.replace('أَصْبَحْنا','أَمْسَيْنَا')
        assert text!=morning['text'],i
        add([i],['evening'],repeats.get(i,1),suffix='evening',text=text,refs=variants[i],instruction='')
    else:
        cats=['morning'] if i in [166,167,168] else ['evening'] if i==170 else ['morning','evening']
        if i==169:cats.append('varied')
        add([i],cats,repeats.get(i,1),daily=i==169)

add([173,174,175,176],['sleep'],3)
add([177],['sleep']);add([178],['sleep'])
for i in range(179,189):
    if i==183:
        text=clean([i]);parts=[('subhan','سُبْحَانَ اللَّهِ',33),('hamd','الحَمْدُ لِلَّهِ',33),('takbir','اللَّهُ أَكْبَرُ',34)]
        for suffix,phrase,count in parts:
            assert phrase in text
            add([i],['sleep'],count,suffix=suffix,text=phrase)
    elif i==187:add([i],['sleep'],quran=[{'sura':32,'aya':1},{'sura':67,'aya':1}])
    else:add([i],['sleep'])

source=clean([130]);quoted=source[source.index('«')+1:source.rindex('»')]
add([130],['prayer'],3,suffix='istighfar',text=quoted.split('(ثَلَاثًا)')[0].strip())
add([130],['prayer'],suffix='salam',text=quoted.split('(ثَلَاثًا)')[1].strip())
add([131],['prayer']);add([132],['prayer'])
for suffix,phrase in [('subhan','سُبْحَانَ اللَّهِ'),('hamd','الحَمْدُ لِلَّهِ'),('takbir','اللَّهُ أَكْبَرُ')]:
    assert phrase in clean([133]);add([133],['prayer'],33,suffix=suffix,text=phrase)
source=clean([133]);add([133],['prayer'],suffix='completion',text=source[source.index('لَا إِلَهَ'):source.rindex('»')])
add([134,135,136],['prayer']);add([137],['prayer']);add([138],['prayer'],10);add([139],['prayer'])

# Selected life situations, not a claim to ship every chapter of the book.
for i in [54,56,58,60,64,65,67,72,74,190,192,206,207,209,210,235,260,299,302,305,306,308,310,312,320,324,358,376]:
    add([i],['varied'])

result={'source':'https://risala.prh.gov.sa/ar/content/51','title':'حصن المسلم من أذكار الكتاب والسنة','author':'سعيد بن علي بن وهف القحطاني','retrievedDate':'2026-10-24','htmlSha256':hashlib.sha256(raw).hexdigest(),'entries':entries}
(root/'src/data/adhkar.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'entries':len(entries),'perCategory':{c:sum(c in e['categories'] for e in entries) for c in ['morning','evening','sleep','waking','prayer','varied']},'htmlSha256':result['htmlSha256']},indent=2))
