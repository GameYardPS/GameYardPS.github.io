#!/usr/bin/env python3
"""Replace only the 512x512 PS5 home icon in the verified upstream v0.8.3 ELF."""
import hashlib,io,struct,sys,zlib,json
from pathlib import Path
from PIL import Image
EXPECTED='f4b0dee9af572ea1cb77aaf1e6fc5bf8ef520fc0a0a30753dd94a5cbdc04dd8e'
SRC=Path(sys.argv[1]);ICON=Path(sys.argv[2]);OUT=Path(sys.argv[3])
original=SRC.read_bytes()
sha=lambda b: hashlib.sha256(b).hexdigest()
assert sha(original)==EXPECTED, 'Wrong upstream ELF digest: refusing patch'
assert original[:6]==b'\x7fELF\x02\x01', 'Expected x86_64 ELF'
needle=b'\x89PNG\r\n\x1a\n'
found=[]
at=0
while True:
    p=original.find(needle,at)
    if p<0:break
    at=p+8; cur=p+8; dims=None
    for _ in range(5000):
        if cur+12>len(original):break
        n=struct.unpack_from('>I',original,cur)[0]
        tag=original[cur+4:cur+8]
        e=cur+12+n
        if n>5000000 or e>len(original):break
        if zlib.crc32(original[cur+4:cur+8+n])&0xffffffff!=struct.unpack_from('>I',original,cur+8+n)[0]:break
        if tag==b'IHDR':
            dims=struct.unpack_from('>II',original,cur+8)
        cur=e
        if tag==b'IEND':
            if dims==(512,512):found.append((p,cur))
            break
assert len(found)==1,f'Expected one 512x512 PNG resource, got {len(found)}'
a,b=found
img=Image.open(ICON).convert('RGB').resize((512,512),Image.Resampling.LANCZOS)
payload=None
for colors in (256,192,128,96,64,48,32,24,16):
    buf=io.BytesIO()
    img.quantize(colors=colors,method=Image.Quantize.MEDIANCUT).save(buf,format='PNG',optimize=True)
    data=buf.getvalue()
    if len(data)+32<=b-a:
        payload=data
        break
assert payload is not None,'Brand art too large for unchanged ELF slot'
assert payload.endswith(b'\x00\x00\x00\x00IEND\xaeB\x60\x82')
spare=b-a-len(payload)
content=b'GameYard\x00'+b' '*(spare-21)
assert len(content)==spare-12
chunk=struct.pack('>I',len(content))+b'tEXt'+content+struct.pack('>I',zlib.crc32(b'tEXt'+content))
repl=payload[:-12]+chunk+payload[-12:]
assert len(repl)==b-a
Image.open(io.BytesIO(repl)).verify()
modified=original[:a]+repl+original[b:]
assert len(modified)==len(original) and original[:a]==modified[:a] and original[b:]==modified[b:]
# Validate executable sections unchanged; only visual PNG bytes may differ.
shoff=struct.unpack_from('<Q',original,40)[0]; shsize,n=struct.unpack_from('<HH',original,58)
assert n and shoff+n*shsize<=len(original)
for i in range(n):
    _,typ,flags,_,pos,size=struct.unpack_from('<IIQQQQ',original,shoff+i*shsize)
    if flags&4 and typ!=8:
        assert original[pos:pos+size]==modified[pos:pos+size]
OUT.parent.mkdir(exist_ok=True,parents=True)
OUT.write_bytes(modified)
report={'upstream':'v0.8.3','original_sha256':sha(original),'patched_sha256':sha(modified),'patched_range':[a,b],'change':'home-screen PNG icon only','hardware_tested':False}
(OUT.parent/'validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
