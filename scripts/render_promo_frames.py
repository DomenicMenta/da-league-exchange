from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, os, sys

W,H,FPS,DURATION=1080,1920,24,18
OUT=sys.argv[1]; LOGO=sys.argv[2]
os.makedirs(OUT,exist_ok=True)
CREAM=(248,240,220); BLACK=(9,9,8); PANEL=(23,23,21); ORANGE=(200,69,14); GOLD=(238,164,40); GREEN=(46,184,107); GRAY=(137,134,126); LINE=(48,47,43)
FONT='/System/Library/Fonts/Supplemental/Arial.ttf'; BOLD='/System/Library/Fonts/Supplemental/Arial Bold.ttf'; HEAVY='/System/Library/Fonts/Supplemental/Arial Black.ttf'
logo=Image.open(LOGO).convert('RGBA')
def font(n,heavy=False): return ImageFont.truetype(HEAVY if heavy else BOLD,n)
def ease(x): x=max(0,min(1,x)); return 1-(1-x)**3
def alpha(t,a,b,fade=.35): return 0 if t<a or t>b else min(ease((t-a)/fade),ease((b-t)/fade))
def txt(d,s,xy,size,color=CREAM,anchor='la',heavy=False,stroke=0): d.text(xy,s,font=font(size,heavy),fill=color,anchor=anchor,stroke_width=stroke,stroke_fill=BLACK)
def rr(d,box,fill=PANEL,r=24,outline=None,w=2): d.rounded_rectangle(box,radius=r,fill=fill,outline=outline,width=w)
def centered(d,s,y,size,color=CREAM,heavy=True): txt(d,s,(W//2,y),size,color,'ma',heavy)
def fit_logo(size):
    im=logo.copy(); im.thumbnail((size,size),Image.Resampling.LANCZOS); return im
def scene_layer(): return Image.new('RGBA',(W,H),(0,0,0,0))
def grid(d):
    for x in range(0,W,90): d.line((x,0,x,H),fill=(28,28,25),width=1)
    for y in range(0,H,90): d.line((0,y,W,y),fill=(28,28,25),width=1)
    d.rectangle((0,0,18,H),fill=ORANGE)
def badge(d,s,y,width=420,color=ORANGE): rr(d,((W-width)//2,y,(W+width)//2,y+54),color,27); centered(d,s,y+14,21,BLACK if color==GOLD else CREAM)
def player(d,y,pos,name,team,tint):
    rr(d,(116,y,964,y+92),PANEL,18,LINE,2); rr(d,(136,y+15,198,y+77),tint,31)
    txt(d,pos,(167,y+46),18,BLACK,'mm',True); txt(d,name,(220,y+19),30,CREAM,'la',True); txt(d,team,(220,y+56),19,GRAY); txt(d,'START',(928,y+46),16,tint,'rm',True)
def feature(d,y,sym,title,body,x):
    rr(d,(x,y,x+932,y+142),PANEL,24,LINE,2); rr(d,(x+22,y+26,x+110,y+114),ORANGE,22)
    txt(d,sym,(x+66,y+70),31,CREAM,'mm',True); txt(d,title,(x+136,y+26),31,CREAM,'la',True); txt(d,body,(x+136,y+72),23,GRAY)
def add_scene(base,layer,a): base.alpha_composite(Image.blend(Image.new('RGBA',(W,H),(0,0,0,0)),layer,a))

for f in range(FPS*DURATION):
    t=f/FPS; im=Image.new('RGBA',(W,H),BLACK+(255,)); d=ImageDraw.Draw(im); grid(d)
    # scene 1
    a=alpha(t,0,2.7)
    if a:
        ly=scene_layer(); q=ImageDraw.Draw(ly); pop=ease(t/.8); lg=fit_logo(int(370*pop)); ly.alpha_composite(lg,(W//2-lg.width//2,170))
        centered(q,"DYNASTY'S",650,92); centered(q,'OPEN MARKET',765,104,GOLD); q.rounded_rectangle((238,910,842,916),3,fill=ORANGE)
        centered(q,'THE RIGHT LEAGUE. THE RIGHT MANAGER.',985,25,GRAY); badge(q,'FREE DURING LAUNCH',1080,420,GOLD); add_scene(im,ly,a)
    # scene 2
    a=alpha(t,2.25,5.25)
    if a:
        ly=scene_layer(); q=ImageDraw.Draw(ly); txt(q,'STOP',(72,225),142,ORANGE,'la',True); txt(q,'DIGGING THROUGH',(72,395),82,CREAM,'la',True); txt(q,'DEAD GROUP CHATS.',(72,500),82,CREAM,'la',True)
        for i,(one,two) in enumerate([('OPEN TEAM?','3 DAYS AGO'),('ANYONE INTERESTED?','SEEN BY 2'),('BUMP...','NO REPLIES')]):
            r=ease((t-2.55-i*.18)/.45); x=int(72+(1-r)*500); y=710+i*180; rr(q,(x,y,x+936,y+138),PANEL,24,LINE,2); txt(q,one,(x+34,y+28),31); txt(q,two,(x+34,y+79),20,GRAY)
        centered(q,"THERE'S A BETTER WAY.",1390,39,GOLD); add_scene(im,ly,a)
    # scene 3 roster card
    a=alpha(t,4.75,9)
    if a:
        ly=scene_layer(); q=ImageDraw.Draw(ly); txt(q,'SCOUT THE',(72,105),68); txt(q,'FULL ROSTER.',(72,185),82,GOLD,'la',True)
        rr(q,(72,315,1008,1500),(14,14,13),32,ORANGE,4); rr(q,(112,355,342,409),ORANGE,27); txt(q,'OPEN LISTING',(227,382),20,CREAM,'mm',True)
        txt(q,'Sunday Syndicate',(112,440),46,CREAM,'la',True); txt(q,'Commissioner: @DADynasty_',(112,500),22,GRAY); txt(q,'SUPERFLEX  •  1.0 PPR  •  1.5 TEP',(112,565),21,GOLD)
        player(q,640,'QB','C.J. Stroud','HOU · QB',GOLD); player(q,750,'RB',"De'Von Achane",'MIA · RB',GREEN); player(q,860,'WR','Malik Nabers','NYG · WR',ORANGE); player(q,970,'TE','Brock Bowers','LV · TE',GOLD)
        q.line((112,1120,968,1120),fill=LINE,width=2); txt(q,'BUY-IN',(128,1170),18,GRAY); txt(q,'$75',(128,1205),48,GREEN,'la',True); txt(q,'FULL TEAM + BENCH',(930,1170),18,GRAY,'ra'); txt(q,'VIEW LISTING  →',(930,1210),30,CREAM,'ra',True); badge(q,'CHAT  •  WATCHLIST  •  APPLY',1365,620)
        add_scene(im,ly,a)
    # scene 4 import
    a=alpha(t,8.5,12)
    if a:
        ly=scene_layer(); q=ImageDraw.Draw(ly); centered(q,'FROM SLEEPER',220,87); centered(q,'TO THE EXCHANGE',325,87,GOLD); centered(q,'IN UNDER A MINUTE',440,28,GRAY)
        p=max(0,min(1,(t-8.8)/2)); rr(q,(110,600,970,618),(40,40,37),9); rr(q,(110,600,110+int(860*p),618),ORANGE,9)
        for i,(num,label) in enumerate([('01','IMPORT LEAGUE'),('02','CHOOSE TEAM'),('03','PUBLISH OPENING')]):
            r=ease((t-9-i*.35)/.5); x=int(92+(1-r)*500); y=720+i*190; rr(q,(x,y,x+896,y+144),PANEL,24,GOLD if i==2 else LINE,2); txt(q,num,(x+36,y+40),39,GOLD if i==2 else ORANGE,'la',True); txt(q,label,(x+158,y+48),30)
        add_scene(im,ly,a)
    # scene 5 dashboard
    a=alpha(t,11.5,15.25)
    if a:
        ly=scene_layer(); q=ImageDraw.Draw(ly); centered(q,'RUN YOUR SEARCH',155,78); centered(q,'FROM ONE DASHBOARD.',250,62,GOLD)
        rows=[('★','WATCHLIST','Save teams and track changes.'),('12','APPLICATIONS','Review profiles, notes and status.'),('DM','PRIVATE MESSAGES','Talk directly. Keep it organized.'),('✓','COMMISSIONER DESK','Accept, shortlist or decline.')]
        for i,row in enumerate(rows): r=ease((t-11.8-i*.3)/.5); feature(q,470+i*170,*row,int(74+(1-r)*380))
        centered(q,'NO MORE GUESSWORK.',1340,40,ORANGE); add_scene(im,ly,a)
    # close
    a=alpha(t,14.75,18,.45)
    if a:
        ly=scene_layer(); q=ImageDraw.Draw(ly); pop=ease((t-14.75)/.7); lg=fit_logo(int(270*pop)); ly.alpha_composite(lg,(W//2-lg.width//2,150))
        centered(q,'FIND YOUR NEXT',535,73); centered(q,'DYNASTY.',625,116,GOLD); centered(q,'THE DA ORPHAN EXCHANGE',805,28,GRAY)
        rr(q,(110,920,970,1036),ORANGE,18); centered(q,'EXPLORE OPEN TEAMS  →',953,34); centered(q,'da-orphan-exchange.da-league-exchange.workers.dev',1105,22,CREAM)
        badge(q,'FREE DURING LAUNCH',1225,420,GOLD); centered(q,'@DADYNASTY_',1450,26,GRAY); add_scene(im,ly,a)
    im.convert('RGB').save(f'{OUT}/frame_{f:04d}.jpg',quality=92,subsampling=0)
    if f%48==0: print(f'{f}/{FPS*DURATION}',flush=True)
