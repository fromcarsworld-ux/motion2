import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

const clamp={extrapolateLeft:'clamp' as const,extrapolateRight:'clamp' as const};
const xs=[-100,430,760,1130,1530,1180,520,1380,1940];
const ys=[700,360,710,420,680,300,520,780,180];
const stops=[0,80,190,320,440,570,700,850,1080];
const clicks=[122,238,361,497,642,786,918];
export default function CursorOverlay(){
 const f=useCurrentFrame();
 const active=interpolate(f,[50,95,970,1020],[0,1,1,0],clamp);
 const x=interpolate(f,stops,xs,clamp); const y=interpolate(f,stops,ys,clamp);
 const click=clicks.map(t=>f-t).find(age=>age>=0&&age<22);
 const ripple=click===undefined?0:interpolate(click,[0,22],[0,1],clamp);
 return <AbsoluteFill style={{pointerEvents:'none',opacity:active,zIndex:20}}>
   <div style={{position:'absolute',left:x,top:y,transform:'translate(-3px,-3px)',width:70,height:70}}>
    {click!==undefined&&[0,1,2].map(i=><div key={i} style={{position:'absolute',left:-i*8,top:-i*8,width:34+i*16,height:34+i*16,borderRadius:'50%',border:`${2-i*.35}px solid rgba(133,88,255,${Math.max(0,.68-ripple*.7-i*.12)})`,transform:`scale(${.4+ripple*(1+i*.22)})`,opacity:Math.max(0,1-ripple),boxShadow:'0 0 18px rgba(116,67,255,.28)'}}/>)}
    <div style={{position:'absolute',left:12,top:12,width:46,height:46,borderRadius:'50%',background:'rgba(112,55,255,.14)',filter:'blur(10px)',opacity:.8}}/>
    <svg width="44" height="54" viewBox="0 0 44 54" style={{position:'absolute',left:8,top:7,filter:'drop-shadow(0 3px 4px rgba(0,0,0,.5))'}}><path d="M5 3 L7 43 L18 32 L26 49 L32 46 L24 29 L39 29 Z" fill="#fff" stroke="#0c071b" strokeWidth="3" strokeLinejoin="round"/><path d="M9 10 L10 34" stroke="#cbbaff" strokeWidth="2" strokeLinecap="round" opacity=".9"/></svg>
   </div>
 </AbsoluteFill>
}
