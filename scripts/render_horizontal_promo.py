from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, os, random, struct, subprocess, sys, wave

W,H,FPS,DURATION=1920,1080,30,22
ASSETS=sys.argv[1]; FRAMES=sys.argv[2]; AUDIO=sys.argv[3]; LOGO=sys.argv[4] if len(sys.argv)>4 else 'public/da-logo.png'
os.makedirs(FRAMES,exist_ok=True)
CREAM=(248,240,220); BLACK=(8,8,7); ORANGE=(198,70,17); GOLD=(238,165,45); GREEN=(40,175,102); GRAY=(155,150,138)
HEAVY='/System/Library/Fonts/Supplemental/Arial Black.ttf'; BOLD='/System/Library/Fonts/Supplemental/Arial Bold.ttf'; REG='/System/Library/Fonts/Supplemental/Arial.ttf'
def ft(n,kind='b'): return ImageFont.truetype(HEAVY if kind=='h' else BOLD if kind=='b' else REG,n)
def ease(x): x=max(0,min(1,x)); return 1-(1-x)**3
def smooth(x): x=max(0,min(1,x)); return x*x*(3-2*x)
def rgba(c,a=255): return c+(a,)
def text(d,s,xy,size,color=CREAM,anchor='la',kind='b',stroke=0): d.text(xy,s,font=ft(size,kind),fill=color,anchor=anchor,stroke_width=stroke,stroke_fill=BLACK)
def rr(d,box,fill,r=18,outline=None,w=2): d.rounded_rectangle(box,radius=r,fill=fill,outline=outline,width=w)
def frame_screen(path, zoom=1, pan=(0,0)):
    src=Image.open(path).convert('RGB')
    cropw=int(src.width/zoom); croph=int(src.height/zoom); cx=src.width//2+int(pan[0]); cy=src.height//2+int(pan[1])
    x=max(0,min(src.width-cropw,cx-cropw//2)); y=max(0,min(src.height-croph,cy-croph//2))
    return src.crop((x,y,x+cropw,y+croph)).resize((1824,1026),Image.Resampling.LANCZOS)
def composite_screen(base,screen,alpha=1,offset=(0,0)):
    layer=Image.new('RGBA',(W,H),(0,0,0,0)); shadow=Image.new('RGBA',(W,H),(0,0,0,0)); sd=ImageDraw.Draw(shadow)
    x,y=48+offset[0],27+offset[1]; sd.rounded_rectangle((x+10,y+15,x+1834,y+1041),26,fill=(0,0,0,150)); shadow=shadow.filter(ImageFilter.GaussianBlur(18)); layer.alpha_composite(shadow)
    mask=Image.new('L',(1824,1026)); ImageDraw.Draw(mask).rounded_rectangle((0,0,1824,1026),26,fill=255)
    layer.paste(screen,(x,y),mask); ImageDraw.Draw(layer).rounded_rectangle((x,y,x+1824,y+1026),26,outline=(255,255,255,38),width=2)
    layer.putalpha(layer.getchannel('A').point(lambda p:int(p*alpha))); base.alpha_composite(layer)
def cursor(base,x,y,click=0):
    d=ImageDraw.Draw(base,'RGBA')
    if click>0:
        r=18+55*click; d.ellipse((x-r,y-r,x+r,y+r),outline=(238,165,45,int(210*(1-click))),width=7)
    pts=[(x,y),(x+6,y+38),(x+17,y+27),(x+31,y+48),(x+42,y+41),(x+28,y+21),(x+44,y+17)]
    d.polygon([(a+4,b+5) for a,b in pts],fill=(0,0,0,150)); d.polygon(pts,fill=(255,255,255,255),outline=(8,8,7,255)); d.line(pts+[pts[0]],fill=(8,8,7,255),width=3)
def label(base,kicker,title,side='left',progress=1):
    d=ImageDraw.Draw(base,'RGBA'); w=860; x=int((-w-40)+(w+94)*ease(progress)) if side=='left' else int(W+40-(w+94)*ease(progress)); y=790
    rr(d,(x,y,x+w,y+210),(8,8,7,238),24,(238,165,45,220),2); d.rectangle((x,y,x+13,y+210),fill=ORANGE)
    text(d,kicker,(x+50,y+35),22,GOLD,'la','h'); text(d,title,(x+50,y+80),35 if len(title)>27 else 43,CREAM,'la','h')
def click_value(t,at):
    dt=abs(t-at); return 0 if dt>.45 else min(1,dt/.45)

shots={n:os.path.join(ASSETS,n) for n in os.listdir(ASSETS) if n.endswith('.png')}
timeline=[
 (0,2.8,'01-landing.png',(300,665),'THE OPEN MARKET','FIND YOUR NEXT DYNASTY.'),
 (2.8,5.5,'02-marketplace.png',(675,575),'BROWSE REAL OPENINGS','COMPARE COMPLETE LINEUPS.'),
 (5.5,7.4,'03-listing-top.png',(1470,710),'EVERY DETAIL','FORMAT. DUES. BYLAWS.'),
 (7.4,9.2,'04-listing-roster.png',(1470,420),'THE FULL TEAM','STARTERS AND BENCH INCLUDED.'),
 (9.2,11.8,'05-dashboard.png',(665,115),'ONE MANAGER DESK','TRACK YOUR ENTIRE SEARCH.'),
 (11.8,14.2,'06-applications.png',(520,520),'COMMISSIONER CONTROL','REVIEW. SHORTLIST. ACCEPT.'),
 (14.2,16.7,'07-messages.png',(1200,520),'PRIVATE MESSAGES','TALK DIRECTLY. MOVE FASTER.'),
 (16.7,19.2,'08-list-team.png',(1450,400),'POWERED BY SLEEPER','IMPORT AND PUBLISH IN MINUTES.'),
]

for f in range(FPS*DURATION):
    t=f/FPS; base=Image.new('RGBA',(W,H),rgba(BLACK)); d=ImageDraw.Draw(base,'RGBA')
    for x in range(0,W,120): d.line((x,0,x,H),fill=(35,34,30,255),width=1)
    for y in range(0,H,120): d.line((0,y,W,y),fill=(35,34,30,255),width=1)
    if t<19.2:
        idx=next(i for i,s in enumerate(timeline) if s[0]<=t<s[1]); start,end,name,target,kicker,title=timeline[idx]
        local=(t-start)/(end-start); zoom=1+.035*smooth(local); pan=((target[0]-800)*.08*smooth(local),(target[1]-450)*.08*smooth(local))
        screen=frame_screen(shots[name],zoom,pan)
        trans=min(1,ease((t-start)/.22),ease((end-t)/.16) if idx<len(timeline)-1 else 1)
        composite_screen(base,screen,trans)
        label(base,kicker,title,'left' if idx%2==0 else 'right',min(1,(t-start)/.45))
        # Smooth cursor travel from page center toward the next action.
        sx,sy=(960,480); tx=48+target[0]*1.14; ty=27+target[1]*1.14
        p=smooth((local-.18)/.55); cx=sx+(tx-sx)*p; cy=sy+(ty-sy)*p
        ripple=0
        if local>.76: ripple=min(1,(local-.76)/.18)
        cursor(base,int(cx),int(cy),ripple)
        # warm page flash at click/navigation boundary
        if end-t<.12: d.rectangle((0,0,W,H),fill=(238,165,45,int(90*(1-(end-t)/.12))))
    else:
        p=ease((t-19.2)/.7); logo=Image.open(LOGO).convert('RGBA'); logo.thumbnail((220,220),Image.Resampling.LANCZOS)
        base.alpha_composite(logo,(W//2-logo.width//2,100-int((1-p)*100)))
        text(d,'FIND YOUR NEXT',(W//2,405),76,CREAM,'ma','h'); text(d,'DYNASTY.',(W//2,495),112,GOLD,'ma','h')
        text(d,'THE DA ORPHAN EXCHANGE',(W//2,645),27,GRAY,'ma','h'); rr(d,(560,710,1360,805),rgba(ORANGE),18); text(d,'EXPLORE OPEN TEAMS  →',(960,758),34,CREAM,'mm','h')
        text(d,'da-orphan-exchange.da-league-exchange.workers.dev',(960,860),24,CREAM,'ma','b'); rr(d,(740,915,1180,968),rgba(GOLD),26); text(d,'FREE DURING LAUNCH',(960,942),21,BLACK,'mm','h')
    base.convert('RGB').save(os.path.join(FRAMES,f'frame_{f:04d}.jpg'),quality=91,subsampling=0)
    if f%90==0: print(f'{f}/{FPS*DURATION}',flush=True)

# Original rhythmic sound bed with click accents, generated without copyrighted material.
rate=48000; rng=random.Random(7); samples=[]; clicks=[2.55,5.25,7.2,8.95,11.55,13.95,16.45,18.95]
for i in range(rate*DURATION):
    t=i/rate; beat=t%0.5; kick=math.sin(2*math.pi*(64-32*min(1,beat/.16))*t)*math.exp(-beat*25)*.18
    bass=math.sin(2*math.pi*55*t)*.045 + math.sin(2*math.pi*82.5*t)*.025
    hat=(rng.random()*2-1)*math.exp(-(t%.25)*75)*.018
    click=sum(math.sin(2*math.pi*820*(t-c))*math.exp(-(t-c)*45)*.15 for c in clicks if 0<=t-c<.15)
    swell=0.7+0.3*math.sin(2*math.pi*t/8); v=max(-.95,min(.95,(kick+bass+hat+click)*swell)); samples.append(struct.pack('<hh',int(v*32767),int(v*32767)))
with wave.open(AUDIO,'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(rate); w.writeframes(b''.join(samples))
