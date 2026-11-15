// Plaza classes: gives every Insert Object class real behaviour (lights, effects, constraints, UI modifiers, tools, seats, truss, meshes...).
(()=>{const T=THREE,R=new Map,V3=(p)=>new T.Vector3(p.X,p.Y,p.Z),rnd=Math.random,K=Math.PI/180;
const D=(c,o)=>{DEF[c]={...(DEF[c]||{}),...o}};
// ---- default properties (these show up in the Properties panel and are saved with the game) ----
D('Smoke',{Color:C3(.6,.6,.6),Size:5,Opacity:.5});D('Sparkles',{Color:C3(1,.9,.4)});D('ParticleEmitter',{Speed:6,Spread:25,Size:1,Rate:20,Lifetime:2,Color:C3(1,1,1),Transparency:0});
D('Beam',{Width0:.5,Width1:.5,Color:C3(.3,.8,1),Transparency:0});D('Trail',{Width:.6,Lifetime:1.2,Color:C3(1,1,1),Transparency:0});
D('SpotLight',{Angle:45});D('Decal',{StudsPerTileU:4,StudsPerTileV:4});D('Texture',{StudsPerTileU:4,StudsPerTileV:4});
D('Atmosphere',{Density:.3,Color:C3(.78,.78,.82)});D('Clouds',{Cover:.5,Density:.7,Color:C3(1,1,1)});D('BloomEffect',{Intensity:.6,Size:24});D('BlurEffect',{Size:8});
D('ColorCorrectionEffect',{Brightness:0,Contrast:0,Saturation:0,TintColor:C3(1,1,1)});D('SunRaysEffect',{Intensity:.25});D('DepthOfFieldEffect',{FarIntensity:.5,InFocusRadius:35});
for(const c of['HingeConstraint','SpringConstraint','RopeConstraint','BallSocketConstraint','RodConstraint','PrismaticConstraint'])D(c,{Part1Name:''});
D('SpringConstraint',{Stiffness:100,Damping:8,FreeLength:6});D('RopeConstraint',{Length:12});D('RodConstraint',{Length:8});D('HingeConstraint',{ActuatorType:'None',AngularVelocity:2,Axis:'Y'});D('PrismaticConstraint',{ActuatorType:'None',Velocity:4,LowerLimit:-10,UpperLimit:10,Axis:'Y'});
D('BodyVelocity',{Velocity:V(0,10,0)});D('BodyForce',{Force:V(0,0,0)});D('BodyGyro',{Orientation:V(0,0,0),P:8});D('BodyPosition',{Position:V(0,10,0),P:30,D:8});
D('Tool',{RequiresHandle:true,CanBeDropped:false,ToolTip:''});D('Seat',{Disabled:false});D('MeshPart',{MeshId:'',TextureId:''});
D('SurfaceGui',{Face:'Front',PixelsPerStud:40});D('BillboardGui',{Size:U2(0,200,0,60),StudsOffset:V(0,3,0),AlwaysOnTop:true});
D('UIListLayout',{FillDirection:'Vertical',Padding:6,HorizontalAlignment:'Left',VerticalAlignment:'Top'});D('UIGridLayout',{CellSize:U2(0,80,0,80),CellPadding:U2(0,6,0,6),HorizontalAlignment:'Left'});
D('UIPadding',{PaddingTop:8,PaddingBottom:8,PaddingLeft:8,PaddingRight:8});D('UIGradient',{Color0:C3(1,1,1),Color1:C3(.3,.3,.3),Rotation:90,Transparency:0});D('UIAspectRatioConstraint',{AspectRatio:1});D('UIScale',{Scale:1});
D('NegateOperation',{...JSON.parse(JSON.stringify(DEF.Part)),Negative:true,Transparency:.5,Color:C3(.9,.2,.2)});if(!PART.includes('NegateOperation'))PART.push('NegateOperation');
['Frame','TextLabel','TextButton','TextBox','ScrollingFrame','CanvasGroup','ImageLabel','ImageButton'].forEach(c=>DEF[c]&&D(c,{LayoutOrder:0}));
DEF.StarterPack=DEF.StarterPack||{};if(CAT.Containers&&!CAT.Containers.includes('StarterPack'))CAT.Containers.push('StarterPack');
// ---- helpers ----
const walk=(n,f)=>{f(n);n.K.forEach(k=>walk(k,f))},rq=p=>{const r=p.Orientation;return new T.Quaternion().setFromEuler(new T.Euler(r.X*K,r.Y*K,r.Z*K,'YXZ'))};
const attW=a=>{const b=a.Parent,v=V3(a.Position).applyQuaternion(rq(b));return v.add(V3(b.Position))};
const anchor=i=>{const p=i.Parent;if(!p)return null;if(PART.includes(p.C))return{part:p,pos:V3(p.Position)};if(p.C=='Attachment'&&p.Parent&&PART.includes(p.Parent.C))return{part:p.Parent,pos:attW(p)};return null};
const inW=i=>typeof inWS=='function'&&inWS(i);
const tex=new Map,tl=new T.TextureLoader,gt=u=>{if(!tex.has(u))tex.set(u,tl.load(u));return tex.get(u)};
// ---- particles ----
const pm=a=>new T.ShaderMaterial({uniforms:{sc:{value:600}},vertexShader:'attribute float size;attribute vec4 col;uniform float sc;varying vec4 vc;void main(){vc=col;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=size*sc/-mv.z;gl_Position=projectionMatrix*mv;}',fragmentShader:'varying vec4 vc;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(vc.rgb,vc.a*smoothstep(.5,.12,d));}',transparent:true,depthWrite:false,blending:a?T.AdditiveBlending:T.NormalBlending}),MA=pm(1),MN=pm(0);
function mkEm(add){const n=140,g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(n*3),3));g.setAttribute('col',new T.BufferAttribute(new Float32Array(n*4),4));g.setAttribute('size',new T.BufferAttribute(new Float32Array(n),1));const o=new T.Points(g,add?MA:MN);o.frustumCulled=false;scene.add(o);return{o,n,ps:[],acc:0}}
const lerp=(a,b,t)=>a+(b-a)*t,cc=(c,d,t)=>[lerp(c.R,d.R,t),lerp(c.G,d.G,t),lerp(c.B,d.B,t)];
const CFG={Fire:i=>{const s=i.Size/5,c=i.Color;return{add:1,rate:45*s,sp:a=>({life:.6+rnd()*.5,x:a.x+(rnd()-.5)*a.w*.7,y:a.y,z:a.z+(rnd()-.5)*a.w*.7,vx:(rnd()-.5),vy:(3+rnd()*3)*s,vz:(rnd()-.5),s0:3.6*s,s1:.8*s,c0:[c.R,c.G,c.B],c1:[.8,.1,0],a:.9})}},
Smoke:i=>{const s=i.Size/5,c=i.Color;return{add:0,rate:10*s,sp:a=>({life:2+rnd(),x:a.x+(rnd()-.5)*a.w*.5,y:a.y,z:a.z+(rnd()-.5)*a.w*.5,vx:(rnd()-.5)*.8,vy:2+rnd()*2,vz:(rnd()-.5)*.8,s0:2*s,s1:6*s,c0:[c.R,c.G,c.B],c1:[c.R*.8,c.G*.8,c.B*.8],a:i.Opacity})}},
Sparkles:i=>{const c=i.Color;return{add:1,rate:22,sp:a=>{const u=rnd()*6.28,v=rnd()*2-1,r=Math.sqrt(1-v*v);return{life:.7+rnd()*.5,x:a.x,y:a.y+1,z:a.z,vx:r*Math.cos(u)*3,vy:v*3+1,vz:r*Math.sin(u)*3,s0:.9,s1:.1,c0:[c.R,c.G,c.B],c1:[1,1,1],a:1}}}},
ParticleEmitter:i=>{const c=i.Color,sp=Math.tan(i.Spread*K);return{add:1,rate:i.Rate,sp:a=>({life:i.Lifetime*(.7+rnd()*.5),x:a.x+(rnd()-.5)*a.w*.5,y:a.y,z:a.z+(rnd()-.5)*a.w*.5,vx:(rnd()-.5)*sp*i.Speed,vy:i.Speed,vz:(rnd()-.5)*sp*i.Speed,s0:i.Size,s1:i.Size*.3,c0:[c.R,c.G,c.B],c1:[c.R,c.G,c.B],a:1-i.Transparency})}}};
function doEmit(i,st,dt,a){const cfg=CFG[i.C](i);st.o.material=cfg.add?MA:MN;if(a&&i.Enabled!==false){st.acc+=cfg.rate*dt;while(st.acc>=1&&st.ps.length<st.n){st.acc--;const top=a.part?{x:a.pos.x,y:a.pos.y+a.part.Size.Y/2,z:a.pos.z,w:Math.min(a.part.Size.X,a.part.Size.Z)}:{x:a.pos.x,y:a.pos.y,z:a.pos.z,w:.5};st.ps.push({t:0,...cfg.sp(top)})}}
const P=st.o.geometry.attributes;let n=0;st.ps=st.ps.filter(p=>(p.t+=dt)<p.life);for(const p of st.ps){p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;const u=p.t/p.life,c=cc({R:p.c0[0],G:p.c0[1],B:p.c0[2]},{R:p.c1[0],G:p.c1[1],B:p.c1[2]},u);P.position.setXYZ(n,p.x,p.y,p.z);P.col.setXYZW(n,c[0],c[1],c[2],p.a*(1-u*u));P.size.setX(n,lerp(p.s0,p.s1,u));n++}
for(let k=n;k<st.n;k++)P.size.setX(k,0);P.position.needsUpdate=P.col.needsUpdate=P.size.needsUpdate=true;st.o.geometry.setDrawRange(0,st.n)}
// ---- lights (small fixed pools keep the shader stable) ----
const LP={p:[],s:[]};function lightsFrame(ls){const c=cam.position,ds=ls.map(x=>({...x,d:x.a.pos.distanceTo(c)})).sort((a,b)=>a.d-b.d),ps=ds.filter(x=>x.i.C!='SpotLight').slice(0,4),ss=ds.filter(x=>x.i.C=='SpotLight').slice(0,2);
const put=(pool,arr,mk)=>{while(pool.length<arr.length){const l=mk();scene.add(l);if(l.target)scene.add(l.target);pool.push(l)}pool.forEach((l,k)=>{const x=arr[k];if(!x){l.intensity=0;return}const i=x.i,cl=i.Color;l.color.setRGB(cl.R,cl.G,cl.B);l.intensity=(i.Enabled===false?0:i.Brightness*1.4);l.distance=i.Range*1.6;l.decay=1.2;l.position.copy(x.a.pos);if(l.target){const f=new T.Vector3(0,0,-1).applyQuaternion(rq(x.a.part));l.target.position.copy(x.a.pos).add(f);l.angle=Math.min(1.5,i.Angle*K/2);l.penumbra=.3}})};
put(LP.p,ps,()=>new T.PointLight(0xffffff,0));put(LP.s,ss,()=>new T.SpotLight(0xffffff,0))}
// ---- decals / textures / surface guis ----
const FACES={Front:[0,Math.PI,0,0,0,-.5],Back:[0,0,0,0,0,.5],Top:[-Math.PI/2,0,0,0,.5,0],Bottom:[Math.PI/2,0,0,0,-.5,0],Left:[0,-Math.PI/2,0,-.5,0,0],Right:[0,Math.PI/2,0,.5,0,0]},fdim=(p,f)=>f=='Front'||f=='Back'?[p.Size.X,p.Size.Y]:f=='Top'||f=='Bottom'?[p.Size.X,p.Size.Z]:[p.Size.Z,p.Size.Y];
function mkPlane(i){const m=M.get(i.Parent);if(!m)return null;const o=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({transparent:true,polygonOffset:true,polygonOffsetFactor:-3,side:T.FrontSide,depthWrite:false}));m.add(o);return o}
function decalFrame(i,st){const p=i.Parent;if(!p||!PART.includes(p.C)||!M.get(p)){if(st.o){st.o.removeFromParent();st.o=null}return}
if(st.pm!==M.get(p)){st.o&&st.o.removeFromParent();st.o=mkPlane(i);st.pm=M.get(p);st.u=''}if(!st.o)return;const f=FACES[i.Face]||FACES.Front,o=st.o;o.rotation.set(f[0],f[1],f[2]);o.position.set(f[3],f[4],f[5]);
const u=PZ.url(i.Texture);if(u!=st.u){st.u=u;if(st.t)st.t.dispose();st.t=u?tl.load(u):nullo.material.map=st.t;o.material.needsUpdate=true}
o.material.opacity=1-i.Transparency;o.visible=!!st.t;if(st.t&&i.C=='Texture'){const d=fdim(p,i.Face);st.t.wrapS=st.t.wrapT=T.RepeatWrapping;st.t.repeat.set(d[0]/Math.max(.1,i.StudsPerTileU),d[1]/Math.max(.1,i.StudsPerTileV))}}
// 2D painter used by SurfaceGui / BillboardGui
const imgs=new Map,im=u=>{if(!imgs.has(u)){const e=new Image();e.crossOrigin='anonymous';e.onload=()=>e._ok=1;e.src=u;imgs.set(u,e)}return imgs.get(u)};
function paint(ctx,n,x,y,w,h){for(const k of n.K){if(!GUI.includes(k.C)||k.Visible===false)continue;const s=k.Size,p=k.Position,a=k.AnchorPoint||{X:0,Y:0},kw=s.XS*w+s.XO,kh=s.YS*h+s.YO,kx=x+p.XS*w+p.XO-a.X*kw,ky=y+p.YS*h+p.YO-a.Y*kh,cr=k.K.find(q=>q.C=='UICorner'),r=cr?cr.CornerRadius:0;
ctx.save();ctx.beginPath();ctx.roundRect?ctx.roundRect(kx,ky,kw,kh,r):ctx.rect(kx,ky,kw,kh);const bg=k.BackgroundColor3;if(bg&&k.BackgroundTransparency<1){ctx.fillStyle=rgba(bg,1-k.BackgroundTransparency);ctx.fill()}ctx.clip();
if(k.Image){const u=PZ.url(k.Image);if(u){const e=im(u);if(e._ok)ctx.drawImage(e,kx,ky,kw,kh)}}
if(k.Text){ctx.fillStyle=rgba(k.TextColor3,1-k.TextTransparency);ctx.font=`${k.TextSize}px ${FONTS[k.Font]||'sans-serif'}`;ctx.textBaseline='middle';const al=k.TextXAlignment||'Center';ctx.textAlign=al=='Left'?'left':al=='Right'?'right':'center';ctx.fillText(k.Text,al=='Left'?kx+4:al=='Right'?kx+kw-4:kx+kw/2,ky+kh/2,kw)}
paint(ctx,k,kx,ky,kw,kh);ctx.restore();const sk=k.K.find(q=>q.C=='UIStroke');if(sk){ctx.strokeStyle=rgba(sk.Color,1-sk.Transparency);ctx.lineWidth=sk.Thickness;ctx.strokeRect(kx,ky,kw,kh)}}}
function guiFrame(i,st,dt){const p=i.Parent,a=anchor(i);if(!a||i.Enabled===false||!inW(i)){if(st.o){st.o.removeFromParent();st.o=null}return}
const bb=i.C=='BillboardGui',d=bb?[i.Size.XS>0?i.Size.XS*10:i.Size.XO/40,i.Size.YS>0?i.Size.YS*10:i.Size.YO/40]:fdim(a.part,i.Face),pw=bb?40:i.PixelsPerStud,W=Math.max(8,Math.min(1024,Math.round(d[0]*pw))),H=Math.max(8,Math.min(1024,Math.round(d[1]*pw)));
if(!st.c||st.c.width!=W||st.c.height!=H){st.c=document.createElement('canvas');st.c.width=W;st.c.height=H;st.tx=new T.CanvasTexture(st.c);st.o&&st.o.removeFromParent();st.o=null;st.pm=null}
st.tm=(st.tm||0)-dt;if(st.tm<=0){st.tm=.25;const x=st.c.getContext('2d');x.clearRect(0,0,W,H);paint(x,i,0,0,W,H);st.tx.needsUpdate=true}
if(bb){if(!st.o){st.o=new T.Sprite(new T.SpriteMaterial({map:st.tx,transparent:true}));scene.add(st.o)}st.o.material.depthTest=!i.AlwaysOnTop;st.o.scale.set(d[0],d[1],1);const so=V3(i.StudsOffset);st.o.position.copy(a.pos).add(so)}
else{if(st.pm!==M.get(a.part)){st.o&&st.o.removeFromParent();st.o=null}if(!st.o){const m=M.get(a.part);if(!m)return;st.o=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:st.tx,transparent:true,polygonOffset:true,polygonOffsetFactor:-4,depthWrite:false}));m.add(st.o);st.pm=m}const f=FACES[i.Face]||FACES.Front,o=st.o;o.rotation.set(f[0],f[1],f[2]);o.position.set(f[3],f[4],f[5])}}
// ---- beams / trails ----
function beamFrame(i,st){const atts=[];if(i.Attachment0&&i.Attachment1)atts.push(i.Attachment0,i.Attachment1);else{const c=i.Parent;if(c)walk(c,n=>{if(n.C=='Attachment'&&atts.length<2)atts.push(n)})}
const ok=atts.length==2&&atts.every(a=>a.Parent&&PART.includes(a.Parent.C))&&i.Enabled!==false&&inW(i);if(!ok){if(st.o)st.o.visible=false;return}
if(!st.o){st.o=new T.Mesh(new T.BoxGeometry(1,1,1),new T.MeshBasicMaterial({transparent:true}));scene.add(st.o)}const a=attW(atts[0]),b=attW(atts[1]),len=a.distanceTo(b),c=i.Color;st.o.visible=true;st.o.position.copy(a).add(b).multiplyScalar(.5);st.o.lookAt(b);st.o.scale.set((i.Width0+i.Width1)/2,(i.Width0+i.Width1)/2,Math.max(.01,len));st.o.material.color.setRGB(c.R,c.G,c.B);st.o.material.opacity=1-i.Transparency}
function trailFrame(i,st,dt,a){if(!a||!inW(i)||i.Enabled===false){if(st.o)st.o.visible=false;st.h=[];return}
if(!st.o){const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(new Float32Array(120*6),3));g.setAttribute('color',new T.BufferAttribute(new Float32Array(120*6),3));st.o=new T.Mesh(g,new T.MeshBasicMaterial({vertexColors:true,transparent:true,blending:T.AdditiveBlending,side:T.DoubleSide,depthWrite:false}));st.o.frustumCulled=false;scene.add(st.o);st.h=[]}
st.h.push({p:a.pos.clone(),t:0});st.h.forEach(q=>q.t+=dt);st.h=st.h.filter(q=>q.t<i.Lifetime).slice(-120);const P=st.o.geometry.attributes,c=i.Color,w=i.Width/2;let n=0;
st.h.forEach((q,k)=>{const u=1-q.t/i.Lifetime,y=w*u;P.position.setXYZ(n,q.p.x,q.p.y+y,q.p.z);P.position.setXYZ(n+1,q.p.x,q.p.y-y,q.p.z);const f=u*(1-i.Transparency);P.color.setXYZ(n,c.R*f,c.G*f,c.B*f);P.color.setXYZ(n+1,c.R*f,c.G*f,c.B*f);n+=2});
const idx=[];for(let k=0;k<st.h.length-1;k++){const o=k*2;idx.push(o,o+1,o+2,o+1,o+3,o+2)}st.o.geometry.setIndex(idx);P.position.needsUpdate=P.color.needsUpdate=true;st.o.visible=st.h.length>1}
// ---- lighting FX: atmosphere, clouds, post effects ----
let fogObj=null,cloud=null,fx=null;
function ensureFx(){if(fx)return fx;fx=document.createElement('div');fx.id='pz-fx';fx.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:hidden';cv.after(fx);const mk=(t,css)=>{const e=document.createElement(t);e.style.cssText='position:absolute;inset:0;width:100%;height:100%;'+css;fx.append(e);return e};
fx.bloom=mk('canvas','mix-blend-mode:screen;display:none');fx.dof=mk('canvas','display:none');fx.tint=mk('div','mix-blend-mode:multiply;display:none');fx.rays=mk('div','mix-blend-mode:screen;display:none');return fx}
function skyFx(list){const by={};list.forEach(i=>{if(i.Enabled!==false&&(inW(i.Parent||i)||(i.Parent&&i.Parent.C=='Lighting')))by[i.C]=i});const at=by.Atmosphere;
if(at){if(!fogObj)fogObj=new T.FogExp2(0xcccccc,.002);const c=at.Color;fogObj.color.setRGB(c.R,c.G,c.B);fogObj.density=at.Density*.0045;scene.fog=fogObj}else if(fogObj){fogObj=null;try{env()}catch(e){}}
const cl=by.Clouds;if(cl){if(!cloud||cloud._cv!=Math.round(cl.Cover*20)){if(cloud){scene.remove(cloud);cloud.material.map.dispose()}const cn=document.createElement('canvas');cn.width=cn.height=128;const x=cn.getContext('2d'),im=x.createImageData(128,128);for(let a=0;a<128;a++)for(let b=0;b<128;b++){const v=fbm(a/22,b/22,7),al=Math.max(0,Math.min(1,(v-(1-cl.Cover*.9))*4));const k=(a*128+b)*4;im.data[k]=im.data[k+1]=im.data[k+2]=255;im.data[k+3]=al*255}x.putImageData(im,0,0);const t=new T.CanvasTexture(cn);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(3,3);cloud=new T.Mesh(new T.PlaneGeometry(6000,6000),new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,fog:false}));cloud.rotation.x=-Math.PI/2;cloud.renderOrder=-1;cloud._cv=Math.round(cl.Cover*20);scene.add(cloud)}
cloud.position.set(cam.position.x,320,cam.position.z);cloud.material.opacity=Math.min(1,cl.Density);const c=cl.Color;cloud.material.color.setRGB(c.R,c.G,c.B);cloud.material.map.offset.x+=.00006}else if(cloud){scene.remove(cloud);cloud=null}
const bl=by.BloomEffect,bu=by.BlurEffect,cc=by.ColorCorrectionEffect,sr=by.SunRaysEffect,df=by.DepthOfFieldEffect;if(!(bl||bu||cc||sr||df)&&!fx){cv.style.filter='';return}ensureFx();
let f='';if(bu)f+=`blur(${bu.Size/4}px) `;if(cc)f+=`brightness(${1+cc.Brightness}) contrast(${1+cc.Contrast}) saturate(${1+cc.Saturation}) `;cv.style.filter=f;
if(cc){const c=cc.TintColor;fx.tint.style.display=(c.R<1||c.G<1||c.B<1)?'block':'none';fx.tint.style.background=hex(c)}else fx.tint.style.display='none';
fx.bloom.style.display=bl?'block':'none';if(bl){fx.bloom.style.opacity=Math.min(1,bl.Intensity);fx.bloom.style.filter=`blur(${Math.max(2,bl.Size/2)}px) brightness(1.6) contrast(1.8)`}
fx.dof.style.display=df?'block':'none';if(df){fx.dof.style.filter=`blur(${df.FarIntensity*8}px)`;fx.dof.style.webkitMaskImage=fx.dof.style.maskImage=`radial-gradient(circle at 50% 55%,transparent ${df.InFocusRadius}%,#000 95%)`}
if(sr&&sun){const v=sun.position.clone().project(cam),on=v.z<1&&Math.abs(v.x)<1.6&&Math.abs(v.y)<1.6;fx.rays.style.display=on?'block':'none';if(on)fx.rays.style.background=`radial-gradient(circle at ${(v.x+1)*50}% ${(1-v.y)*50}%,rgba(255,238,190,${sr.Intensity}),transparent 55%)`}else fx.rays.style.display='none';
fx._on={bl:!!bl,df:!!df};}
// ---- MeshPart (.obj meshes from uploaded assets) ----
function objGeo(txt){const v=[],vt=[],vn=[],P=[],U=[],N=[],ix=(s,n)=>{const k=parseInt(s);return k<0?n+k:k-1};for(const l of txt.split('\n')){const a=l.trim().split(/\s+/);if(a[0]=='v')v.push(a.slice(1,4).map(Number));else if(a[0]=='vt')vt.push(a.slice(1,3).map(Number));else if(a[0]=='vn')vn.push(a.slice(1,4).map(Number));else if(a[0]=='f'){const fs=a.slice(1).map(x=>x.split('/'));for(let k=1;k<fs.length-1;k++)for(const q of[fs[0],fs[k],fs[k+1]]){P.push(...v[ix(q[0],v.length)]);const t=q[1]?vt[ix(q[1],vt.length)]:[0,0];U.push(t[0],t[1]);if(q[2]&&vn.length)N.push(...vn[ix(q[2],vn.length)])}}}
const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));N.length==P.length?g.setAttribute('normal',new T.Float32BufferAttribute(N,3)):g.computeVertexNormals();g.computeBoundingBox();const b=g.boundingBox,c=b.getCenter(new T.Vector3()),s=b.getSize(new T.Vector3());g.translate(-c.x,-c.y,-c.z);g.scale(1/(s.x||1),1/(s.y||1),1/(s.z||1));return g}
function meshFrame(i,st){const u=PZ.url(i.MeshId);if(u!==st.u){st.u=u;i._geo=null;if(!u)sync(i);else fetch(u).then(r=>r.text()).then(t=>{if(st.u==u){i._geo=objGeo(t);sync(i)}}).catch(e=>out('MeshPart: could not load mesh ('+e.message+')'))}
const m=M.get(i),tu=PZ.url(i.TextureId);if(m&&tu!==st.tu){st.tu=tu;m.material.map=tu?gt(tu):null;m.material.needsUpdate=true}}
// ---- truss lattice look ----
let trussTex=null;function trussFrame(i){const m=M.get(i);if(!m||m.userData.tr)return;if(!trussTex){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.strokeStyle='#fff';x.lineWidth=7;x.strokeRect(3,3,58,58);x.beginPath();x.moveTo(3,3);x.lineTo(61,61);x.moveTo(61,3);x.lineTo(3,61);x.stroke();trussTex=new T.CanvasTexture(c);trussTex.wrapS=trussTex.wrapT=T.RepeatWrapping}m.material.map=trussTex.clone();m.material.map.needsUpdate=true;m.material.map.repeat.set(Math.max(1,Math.round(i.Size.X/2)),Math.max(1,Math.round(i.Size.Y/2)));m.material.alphaTest=.4;m.material.needsUpdate=true;m.userData.tr=1}
// ---- attachment gizmo ----
function attFrame(i,st){const a=anchor({Parent:i});if(!i.Visible||!a||!i.Parent||!PART.includes(i.Parent.C)||!inW(i)){if(st.o)st.o.visible=false;return}if(!st.o){st.o=new T.Mesh(new T.SphereGeometry(.25,10,8),new T.MeshBasicMaterial({color:0x33ccff,depthTest:false}));st.o.renderOrder=9;scene.add(st.o)}st.o.visible=true;st.o.position.copy(attW(i))}
// ---- per-frame driver (editor + play) ----
const FREE={Fire:1,Smoke:1,Sparkles:1,ParticleEmitter:1},GUIS={SurfaceGui:1,BillboardGui:1},FX={Atmosphere:1,Clouds:1,BloomEffect:1,BlurEffect:1,ColorCorrectionEffect:1,SunRaysEffect:1,DepthOfFieldEffect:1};
let lastT=0;
function freeSt(st){st.o&&st.o.removeFromParent&&st.o.removeFromParent();if(st.o&&st.o.geometry&&!st.o.isMesh===false)try{st.o.geometry.dispose()}catch(e){}if(st.o&&scene.children.includes(st.o))scene.remove(st.o);if(st.t)st.t.dispose()}
function frame(dt){try{const seen=new Set,ls=[],fxl=[];
if(MA.uniforms)MA.uniforms.sc.value=MN.uniforms.sc.value=ren.domElement.height/(2*Math.tan(cam.fov*K/2));
walk(root,i=>{const c=i.C;if(FX[c]){fxl.push(i);return}
if(c=='PointLight'||c=='SpotLight'||c=='SurfaceLight'){const a=anchor(i);if(a&&inW(i)&&i.Enabled!==false)ls.push({i,a});return}
if(!(FREE[c]||c=='Decal'||c=='Texture'||GUIS[c]||c=='Beam'||c=='Trail'||c=='Attachment'||c=='MeshPart'||c=='TrussPart'))return;
if(!inW(i)&&!GUIS[c])return;seen.add(i);let st=R.get(i);if(!st){st={};if(FREE[c]){const e=mkEm(c!='Smoke');st=e}R.set(i,st)}
if(FREE[c])doEmit(i,st,dt,anchor(i));else if(c=='Decal'||c=='Texture')decalFrame(i,st);else if(GUIS[c])guiFrame(i,st,dt);else if(c=='Beam')beamFrame(i,st);else if(c=='Trail')trailFrame(i,st,dt,anchor(i));else if(c=='Attachment')attFrame(i,st);else if(c=='MeshPart')meshFrame(i,st);else trussFrame(i)});
for(const[i,st]of R)if(!seen.has(i)){if(st.o){st.o.removeFromParent&&st.o.removeFromParent();if(st.o.parent)scene.remove(st.o)}if(st.o&&st.o.geometry&&st.ps)st.o.geometry.dispose();R.delete(i)}
lightsFrame(ls);skyFx(fxl)}catch(e){if(!frame.e){frame.e=1;out('Effects error: '+e)}}}
function post(){if(!fx||!fx._on)return;const w=Math.max(8,cv.clientWidth>>2),h=Math.max(8,cv.clientHeight>>2);for(const[k,c]of[['bl',fx.bloom],['df',fx.dof]])if(fx._on[k]){if(c.width!=w){c.width=w;c.height=h}try{c.getContext('2d').drawImage(cv,0,0,w,h)}catch(e){}}}
// ---- physics-time behaviours: bodies, constraints, truss, seats, tools ----
const mass=b=>Math.max(.01,b.Density)*b.Size.X*b.Size.Y*b.Size.Z,free=b=>b&&!b.Anchored,setO=(b,q)=>{const e=new T.Euler().setFromQuaternion(q,'YXZ');b.Orientation.X=e.x/K;b.Orientation.Y=e.y/K;b.Orientation.Z=e.z/K;EX.delete(b);OB.delete(b)},mvP=(b,v)=>{b.Position.X=v.x;b.Position.Y=v.y;b.Position.Z=v.z};
let BP=[],eq=null,nm=new Map,seat=null,seatCd=0,hot=null,climb=false;
const axisV=(c,part)=>{const a=c.Axis=='X'?[1,0,0]:c.Axis=='Z'?[0,0,1]:[0,1,0];return new T.Vector3(...a).applyQuaternion(rq(part))};
function endOf(c,n){let t=c['Attachment'+n]||(n==0?c.Parent:null);if(!t&&n==1){const p=c.Part1||(c.Part1Name&&nm.get(c.Part1Name));if(p)t=p}if(!t)return null;if(PART.includes(t.C))return{part:t,pos:V3(t.Position)};if(t.C=='Attachment'&&t.Parent&&PART.includes(t.Parent.C))return{part:t.Parent,pos:attW(t)};return null}
function moveEnds(A,B,d){// d = how far B must move toward A (vector from B to A). Splits between free bodies.
const fa=free(A.part),fb=free(B.part);if(!fa&&!fb)return;const ma=fa?1/mass(A.part):0,mb=fb?1/mass(B.part):0,s=ma+mb;if(fb)mvP(B.part,V3(B.part.Position).addScaledVector(d,mb/s));if(fa)mvP(A.part,V3(A.part.Position).addScaledVector(d,-ma/s))}
function pre(dt){if(!playing||!pl)return;nm=new Map;const bodies=[],cons=[];
walk(svc.Workspace,i=>{if(PART.includes(i.C)&&!nm.has(i.Name))nm.set(i.Name,i);const c=i.C;if(/^Body/.test(c)||/Constraint$/.test(c))if(i.Enabled!==false)(/^Body/.test(c)?bodies:cons).push(i)});
const g=cur=>cur;
for(const b of bodies){const p=b.Parent;if(!p||!PART.includes(p.C)||p.Anchored)continue;const v=p.AssemblyLinearVelocity,m=mass(p),mf=b.MaxForce||{X:1,Y:1,Z:1};
if(b.C=='BodyVelocity'){const t=b.Velocity;if(mf.X>0)v.X=t.X;if(mf.Y>0)v.Y=t.Y;if(mf.Z>0)v.Z=t.Z}
else if(b.C=='BodyForce'){v.X+=b.Force.X/m*dt;v.Y+=b.Force.Y/m*dt;v.Z+=b.Force.Z/m*dt}
else if(b.C=='BodyPosition'){const t=b.Position,q=p.Position,kp=b.P,kd=b.D;if(mf.X>0)v.X+=((t.X-q.X)*kp-v.X*kd)*dt;if(mf.Y>0)v.Y+=((t.Y-q.Y)*kp-v.Y*kd+196.2)*dt;if(mf.Z>0)v.Z+=((t.Z-q.Z)*kp-v.Z*kd)*dt}
else if(b.C=='BodyGyro'){const o=p.Orientation,t=b.Orientation,k=Math.min(1,b.P*dt);o.X+=(t.X-o.X)*k;o.Y+=(t.Y-o.Y)*k;o.Z+=(t.Z-o.Z)*k;EX.delete(p);OB.delete(p)}}
for(const c of cons){const A=endOf(c,0),B=endOf(c,1);if(!A||!B||A.part===B.part)continue;const d=B.pos.clone().sub(A.pos),L=d.length();const dir=L>1e-6?d.clone().multiplyScalar(1/L):new T.Vector3(0,1,0);
if(c.C=='RopeConstraint'){if(L>c.Length)moveEnds(A,B,dir.clone().multiplyScalar(-(L-c.Length)))}
else if(c.C=='RodConstraint'){if(Math.abs(L-c.Length)>.001)moveEnds(A,B,dir.clone().multiplyScalar(-(L-c.Length)))}
else if(c.C=='BallSocketConstraint'||(c.C=='HingeConstraint'&&c.ActuatorType!='Motor')){if(L>.001)moveEnds(A,B,d.clone().negate())}
else if(c.C=='SpringConstraint'){const f=(L-c.FreeLength)*c.Stiffness;for(const[E,sg]of[[A,1],[B,-1]]){if(!free(E.part))continue;const v=E.part.AssemblyLinearVelocity,m=mass(E.part),ac=(f*sg)/m*dt,dm=c.Damping/m*dt;v.X+=dir.x*ac-v.X*Math.min(1,dm);v.Y+=dir.y*ac-v.Y*Math.min(1,dm);v.Z+=dir.z*ac-v.Z*Math.min(1,dm)}}
else if(c.C=='HingeConstraint'){const ax=axisV(c,A.part),q=new T.Quaternion().setFromAxisAngle(ax,c.AngularVelocity*dt),np=B.part===c.Parent?null:A.pos.clone().add(V3(B.part.Position).sub(A.pos).applyQuaternion(q));if(np){mvP(B.part,np);setO(B.part,q.multiply(rq(B.part)));sync(B.part)}}
else if(c.C=='PrismaticConstraint'){const ax=axisV(c,A.part),rel=V3(B.part.Position).sub(A.pos);let al=rel.dot(ax);if(c.ActuatorType=='Motor')al+=c.Velocity*dt;al=Math.max(c.LowerLimit,Math.min(c.UpperLimit,al));mvP(B.part,A.pos.clone().addScaledVector(ax,al));if(free(B.part)){const v=B.part.AssemblyLinearVelocity,vd=v.X*ax.x+v.Y*ax.y+v.Z*ax.z;v.X=ax.x*vd;v.Y=ax.y*vd;v.Z=ax.z*vd}sync(B.part)}}
// truss + seat
const pp=pl.Position,v=pl.AssemblyLinearVelocity,j=jump||keys.Space,up=(keys.KeyW||keys.ArrowUp)||UIS.MoveY>.3||joy.y<-.3,dn=(keys.KeyS||keys.ArrowDown)||UIS.MoveY<-.3||joy.y>.3;let onT=false;
if(seat){const s=seat;if(j||!s.Parent){pl._climb=false;pp.Y=s.Position.Y+s.Size.Y/2+3;seat=null;seatCd=performance.now()+700;s.Occupant=null}else{pp.X=s.Position.X;pp.Y=s.Position.Y+s.Size.Y/2+1.7;pp.Z=s.Position.Z;v.X=v.Y=v.Z=0;pl._climb=true}}
else{for(const b of list){if(b.C=='TrussPart'){const q=b.Position,s=b.Size;if(Math.abs(pp.X-q.X)<s.X/2+1.6&&Math.abs(pp.Z-q.Z)<s.Z/2+1.6&&pp.Y>q.Y-s.Y/2-2&&pp.Y<q.Y+s.Y/2+2.5){onT=true;break}}
else if(b.C=='Seat'&&!b.Disabled&&performance.now()>seatCd){const q=b.Position,s=b.Size;if(Math.abs(pp.X-q.X)<s.X/2+1.2&&Math.abs(pp.Z-q.Z)<s.Z/2+1.2&&pp.Y>q.Y&&pp.Y<q.Y+s.Y/2+4.2&&!b.Occupant){seat=b;b.Occupant=pl;break}}}
if(onT&&!j){v.Y=up?16:dn?-16:0;pl._climb=true;v.X*=.5;v.Z*=.5}else pl._climb=false}
// tools
if(eq&&eq.Parent===pl){const h=eq.FindFirstChild('Handle');if(h){const f=fy,fx_=Math.sin(f),fz=Math.cos(f),hp=h.Position;hp.X=pp.X-Math.cos(f)*1.5+fx_*1.4;hp.Y=pp.Y-.2;hp.Z=pp.Z+Math.sin(f)*1.5+fz*1.4;h.Orientation.Y=f/K;h._w=1;h.Anchored=true;h.CanCollide=false;sync(h)}}
for(const t of walkTools()){if(BP.includes(t)||t.Parent===pl)continue;const h=t.FindFirstChild('Handle');if(h&&Math.hypot(h.Position.X-pp.X,h.Position.Z-pp.Z)<4&&Math.abs(h.Position.Y-pp.Y)<5){BP.push(t);t.Parent=svc.StarterPack;drawHot()}}}
const walkTools=()=>{const o=[];if(svc.Workspace)walk(svc.Workspace,i=>{if(i.C=='Tool'&&i.Parent&&i.Parent.C!='Player'&&i.Parent!==pl)o.push(i)});return o};
function equip(t){if(eq){const o=eq;eq=null;o.Parent=svc.StarterPack;o.Unequipped.fire()}if(t&&t!==eq&&BP.includes(t)){eq=t;t.Parent=pl;t.Equipped.fire()}drawHot()}
function drawHot(){if(!hot){hot=document.createElement('div');hot.id='pz-hot';$('#vp').append(hot)}hot.style.display=BP.length?'flex':'none';hot.innerHTML='';BP.forEach((t,n)=>{const b=document.createElement('button');b.className=eq===t?'on':'';b.innerHTML=`<i>${n+1}</i>${String(t.Name).replace(/[<>&]/g,'')}`;b.title=t.ToolTip||'';b.onclick=()=>equip(eq===t?null:t);hot.append(b)})}
function start(){BP=[];eq=null;seat=null;nm=new Map;const sp=svc.StarterPack;if(sp)sp.K.filter(k=>k.C=='Tool').forEach(t=>BP.push(t));drawHot()}
function stopP(){BP=[];eq=null;seat=null;if(hot){hot.remove();hot=null}}
let pd=null;cv.addEventListener('pointerdown',e=>{pd={x:e.clientX,y:e.clientY,t:performance.now()}});cv.addEventListener('pointerup',e=>{if(playing&&eq&&pd&&Math.hypot(e.clientX-pd.x,e.clientY-pd.y)<8&&performance.now()-pd.t<400&&eq.Enabled!==false)eq.Activated.fire();pd=null});
addEventListener('keydown',e=>{if(!playing||/INPUT|TEXTAREA/.test(document.activeElement&&document.activeElement.tagName))return;const n=+e.key;if(n>=1&&n<=9&&BP[n-1])equip(eq===BP[n-1]?null:BP[n-1])});
// ---- UI modifiers (UIListLayout, UIGridLayout, UIPadding, UIGradient, UIScale, UIAspectRatioConstraint) ----
const AJ={Left:'flex-start',Top:'flex-start',Center:'center',Right:'flex-end',Bottom:'flex-end'};
function gui(i,d){if(!d||!i.K)return;const ks=i.K,pad=ks.find(k=>k.C=='UIPadding'),sc=ks.find(k=>k.C=='UIScale'),ar=ks.find(k=>k.C=='UIAspectRatioConstraint'),gr=ks.find(k=>k.C=='UIGradient'),lay=ks.find(k=>k.C=='UIListLayout'||k.C=='UIGridLayout'),s=d.style;
if(pad)s.padding=`${pad.PaddingTop}px ${pad.PaddingRight}px ${pad.PaddingBottom}px ${pad.PaddingLeft}px`;
if(sc){s.transform=s.transform.replace(/ scale\([^)]*\)$/,'')+` scale(${sc.Scale})`}
if(ar){s.aspectRatio=String(ar.AspectRatio);s.height='auto'}
if(gr&&!i.Image){const a=1-gr.Transparency,c0=gr.Color0,c1=gr.Color1;s.backgroundImage=`linear-gradient(${90+gr.Rotation}deg,${rgba(c0,a)},${rgba(c1,a)})`;s.backgroundBlendMode='multiply'}
if(lay){const kids=ks.filter(k=>GD.has(k)).sort((a,b)=>(a.LayoutOrder||0)-(b.LayoutOrder||0));s.display=i.Visible===false?'none':'flex';
if(lay.C=='UIListLayout'){const h=lay.FillDirection=='Horizontal';s.flexDirection=h?'row':'column';s.gap=lay.Padding+'px';s.flexWrap='nowrap';s.justifyContent=AJ[h?lay.HorizontalAlignment:lay.VerticalAlignment]||'flex-start';s.alignItems=AJ[h?lay.VerticalAlignment:lay.HorizontalAlignment]||'flex-start'}
else{s.flexDirection='row';s.flexWrap='wrap';s.alignContent='flex-start';s.gap=`${lay.CellPadding.YO}px ${lay.CellPadding.XO}px`;s.justifyContent=AJ[lay.HorizontalAlignment]||'flex-start'}
kids.forEach((k,n)=>{const e=GD.get(k);if(!e)return;const q=e.style;q.position='relative';q.left=q.top='auto';q.flex='none';q.order=n;q.transform=`rotate(${k.Rotation||0}deg)`;if(lay.C=='UIGridLayout'){q.width=`calc(${lay.CellSize.XS*100}% + ${lay.CellSize.XO}px)`;q.height=`calc(${lay.CellSize.YS*100}% + ${lay.CellSize.YO}px)`}})}}
window.PZC={frame,post,pre,start,stop:stopP,gui,prop(t,k,v){if(!t.Changed)return;if(/Value$/.test(t.C)){if(k=='Value')t.Changed.fire(v)}else t.Changed.fire(k)}};
})();
