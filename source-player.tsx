'use client';
import React,{forwardRef,useEffect,useImperativeHandle,useRef,useState} from 'react';
import ExternalBiliPlayer from './external-bili-player';
import {videoSource} from '../lib/video-source';
export type SourceControl={seek:(t:number)=>void;pause:()=>void;rate:(r:number)=>void};
type YTPlayer={destroy:()=>void;getCurrentTime:()=>number;getPlayerState:()=>number;seekTo:(t:number,allow:boolean)=>void;playVideo:()=>void;pauseVideo:()=>void;setPlaybackRate:(r:number)=>void};
type YTAPI={Player:new(el:HTMLElement,opts:unknown)=>YTPlayer};
let loading:Promise<YTAPI>|undefined;
function youtube(){return loading||=(new Promise<YTAPI>((resolve,reject)=>{const w=window as unknown as {YT?:YTAPI;onYouTubeIframeAPIReady?:()=>void};if(w.YT?.Player){resolve(w.YT);return}w.onYouTubeIframeAPIReady=()=>resolve(w.YT!);const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{loading=undefined;reject(Error('YouTube 播放器加载失败，请使用原网页或本地视频'))};document.head.appendChild(script)}))}
const EmbeddedSourcePlayer=forwardRef<SourceControl,{url:string;onTime:(t:number)=>void;onError:(m:string)=>void}>(function SourcePlayer({url,onTime,onError},ref){
 const host=useRef<HTMLDivElement>(null),yt=useRef<YTPlayer|null>(null),callbacks=useRef({onTime,onError});callbacks.current={onTime,onError};const source=videoSource(url);const [seek,SEEK]=useState(0);
 useImperativeHandle(ref,()=>({seek(t){if(yt.current){yt.current.seekTo(t,true);yt.current.playVideo()}else SEEK(Math.floor(t))},pause(){yt.current?.pauseVideo()},rate(r){yt.current?.setPlaybackRate(r)}}),[]);
 useEffect(()=>{if(source.kind!=='youtube')return;let dead=false,timer:ReturnType<typeof setInterval>|undefined;const node=document.createElement('div');host.current?.appendChild(node);youtube().then(api=>{if(dead)return;yt.current=new api.Player(node,{videoId:source.id,playerVars:{playsinline:1,origin:location.origin},events:{onReady(){timer=setInterval(()=>{if(yt.current&&[1,2].includes(yt.current.getPlayerState()))callbacks.current.onTime(yt.current.getCurrentTime())},250)},onError(){callbacks.current.onError('原站限制嵌入或视频不可用，请打开原网页，或关联已下载视频')}}})}).catch(e=>callbacks.current.onError(e.message));return()=>{dead=true;if(timer)clearInterval(timer);yt.current?.destroy();yt.current=null;node.remove()}},[url]);
 return source.kind==='youtube'?<div ref={host} className="source-player"/>:<iframe key={seek} className="source-player" title="Bilibili 原视频" src={`https://player.bilibili.com/player.html?bvid=${source.id}&page=${source.page||1}&autoplay=0&t=${seek}`} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>;
});

export default forwardRef<SourceControl,{url:string;onTime:(t:number)=>void;onError:(m:string)=>void;external?:boolean;onConnection?:(c:boolean)=>void}>(function SourcePlayer(props,ref){return props.external&&videoSource(props.url).kind==='bilibili'?<ExternalBiliPlayer {...props} ref={ref}/>:<EmbeddedSourcePlayer {...props} ref={ref}/>});
