'use client';
import React,{useEffect,useMemo,useReducer,useRef,useState} from 'react';
import {makeGaps,correctAnswer,type ClozeSentence} from '../lib/cloze';
import {sessionReducer,splitWordGaps,type Session} from '../lib/cloze-session';
import {useHighlightProfile} from './highlight-settings';
type Props={onAttempt:(items:{text:string;correct:boolean}[])=>void;sentences:ClozeSentence[];initialIndex:number;request:{index:number;nonce:number};captionSize:number;onPlay:(start:number,end:number,text:string,onEnded?:()=>void)=>boolean;onStop:()=>void;onClose:()=>void};
export default function ClozePractice(props:Props){
 const {sentences,initialIndex,request,captionSize}=props;
 const {profile}=useHighlightProfile();
 const exercises=useMemo(()=>sentences.map((s,i)=>({...s,i,gaps:splitWordGaps(makeGaps(s.text,profile))})).filter(s=>s.gaps.length&&Number.isFinite(s.start)&&s.end>s.start),[sentences,profile]);
 const first=exercises.find(s=>s.i>=Math.max(0,initialIndex))||exercises[0];
 const [state,dispatch]=useReducer(sessionReducer,{at:first?.i??0,phase:first?'listening':'finished',values:[],run:0} as Session);
 const [wrong,setWrong]=useState<number[]>([]),[retry,setRetry]=useState<number[]|null>(null),[settings,setSettings]=useState(false),[range,setRange]=useState(false),[start,setStart]=useState(0),[end,setEnd]=useState(sentences.length-1);
 const inputs=useRef<(HTMLInputElement|null)[]>([]),callbacks=useRef(props),session=useRef(state),lastRequest=useRef(request.nonce);
 callbacks.current=props;session.current=state;
 const sentence=exercises.find(s=>s.i===state.at);
 const pool=exercises.filter(s=>(!retry||retry.includes(s.i))&&(!range||(s.i>=start&&s.i<=end)));
 useEffect(()=>{
  if(state.phase!=='listening'&&state.phase!=='correction')return;
  if(!sentence){dispatch({type:'finish'});return;}
  let active=true;
  const ok=callbacks.current.onPlay(sentence.start,sentence.end,sentence.text,()=>{if(active)dispatch({type:'ended'});});
  if(!ok)dispatch({type:'blocked'});
  return ()=>{active=false;callbacks.current.onStop();};
  // A run is one playback; progress renders must not restart it.
 },[state.run,state.at]);
 useEffect(()=>{if(state.phase==='typing')inputs.current[0]?.focus({preventScroll:true});},[state.phase,state.at]);
 useEffect(()=>()=>callbacks.current.onStop(),[]);
 useEffect(()=>{if(request.nonce!==lastRequest.current){lastRequest.current=request.nonce;const next=exercises.find(s=>s.i>=request.index);if(next)dispatch({type:'play',at:next.i});}},[request,exercises]);
 function play(at=state.at){dispatch({type:'play',at});}
 function submit(){
  if(session.current.phase!=='typing'||!sentence)return;
  const items=sentence.gaps.map((g,j)=>({text:g.answer,correct:correctAnswer(state.values[j]||'',g.answer)}));
  callbacks.current.onAttempt(items);
  if(items.every(i=>i.correct)){
   setWrong(w=>w.filter(i=>i!==state.at));
   const next=pool.find(s=>s.i>state.at);
   // Guard repeated Enter events until the next render.
   session.current={...state,phase:'listening'};
   if(next)play(next.i);else{callbacks.current.onStop();dispatch({type:'finish'});}
  }else{
   session.current={...state,phase:'correction'};
   setWrong(w=>w.includes(state.at)?w:[...w,state.at]);dispatch({type:'wrong'});
  }
 }
 const typing=state.phase==='typing',correcting=state.phase==='correction';
 return <section className="subtitle-typing" aria-label="视频字幕打字练习" style={{'--typing-size':Math.min(captionSize,32)+'px'} as React.CSSProperties}>
  <div className="subtitle-typing-top"><span>听音填空 · 第 {state.at+1} 句</span><div><button onClick={()=>setSettings(s=>!s)} aria-expanded={settings}>设置</button><button onClick={()=>{props.onStop();props.onClose();}}>退出练习</button></div></div>
  {settings&&<div className="subtitle-typing-settings"><label>选择句子 <select value={state.at} onChange={e=>play(+e.target.value)}>{exercises.map(s=><option key={s.i} value={s.i}>第 {s.i+1} 句</option>)}</select></label><label><input type="checkbox" checked={range} onChange={e=>setRange(e.target.checked)}/>指定练习段落</label>{range&&<label>第 <input type="number" aria-label="起始句" min={1} max={end+1} value={start+1} onChange={e=>setStart(Math.min(end,Math.max(0,+e.target.value-1)))}/> 至 <input type="number" aria-label="结束句" min={start+1} max={sentences.length} value={end+1} onChange={e=>setEnd(Math.min(sentences.length-1,Math.max(start,+e.target.value-1)))}/> 句 <button onClick={()=>{const first=pool[0];if(first){play(first.i);setSettings(false);}}}>开始本段</button></label>}<button disabled={!wrong.length} onClick={()=>{setRetry([...wrong]);play(Math.min(...wrong));setSettings(false);}}>错题重练（{wrong.length}）</button>{retry&&<button onClick={()=>{setRetry(null);play(exercises[0]?.i??0);}}>返回全部</button>}</div>}
  <div className="subtitle-typing-bottom">
   {state.phase==='finished'?<div className="subtitle-typing-finished"><strong>{exercises.length?'本轮练习完成':'暂无可练习的字幕'}</strong>{pool.length>0&&<button onClick={()=>play(pool[0].i)}>重新练习</button>}<button onClick={props.onClose}>退出练习</button></div>:<>
    {(typing||correcting)&&sentence&&<p className="subtitle-typing-line">{sentence.gaps.map((g,j)=><React.Fragment key={state.at+':'+j}>{sentence.text.slice(j?sentence.gaps[j-1].end:0,g.start)}{correcting?<mark className={correctAnswer(state.values[j]||'',g.answer)?'typing-correct':'typing-correction'}>{g.answer}</mark>:<input ref={node=>{inputs.current[j]=node;}} aria-label={'第 '+(j+1)+' 个单词'} style={{width:Math.max(3,Math.min(16,g.answer.length+1))+'ch'}} value={state.values[j]||''} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} onChange={e=>dispatch({type:'input',index:j,value:e.target.value.replace(/\s/g,'')})} onKeyDown={e=>{if(e.nativeEvent.isComposing)return;if(e.key===' '){e.preventDefault();e.stopPropagation();inputs.current[Math.min(j+1,sentence.gaps.length-1)]?.focus();}else if(e.key==='Enter'){e.preventDefault();e.stopPropagation();if(!e.repeat)submit();}}}/>}{j===sentence.gaps.length-1?sentence.text.slice(g.end):''}</React.Fragment>)}</p>}
    <div className="subtitle-typing-actions"><span role="status">{typing?'空格 → 下一格 · Enter 验证':correcting?'拼写有误 · 看正确拼写，再听一遍':state.phase==='blocked'?'无法开始播放，请检查播放器连接后重试':'先听这一句 · 播放结束后填空'}</span><button onClick={()=>play()}>重播</button>{typing&&<button onClick={submit}>验证 ↵</button>}</div>
   </>}
  </div>
 </section>;
}
