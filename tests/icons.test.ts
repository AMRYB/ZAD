import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {iconCodepoints} from '../src/data/fa-icons.ts';
const base=new URL('../',import.meta.url);
const metadata=JSON.parse(readFileSync(new URL('node_modules/@fortawesome/fontawesome-free/metadata/icon-families.json',base),'utf8'));
// Read OpenType cmap format 4/12: this checks the shipped font, not only the JS names.
function glyph(font:Buffer,code:number){
  let cmap=0;
  for(let i=0;i<font.readUInt16BE(4);i++){const p=12+i*16;if(font.toString('ascii',p,p+4)==='cmap')cmap=font.readUInt32BE(p+8);}
  assert.ok(cmap);
  for(let i=0;i<font.readUInt16BE(cmap+2);i++){
    const sub=cmap+font.readUInt32BE(cmap+4+i*8+4),format=font.readUInt16BE(sub);
    if(format===12){for(let n=0;n<font.readUInt32BE(sub+12);n++){const p=sub+16+n*12,start=font.readUInt32BE(p),end=font.readUInt32BE(p+4);if(code>=start&&code<=end)return font.readUInt32BE(p+8)+code-start;}}
    if(format===4){const count=font.readUInt16BE(sub+6)/2,end=sub+14,start=end+2*count+2,delta=start+2*count,offset=delta+2*count;for(let n=0;n<count;n++){if(code<font.readUInt16BE(start+n*2)||code>font.readUInt16BE(end+n*2))continue;const range=font.readUInt16BE(offset+n*2),d=font.readInt16BE(delta+n*2);if(!range)return (code+d)&65535;const g=font.readUInt16BE(offset+n*2+range+2*(code-font.readUInt16BE(start+n*2)));return g?(g+d)&65535:0;}}
  }
  return 0;
}
test('all UI icons match the pinned Font Awesome 7.3.1 metadata and bundled solid font',()=>{
  const pkg=JSON.parse(readFileSync(new URL('node_modules/@fortawesome/fontawesome-free/package.json',base),'utf8'));
  assert.equal(pkg.version,'7.3.1');
  const font=readFileSync(new URL('assets/fonts/FontAwesome7-Solid-900.otf',base));
  for(const [name,point] of Object.entries(iconCodepoints)){
    assert.equal(point,parseInt(metadata[name].unicode,16),name);
    assert.ok(metadata[name].familyStylesByLicense.free.some((s:{family:string;style:string})=>s.family==='classic'&&s.style==='solid'),name);
    assert.ok(glyph(font,point)>0,`Missing solid glyph: ${name}`);
  }
  const regular=readFileSync(new URL('assets/fonts/FontAwesome7-Regular-400.otf',base));
  for(const name of ['circle','bookmark'] as const)assert.ok(glyph(regular,iconCodepoints[name])>0,name);
});
const privateManifest=new URL('assets/private/font-manifest.json',base);
test('the locally supplied Pro Light font has real weight 300 and covers every UI icon',{skip:!existsSync(privateManifest)},()=>{
  const info=JSON.parse(readFileSync(privateManifest,'utf8'));
  assert.equal(info.version,'7.3.1');
  const font=readFileSync(new URL(`assets/private/${info.filename}`,base));
  let weight=0;
  for(let i=0;i<font.readUInt16BE(4);i++){const p=12+i*16;if(font.toString('ascii',p,p+4)==='OS/2')weight=font.readUInt16BE(font.readUInt32BE(p+8)+4);}
  assert.equal(weight,300);
  for(const [name,point] of Object.entries(iconCodepoints))assert.ok(glyph(font,point)>0,`Missing Light glyph: ${name}`);
});
