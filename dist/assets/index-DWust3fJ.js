(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const a of i.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function t(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(n){if(n.ep)return;n.ep=!0;const i=t(n);fetch(n.href,i)}})();let dt=1;class Wt{constructor(){this.ctx=null,this.mixBus=null,this.pitchAnalyser=null,this.bridgeNode=null,this.inputs=new Map,this.outputs=new Map}async init(){return this.ctx=new AudioContext({latencyHint:"interactive"}),this.mixBus=this.ctx.createGain(),this.pitchAnalyser=this.ctx.createAnalyser(),this.pitchAnalyser.fftSize=4096,this.pitchAnalyser.smoothingTimeConstant=0,this.mixBus.connect(this.pitchAnalyser),this.bridgeNode=this.ctx.createMediaStreamDestination(),this.mixBus.connect(this.bridgeNode),this.ctx}createInput(){const e=dt++,t=this.ctx.createGain(),s=this.ctx.createAnalyser();return s.fftSize=2048,s.smoothingTimeConstant=.8,t.connect(s),t.connect(this.mixBus),this.inputs.set(e,{id:e,stream:null,source:null,gain:t,analyser:s,muted:!1,gainValue:1}),e}connectInputStream(e,t){const s=this.inputs.get(e);if(!s)return;s.source&&s.source.disconnect(),s.stream&&s.stream.getTracks().forEach(i=>i.stop());const n=this.ctx.createMediaStreamSource(t);s.source=n,s.stream=t,this._routeSource(s,s.gain)}_routeSource(e,t){if(!e.source)return;try{e.source.disconnect()}catch{}if(e.splitter)try{e.splitter.disconnect()}catch{}e.splitter=null;const s=e.channelMode||"mix";if(s==="left"||s==="right"){const n=this.ctx.createChannelSplitter(2);e.source.connect(n),n.connect(t,s==="left"?0:1),e.splitter=n}else e.source.connect(t)}setInputChannelMode(e,t){const s=this.inputs.get(e);s&&(s.channelMode=t,this._routeSource(s,s.gain))}getInputChannelCount(e){var s,n,i,a;const t=(i=(n=(s=this.inputs.get(e))==null?void 0:s.stream)==null?void 0:n.getAudioTracks)==null?void 0:i.call(n)[0];return((a=t==null?void 0:t.getSettings)==null?void 0:a.call(t).channelCount)||1}removeInput(e){var s,n,i;const t=this.inputs.get(e);t&&((s=t.source)==null||s.disconnect(),(n=t.splitter)==null||n.disconnect(),t.gain.disconnect(),(i=t.stream)==null||i.getTracks().forEach(a=>a.stop()),this.inputs.delete(e))}switchInputDevice(e,t){this.connectInputStream(e,t)}setInputGain(e,t){const s=this.inputs.get(e);s&&(s.gainValue=t,s.muted||s.gain.gain.setTargetAtTime(t,this.ctx.currentTime,.01))}toggleInputMute(e){const t=this.inputs.get(e);if(!t)return!1;t.muted=!t.muted;const s=t.muted?0:t.gainValue;return t.gain.gain.setTargetAtTime(s,this.ctx.currentTime,.01),t.muted}getInputLevel(e){const t=this.inputs.get(e);return t?this._getLevel(t.analyser):{rms:0,peak:0,rmsDb:-100,peakDb:-100}}async addOutput(e){const t=dt++;if(this.outputs.size===0){this.mixBus.connect(this.ctx.destination),this.ctx.setSinkId&&e&&await this.ctx.setSinkId(e);const n=this.ctx.createAnalyser();n.fftSize=2048,n.smoothingTimeConstant=.8,this.mixBus.connect(n),this.outputs.set(t,{id:t,deviceId:e,primary:!0,ctx:this.ctx,gain:null,analyser:n,outputGain:this.ctx.createGain(),muted:!1,gainValue:1}),this.mixBus.disconnect(this.ctx.destination);const i=this.outputs.get(t).outputGain;this.mixBus.connect(i),i.connect(this.ctx.destination),i.connect(n),this.mixBus.disconnect(n)}else{if(this.outputs.size>=4)return-1;const n=new AudioContext({latencyHint:"interactive"});n.setSinkId&&e&&await n.setSinkId(e);const i=n.createMediaStreamSource(this.bridgeNode.stream),a=n.createGain(),c=n.createAnalyser();c.fftSize=2048,c.smoothingTimeConstant=.8,i.connect(a),a.connect(c),a.connect(n.destination),this.outputs.set(t,{id:t,deviceId:e,primary:!1,ctx:n,bridgeSource:i,gain:a,analyser:c,outputGain:a,muted:!1,gainValue:1})}return t}removeOutput(e){const t=this.outputs.get(e);t&&(t.primary?(t.outputGain.disconnect(),this.mixBus.disconnect(t.outputGain),this.mixBus.disconnect(t.analyser)):(t.bridgeSource.disconnect(),t.outputGain.disconnect(),t.ctx.close()),this.outputs.delete(e))}async switchOutputDevice(e,t){const s=this.outputs.get(e);s&&(s.deviceId=t,s.ctx.setSinkId&&await s.ctx.setSinkId(t))}setOutputGain(e,t){const s=this.outputs.get(e);s&&(s.gainValue=t,s.muted||s.outputGain.gain.setTargetAtTime(t,this.ctx.currentTime,.01))}toggleOutputMute(e){const t=this.outputs.get(e);if(!t)return!1;t.muted=!t.muted;const s=t.muted?0:t.gainValue;return t.outputGain.gain.setTargetAtTime(s,this.ctx.currentTime,.01),t.muted}getOutputLevel(e){const t=this.outputs.get(e);return t?this._getLevel(t.analyser):{rms:0,peak:0,rmsDb:-100,peakDb:-100}}_getLevel(e){const t=new Float32Array(e.fftSize);e.getFloatTimeDomainData(t);let s=0,n=0;for(let r=0;r<t.length;r++){const h=Math.abs(t[r]);s+=t[r]*t[r],h>n&&(n=h)}const i=Math.sqrt(s/t.length),a=i>0?20*Math.log10(i):-100,c=n>0?20*Math.log10(n):-100;return{rms:i,peak:n,rmsDb:a,peakDb:c}}getPitchData(){const e=this.pitchAnalyser.fftSize,t=new Float32Array(e);return this.pitchAnalyser.getFloatTimeDomainData(t),{data:t,sampleRate:this.ctx.sampleRate}}getLatency(){const e=this.ctx.baseLatency||0,t=this.ctx.outputLatency||0;return(e+t)*1e3}getLatencyBreakdown(){const e=(this.ctx.baseLatency||0)*1e3,t=(this.ctx.outputLatency||0)*1e3;return{baseMs:e,outputMs:t}}getBridgeLatency(){var e;return 128/(((e=this.ctx)==null?void 0:e.sampleRate)||48e3)*1e3}async reinitWithBufferSize(e){if(this._reinitInProgress)return this.ctx;this._reinitInProgress=!0;try{return await this._doReinit(e)}finally{this._reinitInProgress=!1}}async _doReinit(e){var i,a,c,r,h;const t=e!=null?e/(((i=this.ctx)==null?void 0:i.sampleRate)||48e3):"interactive",s=[];for(const[l,d]of this.inputs)s.push({id:l,stream:d.stream,gainValue:d.gainValue,muted:d.muted}),d.source&&d.source.disconnect(),d.gain.disconnect(),d.analyser.disconnect();const n=[];for(const[l,d]of this.outputs)n.push({id:l,deviceId:d.deviceId,primary:d.primary,gainValue:d.gainValue,muted:d.muted}),!d.primary&&d.ctx?((a=d.bridgeSource)==null||a.disconnect(),(c=d.outputGain)==null||c.disconnect(),d.ctx.close()):d.primary&&((r=d.outputGain)==null||r.disconnect(),(h=this.mixBus)==null||h.disconnect(d.outputGain));this.outputs.clear(),this.mixBus&&this.mixBus.disconnect(),this.ctx&&await this.ctx.close(),this.ctx=new AudioContext({latencyHint:t}),this.mixBus=this.ctx.createGain(),this.pitchAnalyser=this.ctx.createAnalyser(),this.pitchAnalyser.fftSize=4096,this.pitchAnalyser.smoothingTimeConstant=0,this.mixBus.connect(this.pitchAnalyser),this.bridgeNode=this.ctx.createMediaStreamDestination(),this.mixBus.connect(this.bridgeNode);for(const l of s){const d=this.inputs.get(l.id);if(!d)continue;const p=this.ctx.createGain(),u=this.ctx.createAnalyser();if(u.fftSize=2048,u.smoothingTimeConstant=.8,p.connect(u),p.connect(this.mixBus),d.gain=p,d.analyser=u,d.gainValue=l.gainValue,d.muted=l.muted,l.muted?p.gain.value=0:p.gain.value=l.gainValue,d.stream=l.stream,l.stream&&l.stream.active)try{const A=this.ctx.createMediaStreamSource(l.stream);d.source=A,d.splitter=null,this._routeSource(d,p)}catch(A){console.warn("Failed to reconnect stream after reinit:",A),d.source=null}else d.source=null}for(const l of n)if(l.primary){const d=this.ctx.createGain(),p=this.ctx.createAnalyser();if(p.fftSize=2048,p.smoothingTimeConstant=.8,this.mixBus.connect(d),d.connect(this.ctx.destination),d.connect(p),l.muted?d.gain.value=0:d.gain.value=l.gainValue,this.ctx.setSinkId&&l.deviceId)try{await this.ctx.setSinkId(l.deviceId)}catch{}this.outputs.set(l.id,{id:l.id,deviceId:l.deviceId,primary:!0,ctx:this.ctx,gain:null,analyser:p,outputGain:d,muted:l.muted,gainValue:l.gainValue})}else{const d=new AudioContext({latencyHint:"interactive"});if(d.setSinkId&&l.deviceId)try{await d.setSinkId(l.deviceId)}catch{}const p=d.createMediaStreamSource(this.bridgeNode.stream),u=d.createGain(),A=d.createAnalyser();A.fftSize=2048,A.smoothingTimeConstant=.8,p.connect(u),u.connect(A),u.connect(d.destination),l.muted?u.gain.value=0:u.gain.value=l.gainValue,this.outputs.set(l.id,{id:l.id,deviceId:l.deviceId,primary:!1,ctx:d,bridgeSource:p,gain:u,analyser:A,outputGain:u,muted:l.muted,gainValue:l.gainValue})}return this.ctx}destroy(){for(const[e]of this.inputs)this.removeInput(e);for(const[e,t]of this.outputs)t.primary||t.ctx.close();this.outputs.clear(),this.ctx&&this.ctx.close()}}class jt{constructor(){this.devices={inputs:[],outputs:[]},this.onDevicesChanged=null}async enumerate(){const e=await navigator.mediaDevices.enumerateDevices();return this.devices.inputs=e.filter(t=>t.kind==="audioinput"),this.devices.outputs=e.filter(t=>t.kind==="audiooutput"),this.devices}listenForChanges(){navigator.mediaDevices.addEventListener("devicechange",async()=>{var e;await this.enumerate(),(e=this.onDevicesChanged)==null||e.call(this,this.devices)})}async requestPermission(){(await navigator.mediaDevices.getUserMedia({audio:!0})).getTracks().forEach(t=>t.stop())}async getInputStream(e){const t={echoCancellation:{ideal:!1},noiseSuppression:{ideal:!1},autoGainControl:{ideal:!1},channelCount:{ideal:2},latency:{ideal:0}};return e&&(t.deviceId={exact:e}),navigator.mediaDevices.getUserMedia({audio:t})}}const Jt=.15;class Ut{constructor(){this._yinBuffer=null}detect(e,t){const s=Math.min(Math.floor(e.length/2),Math.ceil(t/50)),n=Math.min(e.length-s,Math.max(1024,s)),i=e.length-n-s,a=s;(!this._yinBuffer||this._yinBuffer.length!==a)&&(this._yinBuffer=new Float32Array(a));const c=this._yinBuffer;let r=0;for(let A=i;A<i+n+s;A++)r+=e[A]*e[A];if(r/(n+s)<1e-7)return null;c[0]=0;for(let A=1;A<a;A++){let g=0;for(let D=0;D<n;D++){const C=e[i+D]-e[i+D+A];g+=C*C}c[A]=g}c[0]=1;let h=0;for(let A=1;A<a;A++)h+=c[A],c[A]*=A/h;let l=-1;for(let A=2;A<a;A++)if(c[A]<Jt){for(;A+1<a&&c[A+1]<c[A];)A++;l=A;break}if(l===-1)return null;const d=l;let p;if(d>0&&d<a-1){const A=c[d-1],g=c[d],D=c[d+1],C=(D-A)/(2*(2*g-D-A));p=d+(isFinite(C)?C:0)}else p=d;const u=t/p;return u<50||u>5e3?null:u}}class Tt{constructor(e){this.ctx=e,this.bpm=120,this.beatsPerMeasure=4,this.volume=.5,this._playing=!1,this._currentBeat=0,this._nextNoteTime=0,this._timerId=null,this._scheduleAheadTime=.1,this._lookaheadMs=25,this._gainNode=this.ctx.createGain(),this._gainNode.gain.value=this.volume,this._gainNode.connect(this.ctx.destination),this.onBeat=null}get playing(){return this._playing}start(){this._playing||(this._playing=!0,this._currentBeat=0,this._nextNoteTime=this.ctx.currentTime,this._schedule(),this._timerId=setInterval(()=>this._schedule(),this._lookaheadMs))}stop(){this._playing&&(this._playing=!1,this._timerId!==null&&(clearInterval(this._timerId),this._timerId=null))}setVolume(e){this.volume=e,this._gainNode.gain.setTargetAtTime(e,this.ctx.currentTime,.01)}_schedule(){for(;this._nextNoteTime<this.ctx.currentTime+this._scheduleAheadTime;)this._scheduleBeat(this._currentBeat,this._nextNoteTime),this._advanceBeat()}_scheduleBeat(e,t){var r;const s=e===0,n=s?1e3:800,i=.06,a=this.ctx.createOscillator();a.type="sine",a.frequency.value=n;const c=this.ctx.createGain();c.gain.setValueAtTime(s?1:.7,t),c.gain.exponentialRampToValueAtTime(.001,t+i),a.connect(c),c.connect(this._gainNode),a.start(t),a.stop(t+i),(r=this.onBeat)==null||r.call(this,e,t)}_advanceBeat(){const e=60/this.bpm;this._nextNoteTime+=e,this._currentBeat=(this._currentBeat+1)%this.beatsPerMeasure}destroy(){this.stop(),this._gainNode.disconnect()}}class P{constructor(e,t={}){this.onChange=null,this._value="",this._items=[],this._groups=[],this._isGrouped=!1,this._open=!1,this.el=document.createElement("div"),this.el.className="dropdown",t.title&&(this.el.title=t.title),this._trigger=document.createElement("button"),this._trigger.type="button",this._trigger.className="dropdown-trigger",this._trigger.setAttribute("aria-haspopup","listbox"),this._trigger.setAttribute("aria-expanded","false"),this._triggerText=document.createElement("span"),this._triggerText.className="dropdown-trigger-text",this._triggerText.textContent=t.placeholder||"Select...",this._trigger.appendChild(this._triggerText);const s=document.createElement("span");s.className="dropdown-arrow",this._trigger.appendChild(s),this.el.appendChild(this._trigger),this._listbox=document.createElement("div"),this._listbox.className="dropdown-listbox",this._listbox.setAttribute("role","listbox"),this.el.appendChild(this._listbox),this._trigger.addEventListener("click",n=>{n.stopPropagation(),this._toggle()}),this._trigger.addEventListener("keydown",n=>this._onKeydown(n)),this._listbox.addEventListener("keydown",n=>this._onKeydown(n)),this._outsideClickHandler=n=>{this.el.contains(n.target)||this.close()},e.appendChild(this.el)}get value(){return this._value}set value(e){this._value=e,this._updateDisplay(),this._updateSelection()}setItems(e){this._items=e,this._groups=[],this._isGrouped=!1,this._renderItems(),this._updateDisplay()}setGroupedItems(e){this._groups=e,this._items=[],this._isGrouped=!0,this._renderGrouped(),this._updateDisplay()}_hasOptions(){return this._isGrouped?this._groups.some(e=>e.items.length>0):this._items.length>0}_renderEmpty(){const e=document.createElement("div");e.className="dropdown-empty",e.textContent="No options available",this._listbox.appendChild(e)}_renderItems(){if(this._listbox.replaceChildren(),!this._items.length){this._renderEmpty();return}for(const e of this._items)this._listbox.appendChild(this._createOption(e))}_renderGrouped(){if(this._listbox.replaceChildren(),!this._groups.some(e=>e.items.length>0)){this._renderEmpty();return}for(const e of this._groups){const t=document.createElement("div");t.className="dropdown-group";const s=document.createElement("div");s.className="dropdown-group-label",s.textContent=e.label,t.appendChild(s);for(const n of e.items)t.appendChild(this._createOption(n));this._listbox.appendChild(t)}}_createOption(e){const t=document.createElement("div");t.className="dropdown-option",t.setAttribute("role","option"),t.dataset.value=e.value,e.value===this._value&&t.classList.add("selected");const s=document.createElement("span");s.className="dropdown-check",s.textContent="✓",t.appendChild(s);const n=document.createElement("span");return n.className="dropdown-option-text",n.textContent=e.label,t.appendChild(n),t.addEventListener("click",i=>{i.stopPropagation(),this._select(e.value),this.close()}),t}_select(e){var t;e!==this._value&&(this._value=e,this._updateDisplay(),this._updateSelection(),(t=this.onChange)==null||t.call(this,e))}_updateDisplay(){const t=(this._isGrouped?this._groups.flatMap(s=>s.items):this._items).find(s=>s.value===this._value);this._triggerText.textContent=t?t.label:this._value||"Select..."}_updateSelection(){const e=this._listbox.querySelectorAll(".dropdown-option");for(const t of e)t.classList.toggle("selected",t.dataset.value===this._value)}_toggle(){this._open?this.close():this.open()}open(){if(this._open)return;this._open=!0,this.el.classList.add("open"),this._trigger.setAttribute("aria-expanded","true"),this._positionListbox(),document.addEventListener("click",this._outsideClickHandler,!0);const e=this._listbox.querySelector(".dropdown-option.selected");e&&e.scrollIntoView({block:"nearest"})}close(){this._open&&(this._open=!1,this.el.classList.remove("open"),this._trigger.setAttribute("aria-expanded","false"),document.removeEventListener("click",this._outsideClickHandler,!0))}_positionListbox(){this._listbox.classList.remove("dropdown-listbox--above");const e=this._trigger.getBoundingClientRect();window.innerHeight-e.bottom<200&&this._listbox.classList.add("dropdown-listbox--above")}_onKeydown(e){switch(e.key){case"Escape":this.close(),this._trigger.focus(),e.preventDefault();break;case"Enter":case" ":this._open||(this.open(),e.preventDefault());break;case"ArrowDown":if(e.preventDefault(),!this._open){this.open();return}this._moveFocus(1);break;case"ArrowUp":if(e.preventDefault(),!this._open){this.open();return}this._moveFocus(-1);break}}_moveFocus(e){const t=[...this._listbox.querySelectorAll(".dropdown-option")];if(!t.length)return;const s=this._listbox.querySelector(".dropdown-option.focused");let n=s?t.indexOf(s)+e:e>0?0:t.length-1;n=Math.max(0,Math.min(t.length-1,n)),s&&s.classList.remove("focused"),t[n].classList.add("focused"),t[n].scrollIntoView({block:"nearest"});const i=t[n].dataset.value;this._select(i)}destroy(){this.close(),this.el.remove()}}class Yt{constructor(e,t,s){this.kind=s,this.onChange=null,this.el=document.createElement("div"),this.el.className="strip-device",this.dropdown=new P(this.el,{title:`Select ${s} device`,placeholder:s==="input"?"Mic...":"Speaker..."}),this.dropdown.onChange=n=>{var i;(i=this.onChange)==null||i.call(this,n)},e.appendChild(this.el)}update(e){const t=this.kind==="input"?e.inputs:e.outputs,s=this.dropdown.value,n=t.map(i=>({value:i.deviceId,label:Zt(i.label,this.kind,i.deviceId)}));this.dropdown.setItems(n),n.some(i=>i.value===s)&&(this.dropdown.value=s)}get value(){return this.dropdown.value}set value(e){this.dropdown.value=e}}function Zt(o,e,t){if(!o)return`${e==="input"?"Mic":"Speaker"} ${t.slice(0,6)}`;let s=o;s=s.replace(/^Default\s*[-\u2013]\s*/i,""),s=s.replace(/^Communications\s*[-\u2013]\s*/i,"");const n=s.match(/^(.{6,}?)\s*\([^)]{15,}\)$/);return n&&(s=n[1].trim()),s||o}class es{constructor(e){this.container=e,this.onAddInput=null,this.onRemoveInput=null,this.onAddOutput=null,this.onRemoveOutput=null,this.onInputDeviceChange=null,this.onOutputDeviceChange=null,this.onInputGainChange=null,this.onOutputGainChange=null,this.onInputMuteToggle=null,this.onOutputMuteToggle=null,this.onBufferSizeChange=null,this.inputStrips=new Map,this.outputStrips=new Map,this.devices={inputs:[],outputs:[]},this._build()}_build(){this.container.innerHTML="";const e=document.createElement("div");e.className="mixer-panel";const t=document.createElement("div");t.className="mixer-section";const s=document.createElement("div");s.className="section-header";const n=document.createElement("span");n.className="section-title section-title--input",n.textContent="Inputs",s.appendChild(n),this.addInputBtn=document.createElement("button"),this.addInputBtn.className="add-strip-btn",this.addInputBtn.textContent="+ Add Input",this.addInputBtn.addEventListener("click",()=>{var A;return(A=this.onAddInput)==null?void 0:A.call(this)}),s.appendChild(this.addInputBtn),this.inputStripContainer=document.createElement("div"),this.inputStripContainer.className="strip-group",t.appendChild(s),t.appendChild(this.inputStripContainer);const i=document.createElement("div");i.className="routing-visual";const a=document.createElement("div");a.className="routing-line",i.appendChild(a);const c=document.createElement("div");c.className="routing-info";const r=document.createElement("span");r.className="routing-arrow",r.textContent="→",c.appendChild(r),this._latencyWrap=document.createElement("div"),this._latencyWrap.className="latency-wrap",this.latencyEl=document.createElement("span"),this.latencyEl.className="routing-latency",this._latencyWrap.appendChild(this.latencyEl),this._latencyTooltip=document.createElement("div"),this._latencyTooltip.className="latency-tooltip",this._latencyWrap.appendChild(this._latencyTooltip),c.appendChild(this._latencyWrap);const h=document.createElement("span");h.className="routing-arrow",h.textContent="→",c.appendChild(h),i.appendChild(c);const l=document.createElement("div");l.className="routing-line",i.appendChild(l);const d=document.createElement("div");d.className="mixer-section";const p=document.createElement("div");p.className="section-header";const u=document.createElement("span");u.className="section-title section-title--output",u.textContent="Outputs",p.appendChild(u),this.addOutputBtn=document.createElement("button"),this.addOutputBtn.className="add-strip-btn",this.addOutputBtn.textContent="+ Add Output",this.addOutputBtn.addEventListener("click",()=>{var A;return(A=this.onAddOutput)==null?void 0:A.call(this)}),p.appendChild(this.addOutputBtn),this.outputStripContainer=document.createElement("div"),this.outputStripContainer.className="strip-group",d.appendChild(p),d.appendChild(this.outputStripContainer),e.appendChild(t),e.appendChild(i),e.appendChild(d),this.container.appendChild(e),this.container.appendChild(this._buildBufferSizeRow())}_buildBufferSizeRow(){const e=document.createElement("div");e.className="buffer-size-row";const t=document.createElement("span");t.className="buffer-size-label",t.textContent="Buffer Size",e.appendChild(t);const s=document.createElement("div");return s.className="buffer-size-dropdown-wrap",this._bufferDropdown=new P(s,{placeholder:"Auto"}),this._bufferDropdown.setItems([{value:"",label:"Auto (default)"},{value:"64",label:"64 samples"},{value:"128",label:"128 samples"},{value:"256",label:"256 samples"},{value:"512",label:"512 samples"},{value:"1024",label:"1024 samples"}]),this._bufferDropdown.value="",this._bufferDropdown.onChange=n=>{var a;const i=n?parseInt(n,10):null;this._updateBufferEstimate(i),(a=this.onBufferSizeChange)==null||a.call(this,i)},e.appendChild(s),this._bufferEstimate=document.createElement("span"),this._bufferEstimate.className="buffer-size-estimate",e.appendChild(this._bufferEstimate),e}_updateBufferEstimate(e){if(!e){this._bufferEstimate.textContent="";return}const t=e/48e3*1e3;this._bufferEstimate.textContent=`~${t.toFixed(1)} ms at 48kHz`}addInputStrip(e,t){const s=this._createStrip("IN","input",e);return s.deviceSelector.onChange=n=>{var i;return(i=this.onInputDeviceChange)==null?void 0:i.call(this,e,n)},s.slider.addEventListener("input",()=>{var i;const n=parseFloat(s.slider.value);s.gainLabel.textContent=`${Math.round(n*100)}%`,(i=this.onInputGainChange)==null||i.call(this,e,n)}),s.muteBtn.addEventListener("click",()=>{var n;return(n=this.onInputMuteToggle)==null?void 0:n.call(this,e)}),s.removeBtn.addEventListener("click",()=>{var n;return(n=this.onRemoveInput)==null?void 0:n.call(this,e)}),s.deviceSelector.update(this.devices),t&&(s.deviceSelector.value=t),this.inputStripContainer.appendChild(s.el),this.inputStrips.set(e,s),this._updateRemoveButtons(),s}removeInputStrip(e){const t=this.inputStrips.get(e);t&&(t.el.remove(),this.inputStrips.delete(e),this._updateRemoveButtons())}addOutputStrip(e,t){const s=this._createStrip("OUT","output",e);return s.deviceSelector.onChange=n=>{var i;return(i=this.onOutputDeviceChange)==null?void 0:i.call(this,e,n)},s.slider.addEventListener("input",()=>{var i;const n=parseFloat(s.slider.value);s.gainLabel.textContent=`${Math.round(n*100)}%`,(i=this.onOutputGainChange)==null||i.call(this,e,n)}),s.muteBtn.addEventListener("click",()=>{var n;return(n=this.onOutputMuteToggle)==null?void 0:n.call(this,e)}),s.removeBtn.addEventListener("click",()=>{var n;return(n=this.onRemoveOutput)==null?void 0:n.call(this,e)}),s.deviceSelector.update(this.devices),t&&(s.deviceSelector.value=t),this.outputStripContainer.appendChild(s.el),this.outputStrips.set(e,s),this._updateRemoveButtons(),s}removeOutputStrip(e){const t=this.outputStrips.get(e);t&&(t.el.remove(),this.outputStrips.delete(e),this._updateRemoveButtons())}_createStrip(e,t,s){const n=document.createElement("div");n.className="mixer-strip",n.dataset.channelId=s,n.dataset.kind=t;const i=document.createElement("div");i.className="strip-label",i.textContent=e,n.appendChild(i);const a=new Yt(n,e,t),c=document.createElement("canvas");c.className="meter-canvas",c.width=12,c.height=40,n.appendChild(c);const r=document.createElement("input");r.type="range",r.className="gain-slider",r.min="0",r.max="2",r.step="0.01",r.value="1",n.appendChild(r);const h=document.createElement("div");h.className="gain-value",h.textContent="100%",n.appendChild(h);const l=document.createElement("button");l.className="mute-btn",l.textContent="M",n.appendChild(l);const d=document.createElement("button");return d.className="remove-btn",d.textContent="×",d.title="Remove",n.appendChild(d),{el:n,deviceSelector:a,meterCanvas:c,slider:r,gainLabel:h,muteBtn:l,removeBtn:d}}_updateRemoveButtons(){const e=this.inputStrips.size<=1;for(const s of this.inputStrips.values())s.removeBtn.style.display=e?"none":"";const t=this.outputStrips.size<=1;for(const s of this.outputStrips.values())s.removeBtn.style.display=t?"none":""}setInputMuted(e,t){const s=this.inputStrips.get(e);s&&s.muteBtn.classList.toggle("muted",t)}setInputDevice(e,t){const s=this.inputStrips.get(e);s&&t&&(s.deviceSelector.value=t)}setOutputMuted(e,t){const s=this.outputStrips.get(e);s&&s.muteBtn.classList.toggle("muted",t)}updateDevices(e){this.devices=e;for(const t of this.inputStrips.values())t.deviceSelector.update(e);for(const t of this.outputStrips.values())t.deviceSelector.update(e)}updateLatency(e,t,s){let n=`${e.toFixed(1)} ms`;const i=t!==void 0&&this.outputStrips.size>1;if(i&&(n+=` (+${t.toFixed(1)} ms bridge)`),this.latencyEl.textContent=n,s){let a=`Base latency: ${s.baseMs.toFixed(1)} ms
`;a+=`Output latency: ${s.outputMs.toFixed(1)} ms
`,i&&(a+=`Bridge latency: ${t.toFixed(1)} ms
`);const c=s.baseMs+s.outputMs+(i?t:0);a+=`Total: ${c.toFixed(1)} ms`,this._latencyTooltip.textContent=a}}}const fe=-60,ht=0,ut=1500,ts=20;class wt{constructor(e){this.canvas=e,this.canvasCtx=e.getContext("2d"),this.peakHoldDb=fe,this.peakHoldTime=0,this.lastPeakDb=fe}draw(e,t){const s=performance.now(),n=this.canvasCtx,i=this.canvas.width,a=this.canvas.height;if(t>=this.peakHoldDb)this.peakHoldDb=t,this.peakHoldTime=s;else if(s-this.peakHoldTime>ut){const u=(s-this.peakHoldTime-ut)/1e3;this.peakHoldDb=Math.max(t,this.peakHoldDb-ts*u)}n.fillStyle="#0f0f1a",n.fillRect(0,0,i,a);const r=this._dbToNorm(e)*a,h=a-r,l=n.createLinearGradient(0,a,0,0);l.addColorStop(0,"#00e676"),l.addColorStop(.6,"#00e676"),l.addColorStop(.8,"#ffea00"),l.addColorStop(.95,"#ff1744"),l.addColorStop(1,"#ff1744"),n.fillStyle=l,n.fillRect(2,h,i-4,r);const d=this._dbToNorm(this.peakHoldDb),p=a-d*a;n.fillStyle="#ffffff",n.fillRect(1,p-1,i-2,2),n.fillStyle="rgba(255,255,255,0.15)";for(const u of[-6,-12,-24,-48]){const A=this._dbToNorm(u),g=a-A*a;n.fillRect(0,g,i,1)}}_dbToNorm(e){return(Math.max(fe,Math.min(ht,e))-fe)/(ht-fe)}}const ss=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],Je=440,Ue=69;function Le(o){return Math.round(12*Math.log2(o/Je)+Ue)}function ae(o){return Je*Math.pow(2,(o-Ue)/12)}function ve(o){const e=ss[o%12],t=Math.floor(o/12)-1;return{name:e,octave:t}}function Lt(o){const e=12*Math.log2(o/Je)+Ue,t=Math.round(e);return(e-t)*100}function ns(o){if(!o||o<20||o>1e4)return null;const e=Le(o),{name:t,octave:s}=ve(e),n=Lt(o),i=ae(e);return{name:t,octave:s,midi:e,cents:n,frequency:o,expectedFreq:i}}class is{constructor(e){this.container=e,this._build(),this._lastNote=null}_build(){this.container.innerHTML="";const e=document.createElement("div");e.className="pitch-display";const t=document.createElement("div");t.className="pitch-left",this.noteEl=document.createElement("div"),this.noteEl.className="pitch-note inactive",this.noteEl.innerHTML="&mdash;",t.appendChild(this.noteEl),this.freqEl=document.createElement("div"),this.freqEl.className="pitch-frequency",this.freqEl.textContent="--- Hz",t.appendChild(this.freqEl),e.appendChild(t);const s=document.createElement("div");s.className="cents-gauge";const n=document.createElement("div");n.className="cents-bar-bg";const i=document.createElement("div");i.className="cents-center-line",n.appendChild(i),this.indicator=document.createElement("div"),this.indicator.className="cents-indicator",n.appendChild(this.indicator),s.appendChild(n);const a=document.createElement("div");a.className="cents-labels",a.innerHTML="<span>-50</span><span>0</span><span>+50</span>",s.appendChild(a),this.centsValueEl=document.createElement("div"),this.centsValueEl.className="cents-value",this.centsValueEl.textContent="",s.appendChild(this.centsValueEl),e.appendChild(s),this.container.appendChild(e)}update(e){if(!e){this.noteEl.classList.add("inactive");return}const t=ns(e);if(!t){this.noteEl.classList.add("inactive");return}this.noteEl.classList.remove("inactive"),this.noteEl.innerHTML=`${t.name}<span class="octave">${t.octave}</span>`,this.freqEl.textContent=`${t.frequency.toFixed(1)} Hz`;const s=t.cents,i=50+Math.max(-50,Math.min(50,s))/50*50;this.indicator.style.left=`${i}%`;const a=Math.abs(s);let c;a<5?c="var(--green)":a<15?c="var(--yellow)":c="var(--red)",this.indicator.style.background=c;const r=s>=0?"+":"";this.centsValueEl.textContent=`${r}${s.toFixed(1)} cents`,this.centsValueEl.style.color=c}}const ie=440,S=o=>ie*Math.pow(2,o/12),ee={"violin-standard":{label:"Violin (GDAE)",family:"Violin",strings:[{name:"G",note:"G",octave:3,frequency:S(-14)},{name:"D",note:"D",octave:4,frequency:S(-7)},{name:"A",note:"A",octave:4,frequency:ie},{name:"E",note:"E",octave:5,frequency:S(7)}]},"violin-drop-g":{label:"Violin Drop G (GDGD)",family:"Violin",strings:[{name:"G",note:"G",octave:3,frequency:S(-14)},{name:"D",note:"D",octave:4,frequency:S(-7)},{name:"G",note:"G",octave:4,frequency:S(-2)},{name:"D",note:"D",octave:5,frequency:S(5)}]},"violin-cross":{label:"Violin Cross (AEAE)",family:"Violin",strings:[{name:"A",note:"A",octave:3,frequency:S(-12)},{name:"E",note:"E",octave:4,frequency:S(-5)},{name:"A",note:"A",octave:4,frequency:ie},{name:"E",note:"E",octave:5,frequency:S(7)}]},"5string-violin":{label:"5-String Violin (CGDAE)",family:"Violin",strings:[{name:"C",note:"C",octave:3,frequency:S(-21)},{name:"G",note:"G",octave:3,frequency:S(-14)},{name:"D",note:"D",octave:4,frequency:S(-7)},{name:"A",note:"A",octave:4,frequency:ie},{name:"E",note:"E",octave:5,frequency:S(7)}]},"viola-standard":{label:"Viola (CGDA)",family:"Viola",strings:[{name:"C",note:"C",octave:3,frequency:S(-21)},{name:"G",note:"G",octave:3,frequency:S(-14)},{name:"D",note:"D",octave:4,frequency:S(-7)},{name:"A",note:"A",octave:4,frequency:ie}]},"cello-standard":{label:"Cello (CGDA)",family:"Cello",strings:[{name:"C",note:"C",octave:2,frequency:S(-33)},{name:"G",note:"G",octave:2,frequency:S(-26)},{name:"D",note:"D",octave:3,frequency:S(-19)},{name:"A",note:"A",octave:3,frequency:S(-12)}]},"bass-standard":{label:"Double Bass (EADG)",family:"Double Bass",strings:[{name:"E",note:"E",octave:1,frequency:S(-41)},{name:"A",note:"A",octave:1,frequency:S(-36)},{name:"D",note:"D",octave:2,frequency:S(-31)},{name:"G",note:"G",octave:2,frequency:S(-26)}]},"bass-5string":{label:"5-String Bass (BEADG)",family:"Double Bass",strings:[{name:"B",note:"B",octave:0,frequency:S(-46)},{name:"E",note:"E",octave:1,frequency:S(-41)},{name:"A",note:"A",octave:1,frequency:S(-36)},{name:"D",note:"D",octave:2,frequency:S(-31)},{name:"G",note:"G",octave:2,frequency:S(-26)}]},"fiddle-open-g":{label:"Fiddle Open G (GDGB)",family:"Fiddle",strings:[{name:"G",note:"G",octave:3,frequency:S(-14)},{name:"D",note:"D",octave:4,frequency:S(-7)},{name:"G",note:"G",octave:4,frequency:S(-2)},{name:"B",note:"B",octave:4,frequency:S(2)}]},"fiddle-open-d":{label:"Fiddle Open D (DADF#)",family:"Fiddle",strings:[{name:"D",note:"D",octave:3,frequency:S(-19)},{name:"A",note:"A",octave:3,frequency:S(-12)},{name:"D",note:"D",octave:4,frequency:S(-7)},{name:"F#",note:"F#",octave:4,frequency:S(-3)}]},"fiddle-calico":{label:"Fiddle Calico (AEAC#)",family:"Fiddle",strings:[{name:"A",note:"A",octave:3,frequency:S(-12)},{name:"E",note:"E",octave:4,frequency:S(-5)},{name:"A",note:"A",octave:4,frequency:ie},{name:"C#",note:"C#",octave:5,frequency:S(4)}]},hardingfele:{label:"Hardingfele (ADAE)",family:"Hardanger",strings:[{name:"A",note:"A",octave:3,frequency:S(-12)},{name:"D",note:"D",octave:4,frequency:S(-7)},{name:"A",note:"A",octave:4,frequency:ie},{name:"E",note:"E",octave:5,frequency:S(7)}]},erhu:{label:"Erhu (DA)",family:"Erhu",strings:[{name:"D",note:"D",octave:4,frequency:S(-7)},{name:"A",note:"A",octave:4,frequency:ie}]}},De="violin-standard";class as{constructor(e){this.container=e,this.currentTuning=De,this.currentFrequency=null,this.onTuningChange=null,this._build()}_build(){this.container.innerHTML="";const e=document.createElement("div");e.className="tuning-panel";const t=document.createElement("div");t.className="tuning-header";const s=document.createElement("span");s.className="tuning-label",s.textContent="Tuning",t.appendChild(s);const n=document.createElement("div");n.className="tuning-select-wrap",this.presetDropdown=new P(n,{placeholder:"Select tuning..."});const i={};for(const[c,r]of Object.entries(ee))i[r.family]||(i[r.family]=[]),i[r.family].push({key:c,preset:r});const a=[];for(const[c,r]of Object.entries(i))a.push({label:c,items:r.map(({key:h,preset:l})=>({value:h,label:l.label}))});this.presetDropdown.setGroupedItems(a),this.presetDropdown.value=De,this.presetDropdown.onChange=c=>{this.currentTuning=c,this._renderStrings(),this.onTuningChange&&this.onTuningChange(this.currentTuning)},t.appendChild(n),e.appendChild(t),this.stringsContainer=document.createElement("div"),this.stringsContainer.className="tuning-strings",e.appendChild(this.stringsContainer),this.container.appendChild(e),this._renderStrings()}_renderStrings(){const e=ee[this.currentTuning];if(e){this.stringsContainer.innerHTML="",this.stringEls=[];for(const t of e.strings){const s=document.createElement("div");s.className="tuning-string";const n=document.createElement("div");n.className="tuning-string-note",n.textContent=t.name,s.appendChild(n);const i=document.createElement("div");i.className="tuning-string-octave",i.textContent=t.octave,s.appendChild(i);const a=document.createElement("div");a.className="tuning-string-freq",a.textContent=`${t.frequency.toFixed(1)} Hz`,s.appendChild(a);const c=document.createElement("div");c.className="tuning-string-indicator",s.appendChild(c),this.stringsContainer.appendChild(s),this.stringEls.push({el:s,indicator:c,frequency:t.frequency,note:t.name})}}}update(e){if(this.currentFrequency=e,!ee[this.currentTuning]||!this.stringEls)return;for(const a of this.stringEls)a.el.classList.remove("active","in-tune","close","off"),a.indicator.textContent="";if(!e)return;let s=null,n=1/0;for(const a of this.stringEls){const c=1200*Math.log2(e/a.frequency);Math.abs(c)<Math.abs(n)&&(n=c,s=a)}if(!s||Math.abs(n)>100)return;s.el.classList.add("active");const i=Math.abs(n);i<5?(s.el.classList.add("in-tune"),s.indicator.textContent="✓"):i<15?(s.el.classList.add("close"),s.indicator.textContent=n>0?"↑":"↓"):(s.el.classList.add("off"),s.indicator.textContent=n>0?"↑↑":"↓↓")}}const os=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],pt=13;function kt(o){const e=12*Math.log2(o/440);return(Math.round(e)%12+12+9)%12}function cs(o){return os[kt(o)]}class rs{constructor(e){this.container=e,this.currentTuning=De,this.rows=[],this._scaleData=null,this._build(),this.setTuning(De)}_build(){this.el=document.createElement("div"),this.el.className="fingerboard",this.container.appendChild(this.el)}setTuning(e){this.currentTuning=e;const t=ee[e];if(t){this.el.innerHTML="",this.rows=[];for(const s of t.strings){const n=document.createElement("div");n.className="fb-string-row";const i=document.createElement("span");i.className="fb-string-label",i.textContent=s.name,n.appendChild(i);const a=[];for(let c=0;c<pt;c++){const r=document.createElement("span");r.className="fb-position",c===0&&r.classList.add("open");const h=s.frequency*Math.pow(2,c/12),l=cs(h),d=kt(h);r.title=c===0?`${s.name} (open)`:l,r.setAttribute("data-note",c===0?s.name:l),r.dataset.pitchClass=d,n.appendChild(r),a.push(r)}this.el.appendChild(n),this.rows.push({el:n,positions:a,frequency:s.frequency})}this._applyScaleHighlights()}}setScale(e){this._scaleData=e,this._applyScaleHighlights()}_applyScaleHighlights(){for(const e of this.rows)for(const t of e.positions){if(t.classList.remove("scale-tone","scale-root"),!this._scaleData)continue;const s=parseInt(t.dataset.pitchClass,10);this._scaleData.pitchClasses.has(s)&&(t.classList.add("scale-tone"),s===this._scaleData.root&&t.classList.add("scale-root"))}}update(e){for(const i of this.rows){i.el.classList.remove("bowed");for(const a of i.positions)a.classList.remove("active")}if(!e)return;let t=null,s=-1,n=1/0;for(const i of this.rows){const a=12*Math.log2(e/i.frequency);if(a<-.5||a>12.5)continue;const c=Math.round(a);if(c<0||c>=pt)continue;const r=Math.abs(a-c);r<n&&(n=r,t=i,s=c)}t&&s>=0&&(t.el.classList.add("bowed"),t.positions[s].classList.add("active"))}setTrainerTarget(e,t){for(const s of this.rows)for(const n of s.positions)n.classList.remove("trainer-target");if(e>=0&&e<this.rows.length){const s=this.rows[e].positions[t];s&&s.classList.add("trainer-target")}}markTrainerHit(e,t){if(e<0||e>=this.rows.length)return;const s=this.rows[e].positions[t];s&&(s.classList.remove("trainer-target"),s.classList.add("trainer-hit"),setTimeout(()=>{s.classList.remove("trainer-hit"),s.classList.add("trainer-done")},300))}clearTrainerState(){for(const e of this.rows)for(const t of e.positions)t.classList.remove("trainer-target","trainer-hit","trainer-done")}}const ls=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],ds=["Violin","Viola","Cello","Double Bass","Fiddle","Hardanger","Erhu"],Qe={major:{label:"Major (Ionian)",intervals:[0,2,4,5,7,9,11],difficulty:1,instruments:["Violin","Viola","Cello","Double Bass","Fiddle","Hardanger","Erhu"]},"natural-minor":{label:"Natural Minor (Aeolian)",intervals:[0,2,3,5,7,8,10],difficulty:1,instruments:["Violin","Viola","Cello","Double Bass","Fiddle","Hardanger","Erhu"]},"major-pentatonic":{label:"Major Pentatonic",intervals:[0,2,4,7,9],difficulty:1,instruments:["Violin","Viola","Cello","Double Bass","Fiddle","Erhu"]},"minor-pentatonic":{label:"Minor Pentatonic",intervals:[0,3,5,7,10],difficulty:1,instruments:["Violin","Viola","Cello","Double Bass","Fiddle","Erhu"]},"harmonic-minor":{label:"Harmonic Minor",intervals:[0,2,3,5,7,8,11],difficulty:2,instruments:["Violin","Viola","Cello","Double Bass","Fiddle","Hardanger","Erhu"]},"melodic-minor":{label:"Melodic Minor",intervals:[0,2,3,5,7,9,11],difficulty:2,instruments:["Violin","Viola","Cello","Double Bass"]},dorian:{label:"Dorian",intervals:[0,2,3,5,7,9,10],difficulty:2,instruments:["Violin","Viola","Cello","Double Bass","Fiddle"]},mixolydian:{label:"Mixolydian",intervals:[0,2,4,5,7,9,10],difficulty:2,instruments:["Violin","Viola","Cello","Fiddle"]},blues:{label:"Blues",intervals:[0,3,5,6,7,10],difficulty:2,instruments:["Violin","Viola","Cello","Double Bass","Fiddle","Erhu"]},phrygian:{label:"Phrygian",intervals:[0,1,3,5,7,8,10],difficulty:3,instruments:["Violin","Viola","Cello","Double Bass","Fiddle"]},lydian:{label:"Lydian",intervals:[0,2,4,6,7,9,11],difficulty:3,instruments:["Violin","Viola","Cello","Double Bass"]},locrian:{label:"Locrian",intervals:[0,1,3,5,6,8,10],difficulty:4,instruments:["Violin","Viola","Cello","Double Bass"]},"whole-tone":{label:"Whole Tone",intervals:[0,2,4,6,8,10],difficulty:3,instruments:["Violin","Viola","Cello"]},"diminished-hw":{label:"Diminished (H-W)",intervals:[0,1,3,4,6,7,9,10],difficulty:4,instruments:["Violin","Viola","Cello"]},"diminished-wh":{label:"Diminished (W-H)",intervals:[0,2,3,5,6,8,9,11],difficulty:4,instruments:["Violin","Viola","Cello"]},chromatic:{label:"Chromatic",intervals:[0,1,2,3,4,5,6,7,8,9,10,11],difficulty:3,instruments:["Violin","Viola","Cello","Double Bass","Fiddle","Hardanger","Erhu"]}},hs=ls.map((o,e)=>({value:String(e),label:o}));function xt(o,e){const t=Qe[e];return t?{pitchClasses:new Set(t.intervals.map(n=>(o+n)%12)),root:o}:null}const us=["","Beginner","Easy","Intermediate","Advanced","Expert"];function ps(o){return us[o]||""}const As=["","●","●●","●●●","●●●●","●●●●●"];class ms{constructor(e){this.container=e,this.onScaleChange=null,this._rootPitchClass=0,this._scaleKey="",this._instrumentFilter="",this._build()}get scaleKey(){return this._scaleKey}get rootPitchClass(){return this._rootPitchClass}_build(){this.container.replaceChildren();const e=document.createElement("div");e.className="scale-panel";const t=document.createElement("div");t.className="scale-header";const s=document.createElement("span");s.className="scale-label",s.textContent="Scale",t.appendChild(s);const n=document.createElement("div");n.className="scale-root-wrap",this._rootDropdown=new P(n,{placeholder:"Root"}),this._rootDropdown.setItems(hs),this._rootDropdown.value="0",this._rootDropdown.onChange=r=>{this._rootPitchClass=parseInt(r,10),this._emitChange()},t.appendChild(n);const i=document.createElement("div");i.className="scale-inst-wrap",this._instDropdown=new P(i,{placeholder:"All instruments"}),this._instDropdown.setItems([{value:"",label:"All instruments"},...ds.map(r=>({value:r,label:r}))]),this._instDropdown.value="",this._instDropdown.onChange=r=>{this._instrumentFilter=r,this._rebuildScaleDropdown()},t.appendChild(i),e.appendChild(t);const a=document.createElement("div");a.className="scale-row";const c=document.createElement("div");c.className="scale-type-wrap",this._scaleDropdown=new P(c,{placeholder:"Off"}),a.appendChild(c),this._diffBadge=document.createElement("span"),this._diffBadge.className="scale-difficulty",a.appendChild(this._diffBadge),this._scaleDropdown.onChange=r=>{this._scaleKey=r,this._updateDiffBadge(),this._emitChange()},e.appendChild(a),this.container.appendChild(e),this._rebuildScaleDropdown()}_rebuildScaleDropdown(){const e=this._scaleKey,t=[{value:"",label:"Off"}];for(const[s,n]of Object.entries(Qe)){if(this._instrumentFilter&&!n.instruments.includes(this._instrumentFilter))continue;const i=As[n.difficulty]||"";t.push({value:s,label:`${n.label}  ${i}`})}this._scaleDropdown.setItems(t),t.some(s=>s.value===e)?(this._scaleDropdown.value=e,this._scaleKey=e):(this._scaleDropdown.value="",this._scaleKey=""),this._updateDiffBadge(),this._emitChange()}_updateDiffBadge(){const e=Qe[this._scaleKey];if(!e){this._diffBadge.textContent="",this._diffBadge.className="scale-difficulty";return}const t=ps(e.difficulty);this._diffBadge.textContent=t,this._diffBadge.className="scale-difficulty",this._diffBadge.classList.add(`diff-${e.difficulty}`)}_emitChange(){var t,s;if(!this._scaleKey){(t=this.onScaleChange)==null||t.call(this,null);return}const e=xt(this._rootPitchClass,this._scaleKey);(s=this.onScaleChange)==null||s.call(this,e)}}class fs{constructor(e){this.container=e,this.onStart=null,this.onTargetChange=null,this.onHit=null,this.onComplete=null,this.onStop=null,this._octaves=1,this._direction="asc",this._tolerance=20,this._state="idle",this._sequence=[],this._currentIndex=0,this._consecutiveHits=0,this._hits=0,this._misses=0,this._centsSum=0,this._centsCount=0,this._wrongNoteFrames=0,this._lastWrongMidi=-1,this._startTime=0,this._build()}get active(){return this._state==="playing"}get octaves(){return this._octaves}get direction(){return this._direction}get tolerance(){return this._tolerance}_build(){this.container.replaceChildren();const e=document.createElement("div");e.className="trainer-panel";const t=document.createElement("div");t.className="trainer-header";const s=document.createElement("span");s.className="trainer-label",s.textContent="Scale Trainer",t.appendChild(s),e.appendChild(t);const n=document.createElement("div");n.className="trainer-config";const i=document.createElement("div");i.className="trainer-config-item";const a=document.createElement("span");a.className="trainer-config-label",a.textContent="Octaves",i.appendChild(a);const c=document.createElement("div");c.className="trainer-config-wrap trainer-config-wrap--small",this._octavesDropdown=new P(c,{placeholder:"1"}),this._octavesDropdown.setItems([{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"}]),this._octavesDropdown.value="1",this._octavesDropdown.onChange=D=>{this._octaves=parseInt(D,10)},i.appendChild(c),n.appendChild(i);const r=document.createElement("div");r.className="trainer-config-item";const h=document.createElement("span");h.className="trainer-config-label",h.textContent="Direction",r.appendChild(h);const l=document.createElement("div");l.className="trainer-config-wrap",this._directionDropdown=new P(l,{placeholder:"Ascending"}),this._directionDropdown.setItems([{value:"asc",label:"Ascending"},{value:"desc",label:"Descending"},{value:"both",label:"Both"}]),this._directionDropdown.value="asc",this._directionDropdown.onChange=D=>{this._direction=D},r.appendChild(l),n.appendChild(r);const d=document.createElement("div");d.className="trainer-config-item";const p=document.createElement("span");p.className="trainer-config-label",p.textContent="Tolerance",d.appendChild(p);const u=document.createElement("div");u.className="trainer-config-wrap",this._toleranceDropdown=new P(u,{placeholder:"20 cents"}),this._toleranceDropdown.setItems([{value:"10",label:"10 cents"},{value:"20",label:"20 cents"},{value:"30",label:"30 cents"},{value:"50",label:"50 cents"}]),this._toleranceDropdown.value="20",this._toleranceDropdown.onChange=D=>{this._tolerance=parseInt(D,10)},d.appendChild(u),n.appendChild(d),e.appendChild(n);const A=document.createElement("div");A.className="trainer-btn-row",this._startBtn=document.createElement("button"),this._startBtn.className="trainer-start-btn",this._startBtn.textContent="Start Practice",this._startBtn.addEventListener("click",()=>this._handleStart()),A.appendChild(this._startBtn),this._stopBtn=document.createElement("button"),this._stopBtn.className="trainer-stop-btn trainer-hidden",this._stopBtn.textContent="Stop",this._stopBtn.addEventListener("click",()=>this._handleStop()),A.appendChild(this._stopBtn),e.appendChild(A),this._progressRow=document.createElement("div"),this._progressRow.className="trainer-progress trainer-hidden";const g=document.createElement("div");g.className="trainer-progress-bar",this._progressFill=document.createElement("div"),this._progressFill.className="trainer-progress-fill",g.appendChild(this._progressFill),this._progressRow.appendChild(g),this._progressText=document.createElement("span"),this._progressText.className="trainer-progress-text",this._progressRow.appendChild(this._progressText),e.appendChild(this._progressRow),this._targetDisplay=document.createElement("div"),this._targetDisplay.className="trainer-target-display trainer-hidden",this._targetNote=document.createElement("div"),this._targetNote.className="trainer-target-note",this._targetDisplay.appendChild(this._targetNote),this._targetInstruction=document.createElement("div"),this._targetInstruction.className="trainer-target-instruction",this._targetInstruction.textContent="Play this note",this._targetDisplay.appendChild(this._targetInstruction),e.appendChild(this._targetDisplay),this._statsRow=document.createElement("div"),this._statsRow.className="trainer-stats trainer-hidden",this._hitsStat=this._createStat("0","Hits","hits"),this._missesStat=this._createStat("0","Misses","misses"),this._accuracyStat=this._createStat("-","Accuracy",""),this._centsStat=this._createStat("-","Avg Cents",""),this._statsRow.appendChild(this._hitsStat.el),this._statsRow.appendChild(this._missesStat.el),this._statsRow.appendChild(this._accuracyStat.el),this._statsRow.appendChild(this._centsStat.el),e.appendChild(this._statsRow),this._summaryEl=document.createElement("div"),this._summaryEl.className="trainer-summary trainer-hidden",e.appendChild(this._summaryEl),this.container.appendChild(e)}_createStat(e,t,s){const n=document.createElement("div");n.className="trainer-stat";const i=document.createElement("div");i.className="trainer-stat-value"+(s?` ${s}`:""),i.textContent=e,n.appendChild(i);const a=document.createElement("div");return a.className="trainer-stat-label",a.textContent=t,n.appendChild(a),{el:n,valEl:i}}_handleStart(){var e;this._state==="complete"&&this._summaryEl.classList.add("trainer-hidden"),(e=this.onStart)==null||e.call(this)}_handleStop(){var e;this._state="idle",this._updateUI(),(e=this.onStop)==null||e.call(this)}beginSession(e){!e||e.length===0||(this._sequence=e,this._currentIndex=0,this._consecutiveHits=0,this._hits=0,this._misses=0,this._centsSum=0,this._centsCount=0,this._wrongNoteFrames=0,this._lastWrongMidi=-1,this._startTime=performance.now(),this._state="playing",this._updateUI(),this._emitTarget())}update(e){var i;if(this._state!=="playing")return;const t=this._sequence[this._currentIndex];if(!t)return;if(!e||e<20){this._consecutiveHits=0;return}const s=Le(e),n=Lt(e);s===t.midi&&Math.abs(n)<=this._tolerance?(this._consecutiveHits++,this._consecutiveHits>=3&&(this._hits++,this._centsSum+=Math.abs(n),this._centsCount++,(i=this.onHit)==null||i.call(this,t),this._advance())):(this._consecutiveHits=0,s!==t.midi&&e>20&&(s===this._lastWrongMidi?(this._wrongNoteFrames++,this._wrongNoteFrames>=5&&(this._misses++,this._wrongNoteFrames=0,this._lastWrongMidi=-1,this._updateStats())):(this._lastWrongMidi=s,this._wrongNoteFrames=1)))}_advance(){var e,t;this._currentIndex++,this._consecutiveHits=0,this._wrongNoteFrames=0,this._lastWrongMidi=-1,this._currentIndex>=this._sequence.length?(this._state="complete",this._updateUI(),this._showSummary(),(e=this.onComplete)==null||e.call(this,{hits:this._hits,misses:this._misses,accuracy:this._getAccuracy(),avgCents:this._getAvgCents(),elapsed:performance.now()-this._startTime}),(t=this.onStop)==null||t.call(this)):(this._updateStats(),this._updateProgress(),this._emitTarget())}_emitTarget(){var t;if(this._currentIndex>=this._sequence.length)return;const e=this._sequence[this._currentIndex];if(e){this._targetNote.textContent="",this._targetNote.appendChild(document.createTextNode(e.noteName));const s=document.createElement("span");s.className="octave",s.textContent=e.octave,this._targetNote.appendChild(s),(t=this.onTargetChange)==null||t.call(this,e)}}_getAccuracy(){const e=this._hits+this._misses;return e===0?0:Math.round(this._hits/e*100)}_getAvgCents(){return this._centsCount===0?0:(this._centsSum/this._centsCount).toFixed(1)}_updateStats(){this._hitsStat.valEl.textContent=this._hits,this._missesStat.valEl.textContent=this._misses;const e=this._hits+this._misses;this._accuracyStat.valEl.textContent=e>0?`${this._getAccuracy()}%`:"-",this._centsStat.valEl.textContent=this._centsCount>0?`${this._getAvgCents()}c`:"-"}_updateProgress(){const e=this._sequence.length,t=this._currentIndex,s=e>0?t/e*100:0;this._progressFill.style.width=`${s}%`,this._progressText.textContent=`${t} / ${e}`}_updateUI(){const e=this._state==="idle",t=this._state==="playing",s=this._state==="complete";this._startBtn.textContent=s?"Restart":"Start Practice",this._startBtn.classList.toggle("trainer-hidden",t),this._stopBtn.classList.toggle("trainer-hidden",!t),this._progressRow.classList.toggle("trainer-hidden",e),t&&this._updateProgress(),s&&(this._progressFill.style.width="100%",this._progressText.textContent=`${this._sequence.length} / ${this._sequence.length}`),this._targetDisplay.classList.toggle("trainer-hidden",!t),this._statsRow.classList.toggle("trainer-hidden",e),(t||s)&&this._updateStats(),s||this._summaryEl.classList.add("trainer-hidden")}_showSummary(){const e=performance.now()-this._startTime,t=Math.round(e/1e3),s=Math.floor(t/60),n=t%60,i=s>0?`${s}m ${n}s`:`${n}s`;this._summaryEl.replaceChildren(),this._summaryEl.classList.remove("trainer-hidden");const a=document.createElement("div");a.className="trainer-summary-title",a.textContent="Practice Complete!",this._summaryEl.appendChild(a);const c=document.createElement("div");c.className="trainer-summary-stats";const r=[{value:`${this._getAccuracy()}%`,label:"Accuracy"},{value:`${this._getAvgCents()}c`,label:"Avg Deviation"},{value:`${this._hits}`,label:"Hits"},{value:`${this._misses}`,label:"Misses"},{value:i,label:"Time"}];for(const h of r){const l=document.createElement("div");l.className="trainer-summary-stat";const d=document.createElement("div");d.className="trainer-summary-stat-value",d.textContent=h.value,l.appendChild(d);const p=document.createElement("div");p.className="trainer-summary-stat-label",p.textContent=h.label,l.appendChild(p),c.appendChild(l)}this._summaryEl.appendChild(c)}}function gs(o,e,t,s={}){const{octaves:n=1,direction:i="asc"}=s,a=ee[o];if(!a)return[];const c=xt(e,t);if(!c)return[];const{pitchClasses:r}=c,h=[];for(let D=0;D<a.strings.length;D++){const C=a.strings[D];for(let T=0;T<=12;T++){const I=C.frequency*Math.pow(2,T/12),z=Le(I),E=z%12;if(r.has(E)){const{name:B,octave:v}=ve(z);h.push({midi:z,freq:ae(z),noteName:B,octave:v,pitchClass:E,stringIndex:D,positionIndex:T})}}}if(h.length===0)return[];h.sort((D,C)=>D.midi-C.midi);const l=[];let d=-1;for(const D of h)D.midi!==d&&(l.push(D),d=D.midi);const p=l.filter(D=>D.pitchClass===e);if(p.length===0)return l;const u=p[0].midi,A=u+n*12,g=l.filter(D=>D.midi>=u&&D.midi<=A);if(g.length===0)return[];if(i==="desc")return g.slice().reverse();if(i==="both"){const D=g.slice(),C=g.slice().reverse().slice(1);return D.concat(C)}return g.slice()}const At=[{value:"2/4",label:"2/4",beats:2},{value:"3/4",label:"3/4",beats:3},{value:"4/4",label:"4/4",beats:4},{value:"5/4",label:"5/4",beats:5},{value:"6/8",label:"6/8",beats:6},{value:"7/8",label:"7/8",beats:7},{value:"9/8",label:"9/8",beats:9},{value:"12/8",label:"12/8",beats:12}];class Ds{constructor(e){this.container=e,this.onStart=null,this.onStop=null,this.onBpmChange=null,this.onTimeSigChange=null,this.onVolumeChange=null,this._bpm=120,this._beats=4,this._playing=!1,this._beatDots=[],this._build()}get bpm(){return this._bpm}get beats(){return this._beats}_build(){this.container.replaceChildren();const e=document.createElement("div");e.className="metronome-panel";const t=document.createElement("div");t.className="metronome-header";const s=document.createElement("span");s.className="metronome-label",s.textContent="Metronome",t.appendChild(s),this._playBtn=document.createElement("button"),this._playBtn.className="metronome-play-btn",this._playBtn.textContent="▶",this._playBtn.title="Start / Stop",this._playBtn.addEventListener("click",()=>{var p,u;this._playing?(this._playing=!1,this._playBtn.textContent="▶",this._playBtn.classList.remove("active"),this._clearBeatDots(),(p=this.onStop)==null||p.call(this)):(this._playing=!0,this._playBtn.textContent="■",this._playBtn.classList.add("active"),(u=this.onStart)==null||u.call(this))}),t.appendChild(this._playBtn),e.appendChild(t);const n=document.createElement("div");n.className="metronome-controls";const i=document.createElement("div");i.className="metronome-bpm-group";const a=document.createElement("button");a.className="metronome-bpm-btn",a.textContent="−",a.addEventListener("click",()=>this._setBpm(this._bpm-1)),i.appendChild(a),this._bpmSlider=document.createElement("input"),this._bpmSlider.type="range",this._bpmSlider.className="metronome-bpm-slider",this._bpmSlider.min="40",this._bpmSlider.max="220",this._bpmSlider.value=String(this._bpm),this._bpmSlider.addEventListener("input",()=>{this._setBpm(parseInt(this._bpmSlider.value,10))}),i.appendChild(this._bpmSlider),this._bpmDisplay=document.createElement("input"),this._bpmDisplay.type="text",this._bpmDisplay.className="metronome-bpm-display",this._bpmDisplay.value=String(this._bpm),this._bpmDisplay.addEventListener("change",()=>{const p=parseInt(this._bpmDisplay.value,10);isNaN(p)?this._bpmDisplay.value=String(this._bpm):this._setBpm(p)}),this._bpmDisplay.addEventListener("keydown",p=>{p.key==="Enter"&&this._bpmDisplay.blur()}),i.appendChild(this._bpmDisplay);const c=document.createElement("span");c.className="metronome-bpm-unit",c.textContent="BPM",i.appendChild(c);const r=document.createElement("button");r.className="metronome-bpm-btn",r.textContent="+",r.addEventListener("click",()=>this._setBpm(this._bpm+1)),i.appendChild(r),n.appendChild(i);const h=document.createElement("div");h.className="metronome-timesig-wrap",this._timeSigDropdown=new P(h,{placeholder:"4/4"}),this._timeSigDropdown.setItems(At.map(p=>({value:p.value,label:p.label}))),this._timeSigDropdown.value="4/4",this._timeSigDropdown.onChange=p=>{var A;const u=At.find(g=>g.value===p);u&&(this._beats=u.beats,this._buildBeatDots(),(A=this.onTimeSigChange)==null||A.call(this,u.beats))},n.appendChild(h);const l=document.createElement("div");l.className="metronome-vol-group";const d=document.createElement("span");d.className="metronome-vol-icon",d.textContent="🔊",l.appendChild(d),this._volSlider=document.createElement("input"),this._volSlider.type="range",this._volSlider.className="metronome-vol-slider",this._volSlider.min="0",this._volSlider.max="1",this._volSlider.step="0.01",this._volSlider.value="0.5",this._volSlider.addEventListener("input",()=>{var p;(p=this.onVolumeChange)==null||p.call(this,parseFloat(this._volSlider.value))}),l.appendChild(this._volSlider),n.appendChild(l),e.appendChild(n),this._beatContainer=document.createElement("div"),this._beatContainer.className="metronome-beats",e.appendChild(this._beatContainer),this.container.appendChild(e),this._buildBeatDots()}_setBpm(e){var t;this._bpm=Math.max(40,Math.min(220,e)),this._bpmSlider.value=String(this._bpm),this._bpmDisplay.value=String(this._bpm),(t=this.onBpmChange)==null||t.call(this,this._bpm)}_buildBeatDots(){this._beatContainer.replaceChildren(),this._beatDots=[];for(let e=0;e<this._beats;e++){const t=document.createElement("span");t.className="metronome-beat-dot",e===0&&t.classList.add("accent"),this._beatContainer.appendChild(t),this._beatDots.push(t)}}_clearBeatDots(){for(const e of this._beatDots)e.classList.remove("lit")}flashBeat(e){this._clearBeatDots(),e>=0&&e<this._beatDots.length&&this._beatDots[e].classList.add("lit")}}const Bs=[{id:"twinkle",genre:"Beginner",abc:`X:1
T:Twinkle, Twinkle, Little Star
C:Traditional (French)
M:4/4
L:1/4
Q:1/4=90
K:A
"A"A A e e|"D"f f "A"e2|"D"d d "A"c c|"E"B B "A"A2|
"A"e e "D"d d|"A"c c "E"B2|"A"e e "D"d d|"A"c c "E"B2|
"A"A A e e|"D"f f "A"e2|"D"d d "A"c c|"E"B B "A"A2|]`},{id:"mary-lamb",genre:"Beginner",abc:`X:1
T:Mary Had a Little Lamb
C:Traditional (American)
M:4/4
L:1/4
Q:1/4=100
K:D
"D"F E D E|F F F2|"A"E E E2|"D"F A A2|
F E D E|F F F F|"A"E E F E|"D"D4|]`},{id:"hot-cross-buns",genre:"Beginner",abc:`X:1
T:Hot Cross Buns
C:Traditional (English)
M:4/4
L:1/4
Q:1/4=96
K:D
"D"F E D2|F E D2|"A"D/D/D/D/ E/E/E/E/|"D"F E D2|]`},{id:"lightly-row",genre:"Beginner",abc:`X:1
T:Lightly Row
C:Traditional (German)
M:4/4
L:1/4
Q:1/4=100
K:A
"A"e c c2|"D"d B B2|"E"A B c d|"A"e e e2|
e c c2|"D"d B B2|"E"A c e e|"A"c4|
"E"B B B B|B c d2|"A"c c c c|c d e2|
e c c2|"D"d B B2|"E"A c e e|"A"A4|]`},{id:"go-tell-aunt-rhody",genre:"Beginner",abc:`X:1
T:Go Tell Aunt Rhody
C:Traditional (American)
M:4/4
L:1/4
Q:1/4=100
K:A
"A"c2 c B|A2 A2|"E"B B d c|"A"B2 A2|
e2 e d|c2 c2|"E"B A B c|"A"A4|]`},{id:"song-of-the-wind",genre:"Beginner",abc:`X:1
T:Song of the Wind
C:Traditional (German)
M:4/4
L:1/8
Q:1/4=110
K:A
"A"A2B2 c2d2|e4 e4|"D"f2d2 a2f2|"A"e8|
"D"f2d2 a2f2|"A"e8|"E"e2d2 d2d2|d2c2 c2c2|
"E"B2c2 B2A2|"A"c4 A4|"E"e2d2 d2d2|d2c2 c2c2|"E"B2c2 B2A2|"A"A8|]`},{id:"frere-jacques",genre:"Beginner",abc:`X:1
T:Frère Jacques
C:Traditional (French)
M:4/4
L:1/4
Q:1/4=110
K:D
"D"D E F D|D E F D|F G A2|F G A2|
A/B/A/G/ F D|A/B/A/G/ F D|D A, D2|D A, D2|]`},{id:"row-your-boat",genre:"Beginner",abc:`X:1
T:Row, Row, Row Your Boat
C:Traditional
M:6/8
L:1/8
Q:3/8=60
K:D
"D"D3 D3|D2E F3|F2E F2G|A6|
d d d A A A|F F F D D D|"A"A2G F2E|"D"D6|]`},{id:"london-bridge",genre:"Beginner",abc:`X:1
T:London Bridge Is Falling Down
C:Traditional (English)
M:4/4
L:1/8
Q:1/4=110
K:D
"D"A3B A2G2|F2G2 A4|"A"E2F2 G4|"D"F2G2 A4|
A3B A2G2|F2G2 A4|"A"E4 "D"A4|F2D6|]`},{id:"old-macdonald",genre:"Beginner",abc:`X:1
T:Old MacDonald Had a Farm
C:Traditional (American)
M:4/4
L:1/4
Q:1/4=120
K:G
"G"G G G D|"C"E E "G"D2|B B A A|G3 D|
G G G D|"C"E E "G"D2|B B A A|G3 D/D/|
G G G D/D/|G G G2|G/G/ G G/G/ G|G/G/ G/G/ G G|
G G G D|"C"E E "G"D2|B B A A|G4|]`},{id:"happy-birthday",genre:"Beginner",abc:`X:1
T:Happy Birthday to You
C:Mildred & Patty Hill
M:3/4
L:1/8
Q:1/4=100
K:D
A>A|"D"B2A2d2|"A"c4A>A|B2A2e2|"D"d4A>A|
"G"a2f2d2|"D"c2"G"B2g>g|"D"f2d2"A"e2|"D"d4|]`},{id:"skip-to-my-lou",genre:"Beginner",abc:`X:1
T:Skip to My Lou
C:Traditional (American)
M:2/4
L:1/8
Q:1/4=110
K:D
"D"F2F2|D2D2|F2F2|A4|"A"E2E2|C2C2|E2E2|G4|
"D"F2F2|D2D2|F2F2|A3A|"A"E2F2|G2E2|"D"D4|D4|]`},{id:"yankee-doodle",genre:"Beginner",abc:`X:1
T:Yankee Doodle
C:Traditional (American)
M:2/4
L:1/8
Q:1/4=110
K:G
"G"GGAB|GBA D|GGAB|"D"G2F2|
"G"GGAB|"C"cBAG|"D"FDEF|"G"G2G2|
"C"E>FED|E>FG2|"D"D>EDC|B,2D2|
"C"E>FED|E>FGE|"D"DGFA|"G"G2G2|]`},{id:"oh-susanna",genre:"Beginner",abc:`X:1
T:Oh! Susanna
C:Stephen Foster (1848)
M:2/4
L:1/8
Q:1/4=100
K:D
DE|"D"FAAB|AF D>E|FFEE|"A"E2DE|
"D"FAA>B|AF D>E|FF"A"EE|"D"D2DE|
"D"FAAB|AF D>E|FFEE|"A"E2DE|
"D"FAA>B|AF D>E|FF"A"EE|"D"D4|
"G"G2G2|B2B2|"D"BAA F|A3 D/E/|
"D"FAA>B|AF D>E|FF"A"EE|"D"D4|]`},{id:"when-the-saints",genre:"Beginner",abc:`X:1
T:When the Saints Go Marching In
C:Traditional (American)
M:4/4
L:1/4
Q:1/4=120
K:D
z D F G|"D"A4-|A D F G|A4-|A D F G|"D"A2 F2|"A"D2 F2|E4-|
E F F E|"D"D3 D|F2 A2|"G"A G3-|G F G2|"D"A2 F2|"A"D2 E2|"D"D4|]`},{id:"aunt-rhody-g",genre:"Beginner",abc:`X:1
T:Long, Long Ago
C:Thomas Haynes Bayly (1833)
M:4/4
L:1/4
Q:1/4=100
K:D
"D"D D E F|F G A2|"G"B c d B|"D"A4|
A F D E|F E D2|"A"E F G E|"A"A4|
"D"D D E F|F G A2|"G"B c d B|"D"A4|
A F D E|F E D2|"A"E F E D|"D"D4|]`},{id:"may-song",genre:"Beginner",abc:`X:1
T:May Song (Alle Vögel sind schon da)
C:Traditional (German)
M:4/4
L:1/4
Q:1/4=110
K:A
"A"A c e a|"D"f a "A"e2|"D"d f "A"c e|"E"B A B2|
"A"c B c d|"E"e d c B|"A"c B c d|"E"e d c B|
"A"A c e a|"D"f a "A"e2|"D"d f "A"c e|"E"B c "A"A2|]`},{id:"o-come-little-children",genre:"Beginner",abc:`X:1
T:O Come, Little Children
C:J.A.P. Schulz (1794)
M:4/4
L:1/4
Q:1/4=96
K:A
"A"e2 c e|e2 c e|"D"d2 B d|"A"c3 c|
"E"B2 B B|"A"c2 A c|"E"B2 A2|E3 E|
"A"A2 A A|"D"B d c B|"A"A2 c e|e3 e|
"D"f2 f f|"A"e c A c|"E"B2 A B|"A"A4|]`},{id:"hush-little-baby",genre:"Beginner",abc:`X:1
T:Hush, Little Baby
C:Traditional (American)
M:4/4
L:1/8
Q:1/4=90
K:D
A,|"D"D2F2 F2FE|F2A2 "A"E3E|E2E2 E2ED|"A"E2F2 "D"D3|]`},{id:"this-old-man",genre:"Beginner",abc:`X:1
T:This Old Man
C:Traditional (English)
M:4/4
L:1/8
Q:1/4=110
K:D
"D"A2F2 A4|A2F2 A4|B2A2 G2F2|"A"E2F2 G4|
F2G2 A2D2|D2DD D2EF|G2A2 "A"A2E2|E2G2 F2E2|"D"D8|]`},{id:"baa-baa",genre:"Beginner",abc:`X:1
T:Baa, Baa, Black Sheep (ABC Song)
C:Traditional
M:4/4
L:1/4
Q:1/4=100
K:A
"A"A A e e|"D"f/f/f/f/ "A"e2|"D"d d "A"c c|"E"B B "A"A2|
"A"e e/e/ "D"d d|"A"c c/c/ "E"B2|"A"e e/e/ "D"d d/d/|"A"c c "E"B2|
"A"A A e e|"D"f/f/f/f/ "A"e2|"D"d d "A"c c|"E"B B "A"A2|]`},{id:"jingle-bells-easy",genre:"Beginner",abc:`X:1
T:Ode to Joy (Easy)
C:Ludwig van Beethoven (1824)
M:4/4
L:1/4
Q:1/4=100
K:D
"D"F F G A|A G F E|D D E F|"A"F>E E2|
"D"F F G A|A G F E|D D E F|"A"E>D "D"D2|]`},{id:"au-clair",genre:"Beginner",abc:`X:1
T:Au Clair de la Lune
C:Traditional (French)
M:4/4
L:1/4
Q:1/4=96
K:D
"D"D D D E|F2 "A"E2|"D"D F E E|D4|
D D D E|F2 "A"E2|"D"D F E E|D4|
"A"E E E E|B,2 B,2|E D C B,|A,4|
"D"D D D E|F2 "A"E2|"D"D F E E|D4|]`},{id:"pop-goes-the-weasel",genre:"Beginner",abc:`X:1
T:Pop Goes the Weasel
C:Traditional (English)
M:6/8
L:1/8
Q:3/8=80
K:D
"D"D2D E2E|F A F D3|D2D E2E|"A"F3 D3|
"D"D2D E2E|F A F D3|"G"B3 "A"E2G|"D"F3 D3|
"D"d3 B2d|"A"c3 A3|"D"d3 B2d|"A"c3 A2A|
"D"A2A E2G|F A F D3|"G"B3 "A"E2G|"D"F3 D3|]`}],Gs=[{id:"greensleeves",genre:"Folk",abc:`X:1
T:Greensleeves
O:English (16th c.)
M:6/8
L:1/8
Q:3/8=60
K:Em
E|"Em"G2A B>cB|"D"A2F D>EF|"Em"G2E E>^DE|"B7"F2^D B,2E|
"Em"G2A B>cB|"D"A2F D>EF|"Em"G>FE "B7"^D>^CD|"Em"E3 E2z|
"G"d3 d>^cB|"D"A2F D>EF|"Em"G2E E>^DE|"B7"F2^D B,3|
"G"d3 d>^cB|"D"A2F D>EF|"Em"G>FE "B7"^D>^CD|"Em"E3 E2|]`},{id:"danny-boy",genre:"Folk",abc:`X:1
T:Danny Boy (Londonderry Air)
O:Irish
M:4/4
L:1/8
Q:1/4=70
K:D
ABc|"D"d3 c d2 fe|"G"d2 B2 "D"A2 FD|"G"G2 B2 d3 e|"D"f6 ed|
"D"d3 c d2 fe|"G"d2 B2 "D"A2 FD|"A"E2 F2 G2 FE|"D"D6 ABc|
"D"d3 c d2 fe|"G"d2 B2 "D"A2 FD|"G"G2 B2 d3 e|"D"f6 ef|
"D"a3 f f2 ed|"G"d2 B2 "D"A2 FD|"A"E2 F2 G2 FE|"D"D6|]`},{id:"scarborough-fair",genre:"Folk",abc:`X:1
T:Scarborough Fair
O:English
M:3/4
L:1/4
Q:1/4=100
K:Edor
"Em"E2 E|B2 B|"D"F>G F|"Em"E3|z B d|"G"e2 d|"Em"B ^c A|B3|
z2 e|e2 e|"D"d2 B|B A G|"C"F D2-|D2 E|"D"B2 A|"Em"G F E|"D"D E F|"Em"E3|]`},{id:"shenandoah",genre:"Folk",abc:`X:1
T:Shenandoah
O:American
M:4/4
L:1/8
Q:1/4=70
K:D
A,2|"D"D2 DD D3 E|F G A d B4|"G"e3 d "D"d3 B|"Bm"d B A2 "G"B2 A2|
"D"F2 A2 A4|"A"A3 F A3 B|"D"d4 "A"A2 F2|"D"E D4|]`},{id:"amazing-grace",genre:"Hymns",abc:`X:1
T:Amazing Grace
C:Tune: New Britain (American, 1829)
M:3/4
L:1/4
Q:1/4=80
K:D
A,|"D"D2 F/D/|F2 E|D2 B,|A,2 A,|D2 F/D/|F2 E/F/|"A"A3-|A2 F/A/|
"D"A2 F/D/|F2 E|D2 B,|A,2 A,|D2 F/D/|"A"F2 E|"D"D3-|D2|]`},{id:"auld-lang-syne",genre:"Folk",abc:`X:1
T:Auld Lang Syne
O:Scottish
M:4/4
L:1/8
Q:1/4=80
K:D
A,2|"D"D3 D D2 F2|"A"E3 D E2 F2|"D"D3 D F2 A2|"G"B6 B2|
"D"A3 F F2 D2|"A"E3 D E2 F2|"D"D3 B, B,2 A,2|D6 B2|
"D"A3 F F2 D2|"A"E3 D E2 B2|"D"A3 F F2 A2|"G"B6 d2|
"D"A3 F F2 D2|"A"E3 D E2 F/E/|"D"D3 B, B,2 A,2|D6|]`},{id:"simple-gifts",genre:"Folk",abc:`X:1
T:Simple Gifts
C:Joseph Brackett (1848)
M:2/4
L:1/8
Q:1/4=90
K:F
C|"F"CF FG|AF AB|c2 cB|AG FG|A2 AG|FF FG|"C"A2 G2|
"F"CF FG|AF AB|c2 cB|AG FG|"C"A2 G2|"F"FF F2|z2 z2|
"F"c2 A>G|AB AF|"C"G2 G>A|GF C2|"F"F2 G>A|AB c2|"Bb"BA "C"G2|
"F"c2 A>G|AB AF|"C"G2 G>A|GF C2|"F"F2 GA|"Bb"BA "C"GF|"F"F4|]`},{id:"home-on-the-range",genre:"Folk",abc:`X:1
T:Home on the Range
C:Daniel E. Kelley (1872)
M:3/4
L:1/4
Q:1/4=120
K:G
D|D G A|"C"B2 G|F E c|"G"c3|z A B|c2 B|"D"A G A|"D"A3|
D G A|"C"B2 G|F E c|"G"c3|z c c|"D"c B A|"G"B G A|G3|
d3|"D"c B A|"G"B2 G|D3|D G A|"C"B2 G|F E c|"G"c3|
z c c|"D"c B A|"G"B G A|"G"G3|]`},{id:"red-river-valley",genre:"Folk",abc:`X:1
T:Red River Valley
O:Canadian / American
M:4/4
L:1/8
Q:1/4=100
K:D
A,D|"D"F2 F2 F2 EF|E2 D6|z2 A,D F2 DF|"A"A2 F2 E4|
z2 AG F2 EF|"G"A2 G2 F2 E2|"A"z2 A,B, C2 DE|"D"F2 E2 D4|]`},{id:"clementine",genre:"Folk",abc:`X:1
T:Oh My Darling, Clementine
O:American
M:3/4
L:1/8
Q:1/4=120
K:D
D>D|"D"D2 A,2 F>F|F2 D2 D>F|A3 G F2|"A"E4 E>F|
G2 G2 F>E|F2 D2 D>F|E3 A, C>E|"D"D4|]`},{id:"down-in-the-valley",genre:"Folk",abc:`X:1
T:Down in the Valley
O:American
M:3/4
L:1/4
Q:1/4=120
K:D
A,|"D"D F A|F3-|F2 E|"A"F E D|E3-|E2 A,|C E G|"A"F2 E|E D C|"D"D3-|D2|]`},{id:"swing-low",genre:"Folk",abc:`X:1
T:Swing Low, Sweet Chariot
O:African American spiritual
M:4/4
L:1/8
Q:1/4=80
K:D
"D"F4 D3 F|F4- F2 D2|"G"B,4 "D"A,3 D|D6 z2|
"D"F4 F2 A2|d3 B A2 F2|"A"A4 F2 E2|E6 z2|
"D"F4 D3 F|F4- F2 D2|"G"B,4 "D"A,3 D|D6 z2|
"D"F4 FG A2|F2 D2 "A"E3 D|"D"D8|]`},{id:"loch-lomond",genre:"Folk",abc:`X:1
T:Loch Lomond
O:Scottish
M:4/4
L:1/8
Q:1/4=80
K:D
A,>B,|"D"D2 D>E F2 E>D|"G"E2 E>F "D"A2 F>E|"D"D2 D>E F2 E>D|"A"E2 B,>A, "D"D2 A,>B,|
"D"D2 D>E F2 E>D|"G"E2 E>F A2 d>e|"D"f2 e>d "A"e2 B>A|"D"F2 E>D D2|]`},{id:"skye-boat-song",genre:"Folk",abc:`X:1
T:Skye Boat Song
O:Scottish
M:6/8
L:1/8
Q:3/8=50
K:D
"D"A>BA "G"D2E|"D"F3 "Bm"A3|"G"B>cB "Em"E2F|"A"A3 z3|
"D"A>BA "G"D2E|"D"F3 "Bm"A3|"G"B>AF "A"E>DE|"D"D3 z3|
"Bm"F>EF "Em"B2A|"Bm"F3 "G"D3|"Bm"F>EF "G"B2A|"F#m"F3 "Bm"B3|
"Bm"F>EF "Em"B2A|"Bm"F3 "G"D3|"Em"E>DE "A"F2E|"A"A3 z3|]`},{id:"water-is-wide",genre:"Folk",abc:`X:1
T:The Water Is Wide
O:Scottish / English
M:4/4
L:1/8
Q:1/4=70
K:D
A,|"D"D2 F2 A3 B|A2 F2 "A"E3 D|"D"D2 F2 "G"G3 F|"A"E6 E2|
"D"F2 A2 d3 c|"G"B2 A2 "D"F3 A|"A"E2 D2 E3 F|"D"D6|]`},{id:"molly-malone",genre:"Folk",abc:`X:1
T:Molly Malone (Cockles and Mussels)
O:Irish
M:3/4
L:1/8
Q:1/4=110
K:D
A,2|"D"D2 D2 D2|D4 F2|"Em"E2 E2 E2|"A"E4 G2|"D"F2 F2 F2|F4 A2|"A"G2 F2 E2|"D"F4 A,2|
"D"D2 D2 D2|D4 F2|"Em"E2 E2 E2|"A"E4 G2|"D"F2 A2 d2|"G"B4 G2|"A"F2 E2 E2|"D"D4|]`},{id:"drunken-sailor",genre:"Folk",abc:`X:1
T:What Shall We Do with the Drunken Sailor
O:Sea shanty
M:2/4
L:1/8
Q:1/4=110
K:Ddor
"Dm"A2 AA|A2 AA|A2 D2|F2 A2|"C"G2 GG|G2 GG|G2 C2|E2 G2|
"Dm"A2 AA|A2 AA|A2 B2|c2 d2|"C"c2 A2|G2 E2|"Dm"D2 D2|D4|]`},{id:"wellerman",genre:"Folk",abc:`X:1
T:Soon May the Wellerman Come
O:New Zealand sea shanty (19th c.)
M:4/4
L:1/8
Q:1/4=100
K:Dm
A,2|"Dm"D2 D2 D2 F2|A2 A2 A4|"Gm"B2 G2 G2 B2|"Dm"A2 F2 D2 D2|
"Dm"D2 D2 D2 F2|A2 A2 A2 A2|"A"G2 E2 ^C2 E2|"Dm"D6 z2|
"Bb"B4 B4|"F"A2 F2 F4|"Gm"G2 G2 G2 A2|"Dm"F2 D2 D4|
"Bb"B4 B4|"F"A2 F2 F2 F2|"A"E2 ^C2 E2 G2|"Dm"F2 D2 D4|]`},{id:"sakura",genre:"World",abc:`X:1
T:Sakura Sakura
O:Japanese folk song
M:4/4
L:1/4
Q:1/4=72
K:Am
"Am"A A B2|A A B2|A B c B|A B/A/ F2|
E C E F|E E/C/ B,2|A B c B|A B/A/ F2|
E C E F|E E/C/ B,2|A A B2|A A B2|"E"E F B/A/ F|"Am"E4|]`},{id:"arirang",genre:"World",abc:`X:1
T:Arirang
O:Korean folk song
M:3/4
L:1/8
Q:1/4=110
K:D
"D"D3 E D2|E2 F3 E|F2 A3 B|A2 F2 E2|D3 E D2|E2 F3 E|D2 B,2 A,2|B,4 A,2|
"D"A4 A2|A3 B A2|F2 E2 D2|E3 F E2|D3 E D2|E2 F3 E|F2 E2 D2|D6|]`},{id:"kalinka",genre:"World",abc:`X:1
T:Kalinka
C:Ivan Larionov (1860)
M:2/4
L:1/8
Q:1/4=110
K:Am
"E"e2 d2|c2 B2|"Am"A4|A2 z2|"E"e2 d2|c2 B2|"Am"A4|A2 z2|
"Am"c2 B2|A2 G2|"G"G2 B2|D2 z2|"Am"c2 B2|A2 G2|"E"B2 A2|E2 z2|]`},{id:"dark-eyes",genre:"World",abc:`X:1
T:Dark Eyes (Ochi Chernye)
O:Russian romance (1884)
M:3/4
L:1/8
Q:1/4=110
K:Dm
A,2|"Dm"D2 E2 F2|G4 A2|"A"^C6-|C4 E2|"A"E2 F2 G2|A4 B2|"Dm"F6-|F4 A2|
"Gm"d2 c2 B2|B4 A2|"Dm"A2 G2 F2|F4 D2|"A"E2 F2 G2|^C4 E2|"Dm"D6-|D4|]`},{id:"la-cucaracha",genre:"World",abc:`X:1
T:La Cucaracha
O:Mexican folk song
M:4/4
L:1/8
Q:1/4=140
K:D
"D"z AAA d2 f2|z AAA d2 f2|"A"d2 d2 c2 c2|B2 B2 A4|
"A"z AAA c2 e2|z AAA c2 e2|"D"a2 b2 a2 g2|f2 e2 d4|]`},{id:"cielito-lindo",genre:"World",abc:`X:1
T:Cielito Lindo
C:Quirino Mendoza y Cortés (1882)
M:3/4
L:1/8
Q:1/4=140
K:D
A,|"D"D3 F E D|"A"C3 E D C|"A"B,6-|B,4 z C|"A"C3 E D C|"D"D3 F E D|"D"A6-|A4 z|
"D"a2 a2 a2|"A"g2 g2 g2|f2 e2 d2|e4 z2|"A"g2 g2 g2|"D"f2 f2 f2|e2 d2 c2|"D"d4 z2|]`},{id:"santa-lucia",genre:"World",abc:`X:1
T:Santa Lucia
C:Teodoro Cottrau (1849)
M:3/8
L:1/8
Q:3/8=50
K:D
"D"A>A d|d c/B/c|"A"c B/A/G|"D"G F2|F>G A|"A"A G/F/E|"D"E d c|d3|]`},{id:"funiculi",genre:"World",abc:`X:1
T:Funiculì, Funiculà
C:Luigi Denza (1880)
M:6/8
L:1/8
Q:3/8=100
K:D
"D"A,|D2D DFE|D2D DFE|"A"E2E EGF|E3 z2E|"D"F2F FAG|F2F FAG|"A"GFE DCB,|A,3 z2|
"D"A2A A2A|A3 F3|"A"G2G G2G|G3 E3|"D"A2A A2A|"G"B2c d2B|"A"A3 E3|"D"D3 z2|]`},{id:"o-sole-mio",genre:"World",abc:`X:1
T:'O Sole Mio
C:Eduardo di Capua (1898)
M:4/4
L:1/8
Q:1/4=70
K:G
"G"D2|B3 A A2 G2|"D"A6 B,C|D2 C2 C2 B,2|"G"B,6 D2|
"G"B3 A A2 G2|"Am"G2 A2 "D"A2 D2|"G"B2 A2 "D"G2 F2|"G"G6|]`},{id:"bella-ciao",genre:"World",abc:`X:1
T:Bella Ciao
O:Italian folk song
M:4/4
L:1/8
Q:1/4=120
K:Am
"Am"E2 A2 B2 c2|A6 z2|E2 A2 B2 c2|A6 z2|E2 A2 B2 c4|B2 A2 c4|B2 A2 e4|e2 e2 e2 de|
"Dm"f2 f4 z2|f2 ed f2 e2|"Am"d2 c4 z2|"E"e2 d2 c2 B2|"Am"A8|]`},{id:"tum-balalaika",genre:"World",abc:`X:1
T:Tumbalalaika
O:Yiddish folk song
M:3/4
L:1/4
Q:1/4=130
K:Am
"Am"E E E|E D C|"E"B, B, B,|B,3|"E"B, B, B,|B, C D|"Am"C C C|C3|
"Am"E E E|E D C|"E"B, B, B,|B, C D|"E"E E ^G|B A ^G|"Am"A3|A3|]`},{id:"cherry-blossom-sakura-2",genre:"World",abc:`X:1
T:Mo Li Hua (Jasmine Flower)
O:Chinese folk song
M:2/4
L:1/16
Q:1/4=60
K:G
"G"E4 E2G2|A2c2 c2A2|G4 G2A2|G8|E4 E2G2|A2c2 c2A2|G4 G2A2|G8|
"G"G4 G4|G4 E2G2|A4 A4|G8|E4 D2E2|G4 E2D2|C4 C2D2|C8|]`},{id:"house-rising-sun",genre:"Rock & Metal",abc:`X:1
T:House of the Rising Sun
O:American folk song (traditional)
M:6/8
L:1/8
Q:3/8=70
K:Am
E|"Am"A3 "C"B3|"D"c3 "F"A3|"Am"z3 "C"c2 c|"D"B3 "F"A3|"Am"E6-|"C"E3 "D"z2 E|"Am"A3 "C"c3|"D"e3 "F"d2 c|
"Am"A3 "C"c3|"E"B6-|B3 z2 E|"Am"A3 "C"B3|"D"c3 "F"A3|"Am"A3 "C"c3|"E"B3 A2 ^G|"Am"A6|]`},{id:"john-henry",genre:"Blues & Jazz",abc:`X:1
T:John Henry
O:American folk ballad
M:4/4
L:1/8
Q:1/4=110
K:D
"D"A,2 D2 D2 D2|D2 E2 F2 D2|F2 F2 F2 E2|D2 F2 A4|
"G"B2 B2 B2 A2|G2 B2 "D"A4|"A"z2 A2 G2 E2|"D"D8|]`},{id:"st-james-infirmary",genre:"Blues & Jazz",abc:`X:1
T:St. James Infirmary
O:American (traditional)
M:4/4
L:1/8
Q:1/4=70
K:Dm
"Dm"A,2 D2 D2 D2|"A"E2 ^C2 D4|"Dm"z2 D2 F2 A2|"Gm"_B2 A2 G4|
"Dm"z2 D2 D2 F2|"A"E2 ^C2 A,4|"Dm"z2 D2 F2 E2|"Dm"D8|]`},{id:"midnight-special",genre:"Blues & Jazz",abc:`X:1
T:Midnight Special
O:American (traditional)
M:4/4
L:1/8
Q:1/4=110
K:G
"C"z2 E2 G2 G2|G2 E2 G4|"G"z2 D2 G2 G2|G2 E2 D4|
"D"z2 D2 F2 A2|A2 F2 A2 B2|"G"G2 E2 D2 B,2|G,8|]`},{id:"wade-in-the-water",genre:"Blues & Jazz",abc:`X:1
T:Wade in the Water
O:African American spiritual
M:4/4
L:1/8
Q:1/4=90
K:Em
"Em"B4 B2 A2|G2 E4 z2|"Am"A4 A2 G2|"Em"E8|
"Em"B4 B2 A2|G2 E4 z2|"B7"^D2 E2 F2 ^D2|"Em"E8|]`},{id:"kumbaya",genre:"Folk",abc:`X:1
T:Kum Ba Yah
O:African American spiritual
M:4/4
L:1/4
Q:1/4=80
K:D
"D"D F A2|A2 "G"B B|"D"A4|z D F A|A2 "A"G F|E4|
z D F A|A2 "G"B B|"D"A2 G F|"A"F E D E|"D"D4|]`},{id:"oh-shenandoah-2",genre:"Folk",abc:`X:1
T:She'll Be Coming Round the Mountain
O:American
M:4/4
L:1/8
Q:1/4=120
K:D
DE|"D"F2 F2 F2 DE|F2 A2 F2 E2|D2 D2 D2 F2|A6 AB|
"G"d2 d2 d2 B2|"D"A2 A2 A2 F2|"A"E2 E2 E2 FE|E6 DE|
"D"F2 F2 F2 DE|F2 A2 d2 c2|"G"B2 B2 "D"A2 F2|"A"E2 E2 "D"D2|]`},{id:"polly-wolly",genre:"Folk",abc:`X:1
T:Polly Wolly Doodle
O:American
M:2/4
L:1/8
Q:1/4=120
K:D
"D"F F F F|F2 D2|F F F F|F2 D2|"A"E E E E|E2 C2|E E E E|E2 A,2|
"D"F F F F|F2 D2|F F F F|F2 D2|"A"E2 E2|F2 E2|"D"D4|D4|]`},{id:"camptown-races",genre:"Folk",abc:`X:1
T:Camptown Races
C:Stephen Foster (1850)
M:2/4
L:1/8
Q:1/4=110
K:D
"D"AA FA|BA F2|FE2 z|FE2 z|AA FA|BA F2|"A"E2 FE|"D"D2 z2|
"D"D>D FA|d4|B>B dB|A3 F|AA F/F/F|E F/G/ F2|"A"E2 FE|"D"D4|]`},{id:"beautiful-dreamer",genre:"Folk",abc:`X:1
T:Beautiful Dreamer
C:Stephen Foster (1864)
M:9/8
L:1/8
Q:3/8=50
K:D
"D"d3 c2 B A3|"D"F3 E2 D "A"E3|"A"G3 F2 E G3|"D"F6 z3|
"D"d3 c2 B A3|"D"F3 E2 D "A"E3|"A"G3 F2 E C3|"D"D6 z3|]`},{id:"oh-shenandoah-3",genre:"Folk",abc:`X:1
T:My Old Kentucky Home
C:Stephen Foster (1853)
M:4/4
L:1/8
Q:1/4=80
K:D
A,2|"D"D3 E F2 A2|"G"B2 d2 "D"A4|F2 D2 "A"E2 E2|"D"D6 A,2|
"D"D3 E F2 A2|"G"B2 d2 "D"A4|F2 D2 "A"E2 F2|"A"E6 A,2|
"D"D3 E F2 A2|"G"B2 d2 "D"A4|F2 D2 "A"E2 E2|"D"D6|]`}],Es=[{id:"soldiers-joy",genre:"Old-Time",abc:`X:1
T:Soldier's Joy
O:American / Scottish
R:reel
M:2/4
L:1/16
Q:1/4=90
K:D
(3ABc|:"D"d2cd BdAF|D2FA dfed|"A"cdec ABcA|"D"d2cd BdAF|
"D"d2cd BdAF|D2FA d2fd|"A"cdec ABcA|"D"d2f2 d2 (3ABc:|
|:"D"d2fg agfg|"A"a2A2 c2e2|"D"d2fg agfg|"A"a2A2 ce2c|
"D"d2fg agfg|"G"bgfe "D"d2fd|"A"cdec ABcA|"D"d2f2 d4:|`},{id:"arkansas-traveler",genre:"Old-Time",abc:`X:1
T:Arkansas Traveler
O:American
R:reel
M:2/4
L:1/16
Q:1/4=90
K:D
|:"D"fe|d2d2 dcde|f2f2 fefg|a2f2 "G"g2e2|"D"fdec d2fe|
d2d2 dcde|f2f2 fefg|a2f2 "A"g2e2|"D"d4 d2:|
|:"D"fg|a2f2 "A"g2e2|"D"fdec d2fg|a2f2 "A"g2e2|"D"fdec d2fg|
afdf "G"gebg|"D"afdf "A"gece|"D"d2d2 "A"cdec|"D"d4 d2:|`},{id:"turkey-in-the-straw",genre:"Old-Time",abc:`X:1
T:Turkey in the Straw
O:American
R:reel
M:2/4
L:1/16
Q:1/4=90
K:G
|:"G"dc|BAGA BGEF|G2G2 GFGA|BcdB "C"cBcd|"D"e2d2 d2dc|
"G"BAGA BGEF|G2G2 GFGA|BcdB "D"A2GA|"G"B2G2 G2:|
|:"G"g2|g2B2 B2AB|g2B2 B2AB|"C"cBcd e2d2|"D"edcB A2g2|
"G"g2B2 B2AB|g2B2 B2AB|"C"c2e2 "D"d2F2|"G"G6:|`},{id:"old-joe-clark",genre:"Old-Time",abc:`X:1
T:Old Joe Clark
O:American
R:reel
M:4/4
L:1/8
Q:1/4=110
K:Amix
|:"A"e2 e2 e2 fg|a2 a2 "G"g2 ed|"A"e2 e2 e2 fg|"G"a2 g2 "A"a4|
"A"e2 e2 e2 fg|a2 a2 "G"g2 ed|"A"c2 "E"B2 "A"A2 Bc|"E"d2 B2 "A"A4:|
|:"A"c2 c2 c2 B2|A2 A2 A2 Bc|"G"d2 B2 B2 cd|e2 d2 d4|
"A"c2 c2 c2 B2|A2 A2 A2 Bc|"E"d2 B2 B2 cB|"A"A6 z2:|`},{id:"bile-em-cabbage",genre:"Old-Time",abc:`X:1
T:Bile 'Em Cabbage Down
O:American
R:reel
M:4/4
L:1/8
Q:1/4=100
K:A
"A"c2c2 B2A2|"D"d2d2 "A"c4|c2c2 B2A2|"E"B2c2 "A"A4|
"A"c2c2 B2A2|"D"d2d2 "A"c4|c2c2 B2A2|"E"B2c2 "A"A4|
"A"e2e2 c2e2|"D"f2f2 "A"e4|e2e2 c2A2|"E"B2c2 "A"A4|
"A"e2e2 c2e2|"D"f2f2 "A"e4|e2e2 c2A2|"E"B2c2 "A"A4|]`},{id:"cripple-creek",genre:"Old-Time",abc:`X:1
T:Cripple Creek
O:American
R:reel
M:4/4
L:1/8
Q:1/4=110
K:A
|:"A"e2 ef e2 cB|A2 Bc "E"B2 A2|"A"e2 ef e2 cB|"E"A2 B2 "A"A4:|
|:"A"c2 cB A2 AB|cB A2 "E"B2 A2|"A"c2 cB A2 AB|"E"cB A2 "A"A4:|`},{id:"liberty",genre:"Old-Time",abc:`X:1
T:Liberty
O:American
R:reel
M:4/4
L:1/8
Q:1/4=110
K:D
|:"D"FG|ABAF A2 dB|ABAF E2 FG|ABAF A2 de|fdeB "A"A2 FG|
"D"ABAF A2 dB|ABAF E2 FG|"G"ABde f2 ed|"A"BAFE "D"D2:|
|:"D"fg|a2 af a2 fd|"G"g2 ge g2 fg|"D"a2 af a2 de|fdeB "A"A2 fg|
"D"a2 af a2 fd|"G"g2 ge g2 fg|"D"afge fde"A"c|"D"d2 d2 d2:|`},{id:"red-wing",genre:"Old-Time",abc:`X:1
T:Red Wing
C:Kerry Mills (1907)
R:polka
M:2/4
L:1/8
Q:1/4=100
K:G
"G"D>E GG|G2 GA|B>c dB|G4|"C"E>F GE|"G"D>E GB|"D"A4-|A4|
"G"D>E GG|G2 GA|B>c dB|G2 Bd|"C"e>e "G"dB|"D"A>B AF|"G"G4-|G4|
"C"c>c cc|e2 dc|"G"B>B BB|d2 BG|"D"A>B AF|D>E FA|"G"G>A BG|"D"A4|
"C"c>c cc|e2 dc|"G"B>B BB|d2 BG|"D"A>B AF|D>E FA|"G"G4-|G4|]`},{id:"whiskey-before-breakfast",genre:"Old-Time",abc:`X:1
T:Whiskey Before Breakfast
O:Canadian / American
R:reel
M:4/4
L:1/8
Q:1/4=110
K:D
|:"D"DEFG A2 FA|"G"BAGB "D"A2 FA|"G"G2 BG "D"F2 AF|"A"EDEF E2 FE|
"D"DEFG A2 FA|"G"BAGB "D"A2 FA|"G"G2 BG "D"F2 AF|"A"EDEF "D"D4:|
|:"D"d2 dc d2 AF|"G"G2 BG "D"F2 AF|"G"G2 BG "D"F2 AF|"A"EDEF E2 FE|
"D"d2 dc d2 AF|"G"G2 BG "D"F2 AF|"G"G2 BG "D"F2 AF|"A"EDEF "D"D4:|`},{id:"angeline-the-baker",genre:"Old-Time",abc:`X:1
T:Angeline the Baker
O:American
R:reel
M:4/4
L:1/8
Q:1/4=110
K:D
|:"D"FA|B2 A2 F2 AF|E2 D2 D2 EF|"G"G2 B2 "D"A2 FA|"A"E4 E2 FA|
"D"B2 A2 F2 AF|E2 D2 D2 EF|"G"G2 B2 "D"A2 F2|"A"E2 D2 "D"D2:|
|:"D"de|f3 e f2 ed|"G"B2 A2 "D"A2 de|f3 e f2 ed|"A"e4 e2 de|
"D"f3 e f2 ed|"G"B2 A2 "D"F2 AF|"G"G2 B2 "D"A2 F2|"A"E2 D2 "D"D2:|`},{id:"ragtime-annie",genre:"Old-Time",abc:`X:1
T:Ragtime Annie
O:American
R:reel
M:2/4
L:1/16
Q:1/4=90
K:D
|:"D"f2e2|d2f2 a2f2|d2f2 a2f2|"A"g2e2 c2e2|g2e2 c2e2|
"D"d2f2 a2f2|d2f2 a2f2|"A"g2e2 cdec|"D"d4 :|
|:"G"g2f2|e2B2 B2c2|d2B2 B2c2|"D"d2A2 A2B2|d2A2 A2d2|
"G"e2B2 B2c2|d2B2 B2c2|"A"d2c2 B2c2|"D"d4 :|`},{id:"st-annes-reel",genre:"Celtic",abc:`X:1
T:St. Anne's Reel
O:French Canadian
R:reel
M:4/4
L:1/8
Q:1/4=110
K:D
|:"D"fe|dcdA FAdA|"G"BcdB "D"A2 fe|"Em"dcdA FAdA|"A"Bcde fdfe|
"D"dcdA FAdA|"G"BcdB "D"A2 a2|"G"bagf "A"gfed|"A"cdec "D"d2:|
|:"D"fg|afdf afdf|"G"gbag "D"f2 fg|"D"afdf afdf|"A"gbag f2 ef|
"G"g2 gf gfed|"D"Bcdf afdf|"G"bagf "A"gfed|"A"cdec "D"d2:|`},{id:"devils-dream",genre:"Old-Time",abc:`X:1
T:Devil's Dream
O:Scottish / American
R:reel
M:4/4
L:1/8
Q:1/4=110
K:A
|:"A"ag|aAeA fAeA|aAeA fAeA|"D"dfed fedc|"E"dcBA GFED|
"A"aAeA fAeA|aAeA fAeA|"D"dfed fedc|"E"dcBc "A"A2:|
|:"A"ce|aece fece|aece fece|"D"dfed fedc|"E"dcBA GFED|
"A"aece fece|aece fece|"D"dfed fedc|"E"dcBc "A"A2:|`},{id:"fishers-hornpipe",genre:"Celtic",abc:`X:1
T:Fisher's Hornpipe
O:English / American
R:hornpipe
M:4/4
L:1/8
Q:1/4=100
K:F
|:"F"AG|FAcf ag f2|"C"egfe dc B2|"F"AGFA "Bb"dcBA|"C"G2 B2 B2 AG|
"F"FAcf ag f2|"C"egfe dc B2|"F"AFAc "Bb"dfed|"C"cAGB "F"A2:|
|:"F"ag|"C"fe e2 e2 ga|"Bb"bg e2 e2 ga|"F"bagf "C"g2 c2|"F"agfe "C"f2 ag|
"F"fe e2 e2 ga|"Bb"bg e2 e2 ga|"F"bagf "C"edcB|"F"AFGE F2:|`},{id:"sailors-hornpipe",genre:"Celtic",abc:`X:1
T:Sailor's Hornpipe (College Hornpipe)
O:English
R:hornpipe
M:4/4
L:1/8
Q:1/4=100
K:D
|:"D"ag|fdAF DFAd|fdAF Ddfa|"A"gecA EAce|gecA "A7"Aceg|
"D"fdAF DFAd|fdAF Ddfa|"G"gbag "A"fgec|"D"d2 f2 d2:|
|:"D"cd|"A7"e2 A2 A2 cd|e2 A2 A2 cd|"D"fdAF DFAd|fdAF DF (3ABc|
"D"d2 f2 "A"e2 g2|"D"f2 a2 "G"g2 b2|"D"afge "A"fdec|"D"d2 f2 d2:|`},{id:"irish-washerwoman",genre:"Celtic",abc:`X:1
T:The Irish Washerwoman
O:Irish
R:jig
M:6/8
L:1/8
Q:3/8=100
K:G
|:"G"dc|BGG DGG|BGB dcB|"D"cAA EAA|cBc edc|
"G"BGG DGG|BGB dcB|"C"cBc "D"Adc|"G"BGG G:|
|:"G"Bc|dGG BGG|dGG BGG|"D"dAA cAA|dAA cAA|
"G"BGG DGG|BGB dcB|"C"cBc "D"Adc|"G"BGG G:|`},{id:"kesh-jig",genre:"Celtic",abc:`X:1
T:The Kesh
O:Irish
R:jig
M:6/8
L:1/8
Q:3/8=100
K:G
|:"G"GAG GAB|"D"ABA ABd|"C"edd gdd|"D"edB dBA|
"G"GAG GAB|"D"ABA ABd|"C"edd gdB|"D"AGF "G"G3:|
|:"G"BAB dBd|ege dBG|BAB dBG|"D"ABA AGA|
"G"BAB dBd|ege dBd|"C"gfg aga|"D"bgf "G"g3:|`},{id:"swallowtail-jig",genre:"Celtic",abc:`X:1
T:Swallowtail Jig
O:Irish
R:jig
M:6/8
L:1/8
Q:3/8=100
K:Edor
|:"Em"GEE BEE|GEE BAG|"D"FDD ADD|dcd AGF|
"Em"GEE BEE|GEE B2c|"D"dcd AGF|"Em"GEE E3:|
|:"Em"B2B d2B|e2e g2e|"D"f2d d2c|dcd AGF|
"Em"B2B d2B|e2e g2e|"D"dcd AGF|"Em"GEE E3:|`},{id:"rakes-of-mallow",genre:"Celtic",abc:`X:1
T:The Rakes of Mallow
O:Irish
R:polka
M:2/4
L:1/8
Q:1/4=110
K:G
|:"G"GB GB|GB d2|"D"FA FA|FA c2|"G"GB GB|GB dg|"D"fe dc|"G"B2 G2:|
|:"G"g>f ed|g>f ed|"D"e>f ed|cB AF|"G"g>f ed|g>f ed|"D"fe dc|"G"B2 G2:|`},{id:"kerry-polka",genre:"Celtic",abc:`X:1
T:Kerry Polka
O:Irish
R:polka
M:2/4
L:1/8
Q:1/4=110
K:D
|:"D"FE DF|AF AB|AF AB|"A"AF ED|"D"FE DF|AF AB|"G"dc BA|"D"FD D2:|
|:"D"d>e fd|"A"ec AB|"D"d>e fd|"A"e2 cA|"D"d>e fd|"A"ec AB|"G"dc BA|"D"FD D2:|`},{id:"britches-full-of-stitches",genre:"Celtic",abc:`X:1
T:Britches Full of Stitches
O:Irish
R:polka
M:2/4
L:1/8
Q:1/4=110
K:A
|:"A"A>B AF|ED EF|"A"A>B AF|"E"E2 E2|"A"A>B AF|ED EF|"D"AB dB|"A"A2 A2:|
|:"D"d>e dB|AB AF|"D"d>e dB|"A"A2 A2|"D"d>e dB|AB AF|"E"ED EF|"A"A2 A2:|`},{id:"harvest-home",genre:"Celtic",abc:`X:1
T:Harvest Home
O:Irish
R:hornpipe
M:4/4
L:1/8
Q:1/4=100
K:D
|:"D"AF|DAFA DAFA|"G"dcde "D"fdAF|"A"EAcA EAcA|egfe dcBA|
"D"DAFA DAFA|"G"dcde "D"fdAF|"A"GBAG FAEc|"D"d2 f2 d2:|
|:"D"fg|afdf a2 gf|"A"gece g2 fe|"D"fdAd fdAd|"G"gfge "D"fdAF|
"D"DAFA DAFA|"G"dcde "D"fdAF|"A"GBAG FAEc|"D"d2 f2 d2:|`},{id:"drowsy-maggie",genre:"Celtic",abc:`X:1
T:Drowsy Maggie
O:Irish
R:reel
M:4/4
L:1/8
Q:1/4=110
K:Edor
|:"Em"E2BE dEBE|E2BE "D"AFDF|"Em"E2BE dEBE|"D"BABc dAFD:|
|:"D"d2fd c2ec|defg afge|"D"d2fd c2ec|"Em"BABc dAFD:|`},{id:"silver-spear",genre:"Celtic",abc:`X:1
T:The Silver Spear
O:Irish
R:reel
M:4/4
L:1/8
Q:1/4=110
K:D
|:"D"FA|BAFA D2FA|BAFA "G"B2AB|"D"d2fd "A"edBd|"D"ABde fdAB|
"D"BAFA D2FA|BAFA "G"B2AB|"D"d2fd "A"edBe|"D"fdeB d2:|
|:"D"fg|afdf afdf|"A"gefd edBd|"D"afdf a2fa|"A"gefd e2fg|
"D"afdf afdf|"A"gefd edBd|"D"d2fd "A"edBe|"D"fdeB d2:|`},{id:"cooleys-reel",genre:"Celtic",abc:`X:1
T:Cooley's Reel
O:Irish
R:reel
M:4/4
L:1/8
Q:1/4=110
K:Edor
|:"Em"EBBA B2EB|B2AB dBAG|"D"FDAD BDAD|FDAD dAFD|
"Em"EBBA B2EB|B2AB defg|"D"afge dBAF|DEFD "Em"E4:|
|:"Em"gfef gfef|g2fg edBd|"Em"gfef gfef|"D"afge d2Bd|
"Em"gfef gfef|g2fg edBd|"D"afge dBAF|DEFD "Em"E4:|`},{id:"mason-apron",genre:"Celtic",abc:`X:1
T:The Mason's Apron
O:Irish / Scottish
R:reel
M:4/4
L:1/8
Q:1/4=100
K:A
|:"A"ed|cAAA EAAA|cAec dBGB|cAAA EAAA|"E"Bcde "A"cAAe|
"A"cAAA EAAA|cAec dBGB|cAAA EAAA|"E"Bcde "A"cA:|
|:"A"ef|aeef aeef|aecA ecAc|"D"dfed fedf|"E"edcB GABe|
"A"aeef aeef|aecA ecAc|"D"dfed fedc|"E"Bcde "A"cA:|`},{id:"star-of-munster",genre:"Celtic",abc:`X:1
T:The Star of Munster
O:Irish
R:reel
M:4/4
L:1/8
Q:1/4=100
K:Ador
|:"Am"cBAG EAAG|ABcd e2dc|"G"BGGF G2AB|cBAG FGEG|
"Am"cBAG EAAG|ABcd e2dc|"G"BGdB "Am"cAAG|"Em"EG"G"GF "Am"A2A2:|
|:"Am"a2ag eaag|a2ag edcB|"G"g2gf g2ga|gfga gedB|
"Am"a2ag eaag|abag edcB|"G"BGdB "Am"cAAG|"Em"EG"G"GF "Am"A2A2:|`},{id:"morrisons-jig",genre:"Celtic",abc:`X:1
T:Morrison's Jig
O:Irish
R:jig
M:6/8
L:1/8
Q:3/8=100
K:Edor
|:"Em"E3 B3|EBE AFD|E3 B3|"D"ABA FED|
"Em"E3 B3|EBE AFD|"G"G3 FGA|"D"dAG FED:|
|:"Em"Bee fee|aee fee|Bee fee|"D"a2g fed|
"Em"Bee fee|aee fee|"G"gfe "D"d2A|BAG FED:|`},{id:"rights-of-man",genre:"Celtic",abc:`X:1
T:The Rights of Man
O:Irish
R:hornpipe
M:4/4
L:1/8
Q:1/4=90
K:Em
|:"Em"GA|BAGF E2 (3FED|EFGA B2 ef|"D"gfed edBd|cBAG "B7"A2 GA|
"Em"BAGF E2 (3FED|EFGA B2 ef|"D"gfed BcdF|"Em"A2 G2 G2:|
|:"G"Bc|d2 Bd "D"f2 df|"Em"g2 fe "B7"^d2 ef|"Em"gfed "C"e2 dc|"D"BAGF "B7"E2 GA|
"Em"BAGF E2 (3FED|EFGA B2 ef|"D"gfed BcdF|"Em"A2 G2 G2:|`},{id:"haste-to-the-wedding",genre:"Celtic",abc:`X:1
T:Haste to the Wedding
O:Irish
R:jig
M:6/8
L:1/8
Q:3/8=100
K:D
|:"D"AFA Agf|edB cdB|AFA Agf|"A"efe e2g|
"D"fdf "G"gfg|"D"afd "G"B2B|"D"AFA "A"fge|"D"fdd d2:|
|:"D"fga a2f|"G"gab b2g|"D"fga afd|"A"edB c2A|
"D"fga a2f|"G"gab b2g|"D"fed "A"edc|"D"dfd d2:|`},{id:"flowers-of-edinburgh",genre:"Celtic",abc:`X:1
T:Flowers of Edinburgh
O:Scottish
R:reel
M:4/4
L:1/8
Q:1/4=100
K:G
|:"G"GE|D2 DE GFGA|BGBd cBAG|"D"FGAB cBAG|FGAF DEFD|
"G"GABG "C"E2 cE|"G"D2 dB "C"cBAG|"D"FGAF DEFA|"G"G2 G2 G2:|
|:"G"Bc|d2 dg edef|g2 gf gdBG|"C"c2 ce dcBA|"G"B2 Bd "D"cBAG|
"G"FGAB cBAG|DGBd "C"cBAG|"D"FGAF DEFA|"G"G2 G2 G2:|`},{id:"speed-the-plough",genre:"Celtic",abc:`X:1
T:Speed the Plough
O:English
R:reel
M:4/4
L:1/8
Q:1/4=110
K:G
|:"G"BGBG BGBG|"D"AFAF AFAF|"G"GABc dedc|"D"BcAB "G"G2 G2:|
|:"G"Bdgd Bdgd|"C"cege cege|"G"Bdgd Bdgd|"D"cBAG "G"GABc|
"G"dedB "C"cdec|"G"BcdB "D"A2 A2|"G"GABc "D"dedc|"D"BcAB "G"G2 G2:|`},{id:"planxty-irwin",genre:"Celtic",abc:`X:1
T:Planxty Irwin
C:Turlough O'Carolan (1670–1738)
R:waltz
M:3/4
L:1/8
Q:1/4=110
K:G
|:"G"D2|G2 G2 AB|"C"c2 B2 A2|"G"B2 G2 GA|"D"B2 A2 D2|
"G"G2 G2 AB|"C"c2 B2 A2|"D"BA G2 F2|"G"G4:|
|:"G"Bc|d2 d2 ef|g2 d2 B2|"C"c2 e2 dc|"G"B2 G2 Bc|
"G"d2 d2 ef|g2 d2 B2|"C"c2 B2 A2|"G"B2 G2 Bc|
"G"d2 g2 d2|"C"e2 c2 A2|"G"B2 G2 GA|"D"B2 A2 D2|
"G"G2 G2 AB|"C"c2 B2 A2|"D"BA G2 F2|"G"G4:|`},{id:"si-bheag",genre:"Celtic",abc:`X:1
T:Sí Bheag, Sí Mhór
C:Turlough O'Carolan (1670–1738)
R:waltz
M:3/4
L:1/8
Q:1/4=100
K:D
|:"D"de|f2 e2 d2|"G"B4 dB|"D"A2 F2 A2|"G"B4 AB|"D"d2 e2 f2|"G"e2 d2 B2|"A"A6-|A4:|
|:"D"de|f4 g2|a4 g2|"D"f2 d2 f2|"A"e4 de|"D"f2 e2 d2|"G"B4 dB|"D"A2 F2 "A"E2|"D"D6-|D4:|`},{id:"fanny-power",genre:"Celtic",abc:`X:1
T:Fanny Power
C:Turlough O'Carolan (1670–1738)
R:waltz
M:3/4
L:1/8
Q:1/4=110
K:G
|:"G"D2|G2 G2 AB|"C"c2 B2 A2|"G"B2 G2 B2|"D"d4 cB|
"C"A2 G2 FG|"D"A2 D2 GF|"C"E2 G2 "D"F2|"G"G4:|
|:"G"Bc|d2 g2 g2|"C"g4 fe|"G"d2 B2 G2|"D"A4 Bc|
"G"d2 g2 g2|"C"g4 fe|"G"d2 B2 "D"A2|"G"G4:|`},{id:"scotland-the-brave",genre:"Celtic",abc:`X:1
T:Scotland the Brave
O:Scottish
R:march
M:4/4
L:1/8
Q:1/4=100
K:D
"D"D2 D>E F>D F>A|d2 d>c d2 A2|"G"B>B A>G "D"F>G A>F|"A"E4 E4|
"D"D2 D>E F>D F>A|d2 d>c d2 A2|"G"B>B A>G "A"F>G A>E|"D"D4 D4|
"D"f4 f>e d>e|f>e d>B A4|"G"B>B A>G "D"F>G A>F|"A"E4 E4|
"D"D2 D>E F>D F>A|d2 d>c d2 A2|"G"B>B A>G "A"F>G A>E|"D"D4 D4|]`},{id:"bonnie-dundee",genre:"Celtic",abc:`X:1
T:Bonnie Dundee
O:Scottish
R:jig
M:6/8
L:1/8
Q:3/8=90
K:D
|:"D"A|AFD D2E|F2G A2B|"G"B2G "D"F2D|"A"E3 E2A|
"D"AFD D2E|F2G A2d|"G"BAG "A"FGE|"D"D3 D2:|
|:"D"d|dcd f2e|d2c d2A|"G"B2G "D"F2D|"A"E3 E2A|
"D"AFD D2E|F2G A2d|"G"BAG "A"FGE|"D"D3 D2:|`},{id:"mairis-wedding",genre:"Celtic",abc:`X:1
T:Mairi's Wedding (Lewis Bridal Song)
O:Scottish (trad.)
R:reel
M:4/4
L:1/8
Q:1/4=110
K:G
"G"G2 G2 G2 AB|"C"c4 B4|"D"A2 A2 A2 Bc|"G"d4 B4|
"G"G2 G2 G2 AB|"C"c4 B2 G2|"D"A2 B2 c2 A2|"G"G8|
"G"g4 d4|"C"e2 d2 c2 B2|"D"A2 A2 A2 Bc|"G"d4 B4|
"G"G2 G2 G2 AB|"C"c4 B2 G2|"D"A2 B2 c2 A2|"G"G8|]`},{id:"blackberry-blossom",genre:"Bluegrass",abc:`X:1
T:Blackberry Blossom
O:American
R:reel
M:4/4
L:1/8
Q:1/4=100
K:G
|:"G"BAGB "D"AGFA|"Em"G2 E2 "C"E3 D|"G"B,DGB "D"AGFA|"Em"GAGF E2 FG|
"G"BAGB "D"AGFA|"Em"G2 E2 "C"E3 D|"G"B,DGB "D"AGFA|"G"G2 G2 G4:|
|:"Em"B2 GB e2 Be|g2 eg b3 a|"Em"gfe^d e2 Bc|d2 dc BAGF|
"Em"E2 G2 B2 e2|g2 eg b3 a|"G"gfga "D"bgaf|"G"g2 g2 g4:|`},{id:"salt-creek",genre:"Bluegrass",abc:`X:1
T:Salt Creek
O:American
R:reel
M:4/4
L:1/8
Q:1/4=100
K:A
|:"A"e2 ec BcAB|cBAc e2 ef|"G"g2 gf gfed|"G"BAGB d2 ef|
"A"e2 ec BcAB|cBAc e2 ef|"G"gfed BAGB|"E"ABcB "A"A4:|
|:"A"A2 cB A2 AB|cBAc e2 ef|"G"g2 gf gfed|BAGB d2 ef|
"A"A2 cB A2 AB|cBAc e2 ef|"G"gfed BAGB|"E"ABcB "A"A4:|`},{id:"forked-deer",genre:"Old-Time",abc:`X:1
T:Forked Deer
O:American
R:reel
M:4/4
L:1/8
Q:1/4=100
K:D
|:"D"fe|dcdB A2FA|dcdB A2fe|dcdB AFED|"A"EFGF E2fe|
"D"dcdB A2FA|dcdB A2fe|dcdB AFEF|"D"D2 F2 D2:|
|:"D"FG|ABAF ABAF|ABAF E2FG|ABAF ABde|"A"fdec d2FG|
"D"ABAF ABAF|dcdB A2fe|dcdB AFEF|"D"D2F2 D2:|`},{id:"over-the-waterfall",genre:"Old-Time",abc:`X:1
T:Over the Waterfall
O:American
R:reel
M:4/4
L:1/8
Q:1/4=100
K:D
|:"D"de|f2 ef d2 Bd|"G"A2 FA B2 dB|"D"A2 FA DEFA|"A"G2 E2 E2 de|
"D"f2 ef d2 Bd|"G"A2 FA B2 dB|"D"A2 FA "A"EFGE|"D"D2 F2 D2:|
|:"G"g2 fg ed B2|"D"d2 df a2 fa|"G"g2 fg edBd|"A"e4 e2 de|
"G"g2 fg ed B2|"D"d2 df a3 f|"A"edcB A2 c2|"D"d6:|`},{id:"golden-slippers",genre:"Old-Time",abc:`X:1
T:Golden Slippers
C:James A. Bland (1879)
R:reel
M:4/4
L:1/8
Q:1/4=110
K:G
"G"B2 Bc d2 B2|G2 Bd g4|"D"A2 AB c2 A2|F2 Ac f4|
"G"B2 Bc d2 B2|G2 Bd g2 fe|"D"d2 c2 A2 F2|"G"G6 z2|
"C"e2 e2 e2 ed|"G"d4 B4|"D"A2 AB c2 A2|"G"B2 Bc d4|
"C"e2 e2 e2 ed|"G"d2 B2 G2 B2|"D"A2 A2 c2 F2|"G"G6 z2|]`},{id:"westphalia-waltz",genre:"Old-Time",abc:`X:1
T:Westphalia Waltz
O:American (Polish origin)
R:waltz
M:3/4
L:1/8
Q:1/4=120
K:G
"G"D2|G4 AB|d4 B2|"C"c2 B2 A2|"G"B4 G2|"D"A4 FA|d4 c2|"D"A2 F2 D2|"G"G4 D2|
"G"G4 AB|d4 B2|"C"e4 dc|"G"B4 G2|"D"A2 B2 c2|"D"d2 c2 A2|"D"F2 A2 F2|"G"G4|]`},{id:"the-parting-glass",genre:"Celtic",abc:`X:1
T:The Parting Glass
O:Irish / Scottish
R:air
M:3/4
L:1/8
Q:1/4=80
K:Em
"Em"E2|"Em"G4 A2|"G"B4 d2|"D"A4 G2|"Em"E4 D2|"Em"E4 G2|"D"A4 B2|"Em"G6-|G4 E2|
"Em"G4 A2|"G"B4 d2|"D"A4 G2|"Em"E4 D2|"Em"E4 G2|"D"A2 G2 F2|"Em"E6-|E4 B2|
"G"d4 e2|"Em"g4 e2|"D"d4 B2|"Em"G4 B2|"G"d4 e2|"D"d4 B2|"D"A6-|A4 B2|
"G"d4 e2|"Em"g4 e2|"D"d4 B2|"Em"G4 E2|"Em"E4 G2|"D"A2 G2 F2|"Em"E6-|E4|]`},{id:"star-county-down",genre:"Celtic",abc:`X:1
T:Star of the County Down
O:Irish
R:waltz
M:3/4
L:1/8
Q:1/4=120
K:Em
B,2|"Em"E2 E2 D2|E2 G2 A2|"G"B2 B2 A2|B4 d2|"D"e2 d2 B2|"Em"A2 G2 E2|"D"D2 E2 D2|"Em"B,4 B,2|
"Em"E2 E2 D2|E2 G2 A2|"G"B2 B2 A2|B4 d2|"D"e2 d2 B2|"Em"A2 G2 E2|"D"F2 D2 D2|"Em"E4 B2|
"G"d2 e2 d2|"G"B2 A2 G2|"D"A2 B2 A2|"Em"E4 G2|"G"d2 e2 d2|"Em"B2 A2 G2|"D"A2 B2 A2|"B7"B4 B,2|
"Em"E2 E2 D2|E2 G2 A2|"G"B2 B2 A2|B4 d2|"D"e2 d2 B2|"Em"A2 G2 E2|"D"F2 D2 D2|"Em"E4|]`},{id:"sally-gardens",genre:"Celtic",abc:`X:1
T:Down by the Sally Gardens
O:Irish
R:air
M:3/4
L:1/8
Q:1/4=90
K:D
"D"FE|D2 E2 F2|"G"B4 AF|"D"A4 "A"FE|"D"F4 FE|
"D"D2 E2 F2|"G"B4 AF|"D"A4 "A"E2|"D"D4 FE|
"D"D2 E2 F2|"G"B4 AF|"D"A4 "A"FE|"D"F4 FE|
"D"D2 E2 F2|"G"B4 AF|"D"A4 "A"E2|"D"D4|]`},{id:"whiskey-in-the-jar",genre:"Celtic",abc:`X:1
T:Whiskey in the Jar
O:Irish
R:march
M:4/4
L:1/8
Q:1/4=110
K:D
"D"A2|A2 A2 A2 FA|"Bm"B2 B2 B2 Bc|"G"d2 c2 B2 A2|"D"F4 A4|
"D"A2 A2 A2 FA|"Bm"B2 B2 B2 Bc|"G"d2 c2 B2 A2|"D"F6 z2|
"A"E2 E2 E2 FG|"D"A2 F2 D4|"A"E2 E2 E2 FG|"D"A2 F2 D2 D2|
"D"d4 d4|"A"c4 c4|"G"B2 B2 "A"A2 G2|"D"F2 E2 D2|]`}],bs=[{id:"ode-to-joy",genre:"Classical",abc:`X:1
T:Ode to Joy (Symphony No. 9)
C:Ludwig van Beethoven (1824)
M:4/4
L:1/4
Q:1/4=110
K:D
"D"F F G A|A G F E|D D E F|"A"F>E E2|
"D"F F G A|A G F E|D D E F|"A"E>D "D"D2|
"A"E E F D|E F/G/ F D|E F/G/ F E|D E A,2|
"D"F F G A|A G F E|D D E F|"A"E>D "D"D2|]`},{id:"minuet-g-petzold",genre:"Classical",abc:`X:1
T:Minuet in G (BWV Anh. 114)
C:Christian Petzold (attr. J.S. Bach)
M:3/4
L:1/8
Q:1/4=120
K:G
|:"G"d2 GA Bc|d2 G2 G2|"C"e2 cd ef|"G"g2 G2 G2|
"C"c2 dc BA|"G"B2 cB AG|"D"F2 GA BG|A6|
"G"d2 GA Bc|d2 G2 G2|"C"e2 cd ef|"G"g2 G2 G2|
"C"c2 dc BA|"G"B2 cB AG|"D"A2 BA GF|"G"G6:|
|:"G"b2 ga bg|"D"a2 de fd|g2 ef ge|f2 AB cA|
"G"G2 AB cd|"D"e2 ef ga|"D"f2 e2 d2|^c6|
"D"d2 AB cd|"G"B2 cB AG|"D"F2 GA BG|"D"A2 DE FG|
"C"A2 cB AG|"G"B2 cB AG|"D"A2 BA GF|"G"G6:|`},{id:"musette-d",genre:"Classical",abc:`X:1
T:Musette in D (BWV Anh. 126)
C:J.S. Bach (attr.)
M:2/4
L:1/8
Q:1/4=110
K:D
|:"D"a2 af|d2 df|a2 af|d2 df|"A"ef ge|fa ge|fd ec|"D"d2 d2:|
|:"A"e2 ec|A2 Ac|e2 ec|A2 Ac|"D"fa ge|fa ge|fd ec|"D"d2 d2:|`},{id:"gavotte-gossec",genre:"Classical",abc:`X:1
T:Gavotte
C:François-Joseph Gossec (1786)
M:4/4
L:1/8
Q:1/4=110
K:D
|:"D"FA dc dc|BA GF G2 F2|"A"EG cB cB|AG FE F2 E2|
"D"FA dc dc|BA GF G2 F2|"A"EF GA Bc dB|"A"A2 c2 "D"d4:|
|:"A"ec Ac ec Ac|"D"fd Ad fd Ad|"A"ec Ac ec Ac|"E"BA ^GF "A"A4|
"D"FA dc dc|BA GF G2 F2|"A"EF GA Bc dB|"A"A2 c2 "D"d4:|`},{id:"eine-kleine",genre:"Classical",abc:`X:1
T:Eine kleine Nachtmusik (1st mvt.)
C:Wolfgang Amadeus Mozart (1787)
M:4/4
L:1/8
Q:1/4=120
K:G
"G"G2 z D G2 z D|GDGB d2 z2|"C"c2 z A c2 z A|"D"cAFA D2 z2|
"G"G4 B>A G2|G2 FF F4|"D"A>c FA G2 G2|G2 BB B4|
"D"d>c BA BA AG|AG GF ^FG GA|"G"Bc dc BA GF|G2 z2 z4|]`},{id:"spring-vivaldi",genre:"Classical",abc:`X:1
T:Spring (The Four Seasons, 1st mvt.)
C:Antonio Vivaldi (1725)
M:4/4
L:1/8
Q:1/4=100
K:E
"E"e2|g2 gg f/e/b2 b|g2 gg f/e/b2 b|g a/b/ a2 g2 f2|e4 z2 e2|
g2 gg f/e/b2 b|g2 gg f/e/b2 b|g a/b/ a2 g2 f2|e4 z2|]`},{id:"brahms-lullaby",genre:"Classical",abc:`X:1
T:Lullaby (Wiegenlied, Op. 49 No. 4)
C:Johannes Brahms (1868)
M:3/4
L:1/4
Q:1/4=90
K:D
F/F/|"D"A2 F/F/|A2 F/A/|d c3/2 B/|"A"B A E/F/|G E E/F/|G2 E/G/|c/B/ A c|"D"d2 D/D/|
d2 B/G/|A2 F/D/|"G"G A B|"D"A2 D/D/|d2 B/G/|A2 F/D/|"A"G F/E/ D|"D"D2|]`},{id:"hungarian-dance-5",genre:"Classical",abc:`X:1
T:Hungarian Dance No. 5
C:Johannes Brahms (1869)
M:2/4
L:1/8
Q:1/4=88
K:Gm
"Gm"D4-|D2 G2|_B4-|B2 A>G|"D"^F4-|F2 A2|"Gm"G4-|G2 z2|
"Cm"C4-|C2 F2|_E4-|E2 D>C|"Gm"B,4-|B,2 D2|"D"^C4-|C2 z2|
"Gm"D4-|D2 G2|_B4-|B2 A>G|"D"^F4-|F2 A2|"Gm"G2 ^F2|G2 A2|
"Cm"_B2 c2|d2 _e2|"Gm"d2 c2|_B2 A2|"D"G2 ^F2|A2 D2|"Gm"G4|z4|]`},{id:"new-world-largo",genre:"Classical",abc:`X:1
T:Largo (New World Symphony) — "Goin' Home"
C:Antonín Dvořák (1893)
M:4/4
L:1/8
Q:1/4=60
K:D
"D"F3 A A4|F3 E D4|"G"E3 F A3 F|"A"E8|
"D"F3 A A4|F3 E D4|"A"E3 F E3 D|"D"D8|]`},{id:"morning-mood",genre:"Classical",abc:`X:1
T:Morning Mood (Peer Gynt)
C:Edvard Grieg (1875)
M:6/8
L:1/8
Q:3/8=60
K:E
"E"BGF EFG|BGF EFG|BGB cGc|BGF E3|
BGF EFG|BGF EFG|BGB cGc|e3 c3|]`},{id:"mountain-king",genre:"Rock & Metal",abc:`X:1
T:In the Hall of the Mountain King
C:Edvard Grieg (1875)
M:4/4
L:1/8
Q:1/4=120
K:Bm
"Bm"B,^CDE F2D2|"F#"^E2^C2 =E2C2|"Bm"D2B,2 D4|
"Bm"B,^CDE F2D2|"F#"^E2^C2 =E2C2|"Bm"D2B,2 D4|
"F#"F^GAB c2A2|^e2c2 =e2c2|"F#"d2B2 d4|
"F#"F^GAB c2A2|^e2c2 =e2c2|"F#"F8|
"Bm"B,^CDE F2D2|"F#"^E2^C2 =E2C2|"Bm"D2B,2 D4|
"Bm"B,^CDE F2D2|"F#"^E2^C2 =E2C2|"Bm"D2B,2 D4|
"F#"F^GAB c2A2|^e2c2 =e2c2|"F#"d2B2 d4|
"F#"F^GAB c2A2|^e2c2 =e2c2|"Bm"B8|]`},{id:"pachelbel-canon",genre:"Classical",abc:`X:1
T:Canon in D (melody)
C:Johann Pachelbel (c. 1680)
M:4/4
L:1/4
Q:1/4=70
K:D
"D"f2 "A"e2|"Bm"d2 "F#m"c2|"G"B2 "D"A2|"G"B2 "A"c2|
"D"d2 "A"c2|"Bm"B2 "F#m"A2|"G"G2 "D"F2|"G"G2 "A"E2|
"D"D/F/A/G/ "A"F/D/F/E/|"Bm"D/B,/D/A/ "F#m"G/B/A/G/|"G"F/D/E/c/ "D"d/f/a/a,/|"G"b,/g/f/e/ "A"f/e/d/c/|
"D"d/c/d/D/ "A"C/A/E/F/|"Bm"D/d/c/B/ "F#m"c/f/a/b/|"G"g/f/e/g/ "D"f/e/d/c/|"G"B/A/G/F/ "A"E/G/F/E/|"D"D4|]`},{id:"jesu-joy",genre:"Classical",abc:`X:1
T:Jesu, Joy of Man's Desiring
C:J.S. Bach (1723)
M:3/4
L:1/8
Q:1/4=90
K:G
"G"GAB dcc|edd gfg|"D"dBG ABc|"G"dedcBA|
"G"BcdAGF|GDG BAB|"Em"GAB dcc|edd gfg|
"D"dBG ABc|DGF EDC|"D"B,DG FA,F|"G"G6|]`},{id:"air-g-string",genre:"Classical",abc:`X:1
T:Air on the G String
C:J.S. Bach (c. 1730)
M:4/4
L:1/8
Q:1/4=50
K:D
"D"f8-|f2 "F#m"(3bge "Bm"d/c/d/e/ "D"d/c/B/A/|"G"G2 B4 e2|"A"e/c/d/B/ A>G F2 E2|"D"D8|]`},{id:"surprise-symphony",genre:"Classical",abc:`X:1
T:Surprise Symphony (2nd mvt.)
C:Joseph Haydn (1791)
M:2/4
L:1/8
Q:1/4=90
K:C
"C"CC EE|GG E2|FF DD|"G"B,B, G,2|
"C"CC EE|GG E2|"G"F/E/D/E/ "C"FE|"G"D2 z2|
"G"DD FF|"C"EE G2|"G"DD FF|"C"E E G2|
"C"CC EE|GG E2|"G"F/E/D/E/ "C"FE|"C"C2 z2|]`},{id:"rondo-alla-turca",genre:"Classical",abc:`X:1
T:Rondo alla Turca (theme)
C:Wolfgang Amadeus Mozart (1783)
M:2/4
L:1/16
Q:1/4=110
K:Am
"Am"BA^GA c4|dc^Bc e4|fe^de bagf|"E"e4 "Am"c'4|
"Am"a2 c'2 "E"b2 a2|"Am"g2 a2 "E"b2 a2|"Am"g2 a2 "E"b2 a2|"Am"g2 f2 e4|]`},{id:"the-swan",genre:"Classical",abc:`X:1
T:The Swan (Carnival of the Animals)
C:Camille Saint-Saëns (1886)
M:6/4
L:1/8
Q:1/4=80
K:G
"G"g6- g2 f2 b2|e2 d2 g4 B4|"C"c4 d2 e2 g2 c'2|"G"b6- b4 B2|
"Am"c4 d2 e2 c2 e2|"D"a6 g2 f2 e2|"G"d6- d4|]`},{id:"swan-lake",genre:"Classical",abc:`X:1
T:Swan Lake (Scene theme)
C:Pyotr Ilyich Tchaikovsky (1876)
M:4/4
L:1/8
Q:1/4=72
K:Bm
"Bm"F8|B,C DE F4|D2 F2 D2 F2|B,2 D2 B,4|
"G"G8|"Em"E2 G2 E2 B,2|"F#"^A,4 C4|"Bm"B,8|]`},{id:"sugar-plum",genre:"Classical",abc:`X:1
T:Dance of the Sugar Plum Fairy
C:Pyotr Ilyich Tchaikovsky (1892)
M:2/4
L:1/16
Q:1/4=72
K:Em
"Em"g2e2 g2^f2|e2^d2 e2 z2|"B7"^d2^d2 ^d2^c2|"Em"e2e2 e2 z2|
"Em"g2e2 g2^f2|e2^d2 e2 z2|"Am"c2c2 B2A2|"B7"B4 z4|]`},{id:"can-can",genre:"Classical",abc:`X:1
T:Can-Can (Galop Infernal)
C:Jacques Offenbach (1858)
M:2/4
L:1/8
Q:1/4=140
K:D
"D"D2 EG|FE Ac|BA AE|"A"GF E2|
"A"E2 EG|FE Ac|BA AE|"D"FE D2|
"D"D2 EG|FE Ac|BA AE|"A"GF E2|
"A"E2 EG|FE Ac|BA EF|"D"D2 z2|]`},{id:"william-tell",genre:"Rock & Metal",abc:`X:1
T:William Tell Overture (Finale)
C:Gioachino Rossini (1829)
M:2/4
L:1/16
Q:1/4=120
K:E
"E"BBB2 BBB2|BBBe e2f2|"B"g2BB BBB2|BBBe "E"g2e2|
"E"BBB2 BBB2|BBBe e2f2|"B"g2fe dBdf|"E"e4 z4|
"E"BBB2 BBB2|BBBe e2f2|"B"g2BB BBB2|BBBe "E"g2e2|
"E"BBB2 BBB2|BBBe e2f2|"B"g2fe dBdf|"E"e4 z4|]`},{id:"habanera",genre:"Classical",abc:`X:1
T:Habanera (Carmen)
C:Georges Bizet (1875)
M:2/4
L:1/16
Q:1/4=70
K:Dm
"Dm"d4 ^c2c2|=c4 B2B2|"A7"_B2 A2 A2 _A2|G4 F4|
"Dm"F2 E2 E2 _E2|D4 ^C4|"A7"E2 D2 ^C2 B,2|"Dm"A,4 z4|]`},{id:"toreador",genre:"Classical",abc:`X:1
T:Toreador Song (Carmen)
C:Georges Bizet (1875)
M:4/4
L:1/8
Q:1/4=100
K:F
"F"c2 d>c A2 A2|A>G A>B A4|"Bb"B>G "F"c>A B>G "C"E2|"F"F8|
"Dm"d2 c>B A2 G2|"C"A>G A>B G4|"F"c3 B A2 G2|"C"G6 z2|]`},{id:"blue-danube",genre:"Classical",abc:`X:1
T:The Blue Danube
C:Johann Strauss II (1867)
M:3/4
L:1/4
Q:1/4=150
K:D
"D"D D F|A3|A z a|a z f|f z D|D F A|A3|A z a|a z g|g z C|
"A"C E B|B3|B z b|b z g|g z C|C E B|B3|B z b|b z f|f z D|
"D"D F A|d3|d z d'|d' z a|a z D|D F A|d3|d z d'|d' z b|b z e|
"A"g3|^g2 a|"D"f'3|f'2 d'|"G"f2 e2|"A"b2 a2|"D"d3|]`},{id:"radetzky",genre:"Classical",abc:`X:1
T:Radetzky March (trio theme)
C:Johann Strauss I (1848)
M:2/4
L:1/8
Q:1/4=110
K:D
"D"A>A AA|A2 f2|"A"e>d cd|e2 c2|"A"e>e ee|e2 g2|"D"f>e de|f2 d2|
"D"A>A AA|A2 f2|"A"e>d cd|e2 c2|"A"e>e ef|"G"g>f "A"ec|"D"d2 z2|]`},{id:"la-donna",genre:"Classical",abc:`X:1
T:La donna è mobile (Rigoletto)
C:Giuseppe Verdi (1851)
M:3/8
L:1/8
Q:3/8=60
K:A
"A"c2c|c>e d|"E"B3|B2 z|"E"d2d|d>f e|"A"c3|c2 z|
"A"c2c|c>e d|"E"B3|B2 z|"E"d2 d|d>f e|"A"c3-|c2 z|]`},{id:"brindisi",genre:"Classical",abc:`X:1
T:Brindisi (La Traviata)
C:Giuseppe Verdi (1853)
M:3/8
L:1/8
Q:3/8=60
K:Bb
F|"Bb"f2 f|f2 e|"Bb"d2 d|d2 c|"Bb"B2 c|d2 e|"F"f2 g|f2 F|
"Bb"f2 f|f2 e|"Bb"d2 d|d2 c|"F"c2 d|e2 c|"Bb"B3-|B2|]`},{id:"o-mio-babbino",genre:"Classical",abc:`X:1
T:O mio babbino caro (Gianni Schicchi)
C:Giacomo Puccini (1918)
M:6/8
L:1/8
Q:3/8=50
K:Ab
"Ab"E|c3 B>A B|"Db"F3- F2 B|"Ab"E3 A>c e|"Eb"e3 d2 E|
"Ab"c3 B>A B|"Db"F3- F2 B|"Ab"E2 A c2 e|"Eb"e3 d2|]`},{id:"humoresque",genre:"Classical",abc:`X:1
T:Humoresque (Op. 101 No. 7)
C:Antonín Dvořák (1894)
M:2/4
L:1/16
Q:1/4=70
K:G
"G"G3A G3A|B3d e3d|"D"g3e d3B|"G"A3B A3G|
"G"G3A G3A|B3d e3d|"D"g3e d3B|"G"G8|]`},{id:"liebestraum",genre:"Classical",abc:`X:1
T:Liebestraum No. 3 (theme)
C:Franz Liszt (1850)
M:6/4
L:1/8
Q:1/4=90
K:Ab
"Ab"c6 c4 B2|c6 "Db"d4 c2|"Ab"c6 B4 A2|"Eb"B6- B6|
"Ab"c6 c4 B2|c6 "Db"f4 e2|"Ab"e6 "Eb"d4 c2|"Ab"c12|]`},{id:"wedding-march",genre:"Classical",abc:`X:1
T:Wedding March (A Midsummer Night's Dream)
C:Felix Mendelssohn (1842)
M:4/4
L:1/8
Q:1/4=100
K:C
"C"G>GGG G4|"F"G>GGG A4|"G7"F>FFF F2 G2|"C"E>FGc e4|
"Am"d>ccB c2 A2|"Dm"A>GFE "G"D4|"C"G>Gcc e2 d2|"G"c2 B2 "C"c4|]`},{id:"bridal-chorus",genre:"Classical",abc:`X:1
T:Bridal Chorus (Here Comes the Bride)
C:Richard Wagner (1850)
M:4/4
L:1/8
Q:1/4=80
K:G
"G"D4 G3G|G6 z2|"D"D4 A3F|"G"G6 z2|
"G"D4 G3c|"C"c4 B3A|"D"G3F G3A|"G"B6 z2|]`},{id:"ave-maria-schubert",genre:"Classical",abc:`X:1
T:Ave Maria
C:Franz Schubert (1825)
M:4/4
L:1/8
Q:1/4=50
K:Bb
"Bb"B4 A>B dc|"F"B6 z2|"Bb"d3 d e>dcB|"F"c6 z2|
"Gm"d3 d g>f e>d|"Cm"c4 =B>c ed|"F"c2 B2 "F7"c>BAG|"Bb"B6 z2|]`},{id:"schubert-serenade",genre:"Classical",abc:`X:1
T:Serenade (Ständchen)
C:Franz Schubert (1828)
M:3/4
L:1/8
Q:1/4=80
K:Dm
"Dm"A>^G A2 F2|D4 A,2|"A"A>^G A2 ^C2|"Dm"D4 z2|
"Dm"d>^c d2 A2|F4 D2|"Gm"_B>A G2 E2|"A"^C4 z2|]`},{id:"pomp-circumstance",genre:"Classical",abc:`X:1
T:Pomp and Circumstance March No. 1 (Trio)
C:Edward Elgar (1901)
M:4/4
L:1/4
Q:1/4=72
K:G
"G"B3 A|G A B c|"D"A4|z D E F|"C"G2 E F|"G"G A B c|"D"A4|z4|
"G"B3 A|G A B c|"C"e d c B|"Am"B2 A2|"D"d2 A B|"G"c B A G|"D"A4|"G"G4|]`},{id:"trumpet-voluntary",genre:"Classical",abc:`X:1
T:Prince of Denmark's March (Trumpet Voluntary)
C:Jeremiah Clarke (c. 1700)
M:4/4
L:1/8
Q:1/4=90
K:D
"D"A2|d4 A2 d2|"A"c2 B2 A2 e2|"D"f3 e d2 c2|"A"d4 A2 A2|
"D"d4 A2 d2|"G"B2 A2 G2 B2|"A"A2 G2 F2 E2|"D"D6|]`},{id:"water-music-hornpipe",genre:"Classical",abc:`X:1
T:Hornpipe (Water Music)
C:George Frideric Handel (1717)
M:3/2
L:1/8
Q:1/2=60
K:D
"D"d2 A2 F2 A2 d2 f2|"A"e2 c2 A2 c2 e2 a2|"D"f2 d2 "G"g2 B2 "A"e2 c2|"D"d4 A4 D4|
"D"F2 A2 d4 A4|"A"E2 A2 c4 A4|"D"f2 e2 "A"d2 c2 B2 A2|"D"d4 D4 z4|]`},{id:"largo-xerxes",genre:"Classical",abc:`X:1
T:Largo (Ombra mai fù, Xerxes)
C:George Frideric Handel (1738)
M:3/4
L:1/8
Q:1/4=50
K:G
"G"G6-|G2 A2 B2|"C"c3 B A2|"G"B4 G2|"D"A4 d2-|d2 c2 B2|"Em"B4 A2|"D"A6|
"G"G6-|G2 A2 B2|"C"c3 d e2|"G"d4 B2|"D"A2 B2 c2|"G"B2 A2 G2|"D"A4 F2|"G"G6|]`},{id:"bach-minuet-2",genre:"Classical",abc:`X:1
T:Minuet in G minor (BWV Anh. 115)
C:Christian Petzold (attr. J.S. Bach)
M:3/4
L:1/8
Q:1/4=110
K:Gm
|:"Gm"d4 Bc|d2 G2 G2|"Cm"e4 cd|"Gm"e2 G2 G2|
"Cm"c2 B2 A2|"Gm"B2 A2 G2|"D"^F2 G2 A2|"Gm"D4 B2|
"Gm"d4 Bc|d2 G2 G2|"Cm"e4 cd|"Gm"e2 G2 G2|
"Cm"c2 B2 A2|"Gm"B2 A2 G2|"D"A2 G2 ^F2|"Gm"G6:|`},{id:"bourree-handel",genre:"Classical",abc:`X:1
T:Bourrée
C:George Frideric Handel
M:2/2
L:1/8
Q:1/2=70
K:G
|:"G"G2|B2 G2 d2 B2|"C"c2 B2 A2 G2|"D"F2 G2 A2 F2|"G"G6 B2|
"G"d2 B2 g2 d2|"C"e2 d2 c2 B2|"D"A2 B2 c2 A2|"G"B6:|`},{id:"boccherini-minuet",genre:"Classical",abc:`X:1
T:Minuet (String Quintet Op. 11 No. 5)
C:Luigi Boccherini (1771)
M:3/4
L:1/16
Q:1/4=100
K:A
"A"c2B2 A4 A4|e2d2 c4 c4|"E"B2c2 d2e2 f2g2|"A"a4 c4 z4|
"A"c2B2 A4 A4|e2d2 c4 c4|"E"Bcde fgab "E"g4|"A"a4 A4 z4|]`},{id:"moonlight-sonata",genre:"Classical",abc:`X:1
T:Moonlight Sonata (1st mvt. melody)
C:Ludwig van Beethoven (1801)
M:4/4
L:1/8
Q:1/4=50
K:C#m
"C#m"z4 z2 G>G|G6 G>G|"A"G4 A4|"F#m"G4 "G#"^F4|"C#m"E6 G>G|G6 G>G|"G#"G4 A4|"C#m"G8|]`},{id:"fur-elise",genre:"Classical",abc:`X:1
T:Für Elise (theme)
C:Ludwig van Beethoven (1810)
M:3/8
L:1/16
Q:3/8=50
K:Am
e^d|"Am"e^deB=dc|"Am"A2 z CEA|"E"B2 z E^GB|"Am"c2 z Ee^d|
"Am"e^deB=dc|"Am"A2 z CEA|"E"B2 z EcB|"Am"A4|]`},{id:"turkish-march-beethoven",genre:"Classical",abc:`X:1
T:Turkish March (The Ruins of Athens)
C:Ludwig van Beethoven (1811)
M:2/4
L:1/16
Q:1/4=100
K:Bb
"Bb"d2c2 d4|c2B2 c4|"F"c2=B2 c2d2|"Bb"e4 d4|
"Bb"d2c2 d4|c2B2 c4|"F"c2B2 A2c2|"Bb"B4 z4|]`},{id:"spring-song",genre:"Classical",abc:`X:1
T:Spring Song (Op. 62 No. 6)
C:Felix Mendelssohn (1842)
M:2/4
L:1/16
Q:1/4=80
K:A
"A"e4 e3c|e4 a4|"D"f4 d3f|"A"e4 c4|"E"B4 B3c|d4 B4|"A"c4 A4|"E"B8|]`},{id:"nocturne-chopin",genre:"Classical",abc:`X:1
T:Nocturne Op. 9 No. 2 (theme)
C:Frédéric Chopin (1832)
M:12/8
L:1/8
Q:3/8=50
K:Eb
B,|"Eb"G4 F2 G4 E2|"Bb"E6 B,4 B,2|"Eb"G3 F2 G2 F2 E2 G2|"Ab"F6- F4 B,2|"Eb"G4 F2 G4 E2|"Bb"E6 B,4|]`},{id:"salut-damour",genre:"Classical",abc:`X:1
T:Salut d'Amour
C:Edward Elgar (1888)
M:2/4
L:1/8
Q:1/4=60
K:E
"E"B,|E2 ^D>E|G2 B,2|"A"c3 B|"E"G2 z B,|"F#m"F2 ^E>F|"B7"A2 B,2|"E"B3 A|G2 z|]`},{id:"meditation-thais",genre:"Classical",abc:`X:1
T:Méditation (Thaïs)
C:Jules Massenet (1894)
M:4/4
L:1/8
Q:1/4=50
K:D
"D"F2 A2 d2 f2|"A"e4 "D"d4|"G"B2 d2 g2 b2|"D"a6 f2|"G"g2 e2 "D"d2 A2|"Em"B2 G2 "A7"E2 C2|"D"D8|]`},{id:"csardas",genre:"Classical",abc:`X:1
T:Csárdás (Largo theme)
C:Vittorio Monti (1904)
M:4/4
L:1/8
Q:1/4=60
K:Dm
"Dm"A,8-|A,2 D2 F2 A2|d6 ^c2|"Gm"d2 =c2 _B2 A2|"Dm"A6 F2|"A7"E2 ^C2 E2 G2|"Dm"F2 D2 A,2 D2|F8|]`},{id:"paganini-24",genre:"Rock & Metal",abc:`X:1
T:Caprice No. 24 (theme)
C:Niccolò Paganini (1817)
M:2/4
L:1/16
Q:1/4=90
K:Am
|:"Am"a4 a2c'2|b2a2 e'4|a4 a2c'2|b2a2 e'4|
"Am"a4 a2c'2|b2a2 e'4|"E"e'4 e'2^g'2|"Am"a'4 z4:|
|:"Dm"d'4 d'2f'2|"G"e'2d'2 g'4|"C"c'4 c'2e'2|"F"d'2c'2 f'4|
"Bdim"b4 b2d'2|"E"c'2b2 e'4|"Am"a4 "E"^g2e2|"Am"a4 z4:|`},{id:"bumblebee",genre:"Rock & Metal",abc:`X:1
T:Flight of the Bumblebee
C:Nikolai Rimsky-Korsakov (1900)
M:2/4
L:1/16
Q:1/4=72
K:Am
"Am"e'^d'=d'^c' =c'b_b=b|=c'^c'=d'^d' e'^d'=d'^c'|=c'b_b=b c'^c'd'^d'|e'^d'=d'^c' =c'b_b=b|
"Am"e'^d'=d'^c' =c'b_b=b|=c'^c'=d'^d' e'^d'=d'^c'|"E"^g'^f'=f'e' =e'^d'=d'^c'|"Am"a'4 z4|]`},{id:"toccata-d-minor",genre:"Rock & Metal",abc:`X:1
T:Toccata in D minor (opening)
C:J.S. Bach (attr.)
M:4/4
L:1/16
Q:1/4=60
K:Dm
"Dm"a'2g'2 a'8 z4|g'f'e'd' ^c'4 d'8|"A"a2g2 a8 z4|e2f2 ^c2d2 z8|
"Dm"A2G2 A8 z4|G F E D ^C4 D8|]`},{id:"ride-valkyries",genre:"Rock & Metal",abc:`X:1
T:Ride of the Valkyries
C:Richard Wagner (1856)
M:9/8
L:1/16
Q:3/8=60
K:Bm
"Bm"F B5 d6 B d5|f6 d f5 b6|"D"A d5 f6 d f5|a6 f a5 d'6|
"F#"c f5 a6 f a5|c'6 a c'5 f'6|"Bm"B d5 f6 d f5|"F#"f6 F B5 "Bm"B6|]`},{id:"danse-macabre",genre:"Rock & Metal",abc:`X:1
T:Danse Macabre (waltz theme)
C:Camille Saint-Saëns (1874)
M:3/4
L:1/8
Q:1/4=150
K:Gm
"Gm"D2 G2 G2|G2 ^F2 G2|"Cm"A2 G2 _B2|"D"A4 ^F2|
"Gm"D2 G2 G2|G2 ^F2 G2|"D"A2 G2 ^F2|"Gm"G4 z2|
"Gm"g2 d2 d2|_e2 d2 c2|"D"d2 c2 _B2|A4 ^F2|
"Gm"g2 d2 d2|_e2 d2 c2|"D"_B2 A2 ^F2|"Gm"G4 z2|]`},{id:"night-bald-mountain",genre:"Rock & Metal",abc:`X:1
T:Night on Bald Mountain (theme)
C:Modest Mussorgsky (1867)
M:4/4
L:1/8
Q:1/4=110
K:Dm
"Dm"D2 A2 _B2 A2|^G2 A2 F2 D2|"Gm"G2 _B2 d2 B2|"A"A6 z2|
"Dm"D2 A2 _B2 A2|^G2 A2 F2 D2|"A"E2 ^C2 E2 G2|"Dm"F6 z2|]`},{id:"funeral-march",genre:"Rock & Metal",abc:`X:1
T:Funeral March (Sonata No. 2)
C:Frédéric Chopin (1839)
M:4/4
L:1/8
Q:1/4=50
K:Bbm
"Bbm"F4 F3 F|F4 _A3 G|"Bbm"G3 F F3 =E|"Bbm"F8|
"Bbm"F4 F3 F|F4 _A3 G|"Bbm"G3 F F3 =E|"Bbm"F8|]`},{id:"dies-irae",genre:"Rock & Metal",abc:`X:1
T:Dies Irae (plainchant)
C:Gregorian chant (13th c.)
M:4/4
L:1/4
Q:1/4=80
K:Dm
"Dm"F E F D|E C D2|F F G F|E D E2|
"Dm"F E F D|E C D2|F F G F|E D D2|]`},{id:"bolero",genre:"Rock & Metal",abc:`X:1
T:Bolero (theme)
C:Maurice Ravel (1928)
M:3/4
L:1/16
Q:1/4=72
K:C
"C"c4 Bcdc BAc2|c2Ac c4 BcAG|E2EF A4 G4|"C"F4 E2D2 C4|]`},{id:"korobeiniki",genre:"Rock & Metal",abc:`X:1
T:Korobeiniki (Tetris theme)
O:Russian folk song (1861)
M:4/4
L:1/8
Q:1/4=140
K:Am
"Am"e2 Bc d2 cB|A2 Ac e2 dc|"E"B3 c d2 e2|"Am"c2 A2 A4|
"Dm"z d2 f a2 gf|"C"e3 c e2 dc|"E"B2 Bc d2 e2|"Am"c2 A2 A4|
"Am"e2 Bc d2 cB|A2 Ac e2 dc|"E"B3 c d2 e2|"Am"c2 A2 A4|
"Dm"z d2 f a2 gf|"C"e3 c e2 dc|"E"B2 Bc d2 e2|"Am"c2 A2 A4|]`},{id:"hava-nagila",genre:"Rock & Metal",abc:`X:1
T:Hava Nagila
O:Jewish folk (1918)
M:4/4
L:1/8
Q:1/4=120
K:Dphr
"D"A3 A c2 B2|A4 ^F4|^F3 ^F B2 A2|G4 E4|
"Gm"E3 E G2 F2|E4 D4|"A"^C2 D2 E2 F2|"D"D8|]`}],Fs=[{id:"jingle-bells",genre:"Holiday",abc:`X:1
T:Jingle Bells
C:James Lord Pierpont (1857)
M:4/4
L:1/8
Q:1/4=120
K:D
"D"F2F2 F4|F2F2 F4|F2A2 D3E|F8|"G"G2G2 G3G|"D"G2F2 F2FF|"A"F2E2 E2F2|E4 A4|
"D"F2F2 F4|F2F2 F4|F2A2 D3E|F8|"G"G2G2 G3G|"D"G2F2 F2FF|"A"A2A2 G2E2|"D"D8|]`},{id:"silent-night",genre:"Holiday",abc:`X:1
T:Silent Night
C:Franz Xaver Gruber (1818)
M:6/8
L:1/8
Q:3/8=50
K:D
"D"A3 BA2|F6|A3 BA2|F6|"A"e3 e2c|c6|"D"d3 d2A|A6|
"G"B3 B2d|"D"d>cB A2B|A3 BA2|F6|"G"B3 B2d|"D"d>cB A2B|A3 BA2|F6|
"A"e3 e2g|e>cA c3|"D"d6|f6|d>AF A>GE|"D"D6-|D6|]`},{id:"joy-to-the-world",genre:"Holiday",abc:`X:1
T:Joy to the World
C:Lowell Mason / G.F. Handel (1839)
M:2/4
L:1/8
Q:1/4=90
K:D
"D"d2 c>B|"A"A3 G|"D"F2 E2|"A"D3 A|B3 B|c3 c|"D"d3 d|d c B A|
"D"A>G FD|d c B A|A>G FF|F F F F/G/|A3 G/F/|E E E E/F/|G3 F/E/|"D"D2 d2|B>A G F|"A"G2 F2|"D"D4|]`},{id:"deck-the-halls",genre:"Holiday",abc:`X:1
T:Deck the Halls
O:Welsh
M:4/4
L:1/8
Q:1/4=110
K:D
"D"A3G F2E2|D2E2 F2D2|"A"EFGE "D"F3E|D2C2 D4|
"D"A3G F2E2|D2E2 F2D2|"A"EFGE "D"F3E|D2C2 D4|
"A"E3F G2E2|"D"F3G A2E2|"A"FG A2 Bc d2|c2B2 A4|
"D"A3G F2E2|D2E2 F2D2|"G"BBBB "D"A3G|F2E2 D4|]`},{id:"o-christmas-tree",genre:"Holiday",abc:`X:1
T:O Christmas Tree (O Tannenbaum)
O:German
M:3/4
L:1/8
Q:1/4=90
K:D
A,2|"D"D3 D D2|E4 F2|F3 F F2|"A"F4 E2|"A"F2 G2 C2|E4 D2|"D"D4|]`},{id:"we-wish-merry-christmas",genre:"Holiday",abc:`X:1
T:We Wish You a Merry Christmas
O:English
M:3/4
L:1/8
Q:1/4=140
K:D
A,2|"D"D2 DE DC|"G"B,2 B,2 B,2|"E"E2 EF ED|"A"C2 A,2 A,2|"F#"F2 FG FE|"Bm"D2 B,2 A,A,|"G"B,2 E2 "A"C2|"D"D4|]`},{id:"hark-herald",genre:"Holiday",abc:`X:1
T:Hark! The Herald Angels Sing
C:Felix Mendelssohn (1840)
M:4/4
L:1/4
Q:1/4=100
K:D
"D"A, D D>C|D F F E|"A"A A A>G|"D"F E F2|
"D"A, D D>C|D F F E|"A"A E E>C|"A"C B, A,2|]`},{id:"o-come-all-ye",genre:"Holiday",abc:`X:1
T:O Come, All Ye Faithful (Adeste Fideles)
C:John Francis Wade (1751)
M:4/4
L:1/4
Q:1/4=100
K:D
"D"D2 D A,|D2 E2|"A"A, A, A,2|"D"D2 F2|
"D"E D C B,|"A"A,3 z|]`},{id:"god-rest-ye",genre:"Holiday",abc:`X:1
T:God Rest Ye Merry, Gentlemen
O:English
M:4/4
L:1/4
Q:1/4=110
K:Em
"Em"E|E B B A|G F E D|E F G A|"B7"B3 E|
"Em"E B B A|G F E D|E F G A|"B7"B3 B|
"C"c A B c|"G"d e B A|G E F G|"Am"A2 G A|
"Em"B c B A|G F E D|"Am"G2 F G|"B7"A2 B c|"Em"B4|]`},{id:"away-in-a-manger",genre:"Holiday",abc:`X:1
T:Away in a Manger
C:William J. Kirkpatrick (1895)
M:3/4
L:1/4
Q:1/4=100
K:D
A|"D"A G F|F E D|D C B,|"A"A,2 A,|A, B, A,|A, E C|"A"B, A, D|"D"F2 A|
"D"A G F|F E D|"G"D C B,|"D"A,2 A,|"D"A, B, A,|A, E C|B, A, D|"D"D2|]`},{id:"first-noel",genre:"Holiday",abc:`X:1
T:The First Noel
O:English (traditional)
M:3/4
L:1/4
Q:1/4=110
K:D
F/E/|"D"D3/2 E/ F/G/|A2 B/c/|"G"d c B|"D"A2 B/c/|d c B|A B c|d A G|"D"F2 F/E/|
"D"D3/2 E/ F/G/|A2 B/c/|"G"d c B|"D"A2 B/c/|d c B|A B c|d A G|"D"F2 F/E/|
"D"D3/2 E/ F/G/|A2 d/c/|"G"B2 B|"D"A3|d c B|A B c|d A G|"D"F2|]`},{id:"good-king-wenceslas",genre:"Holiday",abc:`X:1
T:Good King Wenceslas
O:Piae Cantiones (1582)
M:4/4
L:1/4
Q:1/4=110
K:D
"D"D D D E|D D A,2|B, A, B, C|D2 D2|
"D"D D D E|D D A,2|B, A, B, C|D2 D2|
"D"A G F E|F E D2|B, A, B, C|D2 D2|
"G"A, A, B, C|D D E2|"D"A G F E|"A"D2 "D"G2|"D"D4|]`},{id:"angels-we-have-heard",genre:"Holiday",abc:`X:1
T:Angels We Have Heard on High
O:French carol
M:4/4
L:1/4
Q:1/4=100
K:D
"D"F F F A|A G/F/ F2|F E F A|F E/D/ D2|
"D"F F F A|A G/F/ F2|F E F A|F E/D/ D2|
"D"A2- A/B/A/G/|"G"B2- B/c/B/A/|"A"c2- c/d/c/B/|"D"A3 A|
"G"B2- B/c/B/A/|"A"c2- c/d/c/B/|"D"A3 A|"G"B2 "A"c2|"D"d4|]`},{id:"carol-of-bells",genre:"Holiday",abc:`X:1
T:Carol of the Bells (Shchedryk)
C:Mykola Leontovych (1916)
M:3/4
L:1/8
Q:1/4=140
K:Gm
"Gm"B2 AB G2|B2 AB G2|B2 AB G2|B2 AB G2|
"Gm"d2 cd B2|d2 cd B2|d2 cd B2|d2 cd B2|
"Gm"g2 gg fe|d2 dd cB|c2 cc dc|G2 GG G2|
"D"D2 EF GA|B2 c2 B2|"D"A2 G2 ^F2|"Gm"G6|]`},{id:"o-little-town",genre:"Holiday",abc:`X:1
T:O Little Town of Bethlehem
C:Lewis Redner (1868)
M:4/4
L:1/4
Q:1/4=90
K:D
"D"F|F F E F|B A G F|"G"G B A G|"A"F2 E F|
"D"F F E F|"Bm"B A G F|"E"G B A G|"A"E2 D|]`},{id:"up-on-the-housetop",genre:"Holiday",abc:`X:1
T:Up on the Housetop
C:Benjamin Hanby (1864)
M:4/4
L:1/4
Q:1/4=120
K:D
"D"A A B A|F D F2|"G"G G B G|"D"A3 z|"A"E E F E|"D"D F A2|"A"E E F E|"A"E3 z|
"G"G G B2|"D"A A F2|"A"E E F E|"D"D3 z|]`},{id:"jolly-old-st-nick",genre:"Holiday",abc:`X:1
T:Jolly Old St. Nicholas
O:American (19th c.)
M:4/4
L:1/4
Q:1/4=110
K:D
"D"A A A A|G G G2|F F F F|"A"A3 z|E E F E|"D"D F A2|"A"E E F E|"A"E3 z|
"D"A A A A|G G G2|F F F F|"A"A3 z|"A"A G F E|"D"D F A2|"A"E E F E|"D"D4|]`},{id:"go-tell-it",genre:"Holiday",abc:`X:1
T:Go Tell It on the Mountain
O:African American spiritual
M:4/4
L:1/8
Q:1/4=100
K:D
"D"F2 F2 E2 D2|B,2 A,2 D4|"G"G2 G2 F2 E2|"D"D2 F2 A4|
"D"F2 F2 E2 D2|"G"B,2 A,2 D2 B2|"D"A2 F2 "A"E2 E2|"D"D8|]`},{id:"be-thou-my-vision",genre:"Hymns",abc:`X:1
T:Be Thou My Vision
C:Tune: Slane (Irish traditional)
M:3/4
L:1/4
Q:1/4=110
K:D
"D"D D E|F E D|E F A|B2 A|"G"B d e|f e d|"A"B A B|"D"A3|
"D"d d e|f e d|"A"B A B|"D"A3|"G"B d e|f e d|"A"B A B|"D"A3|]`},{id:"morning-has-broken",genre:"Hymns",abc:`X:1
T:Morning Has Broken (Bunessan)
O:Scottish Gaelic melody
M:3/4
L:1/4
Q:1/4=120
K:D
"D"D F A|d3|"G"e d c|"A"B2 A|"D"F A d|"G"B3|"A"A F E|"D"D3|
"D"F A F|"A"E2 F|"Bm"D B, A,|"A"A,3|"D"D E F|"G"B3|"A"A F E|"D"D3|]`},{id:"old-hundredth",genre:"Hymns",abc:`X:1
T:Old Hundredth (Doxology)
C:Louis Bourgeois (1551)
M:4/4
L:1/4
Q:1/4=80
K:G
"G"G2 G F|E D G A|B2 B B|"D"A G "C"c B|"G"A2 G2|
"G"B2 B B|A G c B|"D"A2 G A|"G"B G A F|"G"G4|]`},{id:"holy-holy-holy",genre:"Hymns",abc:`X:1
T:Holy, Holy, Holy (Nicaea)
C:John Bacchus Dykes (1861)
M:4/4
L:1/4
Q:1/4=80
K:D
"D"D D F F|"G"A2 A2|"D"B B B B|A2 F2|"A"A A A A|"D"d2 B2|"A"E E E E|"A"E3 z|
"D"D D F F|"G"A2 A2|"D"B2 B B|A2 F2|"G"d A G F|"D"A2 "A"E2|"D"D4|]`},{id:"come-thou-fount",genre:"Hymns",abc:`X:1
T:Come, Thou Fount of Every Blessing (Nettleton)
C:John Wyeth (1813)
M:3/4
L:1/4
Q:1/4=110
K:D
"D"A F D|F E D|"G"B A B|"D"A2 F|"A"A F E|E F A|"D"F D E|D3|
"D"A F D|F E D|"G"B A B|"D"A2 F|"A"A F E|E F A|"D"F D E|D3|
"D"d c B|A F A|"G"B A B|"D"A2 F|d c B|A F A|"A"F E D|"A"E3|
"D"A F D|F E D|"G"B A B|"D"A2 F|"A"A F E|E F A|"D"F D E|D3|]`},{id:"it-is-well",genre:"Hymns",abc:`X:1
T:It Is Well with My Soul (Ville du Havre)
C:Philip Bliss (1876)
M:4/4
L:1/8
Q:1/4=70
K:D
"D"F3 E D3 F|"G"B3 A G3 E|"D"A3 G F3 A|"A"E8|
"D"F3 E D3 F|"G"B3 A G3 E|"D"A3 G F3 E|"D"D8|]`},{id:"nearer-my-god",genre:"Hymns",abc:`X:1
T:Nearer, My God, to Thee (Bethany)
C:Lowell Mason (1856)
M:6/4
L:1/4
Q:1/4=110
K:D
"D"F2 E D2 B,|"D"A,4 A,2|D2 F E2 D|"A"E6|
"D"F2 E D2 B,|"D"A,4 A,2|"D"D2 E "A"E2 C|"D"D6|]`},{id:"shall-we-gather",genre:"Hymns",abc:`X:1
T:Shall We Gather at the River
C:Robert Lowry (1864)
M:4/4
L:1/8
Q:1/4=100
K:D
"D"F>F F>E D2 F2|A>A A>G F4|"G"G>G B>G "D"F2 A2|"A"E6 z2|
"D"F>F F>E D2 F2|A>A A>G F4|"G"B>B A>F "A"E2 G2|"D"D6 z2|]`},{id:"jerusalem",genre:"Hymns",abc:`X:1
T:Jerusalem
C:Hubert Parry (1916)
M:4/4
L:1/8
Q:1/4=80
K:D
"D"A,2|D3 E F3 D|"G"G4 B2 A2|"D"F3 E D2 F2|"A"E6 A,2|
"D"D3 E F3 D|"G"G4 B2 A2|"D"A3 F "A"E2 F2|"D"D6|]`},{id:"thaxted",genre:"Hymns",abc:`X:1
T:I Vow to Thee, My Country (Thaxted)
C:Gustav Holst (1921)
M:3/4
L:1/8
Q:1/4=90
K:C
"C"E2G2|A3 c B>G|c2 d2 c2|B2 A2 B2|A2 G2 E2|G2 A2 G2|E2 D2 C2|D4|]`},{id:"abide-with-me",genre:"Hymns",abc:`X:1
T:Abide with Me (Eventide)
C:William Henry Monk (1861)
M:4/4
L:1/2
Q:1/2=50
K:D
"D"F F/E/|D A|B A|A G|F G|A B|"A"A G|"A"F2|
"D"F F/E/|D A|"Bm"A G/F/|"E"E2|"D"F G|A F|"A"E E|"D"D2|]`},{id:"rock-of-ages",genre:"Hymns",abc:`X:1
T:Rock of Ages (Toplady)
C:Thomas Hastings (1830)
M:3/4
L:1/8
Q:1/4=90
K:D
"D"F4 E2|D4 B,2|A,6|"A"C2 D2 E2|"D"F4 G2|F6|
"D"F4 E2|D4 B,2|A,6|"A"C2 D2 E2|"D"D4 F2|"A"E6|
"D"F4 E2|D4 B,2|A,6|"A"C2 D2 E2|"D"F4 E2|D6|]`},{id:"what-a-friend",genre:"Hymns",abc:`X:1
T:What a Friend We Have in Jesus (Converse)
C:Charles Converse (1868)
M:4/4
L:1/8
Q:1/4=90
K:D
"D"A3 B A2 F2|"G"D3 B, "D"A,4|"D"D3 E F2 A2|"A"E8|
"D"A3 B A2 F2|"G"D3 B, "D"A,4|"A"D3 E F2 E2|"D"D8|]`},{id:"holy-night",genre:"Holiday",abc:`X:1
T:O Holy Night (Cantique de Noël)
C:Adolphe Adam (1847)
M:12/8
L:1/8
Q:3/8=50
K:D
"D"F6 F3 A3|A2 G2 B2 G6|F3 A3 "A"E3 E2 E|"D"D6 z6|
"D"F6 F3 A3|A2 G2 B2 G6|F3 A3 "A"E3 F2 E|"D"D12|]`}],Cs=[{id:"riff-power-e",genre:"Rock & Metal",abc:`X:1
T:Power Drive in E minor
C:Original riff (VAW)
M:4/4
L:1/8
Q:1/4=120
K:Em
|:"Em"E E G E A E B A|G E G A B2 A G|"C"E E G E A E B d|"D"e d B A "B7"B4:|
|:"Em"e2 B2 d2 B2|e B d B A G E2|"C"e2 B2 d2 B2|"B7"^d c B A "Em"B4:|`},{id:"riff-gallop",genre:"Rock & Metal",abc:`X:1
T:Gallop of the Iron Horse
C:Original riff (VAW)
M:4/4
L:1/16
Q:1/4=110
K:Em
|:"Em"E2EE E2EE G2GG E2EE|"D"F2FF F2FF A2AA F2FF|"C"G2GG G2GG B2BB G2GG|"B"^F2FF F2FF B4 z4:|
|:"Em"e2BB e2BB g2BB e2BB|"D"d2AA d2AA f2AA d2AA|"C"c2GG c2GG e2GG c2GG|"B"B2^dd f2dd b4 z4:|`},{id:"riff-blues-a",genre:"Rock & Metal",abc:`X:1
T:Twelve-Bar Boogie in A
C:Original riff (VAW)
M:4/4
L:1/8
Q:1/4=120
K:A
"A7"A,2 C2 E2 F2|^F2 F2 E2 C2|A,2 C2 E2 F2|^F2 F2 E2 C2|
"D7"D2 ^F2 A2 B2|c2 B2 A2 F2|"A7"A,2 C2 E2 F2|^F2 F2 E2 C2|
"E7"E2 ^G2 B2 c2|"D7"D2 ^F2 A2 B2|"A7"A2 =G2 E2 C2|"E7"E2 ^D2 =D2 B,2|"A7"A,8|]`},{id:"riff-pentatonic",genre:"Rock & Metal",abc:`X:1
T:Pentatonic Lightning
C:Original lick study (VAW)
M:4/4
L:1/16
Q:1/4=90
K:Am
|:"Am"ABcA BcdB cdec deg=e|"G"gedc dcAG "Am"A4 z4|
"F"cdec dege gaba "G"g4|"E"edcB cBAG "Am"A8:|`},{id:"riff-surf",genre:"Rock & Metal",abc:`X:1
T:Surf's Up Tremolo
C:Original riff (VAW)
M:4/4
L:1/16
Q:1/4=120
K:Dphr
"D"DDDD DDDD ^FFFF GGGG|AAAA AAAA GGGG ^FFFF|"Gm"GGGG GGGG ^FFFF _EEEE|"D"DDDD DDDD D4 z4|
"D"dddd dddd cccc _BBBB|AAAA AAAA GGGG ^FFFF|"Gm"GGGG ^FFFF _EEEE ^FFFF|"D"D8 z8|]`},{id:"riff-anthem",genre:"Rock & Metal",abc:`X:1
T:Stadium Anthem in D
C:Original melody (VAW)
M:4/4
L:1/8
Q:1/4=100
K:D
"D"A2 A2 B2 A2|d4 A4|"Bm"F2 F2 G2 F2|B4 F4|
"G"G2 G2 A2 B2|d2 c2 B2 A2|"A"E2 F2 G2 A2|c4 A4|
"D"a4 f4|e2 d2 c2 A2|"G"g4 e4|d2 c2 B2 G2|
"D"F2 A2 d2 f2|"A"e2 d2 c2 e2|"D"d8|z8|]`},{id:"riff-metal-shred",genre:"Rock & Metal",abc:`X:1
T:Harmonic Minor Shred
C:Original étude (VAW)
M:4/4
L:1/16
Q:1/4=80
K:Am
|:"Am"ABcd e^fga a^gfe dcBA|"E"^GABc defe dcB^G "Am"A4|
"Dm"defg abc'a gfed cBA^G|"E"Bc de ^fgab "Am"a4 z4:|`},{id:"riff-grunge",genre:"Rock & Metal",abc:`X:1
T:Drop-D Grind
C:Original riff (VAW)
M:4/4
L:1/8
Q:1/4=100
K:Dm
|:"Dm"D2 D F G2 ^G A|z A G F D2 C D|"F"F2 F A c2 ^c d|z d c A "C"G2 E C:|`},{id:"riff-ballad",genre:"Rock & Metal",abc:`X:1
T:Power Ballad in G
C:Original melody (VAW)
M:4/4
L:1/8
Q:1/4=70
K:G
"G"B4 A2 G2|"D"A6 F2|"Em"G4 F2 E2|"C"E6 z2|
"G"B4 A2 G2|"D"A2 B2 c2 d2|"C"e4 d2 c2|"D"d6 z2|
"Em"e4 d2 B2|"C"c4 B2 G2|"G"B4 A2 G2|"D"A6 B2|
"C"c4 B2 A2|"G"B4 A2 G2|"D"A2 G2 F2 A2|"G"G8|]`},{id:"riff-punk",genre:"Rock & Metal",abc:`X:1
T:Three-Chord Rebellion
C:Original riff (VAW)
M:4/4
L:1/8
Q:1/4=160
K:A
|:"A"A A A A A A A A|"D"d d d d d d d d|"E"e e e e e e e e|"A"A A c c e e a2:|
|:"D"f2 f2 e2 d2|"A"c2 c2 B2 A2|"D"f2 f2 e2 d2|"E"e2 ^d2 e4:|`},{id:"the-entertainer",genre:"Blues & Jazz",abc:`X:1
T:The Entertainer
C:Scott Joplin (1902)
M:2/4
L:1/16
Q:1/4=80
K:C
d^d|"C"e2c'2 e2c'2|e2c'4 c'd'|"C"^d'e'c'd' e'2bd'|"G"c'4 z2 d^d|
"C"e2c'2 e2c'2|e2c'4 z2|"F"a2g2 ^f2a2|"G"c'e'2d' c'a2d'|
"C"e2c'2 e2c'2|e2c'4 c'd'|"C"^d'e'c'd' e'2bd'|"G"c'4 z2 c'd'|
"C"e'c'd'e' e'c'd'c'|e'c'd'e' e'c'd'c'|"G"e'c'd'e' e'2bd'|"C"c'4 z4|]`},{id:"maple-leaf-rag",genre:"Blues & Jazz",abc:`X:1
T:Maple Leaf Rag (opening)
C:Scott Joplin (1899)
M:2/4
L:1/16
Q:1/4=70
K:Ab
"Ab"z _A,C_E _AE=G_e-|e2_A,CE_A=G_e-|"Eb"e_A,C_E AEge-|e8|
"Ab"z _A,C_E _AE=G_e-|e2_A,CE_A=G_e-|"Eb"e_B,=D_E =G_Be_b-|"Ab"b8|]`},{id:"tiger-rag",genre:"Blues & Jazz",abc:`X:1
T:Tiger Rag (trio)
C:Original Dixieland Jass Band (1917)
M:2/4
L:1/8
Q:1/4=120
K:Ab
"Ab"c2 B2|_A2 F2|E2 C2|_A,4|"Eb"B2 A2|G2 E2|B,2 E2|G4|
"Eb"B2 A2|G2 E2|"Bb"F2 G2|A4|"Eb"G2 F2|E2 D2|"Ab"C4|z4|]`},{id:"st-louis-blues",genre:"Blues & Jazz",abc:`X:1
T:St. Louis Blues
C:W.C. Handy (1914)
M:4/4
L:1/8
Q:1/4=90
K:G
"G"z2 B2 d2 B2|_B4 G4|"C"z2 c2 e2 c2|"G"_B4 G4|
"C"z2 c2 e2 c2|"G"_B2 G2 B2 G2|"D7"z2 A2 c2 A2|"G"G8|]`},{id:"take-me-out",genre:"Blues & Jazz",abc:`X:1
T:Take Me Out to the Ball Game
C:Albert Von Tilzer (1908)
M:3/4
L:1/4
Q:1/4=160
K:D
"D"D2 d|B A F|"A"E3|B,3|"D"D2 d|B A F|"A"A3-|A2 z|
"A"G F G|E F G|"D"A2 F|D2 z|"G"B2 B|B c d|"A"c3-|c2 z|
"D"D2 d|B A F|"A"E3|B,3|"D"D2 d|B A F|"A"A3-|A2 z|
"A"G F G|"D"E F G|"D"A2 B|c3|"D"d2 d|d c B|"A"A G F|"D"D3|]`},{id:"five-foot-two",genre:"Blues & Jazz",abc:`X:1
T:Five Foot Two, Eyes of Blue
C:Ray Henderson (1925)
M:4/4
L:1/8
Q:1/4=150
K:C
"C"E2 G2 c2 z2|"E7"B2 ^G2 E4|"A7"^C2 E2 A2 z2|G2 E2 ^C4|
"D7"D2 ^F2 A2 c2|B2 A2 ^F2 D2|"G7"G2 F2 E2 D2|"C"C8|]`},{id:"bye-bye-blackbird",genre:"Blues & Jazz",abc:`X:1
T:Bye Bye Blackbird
C:Ray Henderson (1926)
M:4/4
L:1/8
Q:1/4=120
K:F
"F"z2 A2 A2 A2|A4 c2 A2|"F"G4 F4|z8|
"F"z2 A2 A2 A2|"Cdim"_A4 c2 A2|"Gm7"G8|"C7"z8|]`},{id:"sweet-georgia-brown",genre:"Blues & Jazz",abc:`X:1
T:Sweet Georgia Brown
C:Ben Bernie, Maceo Pinkard (1925)
M:4/4
L:1/8
Q:1/4=150
K:F
"D7"z D E ^F A2 ^F E|D4 z4|z D E ^F A2 ^F E|D4 z4|
"G7"z D =F G B2 G F|D4 z4|z D F G B2 G F|D4 z4|
"C7"z C D E G2 E D|C4 z4|"F"A4 A2 G2|F8|]`},{id:"aint-we-got-fun",genre:"Blues & Jazz",abc:`X:1
T:Ain't We Got Fun
C:Richard Whiting (1921)
M:4/4
L:1/8
Q:1/4=140
K:G
"G"D2 D2 E2 D2|G4 D4|"D7"D2 D2 E2 D2|A4 F4|
"D7"F2 F2 G2 F2|A4 c4|"G"B2 A2 G2 E2|D8|]`},{id:"yes-we-have-no-bananas",genre:"Blues & Jazz",abc:`X:1
T:Yes! We Have No Bananas
C:Frank Silver & Irving Cohn (1923)
M:4/4
L:1/8
Q:1/4=150
K:C
"C"G4 A2 G2|E4 C4|"G7"D2 E2 F2 E2|D8|
"G7"F4 G2 F2|D4 B,4|"C"C2 D2 E2 G2|C8|]`},{id:"charleston",genre:"Blues & Jazz",abc:`X:1
T:Charleston
C:James P. Johnson (1923)
M:4/4
L:1/8
Q:1/4=160
K:F
"A7"z A3 A2 z A|z A3 ^G2 A2|"D7"z A3 A2 z A|z A3 ^G2 A2|
"G7"z G3 G2 z G|z G3 ^F2 G2|"C7"A2 G2 F2 E2|"F"F8|]`},{id:"singin-rain",genre:"Blues & Jazz",abc:`X:1
T:Singin' in the Rain
C:Nacio Herb Brown (1929)
M:4/4
L:1/8
Q:1/4=120
K:C
"C"E2 G2 c4-|c2 z2 z4|E2 G2 c4-|c2 z2 z4|
"Dm7"F2 A2 d4-|d2 c2 B2 A2|"G7"G8-|G4 z4|
"C"E2 G2 c4-|c2 z2 z4|E2 G2 c4-|c2 z2 z4|
"Dm7"F2 A2 d4-|d2 c2 "G7"B2 A2|"C"c8-|c4 z4|]`},{id:"aint-misbehavin",genre:"Blues & Jazz",abc:`X:1
T:Ain't Misbehavin'
C:Fats Waller (1929)
M:4/4
L:1/8
Q:1/4=100
K:Eb
"Eb"z2 G2 B2 G2|"Cm"F2 E2 G4|"Fm7"z2 F2 _A2 F2|"Bb7"E2 D2 F4|
"Eb"z2 G2 B2 G2|"Eb7"F2 E2 G2 B2|"Ab"c2 B2 G2 E2|"Eb"E8|]`},{id:"happy-days",genre:"Blues & Jazz",abc:`X:1
T:Happy Days Are Here Again
C:Milton Ager (1929)
M:4/4
L:1/8
Q:1/4=140
K:C
"C"G4 G4|G2 A2 G2 E2|"F"F4 A4|"C"G8|
"C"G4 G4|"Am"G2 A2 G2 E2|"Dm"F4 E2 D2|"G7"D8|
"G7"F4 F4|F2 G2 F2 D2|"C"E4 G4|"Am"c8|
"Dm"d4 d2 c2|"G7"B2 A2 G2 F2|"C"E4 D2 E2|"C"C8|]`},{id:"blue-skies",genre:"Blues & Jazz",abc:`X:1
T:Blue Skies
C:Irving Berlin (1926)
M:4/4
L:1/8
Q:1/4=130
K:Em
"Em"E2 B2 B4-|B2 A2 G2 E2|"Em/D#"^D2 A2 A4-|A2 G2 ^F2 D2|
"G"B,2 G2 G4-|G2 ^F2 E2 D2|"C"C2 E2 G2 E2|"B7"^F8|]`},{id:"puttin-on-the-ritz",genre:"Blues & Jazz",abc:`X:1
T:Puttin' On the Ritz
C:Irving Berlin (1929)
M:4/4
L:1/8
Q:1/4=130
K:Dm
"Dm"z D F A ^G3 G|z ^C E G ^F3 F|"Gm"z _B, D F E3 E|"A"z A, ^C E D4|
"Dm"z D F A ^G3 G|z ^C E G ^F3 F|"Gm"_B2 A2 G2 E2|"A"^C2 E2 "Dm"D4|]`},{id:"mack-the-knife",genre:"Blues & Jazz",abc:`X:1
T:Mack the Knife (Moritat)
C:Kurt Weill (1928)
M:4/4
L:1/8
Q:1/4=110
K:C
"C"z2 E2 F2 A2|G6 z2|"Dm"z2 D2 E2 G2|F6 z2|
"G7"z2 D2 E2 G2|F6 z2|"C"z2 C2 D2 E2|E6 z2|]`},{id:"rhapsody-in-blue",genre:"Blues & Jazz",abc:`X:1
T:Rhapsody in Blue (Andante theme)
C:George Gershwin (1924)
M:4/4
L:1/8
Q:1/4=60
K:E
"E"B2 B4 c2|e2 B6|"A"c2 c4 e2|"E"g2 f6|
"E"B2 B4 c2|e2 B6|"F#m"f2 e2 c2 B2|"B7"B8|]`},{id:"i-got-rhythm",genre:"Blues & Jazz",abc:`X:1
T:I Got Rhythm
C:George Gershwin (1930)
M:4/4
L:1/8
Q:1/4=150
K:Bb
"Bb"z B, C3 E F2|"Gm"z F E3 C B,2|"Cm"z B, C3 E F2|"F7"z G F4 z2|
"Bb"z B, C3 E F2|"Gm"z F E3 C B,2|"Cm"z B, C2 "F7"E2 C2|"Bb"B,6 z2|]`},{id:"georgia",genre:"Blues & Jazz",abc:`X:1
T:Georgia on My Mind
C:Hoagy Carmichael (1930)
M:4/4
L:1/8
Q:1/4=70
K:F
"F"z2 A,2 C4-|C2 D2 C4|"E7"z2 B,2 D4-|D2 E2 D4|
"Dm"z2 A,2 D2 F2|"Bbm"F2 _D2 F4|"F"A4 "D7"F4|"Gm7"G2 F2 "C7"E2 D2|]`},{id:"bill-bailey",genre:"Blues & Jazz",abc:`X:1
T:Bill Bailey, Won't You Please Come Home
C:Hughie Cannon (1902)
M:4/4
L:1/8
Q:1/4=140
K:F
"F"z2 C2 F2 A2|c4 A4|"F"z2 A2 G2 A2|"C7"G8|
"C7"z2 C2 E2 G2|B4 G4|"C7"z2 G2 F2 G2|"F"A8|]`}],ys=[{id:"tech-open-strings",genre:"Technique",abc:`X:1
T:Open String Warm-Up
C:Exercise
M:4/4
L:1/4
Q:1/4=80
K:C
G,4|G, G, G, G,|D4|D D D D|A4|A A A A|e4|e e e e|
e e A A|D D G, G,|G, D A e|e A D G,|]`},{id:"tech-d-major-scale",genre:"Technique",abc:`X:1
T:D Major Scale (1 octave)
C:Exercise
M:4/4
L:1/4
Q:1/4=80
K:D
D E F G|A B c d|d c B A|G F E D|
D/D/ E/E/ F/F/ G/G/|A/A/ B/B/ c/c/ d/d/|d/d/ c/c/ B/B/ A/A/|G/G/ F/F/ E/E/ D2|]`},{id:"tech-a-major-scale",genre:"Technique",abc:`X:1
T:A Major Scale (1 octave)
C:Exercise
M:4/4
L:1/4
Q:1/4=80
K:A
A B c d|e f g a|a g f e|d c B A|]`},{id:"tech-g-major-2oct",genre:"Technique",abc:`X:1
T:G Major Scale (2 octaves)
C:Exercise
M:4/4
L:1/8
Q:1/4=70
K:G
G,A,B,C DEFG|ABcd efga|g2 fe dcBA|GFED CB,A,G,|G,8|]`},{id:"tech-c-major-scale",genre:"Technique",abc:`X:1
T:C Major Scale (low 2s)
C:Exercise
M:4/4
L:1/4
Q:1/4=80
K:C
C D E F|G A B c|c B A G|F E D C|]`},{id:"tech-a-minor-melodic",genre:"Technique",abc:`X:1
T:A Melodic Minor Scale
C:Exercise
M:4/4
L:1/8
Q:1/4=70
K:Am
A,B,CD E^F^GA|Bcde ^f^ga2|a=g=fe dcBA|=G=FED CB,A,2|]`},{id:"tech-chromatic",genre:"Technique",abc:`X:1
T:Chromatic Scale on D & A Strings
C:Exercise
M:4/4
L:1/8
Q:1/4=70
K:C
D^D E F ^F G ^G A|^A B c ^c d ^d e2|e _e d _d c B _B A|_A G _G F E _E D2|]`},{id:"tech-arpeggios",genre:"Technique",abc:`X:1
T:Arpeggios in G, D and A
C:Exercise
M:3/4
L:1/8
Q:1/4=90
K:D
"G"G,B,D GBd|g6|dBG DB,G,|G,6|
"D"DFA dfa|d'6|afd AFD|D6|
"A"A,CE Ace|a6|ecA EC A,|A,6|]`},{id:"tech-wohlfahrt-1",genre:"Technique",abc:`X:1
T:Étude Op. 45 No. 1 (opening)
C:Franz Wohlfahrt (1850s)
M:4/4
L:1/8
Q:1/4=80
K:C
"C"CEGc CEGc|"G"B,DGB B,DGB|"C"CEGc CEGc|"G"DGBd DGBd|
"F"FAcf FAcf|"C"EGce EGce|"G"DGBd "G7"DFBd|"C"cGEC C4|]`},{id:"tech-string-crossing",genre:"Technique",abc:`X:1
T:String Crossing Study
C:Exercise
M:4/4
L:1/8
Q:1/4=80
K:D
"D"DADA DADA|FAFA FAFA|"G"GBGB GBGB|"D"FAFA DADA|
"A"EAEA EAEA|"D"FAFA "G"GBGB|"A"EAEA ^GBGB|"D"FADA D4|]`},{id:"tech-third-position",genre:"Technique",abc:`X:1
T:Third Position Shifting
C:Exercise
M:4/4
L:1/4
Q:1/4=70
K:D
d e f g|a g f e|d e f g|a2 a2|
a b c' d'|d' c' b a|g f e d|d4|]`},{id:"tech-e-string-high",genre:"Technique",abc:`X:1
T:High E-String Ladder
C:Exercise
M:4/4
L:1/8
Q:1/4=70
K:A
e f g a b c' d' e'|e' d' c' b a g f e|a b c' d' e' f' g' a'|a'8|]`},{id:"tech-rhythm-dots",genre:"Technique",abc:`X:1
T:Dotted Rhythm Drill
C:Exercise
M:4/4
L:1/8
Q:1/4=80
K:G
G>A B>c d>e f>g|g>f e>d c>B A>G|G>B d>B G>B d>B|g2 d2 B2 G2|]`},{id:"tech-triplets",genre:"Technique",abc:`X:1
T:Triplet Study
C:Exercise
M:4/4
L:1/8
Q:1/4=70
K:D
(3DEF (3GAB (3cde (3fga|(3agf (3edc (3BAG (3FED|(3DFA (3dAF (3DFA d2|(3AFD (3AFD A,4|]`},{id:"tech-double-dutch",genre:"Technique",abc:`X:1
T:Sixteenth-Note Detaché
C:Exercise
M:4/4
L:1/16
Q:1/4=70
K:A
AAAA BBBB cccc dddd|eeee dddd cccc BBBB|AcBd ceBd cAeA a4|]`}],_s=[...Bs,...Gs,...Es,...bs,...Fs,...Cs,...ys].map(o=>({...o,source:"builtin"})),vs=["Beginner","Folk","World","Celtic","Old-Time","Bluegrass","Classical","Rock & Metal","Blues & Jazz","Hymns","Holiday","Technique"],zt={C:0,D:2,E:4,F:5,G:7,A:9,B:11},mt=["F","C","G","D","A","E","B"],ft=["B","E","A","D","G","C","F"],Ms={C:0,G:1,D:2,A:3,E:4,B:5,"F#":6,"C#":7,F:-1,Bb:-2,Eb:-3,Ab:-4,Db:-5,Gb:-6,Cb:-7,"G#":8,"D#":9,"A#":10,"E#":11,"B#":12,Fb:-8},gt={maj:0,ion:0,mix:-1,dor:-2,min:-3,aeo:-3,m:-3,phr:-4,loc:-5,lyd:1};function Pe(o){const e=(o||"").trim(),t={tonic:"C",mode:"maj",accidentals:{},tonicPc:0,label:"C"};if(/^(HP|Hp)\b/.test(e))return t.tonic="A",t.mode="mix",t.tonicPc=9,t.accidentals={F:1,C:1},t.label="A Mix",t;if(/^none\b/i.test(e)||e==="")return t;const s=e.match(/^([A-Ga-g])([#b]?)\s*([A-Za-z]*)\s*(.*)$/);if(!s)return t;const n=s[1].toUpperCase()+s[2],i=s[3].toLowerCase();let a="maj";if(i==="m")a="min";else if(i.length>=3){const g=i.slice(0,3);g in gt&&(a=g==="aeo"?"min":g==="ion"?"maj":g)}const r=(Ms[n]??0)+gt[a],h={};if(r>0){for(let g=0;g<Math.min(r,7);g++)h[mt[g]]=1;for(let g=7;g<r;g++)h[mt[g-7]]=2}else if(r<0){for(let g=0;g<Math.min(-r,7);g++)h[ft[g]]=-1;for(let g=7;g<-r;g++)h[ft[g-7]]=-2}const l=s[4]||"",d=/(\^\^|\^|__|_|=)([A-Ga-g])/g;let p;for(;p=d.exec(l);){const g={"^^":2,"^":1,__:-2,_:-1,"=":0}[p[1]];h[p[2].toUpperCase()]=g}const u=(zt[n[0]]+(n[1]==="#"?1:n[1]==="b"?-1:0)+12)%12,A={maj:"",min:"m",mix:" Mix",dor:" Dor",phr:" Phr",lyd:" Lyd",loc:" Loc"}[a];return t.tonic=n,t.mode=a,t.accidentals=h,t.tonicPc=u,t.label=n+A,t}function It(o){const e=(o||"").trim();if(e==="C")return{num:4,den:4,text:"4/4"};if(e==="C|")return{num:2,den:2,text:"2/2"};const t=e.match(/^(\d+)(?:\+\d+)*\s*\/\s*(\d+)/);if(t){const n=e.split("/")[0].split("+").map(Number).reduce((i,a)=>i+a,0);return{num:n,den:Number(t[2]),text:`${n}/${t[2]}`}}return null}function Ye(o){const e=(o||"").trim().match(/^(\d+)\s*\/\s*(\d+)/);if(e)return Number(e[1])/Number(e[2]);const t=parseFloat(o);return isFinite(t)?t:null}function Ss(o){const e=(o||"").replace(/"[^"]*"/g,"").trim(),t=e.match(/((?:\d+\/\d+\s*)+)=\s*(\d+)/);if(t){const n=t[1].trim().split(/\s+/).reduce((i,a)=>i+(Ye(a)||0),0);return Number(t[2])*n*4}const s=e.match(/^(\d+)/);return s?Number(s[1]):null}const Ts={reel:150,jig:165,"slip jig":165,hornpipe:130,polka:140,waltz:120,march:110,strathspey:100,slide:180,mazurka:120,barndance:130,"three-two":120,air:80,hymn:90};function ws(o){const e=o.replace(/\r\n?/g,`
`).split(`
`),t=[];let s=null;for(const n of e)/^X:/.test(n)?(s&&t.push(s.join(`
`)),s=[n]):s?s.push(n):/^[TKM]:/.test(n)&&(s=["X:1",n]);return s&&t.push(s.join(`
`)),t}function $e(o){const e=o.replace(/\r\n?/g,`
`).split(`
`),t={title:"",titles:[],composer:"",origin:"",rhythm:""};let s={num:4,den:4,text:"4/4"},n=!1,i=null,a=null,c=Pe("C"),r=!1;const h=[];for(const u of e){const A=u.replace(/(^|[^\\])%.*$/,"$1");if(r)h.push(A);else{const g=A.match(/^([A-Za-z]):\s?(.*)$/);if(!g){if(A.trim()==="")continue;r=!0,h.push(A);continue}const[,D,C]=g;switch(D){case"T":t.titles.push(C.trim());break;case"C":t.composer=t.composer||C.trim();break;case"O":t.origin=t.origin||C.trim();break;case"R":t.rhythm=C.trim().toLowerCase();break;case"M":{const T=It(C);T&&(s=T,n=!0);break}case"L":i=Ye(C);break;case"Q":a=Ss(C);break;case"K":c=Pe(C),r=!0;break}}}if(t.title=t.titles[0]||"Untitled",!i){const u=s.num/s.den;i=n&&u<.75?1/16:1/8}a||(a=Ts[t.rhythm]||120);const l={meter:s,unitLen:i,tempo:a,key:c},{bars:d}=Ls(h,l),p=ks(d);return xs(t,l,p)}function Ls(o,e){let{unitLen:t,key:s}=e,n=e.meter;const i=[];let a=D(),c={},r=null,h=null,l="",d=null,p=!1,u=0,A=1,g=1;function D(){return{events:[],startRepeat:!1,endRepeat:!1,ending:null,part:"",doubleBar:!1,meter:null}}function C(E={}){(a.events.length>0||E.force)&&(a.ending=r,a.part=l,a.meter=n,i.push(a)),a=D(),c={}}function T(){for(let E=a.events.length-1;E>=0;E--)if(a.events[E].type!=="marker")return a.events[E];for(let E=i.length-1;E>=0;E--){const B=i[E].events;for(let v=B.length-1;v>=0;v--)if(B[v].type!=="marker")return B[v]}return null}function I(E,B){switch(E){case"K":s=Pe(B);break;case"L":{const v=Ye(B);v&&(t=v);break}case"M":{const v=It(B);v&&(n=v);break}case"P":l=B.trim();break}}for(const E of o){let B=E;const v=B.match(/^([A-Za-z]):\s?(.*)$/);if(v){const[,M,b]=v;if(M==="V"){const k=b.trim().split(/\s+/)[0];d===null&&(d=k),p=k!==d}else M==="w"||M==="W"||p||I(M,b);continue}if(p)continue;B=B.replace(/\\\s*$/,"");let G=0;const X=B.length;for(;G<X;){const M=B[G];if(M===" "||M==="	"||M==="y"||M==="`"){G++;continue}if(M==="["&&/[A-Za-z]/.test(B[G+1]||"")&&B[G+2]===":"){const f=B.indexOf("]",G);if(f>G){const _=B[G+1],y=B.slice(G+3,f);if(_==="V"){const x=y.trim().split(/\s+/)[0];d===null&&(d=x),p=x!==d}else I(_,y);if(G=f+1,p)break;continue}}if(M==='"'){const f=B.indexOf('"',G+1),_=f>G?B.slice(G+1,f):"";/^[A-G]/.test(_)&&(h=_.split(/[\s(/]/)[0]),G=f>G?f+1:X;continue}if(M==="!"||M==="+"){const f=B.indexOf(M,G+1);G=f>G?f+1:G+1;continue}if(M==="{"){const f=B.indexOf("}",G);G=f>G?f+1:X;continue}if(".~HLMOPSTuvJR".includes(M)){G++;continue}if(M===")"){G++;continue}if(M==="("){const f=B.slice(G).match(/^\((\d)(?::(\d)?)?(?::(\d)?)?/);if(f){const _=Number(f[1]);let y=f[2]?Number(f[2]):null;const x=f[3]?Number(f[3]):_;if(!y){const Q=n.num%3===0&&n.num>3;y={2:3,3:2,4:3,6:2,8:3}[_]??(Q?3:2)}A=y/_,u=x,G+=f[0].length;continue}G++;continue}if(M==="|"||M===":"||M==="["&&(B[G+1]==="|"||/\d/.test(B[G+1]||""))){const f=B.slice(G).match(/^(:*)(\|\]|\[\||\|\||\||\[(?=\d))?(:*)(\[?\d+(?:[-,]\d+)*)?/);if(f&&f[0].length>0){const _=f[1],y=f[2]||"";let x=f[3],Q=f[4]||"";const $=_.length>0;!y&&_.length>=2&&(x=":");const j=x.length>0,te=y==="||"||y==="|]"||y==="[|";if(y||$||j){if(a.events.length===0){const H=i[i.length-1];H&&($&&(H.endRepeat=!0),te&&(H.doubleBar=!0))}else $&&(a.endRepeat=!0),te&&(a.doubleBar=!0),C();($||te)&&(r=null)}if(j&&(a.startRepeat=!0,r=null),Q){Q=Q.replace("[","");const H=[];for(const be of Q.split(",")){const[Ae,me]=be.split("-").map(Number);if(me)for(let de=Ae;de<=me;de++)H.push(de);else H.push(Ae)}r=H}G+=f[0].length;continue}G++;continue}if(M===">"||M==="<"){let f=0;const _=M;for(;B[G]===_;)f++,G++;const y=1-Math.pow(.5,f),x=T();x&&(_===">"?(x.dur*=1+y,g=1-y):(x.dur*=1-y,g=1+y));continue}if(M==="-"){const f=T();f&&f.type==="note"&&(f.tie=!0),G++;continue}if(M==="["){const f=B.indexOf("]",G);if(f>G){const _=B.slice(G+1,f);let y=null,x=null;const Q=/(\^\^|\^|__|_|=)?([A-Ga-g])([,']*)(\d*\/*\d*)/g;let $;for(;$=Q.exec(_);){const H=Dt($[1],$[2],$[3],s,c);x===null&&(x=Fe($[4])),(y===null||H>y)&&(y=H)}G=f+1;const j=B.slice(G).match(/^(\d*\/*\d*)/);let te=x??1;j&&j[1]&&(te=Fe(j[1]),G+=j[1].length),y!==null&&z({type:"note",midi:y},te);continue}G++;continue}const b=B.slice(G).match(/^(\^\^|\^|__|_|=)?([A-Ga-g])([,']*)(\d*\/*\d*)/);if(b){const f=Dt(b[1],b[2],b[3],s,c);z({type:"note",midi:f},Fe(b[4])),G+=b[0].length;continue}const k=B.slice(G).match(/^([zx])(\d*\/*\d*)/);if(k){z({type:"rest"},Fe(k[2])),G+=k[0].length;continue}const K=B.slice(G).match(/^Z(\d*)/);if(K){const f=K[1]?Number(K[1]):1,_=n.num*(4/n.den);for(let y=0;y<f;y++)a.events.push({type:"rest",dur:_}),y<f-1&&C();G+=K[0].length;continue}G++}}C();function z(E,B){let v=B*t*4;u>0&&(v*=A,u--),g!==1&&(v*=g,g=1),E.dur=v,h&&(E.chord=h,h=null),a.events.push(E)}return{bars:i}}function Fe(o){if(!o)return 1;const e=o.match(/^(\d*)(\/*)(\d*)$/);if(!e)return 1;const t=e[1]?Number(e[1]):1;let s=1;return e[2].length>0&&(s=e[3]?Number(e[3]):Math.pow(2,e[2].length),e[3]&&e[2].length>1&&(s=Number(e[3])*Math.pow(2,e[2].length-1))),t/s}function Dt(o,e,t,s,n){const i=e.toUpperCase();let a=e===i?4:5;for(const h of t||"")h==="'"?a++:h===","&&a--;const c=i+a;let r;return o?(r={"^^":2,"^":1,__:-2,_:-1,"=":0}[o],n[c]=r):c in n?r=n[c]:r=s.accidentals[i]||0,(a+1)*12+zt[i]+r}function ks(o){const e=[];let t=0,s=1,n=-1,i=0,a=0,c=0;for(;a<o.length&&i++<1e4;){const l=o[a];if(l.startRepeat&&n!==a&&(t=a,s=1),n=-1,l.ending&&!l.ending.includes(s)){a++;continue}if(e.push({...l,pass:s,blockStart:t}),l.endRepeat){if(s<2){s++,a=t,n=t;continue}s=1,t=a+1}else l.doubleBar&&(t=a+1,s=1);a++}const r="ABCDEFGHIJKLMNOPQRSTUVWXYZ",h=new Map;for(const l of e){const d=l.part||l.blockStart;h.has(d)||h.set(d,l.part||r[c++%26]);const p=h.get(d),u=`${d}|${l.pass}`;l.section=l.pass>1?`${p} (repeat)`:p,l.sectionKey=u}return e}function xs(o,e,t){const s=[],n=[],i=[];let a=0;for(const r of t){const h=a;for(const d of r.events){if(d.chord&&n.push({start:a,symbol:d.chord}),d.type==="note"){const p=s[s.length-1];p&&p.tie&&p.midi===d.midi&&Math.abs(p.start+p.dur-a)<1e-6?(p.dur+=d.dur,p.tie=!!d.tie):s.push({midi:d.midi,start:a,dur:d.dur,tie:!!d.tie,bar:i.length})}a+=d.dur}const l=r.meter||e.meter;i.push({start:h,dur:a-h,section:r.section,sectionKey:r.sectionKey,meter:l})}for(const r of s)delete r.tie;const c=[];for(let r=0;r<i.length;r++){const h=i[r],l=c[c.length-1];l&&l.key===h.sectionKey?(l.end=h.start+h.dur,l.barEnd=r+1):c.push({key:h.sectionKey,name:h.section,start:h.start,end:h.start+h.dur,barStart:r,barEnd:r+1})}return{title:o.title,composer:o.composer,origin:o.origin,rhythm:o.rhythm,meter:e.meter,key:e.key,tempo:e.tempo,notes:s,bars:i,sections:c,chords:n,totalBeats:a}}const q=5,zs=[.3,.45,.6,.75,.88,1],Is=17,Ks=12,Os={1:1,2:1,3:2,4:2,5:3,6:3,7:4,8:4},Ce=[1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10];function Ns(o){const e=["th","st","nd","rd"],t=o%100;return o+(e[(t-20)%10]||e[t]||e[0])}function Rs(o){return ee[o].strings.map(t=>Le(t.frequency))}function Xs(o,e){if(o.length===0)return 0;const t=Math.min(...o.map(r=>r.midi)),s=Math.max(...o.map(r=>r.midi)),n=e[0],i=e[e.length-1]+12;let a=0,c=1/0;for(let r=-36;r<=36;r+=12){const h=t+r,l=s+r;let d=0;h<n&&(d+=(n-h)*10),l>i&&(d+=l-i),d+=Math.abs(r)*.01,d<c&&(c=d,a=r)}return a}function Qs(o,e){var c;const t=e.length,s=o.map(r=>{const h=[];for(let l=0;l<t;l++){const d=r.midi-e[l],p=l===t-1?Is:Ks;if(d>=0&&d<=p){let u=d<=6?0:d===7?1:4+d;u+=d*.01,h.push({s:l,off:d,cost:u})}}if(h.length===0){const l=r.midi<e[0]?0:t-1;h.push({s:l,off:Math.max(0,r.midi-e[l]),cost:50})}return h}),n=s.map(r=>r.map(()=>({cost:1/0,prev:-1})));(c=s[0])==null||c.forEach((r,h)=>{n[0][h].cost=r.cost});for(let r=1;r<s.length;r++)for(let h=0;h<s[r].length;h++){const l=s[r][h];for(let d=0;d<s[r-1].length;d++){const p=s[r-1][d];let u=Math.abs(l.s-p.s)*.25;p.off>7&&l.off>7?u+=Math.abs(l.off-p.off)*.1:p.off>7!=l.off>7&&l.off!==0&&(u+=.5);const A=n[r-1][d].cost+l.cost+u;A<n[r][h].cost&&(n[r][h]={cost:A,prev:d})}}const i=n.length-1;if(i<0)return;let a=n[i].reduce((r,h,l,d)=>h.cost<d[r].cost?l:r,0);for(let r=i;r>=0;r--){const h=s[r][a];o[r].string=h.s,o[r].offset=h.off,a=n[r][a].prev}}function Ps(o){let e=0;for(let t=0;t<o.length;t++){const s=o[t],n=s.offset;if(n===0){s.finger=0,s.base=e,s.position=Ce[Math.min(e,Ce.length-1)];continue}const i=n-e;if(i<1||i>8){let a=Math.max(0,n-7),c=-1;for(let r=Math.max(0,n-8);r<=n-1;r++){let h=0;for(let l=t;l<Math.min(o.length,t+8);l++){const d=o[l].offset;if(d===0)continue;const p=d-r;if(p>=1&&p<=8)h++;else break}h+=[0,2,4,5,7,9,10,12].includes(r)?.3:0,h-=r*.01,h>c&&(c=h,a=r)}e=a}s.base=e,s.finger=Os[n-e]??4,s.position=Ce[Math.min(e,Ce.length-1)]}}function $s(o){return o.num%3===0&&o.num>3?4/o.den*3:4/o.den}function Hs(o,e){return Math.abs(o-e)<.001}function Ke(o,e){const t=o/e;return Math.abs(t-Math.round(t))<.001}function qs(o){const e=[];for(const t of o.sections){const s=t.barEnd-t.barStart,n=s>8?Math.ceil(s/4):s>4?2:1,i=Math.ceil(s/n);for(let a=0;a<n;a++){const c=t.barStart+a*i,r=Math.min(t.barEnd,c+i);if(c>=r)continue;const h=o.bars[c],l=o.bars[r-1];e.push({name:n>1?`${t.name} · ${a+1}`:t.name,section:t.name,start:h.start,end:l.start+l.dur,barStart:c,barEnd:r})}}return e.length===0&&e.push({name:"A",section:"A",start:0,end:o.totalBeats,barStart:0,barEnd:o.bars.length}),e}function Vs(o,e,t){for(let s=0;s<e.length;s++){const n=e[s],i=[];if(o.forEach((c,r)=>{c.phrase===s&&i.push(r)}),i.length===0)continue;const a=i.map((c,r)=>{const h=o[c],l=t.bars[h.bar]||{start:0,meter:t.meter},d=l.meter||t.meter,p=$s(d),u=h.start-l.start;let A=0;return Hs(u,0)?A=4:Ke(u,p*2)?A=3:Ke(u,p)?A=2:Ke(u,p/2)&&(A=1),h.dur>=p-.001&&(A+=1.5),r===0&&(A+=10),A-=r*1e-4,{i:c,w:A}});a.sort((c,r)=>r.w-c.w),a.forEach((c,r)=>{let h=q;for(let l=0;l<=q;l++)if(r<Math.ceil(i.length*zs[l])){h=l;break}o[c.i].minLevel=h}),n.noteCount=i.length}}function Ws(o){const e=o.notes;if(e.length===0)return{score:1,label:"Beginner"};const t=o.totalBeats*60/o.tempo,s=e.length/Math.max(1,t),n=Math.max(...e.map(u=>u.position||1)),i=Math.max(...e.map(u=>u.midi))-Math.min(...e.map(u=>u.midi));new Set([0,2,4,5,7,9,11].map(u=>(u+o.key.tonicPc)%12));const a=new Set,c={C:0,D:2,E:4,F:5,G:7,A:9,B:11};for(const[u,A]of Object.entries(c))a.add((A+(o.key.accidentals[u]||0)+12)%12);const r=e.filter(u=>!a.has(u.midi%12)).length/e.length,h=e.reduce((u,A,g)=>u+(g>0&&A.offset!==0&&e[g-1].offset!==0&&A.base!==e[g-1].base?1:0),0),l=Math.min(...e.map(u=>u.dur))*60/o.tempo;let d=1+Math.min(4,s*.75)+(n-1)*.7+r*5+Math.min(1.5,h/Math.max(1,e.length)*15)+(i>19?.8:i>12?.4:0)+(l<.15?1:l<.25?.5:0)+(Object.keys(o.key.accidentals).length>=4?.5:0);d=Math.max(1,Math.min(10,d));const p=d<=2.5?"Beginner":d<=4.5?"Easy":d<=6.5?"Intermediate":d<=8?"Advanced":"Expert";return{score:Math.round(d*10)/10,label:p}}function js(o,e){const t=Rs(e),s=Xs(o.notes,t),n=o.notes.map(r=>({...r,midi:r.midi+s}));Qs(n,t),Ps(n);const i=qs(o);let a=0;for(const r of n){for(;a<i.length-1&&r.start>=i[a].end-1e-6;)a++;r.phrase=a}Vs(n,i,o);const c={title:o.title,tempo:o.tempo,meter:o.meter,key:o.key,totalBeats:o.totalBeats,bars:o.bars,chords:o.chords.map(r=>({...r})),transpose:s,tuningKey:e,openMidis:t,notes:n,phrases:i};return c.difficulty=Ws(c),c.maxPosition=Math.max(1,...n.map(r=>r.position||1)),c.range=n.length?{lo:Math.min(...n.map(r=>r.midi)),hi:Math.max(...n.map(r=>r.midi))}:{lo:0,hi:0},c}const Ze="vaw.songplay.progress.v1",Kt="vaw.songplay.usersongs.v1",Ot="vaw.songplay.settings.v1";function et(o,e){try{const t=localStorage.getItem(o);return t?JSON.parse(t):e}catch{return e}}function ke(o,e){try{localStorage.setItem(o,JSON.stringify(e))}catch{}}let Be=et(Ze,{});function He(o){return Be[o]||{plays:0,lastPlayed:0,phraseLevels:{},phraseMastered:{},mastery:0,bestScore:{},bestAccuracy:0,bestStreak:0,medal:{}}}function Bt(o,e){Be[o]=e,ke(Ze,Be)}function Js(o){delete Be[o],ke(Ze,Be)}function tt(){return et(Kt,[])}function Nt(o){ke(Kt,o)}function Gt(){return{tolerance:35,latencyMs:80,guideVolume:.35,clickVolume:.5,backingVolume:.4,guide:!0,click:!0,backing:!0,showNoteNames:!0,tuningCheck:!0,masterMode:!0,...et(Ot,{})}}function ye(o){ke(Ot,o)}const qe=new Map;let Us=0;const Me=new Map;function Et(){return[..._s,...tt().map(o=>({...o,source:"user"}))]}function st(o){if(o.parsed)return o.parsed;let e=qe.get(o.id);return e||(e=$e(o.abc),qe.set(o.id,e)),e}function _e(o,e){const t=`${o.id}|${e}`;let s=Me.get(t);return s||(s=js(st(o),e),Me.set(t,s)),s}function Ys(o,e){const t=st(o),s=_e(o,e);return{title:t.title,composer:t.composer||t.origin||"",key:t.key.label,meter:t.meter.text,tempo:Math.round(t.tempo),notes:s.notes.length,duration:t.totalBeats*60/t.tempo,difficulty:s.difficulty,maxPosition:s.maxPosition,phrases:s.phrases.length,rhythm:t.rhythm}}function Zs(o){return o.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40)}function Oe({title:o,abc:e,parsed:t,genre:s="My Songs",origin:n=""}){const i=tt(),c={id:`user-${Zs(o||"song")}-${Date.now().toString(36)}${(Us++).toString(36)}`,title:o,genre:s,origin:n};return e&&(c.abc=e),t&&(c.parsed=t),i.push(c),Nt(i),{...c,source:"user"}}function en(o){Nt(tt().filter(e=>e.id!==o)),qe.delete(o);for(const e of[...Me.keys()])e.startsWith(o+"|")&&Me.delete(e)}const Ve="https://thesession.org",Rt={reel:"4/4",jig:"6/8","slip jig":"9/8",hornpipe:"4/4",polka:"2/4",slide:"12/8",waltz:"3/4",barndance:"4/4",strathspey:"4/4","three-two":"3/2",mazurka:"3/4",march:"4/4"},tn={reel:"1/4=140",jig:"3/8=110","slip jig":"3/8=110",hornpipe:"1/4=120",polka:"1/4=140",slide:"3/8=120",waltz:"1/4=120",barndance:"1/4=130",strathspey:"1/4=100","three-two":"1/2=80",mazurka:"1/4=120",march:"1/4=110"},sn=Object.keys(Rt);async function Xt(o){const e=await fetch(o,{headers:{Accept:"application/json"}});if(!e.ok)throw new Error(`The Session returned ${e.status}`);return e.json()}async function nn(o,{type:e="",page:t=1}={}){const s=new URLSearchParams({format:"json",perpage:"50",page:String(t)});let n="/tunes/popular";o&&(n="/tunes/search",s.set("q",o)),e&&s.set("type",e);const i=await Xt(`${Ve}${n}?${s}`);return{tunes:(i.tunes||[]).map(a=>({id:a.id,name:a.name,type:a.type,url:a.url})),page:i.page||1,pages:i.pages||1,total:i.total||0}}function an(o){const e=(o||"").match(/^([A-G][b#]?)(major|minor|dorian|mixolydian|lydian|phrygian|locrian)?/i);if(!e)return"C";const t=(e[2]||"major").toLowerCase(),s={major:"",minor:"m",dorian:"dor",mixolydian:"mix",lydian:"lyd",phrygian:"phr",locrian:"loc"}[t];return e[1]+s}async function on(o){const e=await Xt(`${Ve}/tunes/${encodeURIComponent(o)}?format=json`),t=(e.type||"").toLowerCase(),s=Rt[t]||"4/4",n=tn[t]||"1/4=110",i=(e.settings||[]).map((a,c)=>{const r=String(a.abc||"").replace(/\\r\\n|\\n/g,`
`),h=[`X:${c+1}`,`T:${e.name}`,`R:${t}`,`M:${s}`,"L:1/8",`Q:${n}`,`O:The Session #${e.id} (setting ${c+1})`,`K:${an(a.key)}`,r].join(`
`);return{settingId:a.id,key:a.key,abc:h}});return{id:e.id,name:e.name,type:t,url:e.url||`${Ve}/tunes/${e.id}`,settings:i}}function Ne(o,e){let t=0,s;do s=o.getUint8(e.i++),t=t<<7|s&127;while(s&128);return t}function Re(o,e,t){let s="";for(let n=0;n<t;n++)s+=String.fromCharCode(o.getUint8(e+n));return s}function cn(o){const e=new DataView(o);if(Re(e,0,4)!=="MThd")throw new Error("Not a MIDI file");const t=e.getUint32(4),s=e.getUint16(10),n=e.getUint16(12);if(n&32768)throw new Error("SMPTE-timed MIDI files are not supported");let i=8+t;const a=[],c={tempo:null,timeSig:null,keySig:null,title:""};for(let r=0;r<s&&i<e.byteLength;r++){const h=Re(e,i,4),l=e.getUint32(i+4),d=i+8,p=d+l;if(i=p,h!=="MTrk")continue;const u={i:d};let A=0,g=0;const D=new Map,C=[];let T="",I=null;const z=new Set;for(;u.i<p;){A+=Ne(e,u);let E=e.getUint8(u.i);if(E&128)g=E,u.i++;else if(!g)break;const B=g&240,v=g&15;if(g===255){const G=e.getUint8(u.i++),X=Ne(e,u);if(G===81&&c.tempo==null){const M=e.getUint8(u.i)<<16|e.getUint8(u.i+1)<<8|e.getUint8(u.i+2);c.tempo=6e7/M}else G===88&&!c.timeSig?c.timeSig={num:e.getUint8(u.i),den:Math.pow(2,e.getUint8(u.i+1))}:G===89&&!c.keySig?c.keySig={sf:e.getInt8(u.i),minor:e.getUint8(u.i+1)===1}:G===3&&(T=Re(e,u.i,X),r===0&&!c.title&&(c.title=T));u.i+=X,g=0;continue}if(g===240||g===247){const G=Ne(e,u);u.i+=G,g=0;continue}if(B===144||B===128){const G=e.getUint8(u.i++),X=e.getUint8(u.i++),M=v*128+G;if(B===144&&X>0)D.has(M)||D.set(M,{start:A,vel:X});else{const b=D.get(M);b&&(C.push({midi:G,start:b.start,end:A,ch:v,vel:b.vel}),D.delete(M))}z.add(v)}else if(B===160||B===176||B===224)u.i+=2;else if(B===192)I=e.getUint8(u.i++);else if(B===208)u.i+=1;else break}if(C.length>0){C.sort((B,v)=>B.start-v.start||v.midi-B.midi);const E=z.has(9)&&z.size===1;a.push({index:r,name:T||`Track ${r+1}`,notes:C,program:I,isDrums:E})}}return{division:n,tracks:a,meta:c}}const rn=["Piano","Chromatic Perc.","Organ","Guitar","Bass","Strings","Ensemble","Brass","Reed","Pipe","Synth Lead","Synth Pad","Synth FX","Ethnic","Percussive","SFX"];function ln(o){const e=o.tracks.filter(n=>!n.isDrums).map(n=>{const i=n.notes.reduce((c,r)=>c+r.midi,0)/n.notes.length,a=n.program!=null?rn[Math.floor(n.program/8)]:"";return{index:n.index,name:n.name,family:a,count:n.notes.length,avgPitch:i}});let t=null,s=-1/0;for(const n of e){let i=Math.log(n.count+1)*2-Math.abs(n.avgPitch-72)*.15;/lead|melody|vocal|voice|violin|fiddle|solo/i.test(n.name)&&(i+=4),["Synth Lead","Strings","Reed","Pipe","Brass"].includes(n.family)&&(i+=1.5),n.family==="Bass"&&(i-=4),i>s&&(s=i,t=n.index)}return{tracks:e,suggested:t}}function dn(o,e,t){const s=o.tracks.find(b=>b.index===e);if(!s)throw new Error("Track not found");const n=o.division,i=n/8,a=[];for(const b of s.notes){if(b.end-b.start<i)continue;const k=a[a.length-1];if(k&&Math.abs(k.start-b.start)<n/16){b.midi>k.midi&&Object.assign(k,b);continue}a.push({...b})}for(let b=0;b<a.length-1;b++)a[b].end>a[b+1].start&&(a[b].end=a[b+1].start);const c=n/4,r=b=>Math.round(b/c)*c,h=[];for(const b of a){const k=r(b.start),K=Math.max(k+c,r(b.end)),f=h[h.length-1];f&&f.startTick===k||(f&&f.endTick>k&&(f.endTick=k),h.push({midi:b.midi,startTick:k,endTick:K}))}const l=o.meta.timeSig||{num:4,den:4},d=n*l.num*(4/l.den),u=(h.length?Math.floor(h[0].startTick/d):0)*d,A=h.map((b,k)=>({midi:b.midi,start:(b.startTick-u)/n,dur:Math.max(.0625,(b.endTick-b.startTick)/n),i:k})),g=A.length?Math.ceil((A[A.length-1].start+A[A.length-1].dur)/(d/n))*(d/n):d/n,D=d/n,C={num:l.num,den:l.den,text:`${l.num}/${l.den}`},T=[],I=[],z=Math.round(g/D);for(let b=0;b<z;b++){const K=`Part ${Math.floor(b/8)+1}`;T.push({start:b*D,dur:D,section:K,sectionKey:K,meter:C})}for(let b=0;b*8<z;b++){const k=b*8,K=Math.min(z,k+8);I.push({key:`Part ${b+1}`,name:`Part ${b+1}`,start:k*D,end:K*D,barStart:k,barEnd:K})}for(const b of A)b.bar=Math.min(z-1,Math.floor(b.start/D+1e-6));const E=o.meta.keySig,B=["Cb","Gb","Db","Ab","Eb","Bb","F","C","G","D","A","E","B","F#","C#"],v={C:0,"C#":1,Db:1,D:2,Eb:3,E:4,F:5,"F#":6,Gb:6,G:7,Ab:8,A:9,Bb:10,B:11,Cb:11},G=["F","C","G","D","A","E","B"],X=["B","E","A","D","G","C","F"];let M={tonic:"C",mode:"maj",accidentals:{},tonicPc:0,label:"C"};if(E){const b=B[E.sf+7]||"C",k={};E.sf>0&&G.slice(0,E.sf).forEach(_=>{k[_]=1}),E.sf<0&&X.slice(0,-E.sf).forEach(_=>{k[_]=-1});const K=E.minor?(v[b]+9)%12:v[b],f=["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];M={tonic:f[K],mode:E.minor?"min":"maj",accidentals:k,tonicPc:K,label:f[K]+(E.minor?"m":"")}}return{title:t||o.meta.title||s.name||"Imported MIDI",composer:"",origin:"Imported MIDI",rhythm:"",meter:C,key:M,tempo:Math.round(o.meta.tempo||120),notes:A,bars:T,sections:I,chords:[],totalBeats:g}}function m(o,e,t){const s=document.createElement(o);return e&&(s.className=e),t!=null&&(s.textContent=t),s}function bt(o){const e=Math.floor(o/60),t=Math.round(o%60);return`${e}:${String(t).padStart(2,"0")}`}const hn=["Beginner","Easy","Intermediate","Advanced","Expert"];class un{constructor(e){this.container=e,this.onPlay=null,this.tuningKey=De,this._view="library",this._query="",this._genre="All",this._difficulty="All",this._sort="recommended",this._selected=null,this._metaCache=new Map,this._build(),this.refresh()}setTuning(e){!ee[e]||e===this.tuningKey||(this.tuningKey=e,this._metaCache.clear(),this.tuningDropdown&&(this.tuningDropdown.value=e),this.refresh())}_meta(e){const t=`${e.id}|${this.tuningKey}`;let s=this._metaCache.get(t);if(!s){try{s=Ys(e,this.tuningKey)}catch(n){console.warn("Bad song",e.id,n),s=null}this._metaCache.set(t,s)}return s}_build(){const e=m("div","sb-root");this.root=e;const t=m("div","sb-top"),s=m("div","sb-brand");s.append(m("div","sb-brand-title","Song Play"),m("div","sb-brand-sub","Pick a song · play along · level up")),t.appendChild(s);const n=m("div","sb-tabs");this._tabBtns={};for(const[h,l]of[["library","Library"],["mine","My Songs"],["online","Find Online"],["import","Import"]]){const d=m("button","sb-tab",l);d.addEventListener("click",()=>{this._view!==h&&(this._query=""),this._view=h,this.refresh()}),n.appendChild(d),this._tabBtns[h]=d}t.appendChild(n);const i=m("div","sb-tuning");i.append(m("span","sb-label","Instrument"));const a=m("div","sb-dd");this.tuningDropdown=new P(a,{placeholder:"Tuning"});const c={};for(const[h,l]of Object.entries(ee))(c[l.family]=c[l.family]||[]).push({value:h,label:l.label});this.tuningDropdown.setGroupedItems(Object.entries(c).map(([h,l])=>({label:h,items:l}))),this.tuningDropdown.value=this.tuningKey,this.tuningDropdown.onChange=h=>this.setTuning(h),i.appendChild(a),t.appendChild(i),e.appendChild(t),this.inputSlot=m("div","sb-input-slot"),e.appendChild(this.inputSlot);const r=m("div","sb-body");this.listPane=m("div","sb-list-pane"),this.detailPane=m("div","sb-detail-pane"),r.append(this.listPane,this.detailPane),e.appendChild(r),this.container.appendChild(e)}refresh(){for(const[e,t]of Object.entries(this._tabBtns))t.classList.toggle("active",e===this._view);this.listPane.replaceChildren(),this._view==="library"||this._view==="mine"?this._renderList():this._view==="online"?this._renderOnline():this._renderImport(),this._renderDetail()}_renderList(){const e=this.listPane,t=this._view==="mine",s=m("div","sb-filters"),n=m("input","sb-search");n.type="search",n.placeholder=t?"Search my songs…":"Search songs, composers, origins…",n.value=this._query,n.addEventListener("input",()=>{this._query=n.value,this._renderCards(l,t)}),s.appendChild(n);const i=m("div","sb-filter-row"),a=m("div","sb-dd sb-dd--small"),c=new P(a,{placeholder:"Difficulty"});c.setItems([{value:"All",label:"All levels"},...hn.map(d=>({value:d,label:d}))]),c.value=this._difficulty,c.onChange=d=>{this._difficulty=d,this._renderCards(l,t)};const r=m("div","sb-dd sb-dd--small"),h=new P(r,{placeholder:"Sort"});if(h.setItems([{value:"recommended",label:"Recommended"},{value:"title",label:"Title A–Z"},{value:"easy",label:"Easiest first"},{value:"hard",label:"Hardest first"},{value:"mastery",label:"Mastery"},{value:"recent",label:"Recently played"},{value:"short",label:"Shortest"}]),h.value=this._sort,h.onChange=d=>{this._sort=d,this._renderCards(l,t)},i.append(a,r),s.appendChild(i),!t){const d=m("div","sb-chips");for(const p of["All",...vs]){const u=m("button","sb-chip",p);u.classList.toggle("active",this._genre===p),u.addEventListener("click",()=>{this._genre=p,d.querySelectorAll(".sb-chip").forEach(A=>A.classList.toggle("active",A===u)),this._renderCards(l,t)}),d.appendChild(u)}s.appendChild(d)}e.appendChild(s),this._countEl=m("div","sb-count"),e.appendChild(this._countEl);const l=m("div","sb-cards");e.appendChild(l),this._renderCards(l,t)}_filteredSongs(e){const t=this._query.trim().toLowerCase();let s=Et().filter(a=>e?a.source==="user":a.source==="builtin");const n=[];for(const a of s){const c=this._meta(a);if(c&&!(!e&&this._genre!=="All"&&a.genre!==this._genre)&&!(this._difficulty!=="All"&&c.difficulty.label!==this._difficulty)){if(t){const r=`${c.title} ${c.composer} ${a.genre} ${c.key} ${c.rhythm}`.toLowerCase();if(!t.split(/\s+/).every(h=>r.includes(h)))continue}n.push({song:a,meta:c,progress:He(a.id)})}}const i={recommended:(a,c)=>(c.progress.lastPlayed?1:0)-(a.progress.lastPlayed?1:0)||a.meta.difficulty.score-c.meta.difficulty.score,title:(a,c)=>a.meta.title.localeCompare(c.meta.title),easy:(a,c)=>a.meta.difficulty.score-c.meta.difficulty.score,hard:(a,c)=>c.meta.difficulty.score-a.meta.difficulty.score,mastery:(a,c)=>(c.progress.mastery||0)-(a.progress.mastery||0),recent:(a,c)=>(c.progress.lastPlayed||0)-(a.progress.lastPlayed||0),short:(a,c)=>a.meta.duration-c.meta.duration}[this._sort];return n.sort(i),n}_renderCards(e,t){var i;e.replaceChildren();const s=this._filteredSongs(t);if(this._countEl.textContent=`${s.length} song${s.length===1?"":"s"}`,s.length===0){e.appendChild(m("div","sb-empty",t?'No songs yet. Use "Find Online" or "Import" to add tunes, or load a MIDI file of any song you own.':"No songs match these filters."));return}const n=document.createDocumentFragment();for(const{song:a,meta:c,progress:r}of s){const h=m("button","sb-card");((i=this._selected)==null?void 0:i.id)===a.id&&h.classList.add("selected"),h.addEventListener("click",()=>{this._selected=a,e.querySelectorAll(".sb-card").forEach(T=>T.classList.toggle("selected",T===h)),this._renderDetail(),this.root.classList.add("detail-open")});const l=m("div","sb-ring"),d=Math.min(110,r.mastery||0);l.style.setProperty("--pct",String(Math.min(100,d))),l.appendChild(m("span",null,`${d}%`)),d>=100&&l.classList.add("mastered");const p=m("div","sb-card-info");p.append(m("div","sb-card-title",c.title)),p.append(m("div","sb-card-sub",c.composer||a.genre));const u=m("div","sb-card-tags");u.append(m("span","sb-pill sb-pill--genre",a.genre)),u.append(m("span","sb-pill",`${c.key} · ${c.meter}`)),u.append(m("span","sb-pill",bt(c.duration))),p.appendChild(u);const A=m("div","sb-diff"),g=m("div","sb-diff-bars"),D=Math.ceil(c.difficulty.score/2);for(let T=1;T<=5;T++)g.appendChild(m("span",T<=D?"on":""));A.append(g,m("div","sb-diff-label",c.difficulty.label));const C=Object.values(r.medal||{});if(C.length){const T=["platinum","gold","silver","bronze"].find(I=>C.includes(I));A.appendChild(m("div",`sb-medal-dot sb-medal-dot--${T}`,"●"))}h.append(l,p,A),n.appendChild(h)}e.appendChild(n)}_renderDetail(){var Ae,me,de,lt;const e=this.detailPane;e.replaceChildren();const t=this._selected;if(!t){const L=m("div","sb-detail-empty");L.append(m("div","sb-detail-empty-title","Choose a song")),L.append(m("p",null,"Notes fly toward you on a 3D highway: colours are strings, numbers are fingers. Play them in tune and on time. In Learn a Song mode the difficulty adapts phrase by phrase as you improve.")),e.appendChild(L);return}let s,n;try{s=_e(t,this.tuningKey),n=this._meta(t)}catch(L){e.appendChild(m("div","sb-error",`This song could not be loaded: ${L.message}`));return}const i=He(t.id),a=m("button","sb-detail-close","←  Songs");a.addEventListener("click",()=>this.root.classList.remove("detail-open")),e.appendChild(a),e.append(m("h2","sb-detail-title",n.title)),e.append(m("div","sb-detail-sub",[n.composer,t.genre].filter(Boolean).join(" · ")));const c=m("div","sb-stats"),r=(L,N)=>{const V=m("div","sb-stat");V.append(m("div","sb-stat-v",N),m("div","sb-stat-l",L)),c.appendChild(V)};r("Difficulty",`${n.difficulty.score}/10`),r("Notes",String(n.notes)),r("Length",bt(n.duration)),r("Tempo",`♩=${n.tempo}`),r("Key",n.key),r("Positions",n.maxPosition>1?`1st–${n.maxPosition}${["","st","nd","rd"][n.maxPosition]||"th"}`:"1st"),e.appendChild(c),s.transpose&&e.appendChild(m("div","sb-note",`Transposed ${s.transpose>0?"up":"down"} ${Math.abs(s.transpose/12)} octave${Math.abs(s.transpose)>12?"s":""} to fit ${ee[this.tuningKey].label}.`));const h=m("div","sb-progress"),l=m("div","sb-mastery");l.append(m("div","sb-mastery-label","Mastery"));const d=m("div","sb-mastery-bar"),p=m("div","sb-mastery-fill");p.style.width=`${Math.min(100,i.mastery||0)/1.1}%`,(i.mastery||0)>100&&p.classList.add("over"),d.appendChild(p),l.append(d,m("div","sb-mastery-val",`${i.mastery||0}%`)),h.appendChild(l);const u=m("div","sb-levels");for(const L of s.phrases){const N=L.name.replace(" (repeat)",""),V=((Ae=i.phraseLevels)==null?void 0:Ae[N])??0,ne=(me=i.phraseMastered)==null?void 0:me[N],ze=m("div","sb-level");ze.title=`${L.name}: level ${V}/${q}${ne?" (mastered)":""}`;const Ie=m("div","sb-level-fill");Ie.style.height=`${20+V/q*80}%`,ne&&Ie.classList.add("mastered"),ze.appendChild(Ie),u.appendChild(ze)}h.appendChild(u);const A=m("div","sb-best"),g=i.bestScore||{},D=["easy","medium","hard","master"].filter(L=>g[L]).map(L=>{var N;return`${L[0].toUpperCase()+L.slice(1)} ${g[L].toLocaleString()}${(N=i.medal)!=null&&N[L]?` (${i.medal[L]})`:""}`}).join(" · ");A.textContent=`Plays: ${i.plays||0} · Best accuracy: ${i.bestAccuracy||0}% · Best streak: ${i.bestStreak||0}${D?` · ${D}`:""}`,h.appendChild(A),e.appendChild(h);const C=m("div","sb-modes"),T=m("div","sb-mode");T.append(m("div","sb-mode-title","Learn a Song")),T.append(m("div","sb-mode-desc","Starts simple. Each phrase you nail adds more notes, until you are playing every note. Mastered phrases fade out (Master Mode) so you play from memory."));const I=m("button","sb-btn sb-btn-primary","Play");I.addEventListener("click",()=>{var L;return(L=this.onPlay)==null?void 0:L.call(this,t,s,{mode:"learn"})}),T.appendChild(I),C.appendChild(T);const z=m("div","sb-mode");z.append(m("div","sb-mode-title","Score Attack")),z.append(m("div","sb-mode-desc","Fixed difficulty. Build streaks for a ×4 multiplier. Miss three notes in a row and you take a strike. Too many strikes and the song ends."));const E=m("div","sb-btn-row");for(const[L,N]of[["easy","Easy"],["medium","Medium"],["hard","Hard"],["master","Master"]]){const V=m("button","sb-btn",N);L==="master"&&!(((de=i.medal)==null?void 0:de.hard)==="gold"||((lt=i.medal)==null?void 0:lt.hard)==="platinum")&&(V.title="Tip: earn Gold on Hard first. Master hides the notes as they approach."),V.addEventListener("click",()=>{var ne;return(ne=this.onPlay)==null?void 0:ne.call(this,t,s,{mode:"score",difficulty:L})}),E.appendChild(V)}z.appendChild(E),C.appendChild(z);const B=m("div","sb-mode");B.append(m("div","sb-mode-title","Riff Repeater")),B.append(m("div","sb-mode-desc","Loop any phrases at your own speed and level. Speed Trainer adds 5% each time you clear a loop with 90% accuracy."));const v=m("div","sb-riff-grid"),G=s.phrases.map((L,N)=>({value:String(N),label:`${N+1}. ${L.name}`})),X=m("div","sb-dd sb-dd--small"),M=new P(X,{placeholder:"From"});M.setItems(G),M.value="0";const b=m("div","sb-dd sb-dd--small"),k=new P(b,{placeholder:"To"});k.setItems(G),k.value=String(Math.min(s.phrases.length-1,1));const K=m("div","sb-dd sb-dd--small"),f=new P(K,{placeholder:"Level"});f.setItems([{value:"dynamic",label:"Dynamic"},...Array.from({length:q+1},(L,N)=>({value:String(N),label:N===q?`Level ${N} (all notes)`:`Level ${N}`}))]),f.value=String(q);const _=(L,N)=>{const V=m("label","sb-field");return V.append(m("span","sb-label",L),N),V};v.append(_("From",X),_("To",b),_("Level",K));const y=m("label","sb-field sb-field--wide");y.append(m("span","sb-label","Speed"));const x=m("input");x.type="range",x.min="25",x.max="125",x.step="5",x.value="70";const Q=m("span","sb-speed-val","70%");x.addEventListener("input",()=>{Q.textContent=`${x.value}%`}),y.append(x,Q),v.appendChild(y);const $=m("label","sb-check"),j=m("input");j.type="checkbox",j.checked=!0,$.append(j,m("span",null,"Speed Trainer")),v.appendChild($),B.appendChild(v);const te=m("button","sb-btn sb-btn-primary","Start loop");te.addEventListener("click",()=>{var ne;let L=Number(M.value||0),N=Number(k.value||0);N<L&&([L,N]=[N,L]);const V=f.value==="dynamic"?"dynamic":Number(f.value);(ne=this.onPlay)==null||ne.call(this,t,s,{mode:"riff",riff:{from:L,to:N,level:V,speed:Number(x.value),trainer:j.checked}})}),B.appendChild(te),C.appendChild(B),e.appendChild(C);const H=m("div","sb-detail-foot"),be=m("button","sb-link","Reset progress");if(be.addEventListener("click",()=>{confirm(`Reset all progress for "${n.title}"?`)&&(Js(t.id),this.refresh())}),H.appendChild(be),t.source==="user"){const L=m("button","sb-link sb-link--danger","Remove from My Songs");L.addEventListener("click",()=>{confirm(`Remove "${n.title}"?`)&&(en(t.id),this._selected=null,this.refresh())}),H.appendChild(L)}if(t.abc){const L=m("button","sb-link","View ABC");L.addEventListener("click",()=>{const N=m("pre","sb-abc",t.abc);L.replaceWith(N)}),H.appendChild(L)}e.appendChild(H)}openRiff(e,t,s){var i;const n=_e(e,this.tuningKey);(i=this.onPlay)==null||i.call(this,e,n,{mode:"riff",riff:{from:t,to:s,level:q,speed:70,trainer:!0}})}_renderOnline(){const e=this.listPane,t=m("div","sb-online");t.append(m("div","sb-online-title","Search The Session")),t.append(m("p","sb-muted","Tens of thousands of traditional Irish, Scottish and other folk tunes, transcribed by the community at thesession.org. Search by name, or leave the box empty to browse the most popular tunes."));const s=m("div","sb-online-row"),n=m("input","sb-search");n.type="search",n.placeholder="e.g. Drowsy Maggie, Kesh, Butterfly…",n.value=this._onlineQuery||"";const i=m("div","sb-dd sb-dd--small"),a=new P(i,{placeholder:"Any type"});a.setItems([{value:"",label:"Any type"},...sn.map(d=>({value:d,label:d[0].toUpperCase()+d.slice(1)}))]),a.value=this._onlineType||"";const c=m("button","sb-btn sb-btn-primary","Search");s.append(n,i,c),t.appendChild(s);const r=m("div","sb-online-results");t.appendChild(r);const h=m("div","sb-credit");h.innerHTML='Contains information from <a href="https://thesession.org" target="_blank" rel="noopener">The Session</a>, made available under the <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener">Open Database License (ODbL)</a>.',t.appendChild(h),e.appendChild(t);const l=async(d=1)=>{this._onlineQuery=n.value.trim(),this._onlineType=a.value,r.replaceChildren(m("div","sb-muted","Searching…"));try{const p=await nn(this._onlineQuery,{type:this._onlineType,page:d});r.replaceChildren(),r.appendChild(m("div","sb-count",`${p.total.toLocaleString()} tunes · page ${p.page} of ${p.pages}`));for(const A of p.tunes){const g=m("div","sb-online-item");g.append(m("div","sb-online-name",A.name),m("span","sb-pill",A.type));const D=m("button","sb-btn","Open");D.addEventListener("click",()=>this._openSessionTune(A.id,g)),g.appendChild(D),r.appendChild(g)}const u=m("div","sb-btn-row");if(p.page>1){const A=m("button","sb-btn","← Prev");A.addEventListener("click",()=>l(p.page-1)),u.appendChild(A)}if(p.page<p.pages){const A=m("button","sb-btn","Next →");A.addEventListener("click",()=>l(p.page+1)),u.appendChild(A)}r.appendChild(u)}catch(p){r.replaceChildren(m("div","sb-error",`Could not reach The Session (${p.message}). Check your internet connection.`))}};c.addEventListener("click",()=>l(1)),n.addEventListener("keydown",d=>{d.key==="Enter"&&l(1)}),this._onlineAutoRun!==!1&&(this._onlineAutoRun=!1,l(1))}async _openSessionTune(e,t){const s=m("div","sb-online-settings");s.textContent="Loading…",t.after(s);try{const n=await on(e);s.replaceChildren(),s.appendChild(m("div","sb-muted",`${n.settings.length} setting${n.settings.length===1?"":"s"}. Each one is a different transcription:`)),n.settings.slice(0,12).forEach((a,c)=>{const r=m("div","sb-online-setting");let h="";try{const d=$e(a.abc),p=_e({id:`session-${e}-${a.settingId}`,abc:a.abc},this.tuningKey);h=`${d.key.label} · ${p.notes.length} notes · ${p.difficulty.label}`}catch{h="unparseable"}r.append(m("span",null,`Setting ${c+1}`),m("span","sb-muted",h));const l=m("button","sb-btn sb-btn-primary","Add to My Songs");l.addEventListener("click",()=>{const d=Oe({title:n.name,abc:a.abc,origin:`The Session #${n.id}`});this._selected=d,this._view="mine",this.refresh(),this.root.classList.add("detail-open")}),r.appendChild(l),s.appendChild(r)});const i=m("a","sb-link","View on thesession.org ↗");i.href=n.url,i.target="_blank",i.rel="noopener",s.appendChild(i)}catch(n){s.textContent=`Failed to load tune: ${n.message}`}}_renderImport(){const e=this.listPane,t=m("div","sb-import");t.append(m("div","sb-online-title","Import songs")),t.append(m("p","sb-muted","Bring your own music. Load a MIDI file (any song you own: rock, pop, film, games…) and pick the melody track. Or paste or load ABC notation from sites like abcnotation.com. Imported songs stay in this browser under My Songs."));const s=m("div","sb-file-row"),n=m("input");n.type="file",n.accept=".mid,.midi,.abc,.txt,audio/midi,audio/x-midi",n.id="sb-file-input";const i=m("label","sb-btn sb-btn-primary","Choose MIDI / ABC file…");i.htmlFor="sb-file-input",s.append(i,n),t.appendChild(s);const a=m("div","sb-import-out");t.appendChild(a),n.addEventListener("change",async()=>{var d;const l=(d=n.files)==null?void 0:d[0];if(l){a.replaceChildren();try{if(/\.(mid|midi)$/i.test(l.name)){const p=await l.arrayBuffer(),u=cn(p),{tracks:A,suggested:g}=ln(u);if(A.length===0)throw new Error("No melodic tracks found");a.appendChild(m("div","sb-muted","Pick the track to play (the likely melody is highlighted):"));const D=l.name.replace(/\.(mid|midi)$/i,"");for(const C of A){const T=m("div","sb-online-setting");C.index===g&&T.classList.add("suggested"),T.append(m("span",null,C.name),m("span","sb-muted",`${C.family||"Instrument"} · ${C.count} notes`));const I=m("button","sb-btn sb-btn-primary","Add");I.addEventListener("click",()=>{const z=dn(u,C.index,`${D}${A.length>1?` (${C.name})`:""}`),E=Oe({title:z.title,parsed:z,origin:"MIDI import"});this._selected=E,this._view="mine",this.refresh(),this.root.classList.add("detail-open")}),T.appendChild(I),a.appendChild(T)}}else{const p=await l.text();this._importAbcText(p,a)}}catch(p){a.appendChild(m("div","sb-error",`Import failed: ${p.message}`))}n.value=""}}),t.appendChild(m("div","sb-label sb-label--block","Paste ABC notation"));const c=m("textarea","sb-abc-input");c.placeholder=`X:1
T:My Tune
M:4/4
L:1/8
Q:1/4=100
K:D
|:DEFG A2 FA|...`,c.rows=9,t.appendChild(c);const r=m("div","sb-import-out"),h=m("button","sb-btn sb-btn-primary","Add tune(s)");h.addEventListener("click",()=>this._importAbcText(c.value,r)),t.append(h,r),e.appendChild(t)}_importAbcText(e,t){t.replaceChildren();const s=ws(e);if(s.length===0){t.appendChild(m("div","sb-error","No ABC tunes found. A tune needs at least a K: (key) line."));return}let n=0,i=null;for(const a of s)try{const c=$e(a);if(c.notes.length<2)throw new Error("no notes");i=Oe({title:c.title,abc:a,origin:"ABC import"}),n++}catch(c){t.appendChild(m("div","sb-error",`Skipped a tune: ${c.message}`))}n&&(t.appendChild(m("div","sb-ok",`Added ${n} tune${n===1?"":"s"} to My Songs.`)),this._selected=i,this._view="mine",this.refresh(),this.root.classList.add("detail-open"))}findSong(e){return Et().find(t=>t.id===e)||null}updateProgress(){this._view==="library"||this._view==="mine"?this.refresh():this._renderDetail()}static parsedFor(e){return st(e)}}const pn=[[/^(maj7|M7)/,[0,4,7,11]],[/^(m7|min7|-7)/,[0,3,7,10]],[/^(dim|°)/,[0,3,6]],[/^(aug|\+)/,[0,4,8]],[/^(sus4|sus)/,[0,5,7]],[/^sus2/,[0,2,7]],[/^(m|min|-)/,[0,3,7]],[/^7/,[0,4,7,10]],[/^6/,[0,4,7,9]],[/^/,[0,4,7]]],An={C:0,D:2,E:4,F:5,G:7,A:9,B:11};function mn(o){const e=(o||"").match(/^([A-G])([#b]?)(.*)$/);if(!e)return null;const t=(An[e[1]]+(e[2]==="#"?1:e[2]==="b"?-1:0)+12)%12,s=e[3];for(const[n,i]of pn)if(n.test(s))return{root:t,intervals:i};return{root:t,intervals:[0,4,7]}}class Ft{constructor(e){this.ctx=e,this.master=e.createGain(),this.master.gain.value=.8,this.master.connect(e.destination),this.guideBus=e.createGain(),this.backingBus=e.createGain(),this.clickBus=e.createGain();for(const t of[this.guideBus,this.backingBus,this.clickBus])t.connect(this.master);this._active=new Set}setVolumes({guide:e,backing:t,click:s}){const n=this.ctx.currentTime;e!=null&&this.guideBus.gain.setTargetAtTime(e,n,.02),t!=null&&this.backingBus.gain.setTargetAtTime(t,n,.02),s!=null&&this.clickBus.gain.setTargetAtTime(s,n,.02)}_track(e,t){this._active.add(e),e.onended=()=>this._active.delete(e),e.stop(t)}note(e,t,s,n=.25){const i=this.ctx,a=ae(e),c=i.createOscillator();c.type="sawtooth",c.frequency.value=a;const r=i.createOscillator(),h=i.createGain();r.frequency.value=5.5,h.gain.setValueAtTime(0,t),h.gain.linearRampToValueAtTime(a*.006,t+Math.min(.35,s)),r.connect(h).connect(c.frequency);const l=i.createBiquadFilter();l.type="lowpass",l.frequency.value=Math.min(5e3,a*5),l.Q.value=.8;const d=i.createGain(),p=Math.max(.06,s*.95);d.gain.setValueAtTime(1e-4,t),d.gain.linearRampToValueAtTime(n,t+.04),d.gain.setTargetAtTime(n*.75,t+.05,.1),d.gain.setTargetAtTime(1e-4,t+p,.04),c.connect(l).connect(d).connect(this.guideBus),c.start(t),r.start(t),this._track(c,t+p+.3),this._track(r,t+p+.3)}chord(e,t,s){const n=mn(e);if(!n)return;const i=this.ctx,a=Math.max(.2,s);for(const h of n.intervals){const l=55+(n.root+h-7+12)%12+0,d=i.createOscillator();d.type="triangle",d.frequency.value=ae(l);const p=i.createGain();p.gain.setValueAtTime(1e-4,t),p.gain.linearRampToValueAtTime(.07,t+.08),p.gain.setTargetAtTime(1e-4,t+a-.05,.08),d.connect(p).connect(this.backingBus),d.start(t),this._track(d,t+a+.4)}const c=i.createOscillator();c.type="sine",c.frequency.value=ae(36+n.root);const r=i.createGain();r.gain.setValueAtTime(1e-4,t),r.gain.linearRampToValueAtTime(.35,t+.01),r.gain.setTargetAtTime(1e-4,t+.05,Math.min(.5,a/2)),c.connect(r).connect(this.backingBus),c.start(t),this._track(c,t+a+.4)}drone(e,t,s){const n=this.ctx;for(const i of[43+(e-7+12)%12,50+(e-2+12)%12]){const a=n.createOscillator();a.type="triangle",a.frequency.value=ae(i);const c=n.createGain();c.gain.setValueAtTime(1e-4,t),c.gain.linearRampToValueAtTime(.06,t+.3),c.gain.setTargetAtTime(1e-4,t+s,.2),a.connect(c).connect(this.backingBus),a.start(t),this._track(a,t+s+1)}}click(e,t=!1,s=null){const n=this.ctx,i=n.createOscillator();i.type="square",i.frequency.value=t?1600:1100;const a=n.createGain();if(a.gain.setValueAtTime(t?.35:.2,e),a.gain.exponentialRampToValueAtTime(1e-4,e+.04),s!=null){const c=n.createGain();c.gain.value=s,i.connect(a).connect(c).connect(this.master)}else i.connect(a).connect(this.clickBus);i.start(e),this._track(i,e+.05)}stopAll(){for(const e of this._active)try{e.stop()}catch{}this._active.clear()}dispose(){this.stopAll(),this.master.disconnect()}}const fn={C:"#3ddc84",G:"#ff8c1a",D:"#2e8fff",A:"#ffd23f",E:"#ff3b55",B:"#b061ff","F#":"#ff5fd2","C#":"#3ddcc4",F:"#ff5fd2"},Ct=["#ff8c1a","#2e8fff","#ffd23f","#ff3b55","#b061ff","#3ddc84"],Xe=2.6,gn=.16,yt=.14,ge={easy:{label:"Easy",level:1,strikes:5},medium:{label:"Medium",level:3,strikes:4},hard:{label:"Hard",level:q,strikes:3},master:{label:"Master",level:q,strikes:3,fade:!0}};function Dn(o,e){return fn[o==null?void 0:o.name]||Ct[e%Ct.length]}function F(o,e,t){const s=document.createElement(o);return e&&(s.className=e),t!=null&&(s.textContent=t),s}function _t(o){o=Math.max(0,o);const e=Math.floor(o/60),t=Math.floor(o%60);return`${e}:${String(t).padStart(2,"0")}`}function he(o){return o.name.replace(" (repeat)","")}class Bn{constructor(e,t){this.container=e,this.deps=t,this.onExit=null,this.onRiffRequest=null,this.settings=Gt(),this._state="idle",this._freq=null,this._freqTime=0,this._raf=null,this._particles=[],this._popups=[],this._synth=null,this._cam=0,this._build(),this._onKey=s=>this._handleKey(s),this._onVisibility=()=>{document.hidden&&this._state==="playing"&&this.pause()},document.addEventListener("visibilitychange",this._onVisibility)}get active(){return this._state==="playing"||this._state==="tuning"||this._state==="paused"}_build(){const e=F("div","sp-root");this.root=e;const t=F("div","sp-hud"),s=F("div","sp-hud-left");this.hudTitle=F("div","sp-title"),this.hudSub=F("div","sp-sub"),s.append(this.hudTitle,this.hudSub);const n=F("div","sp-hud-stats"),i=d=>{const p=F("div","sp-stat"),u=F("div","sp-stat-value","0");return p.append(u,F("div","sp-stat-label",d)),n.appendChild(p),{box:p,v:u}};this.stScore=i("Score"),this.stMult=i("Multiplier"),this.stStreak=i("Streak"),this.stAcc=i("Accuracy"),this.stStrikes=i("Strikes"),t.append(s,n),this.timeline=F("canvas","sp-timeline");const a=F("div","sp-stage");this.canvas=F("canvas","sp-canvas"),a.appendChild(this.canvas),this.stage=a,this.overlay=F("div","sp-overlay hidden"),a.appendChild(this.overlay);const c=F("div","sp-controls");this.btnPause=F("button","sp-btn sp-btn-primary","Pause"),this.btnPause.addEventListener("click",()=>this._state==="paused"?this.resume():this.pause()),this.btnRestart=F("button","sp-btn","Restart"),this.btnRestart.addEventListener("click",()=>this.restart()),this.btnExit=F("button","sp-btn","Library"),this.btnExit.addEventListener("click",()=>this.exit());const r=F("label","sp-speed");r.append(F("span",null,"Speed")),this.speedInput=F("input"),this.speedInput.type="range",this.speedInput.min="25",this.speedInput.max="125",this.speedInput.step="5",this.speedInput.value="100",this.speedVal=F("span","sp-speed-val","100%"),this.speedInput.addEventListener("input",()=>this._setSpeed(Number(this.speedInput.value)/100)),r.append(this.speedInput,this.speedVal);const h=F("div","sp-toggles"),l=(d,p)=>{const u=F("button","sp-chip",p);u.setAttribute("aria-pressed",String(!!this.settings[d])),u.addEventListener("click",()=>{this.settings[d]=!this.settings[d],u.setAttribute("aria-pressed",String(this.settings[d])),ye(this.settings),this._applyVolumes()}),h.appendChild(u)};l("guide","Guide melody"),l("backing","Backing"),l("click","Click"),l("showNoteNames","Note names"),c.append(this.btnPause,this.btnRestart,r,h,this.btnExit),e.append(t,this.timeline,a,c),this.container.appendChild(e),this._ro=new ResizeObserver(()=>this._resize()),this._ro.observe(a),this._ro.observe(this.timeline)}_resize(){const e=window.devicePixelRatio||1,t=this.stage.getBoundingClientRect();this._w=Math.max(200,t.width),this._h=Math.max(160,t.height),this.canvas.width=Math.round(this._w*e),this.canvas.height=Math.round(this._h*e),this.canvas.style.width=this._w+"px",this.canvas.style.height=this._h+"px",this._dpr=e;const s=this.timeline.getBoundingClientRect();this.timeline.width=Math.round(Math.max(100,s.width)*e),this.timeline.height=Math.round(Math.max(10,s.height)*e)}start(e,t,s){var r,h;this.song=e,this.chart=t,this.opts={mode:"learn",difficulty:"hard",...s},this.settings=Gt(),this.progress=He(e.id),this.preset=ee[t.tuningKey],this.beatSec=60/t.tempo,this.notes=t.notes.map((l,d)=>({...l,i:d,sec:l.start*this.beatSec,durSec:l.dur*this.beatSec})),this.phrases=t.phrases.map(l=>({...l,sec:l.start*this.beatSec,endSec:l.end*this.beatSec})),this.endSec=t.totalBeats*this.beatSec;{const l=t.meter,d=l.num%3===0&&l.num>3;this._clickSec=(d?3*(4/l.den):4/l.den)*this.beatSec;const p=l.num*(4/l.den)*this.beatSec,u=Math.round(p/this._clickSec);this._countInSec=u>=3?p:p*2}this._barStartSecs=new Set(t.bars.map(l=>Math.round(l.start*this.beatSec*1e3)));const n=this.opts.mode;let i=1;n==="riff"&&(i=(((r=this.opts.riff)==null?void 0:r.speed)??100)/100),this.speedInput.value=String(Math.round(i*100)),this.speedVal.textContent=`${Math.round(i*100)}%`,this.speed=i,this.title=e.title||t.title,this.hudTitle.textContent=this.title;const a=n==="learn"?"Learn a Song":n==="score"?`Score Attack · ${ge[this.opts.difficulty].label}`:"Riff Repeater";this.hudSub.textContent=`${a} · ${t.key.label} · ${t.meter.text} · ♩=${Math.round(t.tempo)}`,this.stMult.box.style.display=n==="score"?"":"none",this.stStrikes.box.style.display=n==="score"?"":"none",this.stScore.box.style.display=n==="learn"?"none":"",document.addEventListener("keydown",this._onKey),this._resize();const c=this.deps.getCtx();(h=c==null?void 0:c.resume)==null||h.call(c),this._resetRun(),this._pausedAt=null,this._anchorSong=0,this.settings.tuningCheck&&n!=="riff"?this._showTuningCheck():this._beginPlay(),this._loop()}_resetRun(){const e=this.opts.mode;this.score=0,this.streak=0,this.bestStreak=0,this.multiplier=1,this.hits=0,this.misses=0,this.perfects=0,this.strikes=0,this.consecMiss=0,this.failed=!1,this._particles=[],this._popups=[];for(const t of this.notes)t.state="pending",t.frames=0,t.firstMatch=null,t.cents=null,t.holdFrames=0;for(const t of this.phrases)t.level=null,t.evaluated=!1,t.hits=0,t.total=0,t.faded=!1;if(e==="riff"){const t=this.opts.riff;this.rangeStart=this.phrases[t.from].sec,this.rangeEnd=this.phrases[t.to].endSec,this.loopCount=0,this.loopStats=[]}else this.rangeStart=0,this.rangeEnd=this.endSec;this._levelByKey={};for(let t=0;t<this.phrases.length;t++){const s=he(this.phrases[t]);s in this._levelByKey||(this._levelByKey[s]=this.progress.phraseLevels[s]??0)}}_levelFor(e){const t=this.opts.mode;if(t==="score")return ge[this.opts.difficulty].level;if(t==="riff"){const s=this.opts.riff.level;return s==="dynamic"?this._levelByKey[he(this.phrases[e])]:s}return this._levelByKey[he(this.phrases[e])]}_isMasterFade(e){const t=this.opts.mode;return t==="score"?!!ge[this.opts.difficulty].fade:t==="learn"&&this.settings.masterMode?!!this.progress.phraseMastered[he(this.phrases[e])]:!1}_beginPlay(){this._hideOverlay(),this._resetRun();const e=this.deps.getCtx();e&&!this._synth?this._synth=new Ft(e):e&&this._synth&&this._synth.ctx!==e&&(this._synth.dispose(),this._synth=new Ft(e)),this._applyVolumes(),this._seek(this.rangeStart-this._countInSec),this._state="playing",this.btnPause.textContent="Pause",this.btnPause.disabled=!1}_applyVolumes(){if(!this._synth)return;const e=this.settings;this._synth.setVolumes({guide:e.guide?e.guideVolume:0,backing:e.backing?e.backingVolume:0,click:e.click?e.clickVolume:0})}_now(){const e=this.deps.getCtx();return e&&e.state==="running"?e.currentTime:performance.now()/1e3}_clockIsCtx(){const e=this.deps.getCtx();return!!(e&&e.state==="running")}_seek(e){var t;this._anchorSong=e,this._anchorClock=this._now(),this._anchorIsCtx=this._clockIsCtx(),this._scheduledUntil=e,(t=this._synth)==null||t.stopAll(),this._nextBeat=Math.ceil(e/this._clickSec-1e-6)}get songSec(){if(this._state==="paused"||this._state!=="playing")return this._pausedAt??this._anchorSong??0;if(this._anchorIsCtx!==this._clockIsCtx()){const e=this._anchorSong;this._seek(e)}return this._anchorSong+(this._now()-this._anchorClock)*this.speed}_setSpeed(e){const t=this.songSec;this.speed=e,this.speedVal.textContent=`${Math.round(e*100)}%`,this._state==="playing"&&this._seek(t)}pause(){var e;this._state==="playing"&&(this._pausedAt=this.songSec,this._state="paused",(e=this._synth)==null||e.stopAll(),this.btnPause.textContent="Resume",this._showPauseMenu())}resume(){if(this._state!=="paused")return;this._hideOverlay();const e=this._pausedAt-2*this.beatSec;this._state="playing",this._pausedAt=null,this._seek(Math.max(this.rangeStart-this._countInSec,e)),this.btnPause.textContent="Pause"}restart(){this.chart&&(this._pausedAt=null,this._beginPlay())}exit(){var e;this.stop(),(e=this.onExit)==null||e.call(this)}stop(){var e;this._state="idle",(e=this._synth)==null||e.stopAll(),this._hideOverlay(),document.removeEventListener("keydown",this._onKey),this._raf&&cancelAnimationFrame(this._raf),this._raf=null}_handleKey(e){e.target&&(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA")||(e.code==="Space"?(e.preventDefault(),this._state==="playing"?this.pause():this._state==="paused"&&this.resume()):e.key==="Escape"?this._state==="playing"?this.pause():this.exit():(e.key==="r"||e.key==="R")&&this.restart())}update(e){this._freq=e,this._freqTime=performance.now(),this._state==="tuning"?this._updateTuning(e):this._state==="playing"&&this._judge(e)}_evalSec(){return this.songSec-this.settings.latencyMs/1e3*this.speed}_visible(e){const s=this.phrases[e.phrase].level??this._levelFor(e.phrase);return e.minLevel<=s}_judge(e){const t=this._evalSec(),s=gn*this.speed,n=yt*this.speed,i=this.settings.tolerance;let a=null;e&&(a=69+12*Math.log2(e/440));for(const c of this.notes){if(c.state!=="pending"||c.sec<this.rangeStart-1e-6||c.sec>=this.rangeEnd-1e-6)continue;if(c.sec-s>t)break;if(!this._visible(c))continue;const r=c.sec+Math.max(Math.min(c.durSec,.6*this.speed),.12*this.speed)+n;if(t>r){this._registerMiss(c);continue}if(a==null)continue;const h=(a-c.midi)*100;if(Math.abs(h)<=i){c.firstMatch==null&&(c.firstMatch=t),c.frames++,c.cents=c.cents==null?h:c.cents*.6+h*.4;const l=c.durSec/this.speed<.18?1:2;c.frames>=l&&this._registerHit(c);break}}for(const c of this.notes)if(c.state==="hit"&&!(c.sec+c.durSec<t)){if(c.sec-s>t)break;c.holding=a!=null&&Math.abs((a-c.midi)*100)<=i}this._evaluatePhrases(t)}_registerHit(e){e.state="hit";const t=(e.firstMatch-e.sec)/this.speed,s=Math.abs(t)<.08&&Math.abs(e.cents??0)<20;e.grade=s?"perfect":"good",this.hits++,s&&this.perfects++,this.streak++,this.consecMiss=0,this.bestStreak=Math.max(this.bestStreak,this.streak),this.multiplier=Math.min(4,1+Math.floor(this.streak/10)),this.score+=(s?150:100)*this.multiplier;const n=this.phrases[e.phrase];n.hits++,n.total++;const i=this._notePos(e,0);this._burst(i.x,i.y,this._colorOf(e.string),s?22:12);let a=s?"Perfect":t<0?"Early":"Late";!s&&Math.abs(e.cents??0)>=20&&Math.abs(t)<.08&&(a=e.cents>0?"Sharp":"Flat"),this._popup(i.x,i.y-30,a,s?"#7dffb0":"#ffe27a"),this.streak>0&&this.streak%25===0&&this._popup(this._w/2,this._h*.3,`${this.streak} note streak!`,"#ffffff",1.6)}_registerMiss(e){e.state="miss",this.misses++,this.streak=0,this.multiplier=1,this.consecMiss++;const t=this.phrases[e.phrase];t.total++;const s=this._notePos(e,0);this._popup(s.x,s.y-30,"Miss","#ff6b6b"),this.opts.mode==="score"&&this.consecMiss>=3&&(this.consecMiss=0,this.strikes++,this._popup(this._w/2,this._h*.35,`STRIKE ${this.strikes}`,"#ff4d4d",2),this.strikes>=ge[this.opts.difficulty].strikes&&(this.failed=!0,this._finish()))}_evaluatePhrases(e){const t=this.opts.mode;for(let s=0;s<this.phrases.length;s++){const n=this.phrases[s];if(n.level==null&&n.sec-Xe*this.speed<=this.songSec&&(n.level=this._levelFor(s),n.faded=this._isMasterFade(s)),n.evaluated||e<n.endSec+yt*this.speed+.05)continue;if(n.sec<this.rangeStart-1e-6||n.endSec>this.rangeEnd+1e-6){n.evaluated=!0;continue}if(n.evaluated=!0,n.total===0)continue;const i=n.hits/n.total;if(n.acc=i,t==="learn"||t==="riff"&&this.opts.riff.level==="dynamic"){const a=he(n),c=this._levelByKey[a];i>=.85&&c<q?(this._levelByKey[a]=c+1,this._popup(this._w/2,this._h*.22,"LEVEL UP","#8ad4ff",1.8)):i>=.9&&c===q?this.progress.phraseMastered[a]?n.faded&&(this.progress.phraseMasterCleared=this.progress.phraseMasterCleared||{},this.progress.phraseMasterCleared[a]=!0):(this.progress.phraseMastered[a]=!0,this._popup(this._w/2,this._h*.22,"PHRASE MASTERED","#c58bff",2)):i<.4&&c>0&&(this._levelByKey[a]=c-1,this._popup(this._w/2,this._h*.22,"Level down","#ffb36b",1.4))}}}_schedule(){var r;if(!this._synth||!this._clockIsCtx()||this._state!=="playing")return;const e=.3*this.speed,t=this._scheduledUntil,s=this.songSec+e;if(s<=t)return;const n=h=>this._anchorClock+(h-this._anchorSong)/this.speed,i=this._now(),a=this._clickSec;for(;this._nextBeat*a<s;){const h=this._nextBeat*a;if(h>=t-1e-6&&h<=this.rangeEnd+1e-6){const l=h<this.rangeStart-1e-6;if(this.settings.click||l){const d=l?!1:this._barStartSecs.has(Math.round(h*1e3)),p=n(h);p>=i-.01&&this._synth.click(p,d,l&&!this.settings.click?this.settings.clickVolume:null)}}this._nextBeat++}for(const h of this.notes){if(h.sec<t||h.sec>=s||h.sec<this.rangeStart-1e-6||h.sec>=this.rangeEnd-1e-6||!this._visible(h))continue;const l=n(h.sec);l>=i-.01&&this._synth.note(h.midi,l,h.durSec/this.speed)}const c=this.chart.chords;if(c.length>0)for(let h=0;h<c.length;h++){const l=c[h],d=l.start*this.beatSec;if(d<t||d>=s||d<this.rangeStart-1e-6||d>=this.rangeEnd-1e-6)continue;const p=(((r=c[h+1])==null?void 0:r.start)??this.chart.totalBeats)*this.beatSec,u=n(d);u>=i-.01&&this._synth.chord(l.symbol,u,Math.min(p,this.rangeEnd)/this.speed-d/this.speed)}else for(const h of this.chart.bars){const l=h.start*this.beatSec;if(l<t||l>=s||l<this.rangeStart-1e-6||l>=this.rangeEnd-1e-6)continue;const d=n(l);d>=i-.01&&this._synth.drone(this.chart.key.tonicPc,d,h.dur*this.beatSec/this.speed)}this._scheduledUntil=s}_loop(){this._raf&&cancelAnimationFrame(this._raf);const e=()=>{this._raf=requestAnimationFrame(e),this._state==="playing"&&(performance.now()-this._freqTime>100&&this._judge(null),this._schedule(),this._checkEnd()),this._render(),this._renderTimeline(),this._updateHud()};e()}_checkEnd(){const e=this.songSec;if(this.opts.mode==="riff"){e>=this.rangeEnd+.4*this.speed&&this._riffLoop();return}e>=this.endSec+1.2*this.speed&&this._finish()}_riffLoop(){const e=this.opts.riff;let t=0,s=0;for(const i of this.notes)i.sec<this.rangeStart-1e-6||i.sec>=this.rangeEnd-1e-6||(i.state==="hit"&&s++,(i.state==="hit"||i.state==="miss")&&t++);const n=t?s/t:0;if(this.loopCount++,this.loopStats.push({acc:n,speed:this.speed}),e.trainer&&n>=.9&&this.speed<1){const i=Math.min(1,Math.round((this.speed+.05)*100)/100);this.speed=i,this.speedInput.value=String(Math.round(i*100)),this.speedVal.textContent=`${Math.round(i*100)}%`,this._popup(this._w/2,this._h*.25,`Speed up → ${Math.round(i*100)}%`,"#8ad4ff",1.8)}this._popup(this._w/2,this._h*.4,`Loop ${this.loopCount}: ${Math.round(n*100)}%`,"#ffffff",1.6);for(const i of this.notes)i.sec<this.rangeStart-1e-6||i.sec>=this.rangeEnd-1e-6||(i.state="pending",i.frames=0,i.firstMatch=null,i.cents=null);for(const i of this.phrases)i.evaluated=!1,i.hits=0,i.total=0,i.level=null;this._saveDynamicLevels(),this._seek(this.rangeStart-2*this.beatSec)}_saveDynamicLevels(){(this.opts.mode==="learn"||this.opts.mode==="riff"&&this.opts.riff.level==="dynamic")&&(this.progress.phraseLevels={...this.progress.phraseLevels,...this._levelByKey},this._recomputeMastery(),Bt(this.song.id,this.progress))}_recomputeMastery(){var s;const e=Object.keys(this._levelByKey);if(e.length===0)return;let t=0;for(const n of e){let a=(this._levelByKey[n]??0)/q*100;this.progress.phraseMastered[n]&&(a=100),(s=this.progress.phraseMasterCleared)!=null&&s[n]&&(a=110),t+=a}this.progress.mastery=Math.round(t/e.length)}_finish(){var a;if(this._state==="results")return;this._pausedAt=this.songSec,this._state="results",this.btnPause.disabled=!0,(a=this._synth)==null||a.stopAll();const e=this.hits+this.misses,t=e?this.hits/e:0,s=this.progress;s.plays=(s.plays||0)+1,s.lastPlayed=Date.now(),s.bestAccuracy=Math.max(s.bestAccuracy||0,Math.round(t*100)),s.bestStreak=Math.max(s.bestStreak||0,this.bestStreak);let n=null,i=!1;if(this.opts.mode==="score"){const c=this.opts.difficulty;this.failed||(n=t>=.98?"platinum":t>=.9?"gold":t>=.75?"silver":t>=.5?"bronze":null),(s.bestScore[c]||0)<this.score&&(s.bestScore[c]=this.score,i=!0);const r={bronze:1,silver:2,gold:3,platinum:4};n&&r[n]>(r[s.medal[c]]||0)&&(s.medal[c]=n)}this.opts.mode==="learn"&&(this.progress.phraseLevels={...this.progress.phraseLevels,...this._levelByKey},this._recomputeMastery()),Bt(this.song.id,s),this._showResults({acc:t,medal:n,newBest:i})}_colorOf(e){var t;return Dn((t=this.preset)==null?void 0:t.strings[e],e)}_geometry(){const e=this._w,t=this._h,s=this.preset?this.preset.strings.length:4,n=t<360,i=t*(n?.56:.6),a=t*.86,c=(a-i)/Math.max(1,s-1||1),r=a+c*.55,h={x:e/2,y:t*.04},l=e<520?7:9,d=Math.max(26,e*.08),p=(e-d-Math.max(12,e*.08))/l,u=(1/.1-1)/(Xe*this.speed);return{W:e,H:t,nStr:s,nearTop:i,nearBottom:a,rowH:c,floorY:r,vp:h,span:l,left:d,colW:p,k:u}}_project(e,t,s,n){const i=1/(1+Math.max(-.4/n.k,s)*n.k);return{x:n.vp.x+(e-n.vp.x)*i,y:n.vp.y+(t-n.vp.y)*i,f:i}}_rowY(e,t){return t.nearTop+e*t.rowH}_colX(e,t){return t.left+(e-this._cam+.5)*t.colW}_notePos(e,t){const s=this._geometry();return this._project(this._colX(e.offset,s),this._rowY(e.string,s),t,s)}_render(){const e=this.canvas.getContext("2d");if(!e||!this._w)return;const t=this._dpr||1;e.setTransform(t,0,0,t,0,0);const s=this._geometry(),{W:n,H:i}=s,a=e.createLinearGradient(0,0,0,i);if(a.addColorStop(0,"#05070d"),a.addColorStop(.6,"#0b1222"),a.addColorStop(1,"#101a30"),e.fillStyle=a,e.fillRect(0,0,n,i),!this.chart)return;const c=this.songSec,r=this._state==="playing"?this._evalSec():c,h=Xe*this.speed;let l=1/0,d=-1/0,p=null;for(const f of this.notes)if(!(f.sec+f.durSec<c-.2)){if(f.sec>c+h*.8)break;this._visible(f)&&(p===null&&f.offset>0&&(p=f.base),f.offset>0&&(l=Math.min(l,f.offset),d=Math.max(d,f.offset)))}let u=this._cam;l!==1/0&&(l-1<this._cam&&(u=Math.max(0,l-1)),d+1>this._cam+s.span&&(u=Math.max(0,d+1-s.span)),d<=s.span-1&&(u=0)),this._cam+=(u-this._cam)*.08,this._anchorBase=p??this._anchorBase??0;const A=f=>f-c,g=Math.floor(this._cam),D=Math.ceil(this._cam+s.span),C=this._project(this._colX(g-.5,s),s.floorY,0,s),T=this._project(this._colX(D+.5,s),s.floorY,0,s),I=this._project(this._colX(g-.5,s),s.floorY,h,s),z=this._project(this._colX(D+.5,s),s.floorY,h,s),E=e.createLinearGradient(0,I.y,0,C.y);E.addColorStop(0,"rgba(30,45,80,0)"),E.addColorStop(1,"rgba(40,60,110,0.55)"),e.fillStyle=E,e.beginPath(),e.moveTo(C.x,C.y),e.lineTo(T.x,T.y),e.lineTo(z.x,z.y),e.lineTo(I.x,I.y),e.closePath(),e.fill();const B=this._anchorBase;{const f=this._project(this._colX(B+.5,s),s.floorY,0,s),_=this._project(this._colX(B+8.5,s),s.floorY,0,s),y=this._project(this._colX(B+8.5,s),s.floorY,h*.6,s),x=this._project(this._colX(B+.5,s),s.floorY,h*.6,s),Q=e.createLinearGradient(0,x.y,0,f.y);Q.addColorStop(0,"rgba(140,90,255,0)"),Q.addColorStop(1,"rgba(140,90,255,0.28)"),e.fillStyle=Q,e.beginPath(),e.moveTo(f.x,f.y),e.lineTo(_.x,_.y),e.lineTo(y.x,y.y),e.lineTo(x.x,x.y),e.closePath(),e.fill()}for(let f=g;f<=D+1;f++){const _=this._project(this._colX(f-.5,s),s.floorY,0,s),y=this._project(this._colX(f-.5,s),s.floorY,h,s),x=f-B===2||f-B===4||f-B===5||f-B===7;e.strokeStyle=x?"rgba(180,200,255,0.22)":"rgba(120,140,190,0.12)",e.lineWidth=1,e.beginPath(),e.moveTo(_.x,_.y),e.lineTo(y.x,y.y),e.stroke()}const v=Math.floor(c/this.beatSec),G=Math.ceil((c+h)/this.beatSec),X=this.chart.bars,M=new Set(X.map(f=>Math.round(f.start*1e3)));for(let f=v;f<=G;f++){const _=f*this.beatSec,y=A(_);if(y<-.05||y>h)continue;const x=M.has(Math.round(f*1e3)),Q=this._project(this._colX(g-.5,s),s.floorY,y,s),$=this._project(this._colX(D+.5,s),s.floorY,y,s);e.strokeStyle=x?"rgba(200,215,255,0.35)":"rgba(160,180,230,0.12)",e.lineWidth=x?2*Q.f+.5:1,e.beginPath(),e.moveTo(Q.x,Q.y),e.lineTo($.x,$.y),e.stroke()}e.textAlign="left";for(const f of this.phrases){const _=A(f.sec);if(_<0||_>h)continue;const y=this._project(this._colX(D+.6,s),s.floorY,_,s);e.fillStyle="rgba(200,215,255,0.6)",e.font=`600 ${Math.max(9,14*y.f)}px system-ui, sans-serif`,e.fillText(f.name,Math.min(n-60,y.x+4),y.y-4)}const b=s.nStr;for(let f=0;f<b;f++){const _=this._rowY(f,s),y=this._project(this._colX(g-.5,s),_,0,s),x=this._project(this._colX(D+.5,s),_,0,s);e.strokeStyle=this._colorOf(f),e.globalAlpha=.85,e.lineWidth=2.5+(b-f)*.5,e.beginPath(),e.moveTo(y.x,_),e.lineTo(x.x,_),e.stroke(),e.globalAlpha=1,e.fillStyle=this._colorOf(f),e.font="700 13px system-ui, sans-serif",e.textAlign="left",e.fillText(this.preset.strings[f].name,6,_+4)}e.textAlign="center",e.font="600 11px system-ui, sans-serif";for(let f=Math.max(0,g);f<=D;f++){const _=this._colX(f,s),y=f-B;e.fillStyle=y>=1&&y<=8?"rgba(200,180,255,0.85)":"rgba(150,165,200,0.45)",e.fillText(String(f),_,s.floorY+14)}e.fillStyle="rgba(200,180,255,0.85)",e.font="600 11px system-ui, sans-serif",e.textAlign="left",e.fillText(`${Ns(this._positionOfBase(B))} position`,10,38);const k=[];for(const f of this.notes)if(!(f.sec+f.durSec<c-.4*this.speed)){if(f.sec>c+h)break;f.sec<this.rangeStart-1e-6||f.sec>=this.rangeEnd-1e-6||this._visible(f)&&k.push(f)}for(let f=k.length-1;f>=0;f--)this._drawNote(e,k[f],c,s,h);if(this._drawPitchCursor(e,s,r),this._drawFx(e),this._state==="playing"&&c<this.rangeStart){const f=Math.ceil((this.rangeStart-c)/this._clickSec-1e-6);f>0&&(e.fillStyle="rgba(255,255,255,0.9)",e.font=`800 ${Math.min(96,i*.22)}px system-ui, sans-serif`,e.textAlign="center",e.fillText(String(f),n/2,i*.4))}const K=this.phrases.find(f=>c>=f.sec&&c<f.endSec);if(e.textAlign="left",e.fillStyle="rgba(220,230,255,0.8)",e.font="600 13px system-ui, sans-serif",K){const f=K.level??this._levelFor(this.phrases.indexOf(K)),_=this.opts.mode==="learn"||this.opts.mode==="riff"&&this.opts.riff.level==="dynamic"?` · Level ${f}/${q}`:"";e.fillText(`${K.name}${_}${K.faded?" · MASTER MODE":""}`,10,20)}e.textAlign="right",e.fillText(`${_t(Math.max(0,c)/this.speed)} / ${_t(this.endSec/this.speed)}`,n-10,20)}_positionOfBase(e){const t=[1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10];return t[Math.max(0,Math.min(t.length-1,Math.round(e)))]}_drawNote(e,t,s,n,i){const a=t.sec-s,c=t.sec+t.durSec-s,r=this._colorOf(t.string),h=this._rowY(t.string,n),l=t.offset===0,d=Math.floor(this._cam),p=Math.ceil(this._cam+n.span);let u=1;if(this.phrases[t.phrase].faded&&(u=Math.max(0,Math.min(1,(a/i-.35)/.25))),t.state==="miss"&&(u*=.35),u<=.01&&t.state!=="hit")return;if(e.save(),e.globalAlpha=u,t.durSec>.3*this.beatSec*2||t.durSec/this.speed>.35){const E=Math.max(0,a),B=Math.min(i,c);if(B>E){const v=l?null:this._colX(t.offset,n),G=l?null:n.colW*.22,X=l?null:this._project(v-G,h,E,n),M=l?null:this._project(v+G,h,E,n),b=l?null:this._project(v+G,h,B,n),k=l?null:this._project(v-G,h,B,n);if(e.fillStyle=r,e.globalAlpha=u*(t.state==="hit"?t.holding?.85:.45:.4),!l)e.beginPath(),e.moveTo(X.x,X.y),e.lineTo(M.x,M.y),e.lineTo(b.x,b.y),e.lineTo(k.x,k.y),e.closePath(),e.fill();else{const K=this._project(this._colX(d,n),h,E,n),f=this._project(this._colX(p,n),h,E,n),_=this._project(this._colX(d,n),h,B,n),y=this._project(this._colX(p,n),h,B,n);e.globalAlpha=u*.18,e.beginPath(),e.moveTo(K.x,K.y),e.lineTo(f.x,f.y),e.lineTo(y.x,y.y),e.lineTo(_.x,_.y),e.closePath(),e.fill()}e.globalAlpha=u}}if(t.state==="hit"){e.restore();return}a<-.02&&t.state;const g=Math.max(0,a);if(l){const E=this._project(this._colX(d+.1,n),h,g,n),B=this._project(this._colX(p-.1,n),h,g,n),v=n.rowH*.32*E.f+3;if(e.fillStyle=r,e.globalAlpha=u*.85,this._roundRect(e,E.x,E.y-v/2,B.x-E.x,v,v/2),e.fill(),e.globalAlpha=u,e.fillStyle="#0b1222",e.font=`800 ${Math.max(9,18*E.f)}px system-ui, sans-serif`,e.textAlign="center",e.fillText("0",(E.x+B.x)/2,E.y+6*E.f),this.settings.showNoteNames&&E.f>.35){const G=ve(t.midi);e.fillStyle="rgba(255,255,255,0.85)",e.font=`600 ${Math.max(8,12*E.f)}px system-ui, sans-serif`,e.fillText(`${G.name}${G.octave}`,(E.x+B.x)/2+40*E.f,E.y-v)}e.restore();return}const D=this._project(this._colX(t.offset,n),h,g,n),C=this._project(this._colX(t.offset,n),n.floorY,g,n),T=n.colW*.78*D.f,I=Math.min(n.rowH*.8,n.colW*.6)*D.f+4;e.strokeStyle=r,e.globalAlpha=u*.35,e.lineWidth=Math.max(1,3*D.f),e.beginPath(),e.moveTo(D.x,D.y),e.lineTo(C.x,C.y),e.stroke(),e.fillStyle=r,e.globalAlpha=u*.25,e.beginPath(),e.ellipse(C.x,C.y,T*.45,3*D.f+1,0,0,Math.PI*2),e.fill(),e.globalAlpha=u;const z=e.createLinearGradient(0,D.y-I/2,0,D.y+I/2);if(z.addColorStop(0,"#ffffff"),z.addColorStop(.25,r),z.addColorStop(1,r),e.fillStyle=z,this._roundRect(e,D.x-T/2,D.y-I/2,T,I,Math.min(8,I/3)),e.fill(),e.strokeStyle=t.state==="miss"?"#ff4d4d":"rgba(255,255,255,0.9)",e.lineWidth=Math.max(1,2*D.f),e.stroke(),e.fillStyle="#0b1222",e.font=`800 ${Math.max(9,I*.62)}px system-ui, sans-serif`,e.textAlign="center",e.fillText(String(t.finger),D.x,D.y+I*.22),this.settings.showNoteNames&&D.f>.3){const E=ve(t.midi);e.fillStyle="rgba(255,255,255,0.9)",e.font=`600 ${Math.max(8,12*D.f)}px system-ui, sans-serif`,e.fillText(`${E.name}${E.octave}`,D.x,D.y-I/2-4*D.f)}e.restore()}_drawPitchCursor(e,t,s){if(!(this._freq&&performance.now()-this._freqTime<150))return;const i=69+12*Math.log2(this._freq/440);let a=null;for(const u of this.notes)if(!(u.state!=="pending"||!this._visible(u))&&!(u.sec+u.durSec<s-.2)){a=u;break}let c;if(a&&Math.abs(a.sec-s)<1.2*this.speed)c=a.string;else{c=0;const u=this.chart.openMidis;for(let A=u.length-1;A>=0;A--)if(i>=u[A]-.5){c=A;break}}const r=i-this.chart.openMidis[c];if(r<-1||r>20)return;const h=this._colX(r,t),l=this._rowY(c,t);let d="#9fb4ff",p="";if(a&&a.string===c){const u=(i-a.midi)*100;Math.abs(u)<=this.settings.tolerance?d="#5dff9e":d="#ffb347",Math.abs(u)<150&&(p=`${u>0?"+":""}${Math.round(u)}¢`)}e.save(),e.shadowColor=d,e.shadowBlur=16,e.strokeStyle=d,e.lineWidth=3,e.beginPath(),e.arc(h,l,11,0,Math.PI*2),e.stroke(),e.restore(),p&&(e.fillStyle=d,e.font="700 11px system-ui, sans-serif",e.textAlign="center",e.fillText(p,h,l+26))}_roundRect(e,t,s,n,i,a){e.beginPath(),e.moveTo(t+a,s),e.arcTo(t+n,s,t+n,s+i,a),e.arcTo(t+n,s+i,t,s+i,a),e.arcTo(t,s+i,t,s,a),e.arcTo(t,s,t+n,s,a),e.closePath()}_burst(e,t,s,n){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,c=1.5+Math.random()*4;this._particles.push({x:e,y:t,vx:Math.cos(a)*c,vy:Math.sin(a)*c-2,life:1,color:s})}}_popup(e,t,s,n,i=1){this._popups.push({x:e,y:t,text:s,color:n,life:1,scale:i})}_drawFx(e){for(const t of this._particles)t.x+=t.vx,t.y+=t.vy,t.vy+=.15,t.life-=.03,e.globalAlpha=Math.max(0,t.life),e.fillStyle=t.color,e.fillRect(t.x-2,t.y-2,4,4);this._particles=this._particles.filter(t=>t.life>0),e.textAlign="center";for(const t of this._popups)t.y-=.6,t.life-=.018,e.globalAlpha=Math.max(0,Math.min(1,t.life*1.5)),e.fillStyle=t.color,e.font=`800 ${Math.round(15*t.scale)}px system-ui, sans-serif`,e.fillText(t.text,t.x,t.y);this._popups=this._popups.filter(t=>t.life>0).slice(-14),e.globalAlpha=1}_renderTimeline(){const e=this.timeline,t=e.getContext("2d");if(!t||!this.chart)return;const s=this._dpr||1,n=e.width/s,i=e.height/s;t.setTransform(s,0,0,s,0,0),t.clearRect(0,0,n,i),t.fillStyle="#0b1222",t.fillRect(0,0,n,i);const a=this.endSec||1;for(let r=0;r<this.phrases.length;r++){const h=this.phrases[r],l=h.sec/a*n,d=h.endSec/a*n,p=h.level??this._levelFor(r),u=he(h),A=this.opts.mode==="learn"&&this.progress.phraseMastered[u],g=h.sec>=this.rangeStart-1e-6&&h.endSec<=this.rangeEnd+1e-6,D=.25+.75*(p/q);t.fillStyle=g?A?"#a46bff":h.evaluated&&h.acc!=null?h.acc>=.85?"#36c46f":h.acc>=.5?"#e0b030":"#d4504f":"#3a5a9a":"rgba(80,90,120,0.3)",t.fillRect(l+1,i-i*D,Math.max(1,d-l-2),i*D)}const c=Math.max(0,this.songSec)/a*n;t.fillStyle="#ffffff",t.fillRect(c-1,0,2,i)}_updateHud(){if(!this.chart||this._state==="idle")return;const e=(this.hits||0)+(this.misses||0);this.stScore.v.textContent=(this.score||0).toLocaleString(),this.stMult.v.textContent=`×${this.multiplier||1}`,this.stStreak.v.textContent=String(this.streak||0),this.stAcc.v.textContent=e?`${Math.round(this.hits/e*100)}%`:"—";const t=this.opts.mode==="score"?ge[this.opts.difficulty].strikes:0;this.stStrikes.v.textContent=t?`${"✕".repeat(this.strikes||0)}${"·".repeat(Math.max(0,t-(this.strikes||0)))}`:""}_hideOverlay(){this.overlay.classList.add("hidden"),this.overlay.replaceChildren()}_showOverlay(...e){this.overlay.replaceChildren(...e),this.overlay.classList.remove("hidden")}_showTuningCheck(){this._state="tuning";const e=F("div","sp-card");e.append(F("h3",null,"Tune Up")),e.append(F("p","sp-muted",`Play each open string. This song is arranged for ${this.preset.label}.`));const t=F("div","sp-tune-list");this._tuneRows=this.preset.strings.map((a,c)=>{const r=F("div","sp-tune-row"),h=F("span","sp-tune-name",`${a.name}${a.octave}`);h.style.color=this._colorOf(c);const l=F("div","sp-tune-meter"),d=F("div","sp-tune-needle");l.appendChild(d);const p=F("span","sp-tune-val","—");return r.append(h,l,p),t.appendChild(r),{row:r,needle:d,val:p,freq:a.frequency,okFrames:0,done:!1}}),e.appendChild(t);const s=F("div","sp-card-btns"),n=F("button","sp-btn sp-btn-primary","Start song");n.addEventListener("click",()=>this._beginPlay());const i=F("button","sp-btn","Always skip tuning");i.addEventListener("click",()=>{this.settings.tuningCheck=!1,ye(this.settings),this._beginPlay()}),s.append(n,i),e.appendChild(s),this._showOverlay(e)}_updateTuning(e){if(this._tuneRows){for(const t of this._tuneRows){if(!e)continue;const s=1200*Math.log2(e/t.freq);if(Math.abs(s)>80)continue;const n=Math.max(-50,Math.min(50,s));t.needle.style.left=`${50+n}%`,t.val.textContent=`${s>0?"+":""}${Math.round(s)}¢`,Math.abs(s)<8?t.okFrames++:t.okFrames=Math.max(0,t.okFrames-1),t.okFrames>12&&!t.done&&(t.done=!0,t.row.classList.add("ok"),t.val.textContent="✓ in tune")}this._tuneRows.every(t=>t.done)&&(this._tuneRows=null,setTimeout(()=>{this._state==="tuning"&&this._beginPlay()},600))}}_showPauseMenu(){const e=F("div","sp-card");e.append(F("h3",null,"Paused"));const t=F("div","sp-card-btns sp-card-btns--col"),s=F("button","sp-btn sp-btn-primary","Resume");s.addEventListener("click",()=>this.resume());const n=F("button","sp-btn","Restart");n.addEventListener("click",()=>this.restart());const i=F("button","sp-btn","Riff Repeater this phrase");i.addEventListener("click",()=>{var g;const u=this._pausedAt??0;let A=this.phrases.findIndex(D=>u>=D.sec&&u<D.endSec);A<0&&(A=0),this.stop(),(g=this.onRiffRequest)==null||g.call(this,this.song,A,A)});const a=F("button","sp-btn","Back to library");a.addEventListener("click",()=>this.exit()),t.append(s,n,i,a),e.appendChild(t);const c=F("label","sp-setting");c.append(F("span",null,"Latency offset"));const r=F("input");r.type="range",r.min="0",r.max="300",r.step="10",r.value=String(this.settings.latencyMs);const h=F("span",null,`${this.settings.latencyMs} ms`);r.addEventListener("input",()=>{this.settings.latencyMs=Number(r.value),h.textContent=`${r.value} ms`,ye(this.settings)}),c.append(r,h);const l=F("label","sp-setting");l.append(F("span",null,"Pitch tolerance"));const d=F("input");d.type="range",d.min="10",d.max="60",d.step="5",d.value=String(this.settings.tolerance);const p=F("span",null,`±${this.settings.tolerance}¢`);d.addEventListener("input",()=>{this.settings.tolerance=Number(d.value),p.textContent=`±${d.value}¢`,ye(this.settings)}),l.append(d,p),e.append(c,l),this._showOverlay(e)}_showResults({acc:e,medal:t,newBest:s}){const n=F("div","sp-card sp-results"),i=this.failed?"Song Failed":"Song Complete";n.append(F("h3",null,i)),n.append(F("div","sp-muted",this.title));const a=F("div","sp-res-grid"),c=(u,A)=>{const g=F("div","sp-res-item");g.append(F("div","sp-res-value",A),F("div","sp-res-label",u)),a.appendChild(g)};if(c("Accuracy",`${Math.round(e*100)}%`),c("Notes hit",`${this.hits}/${this.hits+this.misses}`),c("Best streak",String(this.bestStreak)),c("Perfect",String(this.perfects)),this.opts.mode==="score"&&c("Score",this.score.toLocaleString()),this.opts.mode==="learn"&&c("Mastery",`${this.progress.mastery}%`),n.appendChild(a),t){const u=F("div",`sp-medal sp-medal--${t}`,`${t.toUpperCase()} MEDAL`);n.appendChild(u)}s&&n.appendChild(F("div","sp-newbest","New high score!"));const r=F("div","sp-res-phrases");let h=null;this.phrases.forEach((u,A)=>{if(u.total===0)return;const g=u.hits/u.total;(!h||g<h.a)&&(h={i:A,a:g});const D=F("div","sp-res-phrase");D.title=`${u.name}: ${Math.round(g*100)}%`;const C=F("div","sp-res-phrase-fill");C.style.height=`${Math.max(6,g*100)}%`,C.style.background=g>=.85?"#36c46f":g>=.5?"#e0b030":"#d4504f",D.appendChild(C),r.appendChild(D)}),n.appendChild(r);const l=F("div","sp-card-btns"),d=F("button","sp-btn sp-btn-primary","Play again");if(d.addEventListener("click",()=>this.restart()),l.appendChild(d),h&&h.a<.9){const u=F("button","sp-btn",`Practice "${this.phrases[h.i].name}"`);u.addEventListener("click",()=>{var A;this.stop(),(A=this.onRiffRequest)==null||A.call(this,this.song,h.i,h.i)}),l.appendChild(u)}const p=F("button","sp-btn","Library");p.addEventListener("click",()=>this.exit()),l.appendChild(p),n.appendChild(l),this._showOverlay(n)}static noteFreq(e){return ae(e)}}function Se(o){const e=((o==null?void 0:o.label)||"").toLowerCase();return/bluetooth|airpods|buds|hands-?free|\bbt\b|hfp|sco/.test(e)?"bluetooth":/usb|interface|scarlett|focusrite|irig|behringer|presonus|audient|motu|zoom|tascam|roland|boss|steinberg|line in|line-in|instrument|guitar|xlr|ux1|um2|evo|ssl/.test(e)?"usb":/headset|wired|headphone|earphone|earpiece|jack|3\.5|trrs|external/.test(e)?"wired":"builtin"}const Gn={usb:"USB audio",wired:"Wired headset",bluetooth:"Bluetooth (adds latency)",builtin:"Built-in mic"};function En(o,e){let t=o.label||`Input ${e+1}`;return t=t.replace(/^Default\s*[-–]\s*/i,"").replace(/^Communications\s*[-–]\s*/i,""),t}class bn{constructor(e){this.onDeviceChange=null,this.onChannelMode=null,this.onGainChange=null,this.el=document.createElement("div"),this.el.className="ip-root";const t=document.createElement("span");t.className="sb-label",t.textContent="Input",this.el.appendChild(t);const s=document.createElement("div");s.className="sb-dd ip-dd",this.dd=new P(s,{placeholder:"Microphone…",title:"Audio input"}),this.dd.onChange=r=>{var h;return(h=this.onDeviceChange)==null?void 0:h.call(this,r)},this.el.appendChild(s);const n=document.createElement("div");n.className="sb-dd ip-ch",this.ch=new P(n,{placeholder:"Channel",title:"Input channel"}),this.ch.setItems([{value:"mix",label:"Mix (L+R)"},{value:"left",label:"Left / In 1"},{value:"right",label:"Right / In 2"}]),this.ch.value="mix",this.ch.onChange=r=>{var h;return(h=this.onChannelMode)==null?void 0:h.call(this,r)},this.chWrap=n,this.el.appendChild(n);const i=document.createElement("label");i.className="ip-gain",i.title="Input boost (useful for quiet line/USB inputs)";const a=document.createElement("input");a.type="range",a.min="0.25",a.max="4",a.step="0.05",a.value="1",this.gainInput=a;const c=document.createElement("span");c.textContent="×1.0",a.addEventListener("input",()=>{var r;c.textContent=`×${Number(a.value).toFixed(1)}`,(r=this.onGainChange)==null||r.call(this,Number(a.value))}),i.append(a,c),this.el.appendChild(i),this.meter=document.createElement("div"),this.meter.className="ip-meter",this.meterFill=document.createElement("div"),this.meterFill.className="ip-meter-fill",this.meter.appendChild(this.meterFill),this.el.appendChild(this.meter),this.hint=document.createElement("div"),this.hint.className="ip-hint",this.el.appendChild(this.hint),e.appendChild(this.el)}setDevices(e,t){this._inputs=e;const s=e.map((n,i)=>({value:n.deviceId,label:`${En(n,i)}  ·  ${Gn[Se(n)]}`}));this.dd.setItems(s),t&&s.some(n=>n.value===t)&&(this.dd.value=t),this._updateHint(t)}setCurrent(e){this.dd.value=e,this._updateHint(e)}setChannelCount(e){this.chWrap.classList.toggle("hidden",e<2)}setGain(e){this.gainInput.value=String(e),this.gainInput.dispatchEvent(new Event("input"))}_updateHint(e){var n;const t=(n=this._inputs)==null?void 0:n.find(i=>i.deviceId===e),s=t?Se(t):null;this.hint.textContent=s==="bluetooth"?"Bluetooth mics add a lot of delay. Use a wired or USB input for play-along.":s==="usb"?"USB input: pick the channel your instrument is plugged into.":""}updateLevel(e){const t=Math.max(0,Math.min(1,(e+60)/60));this.meterFill.style.width=`${t*100}%`,this.meterFill.classList.toggle("hot",e>-6)}}const w=new Wt,Z=new jt,Fn=new Ut,Cn=document.getElementById("pitch-section"),yn=document.getElementById("tuning-section"),_n=document.getElementById("scale-section"),vn=document.getElementById("trainer-section"),Mn=document.getElementById("metronome-section"),Sn=document.getElementById("fingerboard-section"),Tn=document.getElementById("mixer-section"),wn=new is(Cn),nt=new as(yn),We=new ms(_n),se=new fs(vn),U=new Ds(Mn),le=new rs(Sn),R=new es(Tn);nt.onTuningChange=o=>{le.setTuning(o),Ee.setTuning(o)};const Qt=document.getElementById("song-browser-section"),Pt=document.getElementById("song-player-section"),Ee=new un(Qt),oe=new Bn(Pt,{getCtx:()=>w.ctx});let pe="workstation",Y=null;async function Ln(){try{"wakeLock"in navigator&&!Y&&(Y=await navigator.wakeLock.request("screen"),Y.addEventListener("release",()=>{Y=null}))}catch{}}function kn(){var o;(o=Y==null?void 0:Y.release)==null||o.call(Y),Y=null}function $t(o){Qt.classList.toggle("hidden",o),Pt.classList.toggle("hidden",!o),document.body.classList.toggle("playing-song",o)}const J=new bn(Ee.inputSlot);let W=null,ue=new Set;function ce(){return w.inputs.keys().next().value}function je(o){const e=document.createElement("div");e.className="app-toast",e.textContent=o,document.body.appendChild(e),setTimeout(()=>e.classList.add("show"),10),setTimeout(()=>{e.classList.remove("show"),setTimeout(()=>e.remove(),400)},3200)}function it(o){var e,t,s;return((s=(t=(e=o==null?void 0:o.getAudioTracks)==null?void 0:e.call(o)[0])==null?void 0:t.getSettings)==null?void 0:s.call(t).deviceId)||null}async function Te(o){const e=ce();if(e==null)return!1;try{const t=await Z.getInputStream(o);return w.connectInputStream(e,t),re=!0,W=o||it(t),R.setInputDevice(e,W),J.setCurrent(W),J.setChannelCount(w.getInputChannelCount(e)),Ge(),!0}catch(t){return console.warn("Failed to open input:",t.message),je("Could not open that input"),!1}}J.onDeviceChange=o=>{xe(),Te(o)};J.onChannelMode=o=>{const e=ce();e!=null&&w.setInputChannelMode(e,o)};J.onGainChange=o=>{const e=ce();e!=null&&w.setInputGain(e,o)};async function xn(o){R.updateDevices(o);const e=o.inputs.filter(i=>i.deviceId),t=e.filter(i=>!ue.has(i.deviceId)&&i.deviceId!=="default"),s=ue.size>0;ue=new Set(e.map(i=>i.deviceId)),J.setDevices(e,W);const n=t.find(i=>["usb","wired"].includes(Se(i)));if(s&&n){await Te(n.deviceId)&&je(`Switched input to ${n.label||"external device"}`);return}W&&!ue.has(W)&&await Te(void 0)&&je("Input unplugged, using the default microphone")}Ee.onPlay=(o,e,t)=>{xe(),$t(!0),Ln(),requestAnimationFrame(()=>oe.start(o,e,t))};oe.onExit=()=>{$t(!1),kn(),Ee.updateProgress()};oe.onRiffRequest=(o,e,t)=>{Ee.openRiff(o,e,t)};function Ht(o){if(o!==pe){pe==="songplay"&&oe.active&&oe.pause(),pe=o;for(const e of document.querySelectorAll(".app-tab")){const t=e.dataset.tab===o;e.classList.toggle("active",t),e.setAttribute("aria-selected",String(t))}for(const e of document.querySelectorAll("[data-tab-panel]"))e.classList.toggle("hidden",e.dataset.tabPanel!==o);document.body.classList.toggle("tab-songplay",o==="songplay");try{localStorage.setItem("vaw.activeTab",o)}catch{}}}for(const o of document.querySelectorAll(".app-tab"))o.addEventListener("click",()=>Ht(o.dataset.tab));try{localStorage.getItem("vaw.activeTab")==="songplay"&&Ht("songplay")}catch{}We.onScaleChange=o=>le.setScale(o);se.onStart=()=>{const o=We.scaleKey,e=We.rootPitchClass,t=nt.currentTuning;if(!o)return;const s=gs(t,e,o,{octaves:se.octaves,direction:se.direction});s.length!==0&&(le.clearTrainerState(),se.beginSession(s))};se.onTargetChange=o=>{le.setTrainerTarget(o.stringIndex,o.positionIndex)};se.onHit=o=>{le.markTrainerHit(o.stringIndex,o.positionIndex)};se.onStop=()=>{le.clearTrainerState()};let O=null;U.onStart=()=>{!O&&w.ctx&&(O=new Tt(w.ctx),O.onBeat=o=>{U.flashBeat(o)}),O&&(O.bpm=U.bpm,O.beatsPerMeasure=U.beats,O.start())};U.onStop=()=>{O==null||O.stop()};U.onBpmChange=o=>{O&&(O.bpm=o)};U.onTimeSigChange=o=>{O&&(O.beatsPerMeasure=o)};U.onVolumeChange=o=>{O&&O.setVolume(o)};const at=new Map,ot=new Map;let vt=null,Mt=!1;async function ct(){Mt||(await w.init(),Mt=!0,Nn())}async function rt(o){await ct();const e=w.createInput(),t=R.addInputStrip(e,o);if(at.set(e,new wt(t.meterCanvas)),o)try{const s=await Z.getInputStream(o);w.connectInputStream(e,s)}catch(s){console.warn("Input stream unavailable:",s.message)}return e}function zn(o){w.inputs.size<=1||(w.removeInput(o),R.removeInputStrip(o),at.delete(o))}async function In(o,e){try{const t=await Z.getInputStream(e);w.switchInputDevice(o,t),o===ce()&&(W=e,J.setCurrent(e),J.setChannelCount(w.getInputChannelCount(o)))}catch(t){console.error("Failed to switch input device:",t)}}async function qt(o){try{await ct();const e=await w.addOutput(o);if(e===-1)return;const t=R.addOutputStrip(e,o);return ot.set(e,new wt(t.meterCanvas)),e}catch(e){console.error("Failed to add output:",e)}}function Kn(o){w.outputs.size<=1||(w.removeOutput(o),R.removeOutputStrip(o),ot.delete(o))}async function On(o,e){try{await w.switchOutputDevice(o,e)}catch(t){console.error("Failed to switch output device:",t)}}function Nn(){if(vt)return;let o=0;function e(){const t=pe==="workstation",s=pe==="songplay"&&oe.active;if(t){for(const[n,i]of at){const a=w.getInputLevel(n);i.draw(a.rmsDb,a.peakDb)}for(const[n,i]of ot){const a=w.getOutputLevel(n);i.draw(a.rmsDb,a.peakDb)}}if(pe==="songplay"&&!s&&o%3===0){const n=ce();n!=null&&J.updateLevel(w.getInputLevel(n).rmsDb)}if(o++,s||t&&o%2===0){const{data:n,sampleRate:i}=w.getPitchData(),a=Fn.detect(n,i);t&&(wn.update(a),nt.update(a),le.update(a),se.active&&se.update(a)),s&&oe.update(a)}t&&R.updateLatency(w.getLatency(),w.getBridgeLatency(),w.getLatencyBreakdown()),vt=requestAnimationFrame(e)}e()}R.onAddInput=()=>rt();R.onRemoveInput=o=>zn(o);R.onAddOutput=()=>qt();R.onRemoveOutput=o=>Kn(o);R.onInputDeviceChange=(o,e)=>In(o,e);R.onOutputDeviceChange=(o,e)=>On(o,e);R.onInputGainChange=(o,e)=>w.setInputGain(o,e);R.onOutputGainChange=(o,e)=>w.setOutputGain(o,e);R.onInputMuteToggle=o=>{const e=w.toggleInputMute(o);R.setInputMuted(o,e)};R.onOutputMuteToggle=o=>{const e=w.toggleOutputMute(o);R.setOutputMuted(o,e)};R.onBufferSizeChange=async o=>{const e=O==null?void 0:O._playing;O&&(O.stop(),O=null);const t=await w.reinitWithBufferSize(o);t&&(O=new Tt(t),O.onBeat=s=>{U.flashBeat(s)},e&&(O.bpm=U.bpm,O.beatsPerMeasure=U.beats,O.start()))};var St;const Rn=((St=window.matchMedia)==null?void 0:St.call(window,"(pointer: coarse)").matches)??!1,we=document.getElementById("mic-btn");let re=!1;function xe(){w.ctx&&w.ctx.state!=="running"&&w.ctx.resume().catch(()=>{}),Ge()}for(const o of["pointerdown","touchend","keydown"])window.addEventListener(o,xe,{passive:!0});function Ge(){const o=w.ctx&&w.ctx.state!=="running",e=!re||o;we.classList.toggle("hidden",!e),we.textContent=re?"Tap to start audio":"Enable microphone"}we.addEventListener("click",async()=>{xe(),re||await Vt(),Ge()});async function Vt(){try{const o=await Z.getInputStream();let e=w.inputs.keys().next().value;e==null&&(e=await rt()),w.connectInputStream(e,o),re=!0,W=it(o);try{const t=await Z.enumerate();R.updateDevices(t),ue=new Set(t.inputs.map(s=>s.deviceId).filter(Boolean)),J.setDevices(t.inputs.filter(s=>s.deviceId),W),R.setInputDevice(e,W)}catch{}}catch(o){console.warn("Microphone unavailable:",o.message),we.textContent="Microphone blocked: check permissions"}}async function Xn(){var a,c;await ct();let o={inputs:[],outputs:[]};try{await Z.requestPermission(),o=await Z.enumerate()}catch(r){console.warn("Mic permission denied or unavailable:",r.message);try{o=await Z.enumerate()}catch{}}R.updateDevices(o),Z.listenForChanges(),Z.onDevicesChanged=r=>xn(r),ue=new Set(o.inputs.map(r=>r.deviceId).filter(Boolean));const e=o.inputs.length>0?o.inputs[0].deviceId:void 0,t=o.outputs.length>0?o.outputs[0].deviceId:void 0;await rt(e),re=[...w.inputs.values()].some(r=>r.stream),!re&&o.inputs.length>0&&await Vt();const s=w.inputs.get(ce());W=it(s==null?void 0:s.stream)||e||null;const n=o.inputs.find(r=>["usb","wired"].includes(Se(r)));n&&n.deviceId!==W&&await Te(n.deviceId),J.setDevices(o.inputs.filter(r=>r.deviceId),W),J.setChannelCount(w.getInputChannelCount(ce()));const i=await qt(t);if(Rn&&i!=null&&i!==-1){const r=w.toggleOutputMute(i);R.setOutputMuted(i,r)}Ge(),(c=(a=w.ctx)==null?void 0:a.addEventListener)==null||c.call(a,"statechange",Ge)}Xn();
