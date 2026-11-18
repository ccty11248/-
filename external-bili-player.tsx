'use client';
import React,{forwardRef,useEffect,useImperativeHandle,useRef,useState} from 'react';
import {videoSource} from '../lib/video-source';
import type {SourceControl} from './source-player';
export default forwardRef<SourceControl,{url:string;onTime:(t:number)=>void;onError:(m:string)=>void;onConnection?:(connected:boolean)=>void}>(function ExternalBiliPlayer({url,onTime,onError,onConnection},ref){
 const source=videoSource(url),latest=useRef({onTime,onError,onConnection});latest.current={onTime,onError,onConnection};
 const session=useRef<{tabId:number;frameId:number;seen:number}|null>(null),[connected,CONNECTED]=useState(false),[time,TIME]=useState(0);
 const command=(action:string,value?:number)=>{const s=session.current;if(!s||Date.now()-s.seen>6000){latest.current.onError('扩展尚未连接，请安装0.2版扩展并刷新Leaf，再点击内嵌视频播放。');return}window.postMessage({type:'LEAF_SYNC_COMMAND',id:source.id,page:source.page||1,tabId:s.tabId,frameId:s.frameId,action,value},location.origin)};
 useImperativeHandle(ref,()=>({seek:t=>command('seek',t),pause:()=>{if(session.current)command('pause')},rate:r=>command('rate',r)}),[url]);
 useEffect(()=>{session.current=null;CONNECTED(false);latest.current.onConnection?.(false);
 const receive=(e:MessageEvent)=>{if(e.source!==window||e.origin!==location.origin)return;const m=e.data;if(m?.type==='LEAF_SYNC_ERROR'){latest.current.onError(String(m.error));return}if(m?.type!=='LEAF_SYNC_STATE'||m.id!==source.id||m.page!==(source.page||1)||!Number.isFinite(m.time)||m.time<0||!Number.isInteger(m.tabId)||!Number.isInteger(m.frameId)||m.frameId<=0)return;
 const old=session.current;if(old&&old.tabId!==m.tabId&&Date.now()-old.seen<6000)return;session.current={tabId:m.tabId,frameId:m.frameId,seen:Date.now()};CONNECTED(true);TIME(m.time);latest.current.onConnection?.(true);latest.current.onTime(m.time)};
 window.addEventListener('message',receive);const timer=setInterval(()=>{if(session.current&&Date.now()-session.current.seen>6000){session.current=null;CONNECTED(false);latest.current.onConnection?.(false)}},1000);
 return()=>{clearInterval(timer);window.removeEventListener('message',receive);session.current=null;latest.current.onConnection?.(false)};
 },[url]);
 return <div className="embedded-bili-sync"><iframe className="source-player" title="Bilibili 内嵌视频" src={`https://player.bilibili.com/player.html?bvid=${source.id}&page=${source.page||1}&autoplay=0`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/><div className="embedded-sync-indicator" role="status">{connected?`扩展已连接 · ${Math.floor(time/60)}:${String(Math.floor(time%60)).padStart(2,'0')}`:<><span>自动字幕需安装同步扩展 0.2 并刷新</span><a href="/leaf-sync-extension.zip" download>下载扩展</a></>}</div></div>;
});
