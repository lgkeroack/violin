(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const o of a.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function t(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(n){if(n.ep)return;n.ep=!0;const a=t(n);fetch(n.href,a)}})();let Bt=1;class gs{constructor(){this.ctx=null,this.mixBus=null,this.pitchAnalyser=null,this.bridgeNode=null,this.inputs=new Map,this.outputs=new Map}async init(){return this.ctx=new AudioContext({latencyHint:"interactive"}),this.mixBus=this.ctx.createGain(),this.pitchAnalyser=this.ctx.createAnalyser(),this.pitchAnalyser.fftSize=4096,this.pitchAnalyser.smoothingTimeConstant=0,this.mixBus.connect(this.pitchAnalyser),this.bridgeNode=this.ctx.createMediaStreamDestination(),this.mixBus.connect(this.bridgeNode),this.ctx}createInput(){const e=Bt++,t=this.ctx.createGain(),s=this.ctx.createAnalyser();return s.fftSize=2048,s.smoothingTimeConstant=.8,t.connect(s),t.connect(this.mixBus),this.inputs.set(e,{id:e,stream:null,source:null,gain:t,analyser:s,muted:!1,gainValue:1}),e}connectInputStream(e,t){const s=this.inputs.get(e);if(!s)return;s.source&&s.source.disconnect(),s.stream&&s.stream.getTracks().forEach(a=>a.stop());const n=this.ctx.createMediaStreamSource(t);s.source=n,s.stream=t,this._routeSource(s,s.gain)}_routeSource(e,t){if(!e.source)return;try{e.source.disconnect()}catch{}if(e.splitter)try{e.splitter.disconnect()}catch{}e.splitter=null;const s=e.channelMode||"mix";if(s==="left"||s==="right"){const n=this.ctx.createChannelSplitter(2);e.source.connect(n),n.connect(t,s==="left"?0:1),e.splitter=n}else e.source.connect(t)}setInputChannelMode(e,t){const s=this.inputs.get(e);s&&(s.channelMode=t,this._routeSource(s,s.gain))}getInputChannelCount(e){var s,n,a,o;const t=(a=(n=(s=this.inputs.get(e))==null?void 0:s.stream)==null?void 0:n.getAudioTracks)==null?void 0:a.call(n)[0];return((o=t==null?void 0:t.getSettings)==null?void 0:o.call(t).channelCount)||1}removeInput(e){var s,n,a;const t=this.inputs.get(e);t&&((s=t.source)==null||s.disconnect(),(n=t.splitter)==null||n.disconnect(),t.gain.disconnect(),(a=t.stream)==null||a.getTracks().forEach(o=>o.stop()),this.inputs.delete(e))}switchInputDevice(e,t){this.connectInputStream(e,t)}setInputGain(e,t){const s=this.inputs.get(e);s&&(s.gainValue=t,s.muted||s.gain.gain.setTargetAtTime(t,this.ctx.currentTime,.01))}toggleInputMute(e){const t=this.inputs.get(e);if(!t)return!1;t.muted=!t.muted;const s=t.muted?0:t.gainValue;return t.gain.gain.setTargetAtTime(s,this.ctx.currentTime,.01),t.muted}getInputLevel(e){const t=this.inputs.get(e);return t?this._getLevel(t.analyser):{rms:0,peak:0,rmsDb:-100,peakDb:-100}}async addOutput(e){const t=Bt++;if(this.outputs.size===0){this.mixBus.connect(this.ctx.destination),this.ctx.setSinkId&&e&&await this.ctx.setSinkId(e);const n=this.ctx.createAnalyser();n.fftSize=2048,n.smoothingTimeConstant=.8,this.mixBus.connect(n),this.outputs.set(t,{id:t,deviceId:e,primary:!0,ctx:this.ctx,gain:null,analyser:n,outputGain:this.ctx.createGain(),muted:!1,gainValue:1}),this.mixBus.disconnect(this.ctx.destination);const a=this.outputs.get(t).outputGain;this.mixBus.connect(a),a.connect(this.ctx.destination),a.connect(n),this.mixBus.disconnect(n)}else{if(this.outputs.size>=4)return-1;const n=new AudioContext({latencyHint:"interactive"});n.setSinkId&&e&&await n.setSinkId(e);const a=n.createMediaStreamSource(this.bridgeNode.stream),o=n.createGain(),r=n.createAnalyser();r.fftSize=2048,r.smoothingTimeConstant=.8,a.connect(o),o.connect(r),o.connect(n.destination),this.outputs.set(t,{id:t,deviceId:e,primary:!1,ctx:n,bridgeSource:a,gain:o,analyser:r,outputGain:o,muted:!1,gainValue:1})}return t}removeOutput(e){const t=this.outputs.get(e);t&&(t.primary?(t.outputGain.disconnect(),this.mixBus.disconnect(t.outputGain),this.mixBus.disconnect(t.analyser)):(t.bridgeSource.disconnect(),t.outputGain.disconnect(),t.ctx.close()),this.outputs.delete(e))}async switchOutputDevice(e,t){const s=this.outputs.get(e);s&&(s.deviceId=t,s.ctx.setSinkId&&await s.ctx.setSinkId(t))}setOutputGain(e,t){const s=this.outputs.get(e);s&&(s.gainValue=t,s.muted||s.outputGain.gain.setTargetAtTime(t,this.ctx.currentTime,.01))}toggleOutputMute(e){const t=this.outputs.get(e);if(!t)return!1;t.muted=!t.muted;const s=t.muted?0:t.gainValue;return t.outputGain.gain.setTargetAtTime(s,this.ctx.currentTime,.01),t.muted}getOutputLevel(e){const t=this.outputs.get(e);return t?this._getLevel(t.analyser):{rms:0,peak:0,rmsDb:-100,peakDb:-100}}_getLevel(e){const t=new Float32Array(e.fftSize);e.getFloatTimeDomainData(t);let s=0,n=0;for(let c=0;c<t.length;c++){const h=Math.abs(t[c]);s+=t[c]*t[c],h>n&&(n=h)}const a=Math.sqrt(s/t.length),o=a>0?20*Math.log10(a):-100,r=n>0?20*Math.log10(n):-100;return{rms:a,peak:n,rmsDb:o,peakDb:r}}getPitchData(){const e=this.pitchAnalyser.fftSize,t=new Float32Array(e);return this.pitchAnalyser.getFloatTimeDomainData(t),{data:t,sampleRate:this.ctx.sampleRate}}getLatency(){const e=this.ctx.baseLatency||0,t=this.ctx.outputLatency||0;return(e+t)*1e3}getLatencyBreakdown(){const e=(this.ctx.baseLatency||0)*1e3,t=(this.ctx.outputLatency||0)*1e3;return{baseMs:e,outputMs:t}}getBridgeLatency(){var e;return 128/(((e=this.ctx)==null?void 0:e.sampleRate)||48e3)*1e3}async reinitWithBufferSize(e){if(this._reinitInProgress)return this.ctx;this._reinitInProgress=!0;try{return await this._doReinit(e)}finally{this._reinitInProgress=!1}}async _doReinit(e){var a,o,r,c,h;const t=e!=null?e/(((a=this.ctx)==null?void 0:a.sampleRate)||48e3):"interactive",s=[];for(const[d,l]of this.inputs)s.push({id:d,stream:l.stream,gainValue:l.gainValue,muted:l.muted}),l.source&&l.source.disconnect(),l.gain.disconnect(),l.analyser.disconnect();const n=[];for(const[d,l]of this.outputs)n.push({id:d,deviceId:l.deviceId,primary:l.primary,gainValue:l.gainValue,muted:l.muted}),!l.primary&&l.ctx?((o=l.bridgeSource)==null||o.disconnect(),(r=l.outputGain)==null||r.disconnect(),l.ctx.close()):l.primary&&((c=l.outputGain)==null||c.disconnect(),(h=this.mixBus)==null||h.disconnect(l.outputGain));this.outputs.clear(),this.mixBus&&this.mixBus.disconnect(),this.ctx&&await this.ctx.close(),this.ctx=new AudioContext({latencyHint:t}),this.mixBus=this.ctx.createGain(),this.pitchAnalyser=this.ctx.createAnalyser(),this.pitchAnalyser.fftSize=4096,this.pitchAnalyser.smoothingTimeConstant=0,this.mixBus.connect(this.pitchAnalyser),this.bridgeNode=this.ctx.createMediaStreamDestination(),this.mixBus.connect(this.bridgeNode);for(const d of s){const l=this.inputs.get(d.id);if(!l)continue;const u=this.ctx.createGain(),p=this.ctx.createAnalyser();if(p.fftSize=2048,p.smoothingTimeConstant=.8,u.connect(p),u.connect(this.mixBus),l.gain=u,l.analyser=p,l.gainValue=d.gainValue,l.muted=d.muted,d.muted?u.gain.value=0:u.gain.value=d.gainValue,l.stream=d.stream,d.stream&&d.stream.active)try{const A=this.ctx.createMediaStreamSource(d.stream);l.source=A,l.splitter=null,this._routeSource(l,u)}catch(A){console.warn("Failed to reconnect stream after reinit:",A),l.source=null}else l.source=null}for(const d of n)if(d.primary){const l=this.ctx.createGain(),u=this.ctx.createAnalyser();if(u.fftSize=2048,u.smoothingTimeConstant=.8,this.mixBus.connect(l),l.connect(this.ctx.destination),l.connect(u),d.muted?l.gain.value=0:l.gain.value=d.gainValue,this.ctx.setSinkId&&d.deviceId)try{await this.ctx.setSinkId(d.deviceId)}catch{}this.outputs.set(d.id,{id:d.id,deviceId:d.deviceId,primary:!0,ctx:this.ctx,gain:null,analyser:u,outputGain:l,muted:d.muted,gainValue:d.gainValue})}else{const l=new AudioContext({latencyHint:"interactive"});if(l.setSinkId&&d.deviceId)try{await l.setSinkId(d.deviceId)}catch{}const u=l.createMediaStreamSource(this.bridgeNode.stream),p=l.createGain(),A=l.createAnalyser();A.fftSize=2048,A.smoothingTimeConstant=.8,u.connect(p),p.connect(A),p.connect(l.destination),d.muted?p.gain.value=0:p.gain.value=d.gainValue,this.outputs.set(d.id,{id:d.id,deviceId:d.deviceId,primary:!1,ctx:l,bridgeSource:u,gain:p,analyser:A,outputGain:p,muted:d.muted,gainValue:d.gainValue})}return this.ctx}destroy(){for(const[e]of this.inputs)this.removeInput(e);for(const[e,t]of this.outputs)t.primary||t.ctx.close();this.outputs.clear(),this.ctx&&this.ctx.close()}}class Ds{constructor(){this.devices={inputs:[],outputs:[]},this.onDevicesChanged=null}async enumerate(){const e=await navigator.mediaDevices.enumerateDevices();return this.devices.inputs=e.filter(t=>t.kind==="audioinput"),this.devices.outputs=e.filter(t=>t.kind==="audiooutput"),this.devices}listenForChanges(){navigator.mediaDevices.addEventListener("devicechange",async()=>{var e;await this.enumerate(),(e=this.onDevicesChanged)==null||e.call(this,this.devices)})}async requestPermission(){(await navigator.mediaDevices.getUserMedia({audio:!0})).getTracks().forEach(t=>t.stop())}async getInputStream(e){const t={echoCancellation:{ideal:!1},noiseSuppression:{ideal:!1},autoGainControl:{ideal:!1},channelCount:{ideal:2},latency:{ideal:0}};return e&&(t.deviceId={exact:e}),navigator.mediaDevices.getUserMedia({audio:t})}}const Bs=.15;class Es{constructor(){this._yinBuffer=null}detect(e,t){const s=Math.min(Math.floor(e.length/2),Math.ceil(t/50)),n=Math.min(e.length-s,Math.max(1024,s)),a=e.length-n-s,o=s;(!this._yinBuffer||this._yinBuffer.length!==o)&&(this._yinBuffer=new Float32Array(o));const r=this._yinBuffer;let c=0;for(let A=a;A<a+n+s;A++)c+=e[A]*e[A];if(c/(n+s)<1e-7)return null;r[0]=0;for(let A=1;A<o;A++){let D=0;for(let G=0;G<n;G++){const y=e[a+G]-e[a+G+A];D+=y*y}r[A]=D}r[0]=1;let h=0;for(let A=1;A<o;A++)h+=r[A],r[A]*=A/h;let d=-1;for(let A=2;A<o;A++)if(r[A]<Bs){for(;A+1<o&&r[A+1]<r[A];)A++;d=A;break}if(d===-1)return null;const l=d;let u;if(l>0&&l<o-1){const A=r[l-1],D=r[l],G=r[l+1],y=(G-A)/(2*(2*D-G-A));u=l+(isFinite(y)?y:0)}else u=l;const p=t/u;return p<50||p>5e3?null:p}}class Jt{constructor(e){this.ctx=e,this.bpm=120,this.beatsPerMeasure=4,this.volume=.5,this._playing=!1,this._currentBeat=0,this._nextNoteTime=0,this._timerId=null,this._scheduleAheadTime=.1,this._lookaheadMs=25,this._gainNode=this.ctx.createGain(),this._gainNode.gain.value=this.volume,this._gainNode.connect(this.ctx.destination),this.onBeat=null}get playing(){return this._playing}start(){this._playing||(this._playing=!0,this._currentBeat=0,this._nextNoteTime=this.ctx.currentTime,this._schedule(),this._timerId=setInterval(()=>this._schedule(),this._lookaheadMs))}stop(){this._playing&&(this._playing=!1,this._timerId!==null&&(clearInterval(this._timerId),this._timerId=null))}setVolume(e){this.volume=e,this._gainNode.gain.setTargetAtTime(e,this.ctx.currentTime,.01)}_schedule(){for(;this._nextNoteTime<this.ctx.currentTime+this._scheduleAheadTime;)this._scheduleBeat(this._currentBeat,this._nextNoteTime),this._advanceBeat()}_scheduleBeat(e,t){var c;const s=e===0,n=s?1e3:800,a=.06,o=this.ctx.createOscillator();o.type="sine",o.frequency.value=n;const r=this.ctx.createGain();r.gain.setValueAtTime(s?1:.7,t),r.gain.exponentialRampToValueAtTime(.001,t+a),o.connect(r),r.connect(this._gainNode),o.start(t),o.stop(t+a),(c=this.onBeat)==null||c.call(this,e,t)}_advanceBeat(){const e=60/this.bpm;this._nextNoteTime+=e,this._currentBeat=(this._currentBeat+1)%this.beatsPerMeasure}destroy(){this.stop(),this._gainNode.disconnect()}}class Q{constructor(e,t={}){this.onChange=null,this._value="",this._items=[],this._groups=[],this._isGrouped=!1,this._open=!1,this.el=document.createElement("div"),this.el.className="dropdown",t.title&&(this.el.title=t.title),this._trigger=document.createElement("button"),this._trigger.type="button",this._trigger.className="dropdown-trigger",this._trigger.setAttribute("aria-haspopup","listbox"),this._trigger.setAttribute("aria-expanded","false"),this._triggerText=document.createElement("span"),this._triggerText.className="dropdown-trigger-text",this._triggerText.textContent=t.placeholder||"Select...",this._trigger.appendChild(this._triggerText);const s=document.createElement("span");s.className="dropdown-arrow",this._trigger.appendChild(s),this.el.appendChild(this._trigger),this._listbox=document.createElement("div"),this._listbox.className="dropdown-listbox",this._listbox.setAttribute("role","listbox"),this.el.appendChild(this._listbox),this._trigger.addEventListener("click",n=>{n.stopPropagation(),this._toggle()}),this._trigger.addEventListener("keydown",n=>this._onKeydown(n)),this._listbox.addEventListener("keydown",n=>this._onKeydown(n)),this._outsideClickHandler=n=>{this.el.contains(n.target)||this.close()},e.appendChild(this.el)}get value(){return this._value}set value(e){this._value=e,this._updateDisplay(),this._updateSelection()}setItems(e){this._items=e,this._groups=[],this._isGrouped=!1,this._renderItems(),this._updateDisplay()}setGroupedItems(e){this._groups=e,this._items=[],this._isGrouped=!0,this._renderGrouped(),this._updateDisplay()}_hasOptions(){return this._isGrouped?this._groups.some(e=>e.items.length>0):this._items.length>0}_renderEmpty(){const e=document.createElement("div");e.className="dropdown-empty",e.textContent="No options available",this._listbox.appendChild(e)}_renderItems(){if(this._listbox.replaceChildren(),!this._items.length){this._renderEmpty();return}for(const e of this._items)this._listbox.appendChild(this._createOption(e))}_renderGrouped(){if(this._listbox.replaceChildren(),!this._groups.some(e=>e.items.length>0)){this._renderEmpty();return}for(const e of this._groups){const t=document.createElement("div");t.className="dropdown-group";const s=document.createElement("div");s.className="dropdown-group-label",s.textContent=e.label,t.appendChild(s);for(const n of e.items)t.appendChild(this._createOption(n));this._listbox.appendChild(t)}}_createOption(e){const t=document.createElement("div");t.className="dropdown-option",t.setAttribute("role","option"),t.dataset.value=e.value,e.value===this._value&&t.classList.add("selected");const s=document.createElement("span");s.className="dropdown-check",s.textContent="✓",t.appendChild(s);const n=document.createElement("span");return n.className="dropdown-option-text",n.textContent=e.label,t.appendChild(n),t.addEventListener("click",a=>{a.stopPropagation(),this._select(e.value),this.close()}),t}_select(e){var t;e!==this._value&&(this._value=e,this._updateDisplay(),this._updateSelection(),(t=this.onChange)==null||t.call(this,e))}_updateDisplay(){const t=(this._isGrouped?this._groups.flatMap(s=>s.items):this._items).find(s=>s.value===this._value);this._triggerText.textContent=t?t.label:this._value||"Select..."}_updateSelection(){const e=this._listbox.querySelectorAll(".dropdown-option");for(const t of e)t.classList.toggle("selected",t.dataset.value===this._value)}_toggle(){this._open?this.close():this.open()}open(){if(this._open)return;this._open=!0,this.el.classList.add("open"),this._trigger.setAttribute("aria-expanded","true"),this._positionListbox(),document.addEventListener("click",this._outsideClickHandler,!0);const e=this._listbox.querySelector(".dropdown-option.selected");e&&e.scrollIntoView({block:"nearest"})}close(){this._open&&(this._open=!1,this.el.classList.remove("open"),this._trigger.setAttribute("aria-expanded","false"),document.removeEventListener("click",this._outsideClickHandler,!0))}_positionListbox(){this._listbox.classList.remove("dropdown-listbox--above");const e=this._trigger.getBoundingClientRect();window.innerHeight-e.bottom<200&&this._listbox.classList.add("dropdown-listbox--above")}_onKeydown(e){switch(e.key){case"Escape":this.close(),this._trigger.focus(),e.preventDefault();break;case"Enter":case" ":this._open||(this.open(),e.preventDefault());break;case"ArrowDown":if(e.preventDefault(),!this._open){this.open();return}this._moveFocus(1);break;case"ArrowUp":if(e.preventDefault(),!this._open){this.open();return}this._moveFocus(-1);break}}_moveFocus(e){const t=[...this._listbox.querySelectorAll(".dropdown-option")];if(!t.length)return;const s=this._listbox.querySelector(".dropdown-option.focused");let n=s?t.indexOf(s)+e:e>0?0:t.length-1;n=Math.max(0,Math.min(t.length-1,n)),s&&s.classList.remove("focused"),t[n].classList.add("focused"),t[n].scrollIntoView({block:"nearest"});const a=t[n].dataset.value;this._select(a)}destroy(){this.close(),this.el.remove()}}class Gs{constructor(e,t,s){this.kind=s,this.onChange=null,this.el=document.createElement("div"),this.el.className="strip-device",this.dropdown=new Q(this.el,{title:`Select ${s} device`,placeholder:s==="input"?"Mic...":"Speaker..."}),this.dropdown.onChange=n=>{var a;(a=this.onChange)==null||a.call(this,n)},e.appendChild(this.el)}update(e){const t=this.kind==="input"?e.inputs:e.outputs,s=this.dropdown.value,n=t.map(a=>({value:a.deviceId,label:bs(a.label,this.kind,a.deviceId)}));this.dropdown.setItems(n),n.some(a=>a.value===s)&&(this.dropdown.value=s)}get value(){return this.dropdown.value}set value(e){this.dropdown.value=e}}function bs(i,e,t){if(!i)return`${e==="input"?"Mic":"Speaker"} ${t.slice(0,6)}`;let s=i;s=s.replace(/^Default\s*[-\u2013]\s*/i,""),s=s.replace(/^Communications\s*[-\u2013]\s*/i,"");const n=s.match(/^(.{6,}?)\s*\([^)]{15,}\)$/);return n&&(s=n[1].trim()),s||i}class Fs{constructor(e){this.container=e,this.onAddInput=null,this.onRemoveInput=null,this.onAddOutput=null,this.onRemoveOutput=null,this.onInputDeviceChange=null,this.onOutputDeviceChange=null,this.onInputGainChange=null,this.onOutputGainChange=null,this.onInputMuteToggle=null,this.onOutputMuteToggle=null,this.onBufferSizeChange=null,this.inputStrips=new Map,this.outputStrips=new Map,this.devices={inputs:[],outputs:[]},this._build()}_build(){this.container.innerHTML="";const e=document.createElement("div");e.className="mixer-panel";const t=document.createElement("div");t.className="mixer-section";const s=document.createElement("div");s.className="section-header";const n=document.createElement("span");n.className="section-title section-title--input",n.textContent="Inputs",s.appendChild(n),this.addInputBtn=document.createElement("button"),this.addInputBtn.className="add-strip-btn",this.addInputBtn.textContent="+ Add Input",this.addInputBtn.addEventListener("click",()=>{var A;return(A=this.onAddInput)==null?void 0:A.call(this)}),s.appendChild(this.addInputBtn),this.inputStripContainer=document.createElement("div"),this.inputStripContainer.className="strip-group",t.appendChild(s),t.appendChild(this.inputStripContainer);const a=document.createElement("div");a.className="routing-visual";const o=document.createElement("div");o.className="routing-line",a.appendChild(o);const r=document.createElement("div");r.className="routing-info";const c=document.createElement("span");c.className="routing-arrow",c.textContent="→",r.appendChild(c),this._latencyWrap=document.createElement("div"),this._latencyWrap.className="latency-wrap",this.latencyEl=document.createElement("span"),this.latencyEl.className="routing-latency",this._latencyWrap.appendChild(this.latencyEl),this._latencyTooltip=document.createElement("div"),this._latencyTooltip.className="latency-tooltip",this._latencyWrap.appendChild(this._latencyTooltip),r.appendChild(this._latencyWrap);const h=document.createElement("span");h.className="routing-arrow",h.textContent="→",r.appendChild(h),a.appendChild(r);const d=document.createElement("div");d.className="routing-line",a.appendChild(d);const l=document.createElement("div");l.className="mixer-section";const u=document.createElement("div");u.className="section-header";const p=document.createElement("span");p.className="section-title section-title--output",p.textContent="Outputs",u.appendChild(p),this.addOutputBtn=document.createElement("button"),this.addOutputBtn.className="add-strip-btn",this.addOutputBtn.textContent="+ Add Output",this.addOutputBtn.addEventListener("click",()=>{var A;return(A=this.onAddOutput)==null?void 0:A.call(this)}),u.appendChild(this.addOutputBtn),this.outputStripContainer=document.createElement("div"),this.outputStripContainer.className="strip-group",l.appendChild(u),l.appendChild(this.outputStripContainer),e.appendChild(t),e.appendChild(a),e.appendChild(l),this.container.appendChild(e),this.container.appendChild(this._buildBufferSizeRow())}_buildBufferSizeRow(){const e=document.createElement("div");e.className="buffer-size-row";const t=document.createElement("span");t.className="buffer-size-label",t.textContent="Buffer Size",e.appendChild(t);const s=document.createElement("div");return s.className="buffer-size-dropdown-wrap",this._bufferDropdown=new Q(s,{placeholder:"Auto"}),this._bufferDropdown.setItems([{value:"",label:"Auto (default)"},{value:"64",label:"64 samples"},{value:"128",label:"128 samples"},{value:"256",label:"256 samples"},{value:"512",label:"512 samples"},{value:"1024",label:"1024 samples"}]),this._bufferDropdown.value="",this._bufferDropdown.onChange=n=>{var o;const a=n?parseInt(n,10):null;this._updateBufferEstimate(a),(o=this.onBufferSizeChange)==null||o.call(this,a)},e.appendChild(s),this._bufferEstimate=document.createElement("span"),this._bufferEstimate.className="buffer-size-estimate",e.appendChild(this._bufferEstimate),e}_updateBufferEstimate(e){if(!e){this._bufferEstimate.textContent="";return}const t=e/48e3*1e3;this._bufferEstimate.textContent=`~${t.toFixed(1)} ms at 48kHz`}addInputStrip(e,t){const s=this._createStrip("IN","input",e);return s.deviceSelector.onChange=n=>{var a;return(a=this.onInputDeviceChange)==null?void 0:a.call(this,e,n)},s.slider.addEventListener("input",()=>{var a;const n=parseFloat(s.slider.value);s.gainLabel.textContent=`${Math.round(n*100)}%`,(a=this.onInputGainChange)==null||a.call(this,e,n)}),s.muteBtn.addEventListener("click",()=>{var n;return(n=this.onInputMuteToggle)==null?void 0:n.call(this,e)}),s.removeBtn.addEventListener("click",()=>{var n;return(n=this.onRemoveInput)==null?void 0:n.call(this,e)}),s.deviceSelector.update(this.devices),t&&(s.deviceSelector.value=t),this.inputStripContainer.appendChild(s.el),this.inputStrips.set(e,s),this._updateRemoveButtons(),s}removeInputStrip(e){const t=this.inputStrips.get(e);t&&(t.el.remove(),this.inputStrips.delete(e),this._updateRemoveButtons())}addOutputStrip(e,t){const s=this._createStrip("OUT","output",e);return s.deviceSelector.onChange=n=>{var a;return(a=this.onOutputDeviceChange)==null?void 0:a.call(this,e,n)},s.slider.addEventListener("input",()=>{var a;const n=parseFloat(s.slider.value);s.gainLabel.textContent=`${Math.round(n*100)}%`,(a=this.onOutputGainChange)==null||a.call(this,e,n)}),s.muteBtn.addEventListener("click",()=>{var n;return(n=this.onOutputMuteToggle)==null?void 0:n.call(this,e)}),s.removeBtn.addEventListener("click",()=>{var n;return(n=this.onRemoveOutput)==null?void 0:n.call(this,e)}),s.deviceSelector.update(this.devices),t&&(s.deviceSelector.value=t),this.outputStripContainer.appendChild(s.el),this.outputStrips.set(e,s),this._updateRemoveButtons(),s}removeOutputStrip(e){const t=this.outputStrips.get(e);t&&(t.el.remove(),this.outputStrips.delete(e),this._updateRemoveButtons())}_createStrip(e,t,s){const n=document.createElement("div");n.className="mixer-strip",n.dataset.channelId=s,n.dataset.kind=t;const a=document.createElement("div");a.className="strip-label",a.textContent=e,n.appendChild(a);const o=new Gs(n,e,t),r=document.createElement("canvas");r.className="meter-canvas",r.width=12,r.height=40,n.appendChild(r);const c=document.createElement("input");c.type="range",c.className="gain-slider",c.min="0",c.max="2",c.step="0.01",c.value="1",n.appendChild(c);const h=document.createElement("div");h.className="gain-value",h.textContent="100%",n.appendChild(h);const d=document.createElement("button");d.className="mute-btn",d.textContent="M",n.appendChild(d);const l=document.createElement("button");return l.className="remove-btn",l.textContent="×",l.title="Remove",n.appendChild(l),{el:n,deviceSelector:o,meterCanvas:r,slider:c,gainLabel:h,muteBtn:d,removeBtn:l}}_updateRemoveButtons(){const e=this.inputStrips.size<=1;for(const s of this.inputStrips.values())s.removeBtn.style.display=e?"none":"";const t=this.outputStrips.size<=1;for(const s of this.outputStrips.values())s.removeBtn.style.display=t?"none":""}setInputMuted(e,t){const s=this.inputStrips.get(e);s&&s.muteBtn.classList.toggle("muted",t)}setInputDevice(e,t){const s=this.inputStrips.get(e);s&&t&&(s.deviceSelector.value=t)}setOutputMuted(e,t){const s=this.outputStrips.get(e);s&&s.muteBtn.classList.toggle("muted",t)}updateDevices(e){this.devices=e;for(const t of this.inputStrips.values())t.deviceSelector.update(e);for(const t of this.outputStrips.values())t.deviceSelector.update(e)}updateLatency(e,t,s){let n=`${e.toFixed(1)} ms`;const a=t!==void 0&&this.outputStrips.size>1;if(a&&(n+=` (+${t.toFixed(1)} ms bridge)`),this.latencyEl.textContent=n,s){let o=`Base latency: ${s.baseMs.toFixed(1)} ms
`;o+=`Output latency: ${s.outputMs.toFixed(1)} ms
`,a&&(o+=`Bridge latency: ${t.toFixed(1)} ms
`);const r=s.baseMs+s.outputMs+(a?t:0);o+=`Total: ${r.toFixed(1)} ms`,this._latencyTooltip.textContent=o}}}const Be=-60,Et=0,Gt=1500,Cs=20;class Yt{constructor(e){this.canvas=e,this.canvasCtx=e.getContext("2d"),this.peakHoldDb=Be,this.peakHoldTime=0,this.lastPeakDb=Be}draw(e,t){const s=performance.now(),n=this.canvasCtx,a=this.canvas.width,o=this.canvas.height;if(t>=this.peakHoldDb)this.peakHoldDb=t,this.peakHoldTime=s;else if(s-this.peakHoldTime>Gt){const p=(s-this.peakHoldTime-Gt)/1e3;this.peakHoldDb=Math.max(t,this.peakHoldDb-Cs*p)}n.fillStyle="#0f0f1a",n.fillRect(0,0,a,o);const c=this._dbToNorm(e)*o,h=o-c,d=n.createLinearGradient(0,o,0,0);d.addColorStop(0,"#00e676"),d.addColorStop(.6,"#00e676"),d.addColorStop(.8,"#ffea00"),d.addColorStop(.95,"#ff1744"),d.addColorStop(1,"#ff1744"),n.fillStyle=d,n.fillRect(2,h,a-4,c);const l=this._dbToNorm(this.peakHoldDb),u=o-l*o;n.fillStyle="#ffffff",n.fillRect(1,u-1,a-2,2),n.fillStyle="rgba(255,255,255,0.15)";for(const p of[-6,-12,-24,-48]){const A=this._dbToNorm(p),D=o-A*o;n.fillRect(0,D,a,1)}}_dbToNorm(e){return(Math.max(Be,Math.min(Et,e))-Be)/(Et-Be)}}const ys=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],it=440,at=69;function Oe(i){return Math.round(12*Math.log2(i/it)+at)}function oe(i){return it*Math.pow(2,(i-at)/12)}function Te(i){const e=ys[i%12],t=Math.floor(i/12)-1;return{name:e,octave:t}}function Zt(i){const e=12*Math.log2(i/it)+at,t=Math.round(e);return(e-t)*100}function vs(i){if(!i||i<20||i>1e4)return null;const e=Oe(i),{name:t,octave:s}=Te(e),n=Zt(i),a=oe(e);return{name:t,octave:s,midi:e,cents:n,frequency:i,expectedFreq:a}}class _s{constructor(e){this.container=e,this._build(),this._lastNote=null}_build(){this.container.innerHTML="";const e=document.createElement("div");e.className="pitch-display";const t=document.createElement("div");t.className="pitch-left",this.noteEl=document.createElement("div"),this.noteEl.className="pitch-note inactive",this.noteEl.innerHTML="&mdash;",t.appendChild(this.noteEl),this.freqEl=document.createElement("div"),this.freqEl.className="pitch-frequency",this.freqEl.textContent="--- Hz",t.appendChild(this.freqEl),e.appendChild(t);const s=document.createElement("div");s.className="cents-gauge";const n=document.createElement("div");n.className="cents-bar-bg";const a=document.createElement("div");a.className="cents-center-line",n.appendChild(a),this.indicator=document.createElement("div"),this.indicator.className="cents-indicator",n.appendChild(this.indicator),s.appendChild(n);const o=document.createElement("div");o.className="cents-labels",o.innerHTML="<span>-50</span><span>0</span><span>+50</span>",s.appendChild(o),this.centsValueEl=document.createElement("div"),this.centsValueEl.className="cents-value",this.centsValueEl.textContent="",s.appendChild(this.centsValueEl),e.appendChild(s),this.container.appendChild(e)}update(e){if(!e){this.noteEl.classList.add("inactive");return}const t=vs(e);if(!t){this.noteEl.classList.add("inactive");return}this.noteEl.classList.remove("inactive"),this.noteEl.innerHTML=`${t.name}<span class="octave">${t.octave}</span>`,this.freqEl.textContent=`${t.frequency.toFixed(1)} Hz`;const s=t.cents,a=50+Math.max(-50,Math.min(50,s))/50*50;this.indicator.style.left=`${a}%`;const o=Math.abs(s);let r;o<5?r="var(--green)":o<15?r="var(--yellow)":r="var(--red)",this.indicator.style.background=r;const c=s>=0?"+":"";this.centsValueEl.textContent=`${c}${s.toFixed(1)} cents`,this.centsValueEl.style.color=r}}const ie=440,L=i=>ie*Math.pow(2,i/12),ee={"violin-standard":{label:"Violin (GDAE)",family:"Violin",strings:[{name:"G",note:"G",octave:3,frequency:L(-14)},{name:"D",note:"D",octave:4,frequency:L(-7)},{name:"A",note:"A",octave:4,frequency:ie},{name:"E",note:"E",octave:5,frequency:L(7)}]},"violin-drop-g":{label:"Violin Drop G (GDGD)",family:"Violin",strings:[{name:"G",note:"G",octave:3,frequency:L(-14)},{name:"D",note:"D",octave:4,frequency:L(-7)},{name:"G",note:"G",octave:4,frequency:L(-2)},{name:"D",note:"D",octave:5,frequency:L(5)}]},"violin-cross":{label:"Violin Cross (AEAE)",family:"Violin",strings:[{name:"A",note:"A",octave:3,frequency:L(-12)},{name:"E",note:"E",octave:4,frequency:L(-5)},{name:"A",note:"A",octave:4,frequency:ie},{name:"E",note:"E",octave:5,frequency:L(7)}]},"5string-violin":{label:"5-String Violin (CGDAE)",family:"Violin",strings:[{name:"C",note:"C",octave:3,frequency:L(-21)},{name:"G",note:"G",octave:3,frequency:L(-14)},{name:"D",note:"D",octave:4,frequency:L(-7)},{name:"A",note:"A",octave:4,frequency:ie},{name:"E",note:"E",octave:5,frequency:L(7)}]},"viola-standard":{label:"Viola (CGDA)",family:"Viola",strings:[{name:"C",note:"C",octave:3,frequency:L(-21)},{name:"G",note:"G",octave:3,frequency:L(-14)},{name:"D",note:"D",octave:4,frequency:L(-7)},{name:"A",note:"A",octave:4,frequency:ie}]},"cello-standard":{label:"Cello (CGDA)",family:"Cello",strings:[{name:"C",note:"C",octave:2,frequency:L(-33)},{name:"G",note:"G",octave:2,frequency:L(-26)},{name:"D",note:"D",octave:3,frequency:L(-19)},{name:"A",note:"A",octave:3,frequency:L(-12)}]},"bass-standard":{label:"Double Bass (EADG)",family:"Double Bass",strings:[{name:"E",note:"E",octave:1,frequency:L(-41)},{name:"A",note:"A",octave:1,frequency:L(-36)},{name:"D",note:"D",octave:2,frequency:L(-31)},{name:"G",note:"G",octave:2,frequency:L(-26)}]},"bass-5string":{label:"5-String Bass (BEADG)",family:"Double Bass",strings:[{name:"B",note:"B",octave:0,frequency:L(-46)},{name:"E",note:"E",octave:1,frequency:L(-41)},{name:"A",note:"A",octave:1,frequency:L(-36)},{name:"D",note:"D",octave:2,frequency:L(-31)},{name:"G",note:"G",octave:2,frequency:L(-26)}]},"fiddle-open-g":{label:"Fiddle Open G (GDGB)",family:"Fiddle",strings:[{name:"G",note:"G",octave:3,frequency:L(-14)},{name:"D",note:"D",octave:4,frequency:L(-7)},{name:"G",note:"G",octave:4,frequency:L(-2)},{name:"B",note:"B",octave:4,frequency:L(2)}]},"fiddle-open-d":{label:"Fiddle Open D (DADF#)",family:"Fiddle",strings:[{name:"D",note:"D",octave:3,frequency:L(-19)},{name:"A",note:"A",octave:3,frequency:L(-12)},{name:"D",note:"D",octave:4,frequency:L(-7)},{name:"F#",note:"F#",octave:4,frequency:L(-3)}]},"fiddle-calico":{label:"Fiddle Calico (AEAC#)",family:"Fiddle",strings:[{name:"A",note:"A",octave:3,frequency:L(-12)},{name:"E",note:"E",octave:4,frequency:L(-5)},{name:"A",note:"A",octave:4,frequency:ie},{name:"C#",note:"C#",octave:5,frequency:L(4)}]},hardingfele:{label:"Hardingfele (ADAE)",family:"Hardanger",strings:[{name:"A",note:"A",octave:3,frequency:L(-12)},{name:"D",note:"D",octave:4,frequency:L(-7)},{name:"A",note:"A",octave:4,frequency:ie},{name:"E",note:"E",octave:5,frequency:L(7)}]},erhu:{label:"Erhu (DA)",family:"Erhu",strings:[{name:"D",note:"D",octave:4,frequency:L(-7)},{name:"A",note:"A",octave:4,frequency:ie}]}},Ge="violin-standard";class Ss{constructor(e){this.container=e,this.currentTuning=Ge,this.currentFrequency=null,this.onTuningChange=null,this._build()}_build(){this.container.innerHTML="";const e=document.createElement("div");e.className="tuning-panel";const t=document.createElement("div");t.className="tuning-header";const s=document.createElement("span");s.className="tuning-label",s.textContent="Tuning",t.appendChild(s);const n=document.createElement("div");n.className="tuning-select-wrap",this.presetDropdown=new Q(n,{placeholder:"Select tuning..."});const a={};for(const[r,c]of Object.entries(ee))a[c.family]||(a[c.family]=[]),a[c.family].push({key:r,preset:c});const o=[];for(const[r,c]of Object.entries(a))o.push({label:r,items:c.map(({key:h,preset:d})=>({value:h,label:d.label}))});this.presetDropdown.setGroupedItems(o),this.presetDropdown.value=Ge,this.presetDropdown.onChange=r=>{this.currentTuning=r,this._renderStrings(),this.onTuningChange&&this.onTuningChange(this.currentTuning)},t.appendChild(n),e.appendChild(t),this.stringsContainer=document.createElement("div"),this.stringsContainer.className="tuning-strings",e.appendChild(this.stringsContainer),this.container.appendChild(e),this._renderStrings()}_renderStrings(){const e=ee[this.currentTuning];if(e){this.stringsContainer.innerHTML="",this.stringEls=[];for(const t of e.strings){const s=document.createElement("div");s.className="tuning-string";const n=document.createElement("div");n.className="tuning-string-note",n.textContent=t.name,s.appendChild(n);const a=document.createElement("div");a.className="tuning-string-octave",a.textContent=t.octave,s.appendChild(a);const o=document.createElement("div");o.className="tuning-string-freq",o.textContent=`${t.frequency.toFixed(1)} Hz`,s.appendChild(o);const r=document.createElement("div");r.className="tuning-string-indicator",s.appendChild(r),this.stringsContainer.appendChild(s),this.stringEls.push({el:s,indicator:r,frequency:t.frequency,note:t.name})}}}update(e){if(this.currentFrequency=e,!ee[this.currentTuning]||!this.stringEls)return;for(const o of this.stringEls)o.el.classList.remove("active","in-tune","close","off"),o.indicator.textContent="";if(!e)return;let s=null,n=1/0;for(const o of this.stringEls){const r=1200*Math.log2(e/o.frequency);Math.abs(r)<Math.abs(n)&&(n=r,s=o)}if(!s||Math.abs(n)>100)return;s.el.classList.add("active");const a=Math.abs(n);a<5?(s.el.classList.add("in-tune"),s.indicator.textContent="✓"):a<15?(s.el.classList.add("close"),s.indicator.textContent=n>0?"↑":"↓"):(s.el.classList.add("off"),s.indicator.textContent=n>0?"↑↑":"↓↓")}}const Ms=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],bt=13;function es(i){const e=12*Math.log2(i/440);return(Math.round(e)%12+12+9)%12}function ws(i){return Ms[es(i)]}class Ts{constructor(e){this.container=e,this.currentTuning=Ge,this.rows=[],this._scaleData=null,this._build(),this.setTuning(Ge)}_build(){this.el=document.createElement("div"),this.el.className="fingerboard",this.container.appendChild(this.el)}setTuning(e){this.currentTuning=e;const t=ee[e];if(t){this.el.innerHTML="",this.rows=[];for(const s of t.strings){const n=document.createElement("div");n.className="fb-string-row";const a=document.createElement("span");a.className="fb-string-label",a.textContent=s.name,n.appendChild(a);const o=[];for(let r=0;r<bt;r++){const c=document.createElement("span");c.className="fb-position",r===0&&c.classList.add("open");const h=s.frequency*Math.pow(2,r/12),d=ws(h),l=es(h);c.title=r===0?`${s.name} (open)`:d,c.setAttribute("data-note",r===0?s.name:d),c.dataset.pitchClass=l,n.appendChild(c),o.push(c)}this.el.appendChild(n),this.rows.push({el:n,positions:o,frequency:s.frequency})}this._applyScaleHighlights()}}setScale(e){this._scaleData=e,this._applyScaleHighlights()}_applyScaleHighlights(){for(const e of this.rows)for(const t of e.positions){if(t.classList.remove("scale-tone","scale-root"),!this._scaleData)continue;const s=parseInt(t.dataset.pitchClass,10);this._scaleData.pitchClasses.has(s)&&(t.classList.add("scale-tone"),s===this._scaleData.root&&t.classList.add("scale-root"))}}update(e){for(const a of this.rows){a.el.classList.remove("bowed");for(const o of a.positions)o.classList.remove("active")}if(!e)return;let t=null,s=-1,n=1/0;for(const a of this.rows){const o=12*Math.log2(e/a.frequency);if(o<-.5||o>12.5)continue;const r=Math.round(o);if(r<0||r>=bt)continue;const c=Math.abs(o-r);c<n&&(n=c,t=a,s=r)}t&&s>=0&&(t.el.classList.add("bowed"),t.positions[s].classList.add("active"))}setTrainerTarget(e,t){for(const s of this.rows)for(const n of s.positions)n.classList.remove("trainer-target");if(e>=0&&e<this.rows.length){const s=this.rows[e].positions[t];s&&s.classList.add("trainer-target")}}markTrainerHit(e,t){if(e<0||e>=this.rows.length)return;const s=this.rows[e].positions[t];s&&(s.classList.remove("trainer-target"),s.classList.add("trainer-hit"),setTimeout(()=>{s.classList.remove("trainer-hit"),s.classList.add("trainer-done")},300))}clearTrainerState(){for(const e of this.rows)for(const t of e.positions)t.classList.remove("trainer-target","trainer-hit","trainer-done")}}const Ls=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],ks=["Violin","Viola","Cello","Double Bass","Fiddle","Hardanger","Erhu"],Ue={major:{label:"Major (Ionian)",intervals:[0,2,4,5,7,9,11],difficulty:1,instruments:["Violin","Viola","Cello","Double Bass","Fiddle","Hardanger","Erhu"]},"natural-minor":{label:"Natural Minor (Aeolian)",intervals:[0,2,3,5,7,8,10],difficulty:1,instruments:["Violin","Viola","Cello","Double Bass","Fiddle","Hardanger","Erhu"]},"major-pentatonic":{label:"Major Pentatonic",intervals:[0,2,4,7,9],difficulty:1,instruments:["Violin","Viola","Cello","Double Bass","Fiddle","Erhu"]},"minor-pentatonic":{label:"Minor Pentatonic",intervals:[0,3,5,7,10],difficulty:1,instruments:["Violin","Viola","Cello","Double Bass","Fiddle","Erhu"]},"harmonic-minor":{label:"Harmonic Minor",intervals:[0,2,3,5,7,8,11],difficulty:2,instruments:["Violin","Viola","Cello","Double Bass","Fiddle","Hardanger","Erhu"]},"melodic-minor":{label:"Melodic Minor",intervals:[0,2,3,5,7,9,11],difficulty:2,instruments:["Violin","Viola","Cello","Double Bass"]},dorian:{label:"Dorian",intervals:[0,2,3,5,7,9,10],difficulty:2,instruments:["Violin","Viola","Cello","Double Bass","Fiddle"]},mixolydian:{label:"Mixolydian",intervals:[0,2,4,5,7,9,10],difficulty:2,instruments:["Violin","Viola","Cello","Fiddle"]},blues:{label:"Blues",intervals:[0,3,5,6,7,10],difficulty:2,instruments:["Violin","Viola","Cello","Double Bass","Fiddle","Erhu"]},phrygian:{label:"Phrygian",intervals:[0,1,3,5,7,8,10],difficulty:3,instruments:["Violin","Viola","Cello","Double Bass","Fiddle"]},lydian:{label:"Lydian",intervals:[0,2,4,6,7,9,11],difficulty:3,instruments:["Violin","Viola","Cello","Double Bass"]},locrian:{label:"Locrian",intervals:[0,1,3,5,6,8,10],difficulty:4,instruments:["Violin","Viola","Cello","Double Bass"]},"whole-tone":{label:"Whole Tone",intervals:[0,2,4,6,8,10],difficulty:3,instruments:["Violin","Viola","Cello"]},"diminished-hw":{label:"Diminished (H-W)",intervals:[0,1,3,4,6,7,9,10],difficulty:4,instruments:["Violin","Viola","Cello"]},"diminished-wh":{label:"Diminished (W-H)",intervals:[0,2,3,5,6,8,9,11],difficulty:4,instruments:["Violin","Viola","Cello"]},chromatic:{label:"Chromatic",intervals:[0,1,2,3,4,5,6,7,8,9,10,11],difficulty:3,instruments:["Violin","Viola","Cello","Double Bass","Fiddle","Hardanger","Erhu"]}},xs=Ls.map((i,e)=>({value:String(e),label:i}));function ts(i,e){const t=Ue[e];return t?{pitchClasses:new Set(t.intervals.map(n=>(i+n)%12)),root:i}:null}const zs=["","Beginner","Easy","Intermediate","Advanced","Expert"];function Os(i){return zs[i]||""}const Is=["","●","●●","●●●","●●●●","●●●●●"];class Ns{constructor(e){this.container=e,this.onScaleChange=null,this._rootPitchClass=0,this._scaleKey="",this._instrumentFilter="",this._build()}get scaleKey(){return this._scaleKey}get rootPitchClass(){return this._rootPitchClass}_build(){this.container.replaceChildren();const e=document.createElement("div");e.className="scale-panel";const t=document.createElement("div");t.className="scale-header";const s=document.createElement("span");s.className="scale-label",s.textContent="Scale",t.appendChild(s);const n=document.createElement("div");n.className="scale-root-wrap",this._rootDropdown=new Q(n,{placeholder:"Root"}),this._rootDropdown.setItems(xs),this._rootDropdown.value="0",this._rootDropdown.onChange=c=>{this._rootPitchClass=parseInt(c,10),this._emitChange()},t.appendChild(n);const a=document.createElement("div");a.className="scale-inst-wrap",this._instDropdown=new Q(a,{placeholder:"All instruments"}),this._instDropdown.setItems([{value:"",label:"All instruments"},...ks.map(c=>({value:c,label:c}))]),this._instDropdown.value="",this._instDropdown.onChange=c=>{this._instrumentFilter=c,this._rebuildScaleDropdown()},t.appendChild(a),e.appendChild(t);const o=document.createElement("div");o.className="scale-row";const r=document.createElement("div");r.className="scale-type-wrap",this._scaleDropdown=new Q(r,{placeholder:"Off"}),o.appendChild(r),this._diffBadge=document.createElement("span"),this._diffBadge.className="scale-difficulty",o.appendChild(this._diffBadge),this._scaleDropdown.onChange=c=>{this._scaleKey=c,this._updateDiffBadge(),this._emitChange()},e.appendChild(o),this.container.appendChild(e),this._rebuildScaleDropdown()}_rebuildScaleDropdown(){const e=this._scaleKey,t=[{value:"",label:"Off"}];for(const[s,n]of Object.entries(Ue)){if(this._instrumentFilter&&!n.instruments.includes(this._instrumentFilter))continue;const a=Is[n.difficulty]||"";t.push({value:s,label:`${n.label}  ${a}`})}this._scaleDropdown.setItems(t),t.some(s=>s.value===e)?(this._scaleDropdown.value=e,this._scaleKey=e):(this._scaleDropdown.value="",this._scaleKey=""),this._updateDiffBadge(),this._emitChange()}_updateDiffBadge(){const e=Ue[this._scaleKey];if(!e){this._diffBadge.textContent="",this._diffBadge.className="scale-difficulty";return}const t=Os(e.difficulty);this._diffBadge.textContent=t,this._diffBadge.className="scale-difficulty",this._diffBadge.classList.add(`diff-${e.difficulty}`)}_emitChange(){var t,s;if(!this._scaleKey){(t=this.onScaleChange)==null||t.call(this,null);return}const e=ts(this._rootPitchClass,this._scaleKey);(s=this.onScaleChange)==null||s.call(this,e)}}class Ks{constructor(e){this.container=e,this.onStart=null,this.onTargetChange=null,this.onHit=null,this.onComplete=null,this.onStop=null,this._octaves=1,this._direction="asc",this._tolerance=20,this._state="idle",this._sequence=[],this._currentIndex=0,this._consecutiveHits=0,this._hits=0,this._misses=0,this._centsSum=0,this._centsCount=0,this._wrongNoteFrames=0,this._lastWrongMidi=-1,this._startTime=0,this._build()}get active(){return this._state==="playing"}get octaves(){return this._octaves}get direction(){return this._direction}get tolerance(){return this._tolerance}_build(){this.container.replaceChildren();const e=document.createElement("div");e.className="trainer-panel";const t=document.createElement("div");t.className="trainer-header";const s=document.createElement("span");s.className="trainer-label",s.textContent="Scale Trainer",t.appendChild(s),e.appendChild(t);const n=document.createElement("div");n.className="trainer-config";const a=document.createElement("div");a.className="trainer-config-item";const o=document.createElement("span");o.className="trainer-config-label",o.textContent="Octaves",a.appendChild(o);const r=document.createElement("div");r.className="trainer-config-wrap trainer-config-wrap--small",this._octavesDropdown=new Q(r,{placeholder:"1"}),this._octavesDropdown.setItems([{value:"1",label:"1"},{value:"2",label:"2"},{value:"3",label:"3"}]),this._octavesDropdown.value="1",this._octavesDropdown.onChange=G=>{this._octaves=parseInt(G,10)},a.appendChild(r),n.appendChild(a);const c=document.createElement("div");c.className="trainer-config-item";const h=document.createElement("span");h.className="trainer-config-label",h.textContent="Direction",c.appendChild(h);const d=document.createElement("div");d.className="trainer-config-wrap",this._directionDropdown=new Q(d,{placeholder:"Ascending"}),this._directionDropdown.setItems([{value:"asc",label:"Ascending"},{value:"desc",label:"Descending"},{value:"both",label:"Both"}]),this._directionDropdown.value="asc",this._directionDropdown.onChange=G=>{this._direction=G},c.appendChild(d),n.appendChild(c);const l=document.createElement("div");l.className="trainer-config-item";const u=document.createElement("span");u.className="trainer-config-label",u.textContent="Tolerance",l.appendChild(u);const p=document.createElement("div");p.className="trainer-config-wrap",this._toleranceDropdown=new Q(p,{placeholder:"20 cents"}),this._toleranceDropdown.setItems([{value:"10",label:"10 cents"},{value:"20",label:"20 cents"},{value:"30",label:"30 cents"},{value:"50",label:"50 cents"}]),this._toleranceDropdown.value="20",this._toleranceDropdown.onChange=G=>{this._tolerance=parseInt(G,10)},l.appendChild(p),n.appendChild(l),e.appendChild(n);const A=document.createElement("div");A.className="trainer-btn-row",this._startBtn=document.createElement("button"),this._startBtn.className="trainer-start-btn",this._startBtn.textContent="Start Practice",this._startBtn.addEventListener("click",()=>this._handleStart()),A.appendChild(this._startBtn),this._stopBtn=document.createElement("button"),this._stopBtn.className="trainer-stop-btn trainer-hidden",this._stopBtn.textContent="Stop",this._stopBtn.addEventListener("click",()=>this._handleStop()),A.appendChild(this._stopBtn),e.appendChild(A),this._progressRow=document.createElement("div"),this._progressRow.className="trainer-progress trainer-hidden";const D=document.createElement("div");D.className="trainer-progress-bar",this._progressFill=document.createElement("div"),this._progressFill.className="trainer-progress-fill",D.appendChild(this._progressFill),this._progressRow.appendChild(D),this._progressText=document.createElement("span"),this._progressText.className="trainer-progress-text",this._progressRow.appendChild(this._progressText),e.appendChild(this._progressRow),this._targetDisplay=document.createElement("div"),this._targetDisplay.className="trainer-target-display trainer-hidden",this._targetNote=document.createElement("div"),this._targetNote.className="trainer-target-note",this._targetDisplay.appendChild(this._targetNote),this._targetInstruction=document.createElement("div"),this._targetInstruction.className="trainer-target-instruction",this._targetInstruction.textContent="Play this note",this._targetDisplay.appendChild(this._targetInstruction),e.appendChild(this._targetDisplay),this._statsRow=document.createElement("div"),this._statsRow.className="trainer-stats trainer-hidden",this._hitsStat=this._createStat("0","Hits","hits"),this._missesStat=this._createStat("0","Misses","misses"),this._accuracyStat=this._createStat("-","Accuracy",""),this._centsStat=this._createStat("-","Avg Cents",""),this._statsRow.appendChild(this._hitsStat.el),this._statsRow.appendChild(this._missesStat.el),this._statsRow.appendChild(this._accuracyStat.el),this._statsRow.appendChild(this._centsStat.el),e.appendChild(this._statsRow),this._summaryEl=document.createElement("div"),this._summaryEl.className="trainer-summary trainer-hidden",e.appendChild(this._summaryEl),this.container.appendChild(e)}_createStat(e,t,s){const n=document.createElement("div");n.className="trainer-stat";const a=document.createElement("div");a.className="trainer-stat-value"+(s?` ${s}`:""),a.textContent=e,n.appendChild(a);const o=document.createElement("div");return o.className="trainer-stat-label",o.textContent=t,n.appendChild(o),{el:n,valEl:a}}_handleStart(){var e;this._state==="complete"&&this._summaryEl.classList.add("trainer-hidden"),(e=this.onStart)==null||e.call(this)}_handleStop(){var e;this._state="idle",this._updateUI(),(e=this.onStop)==null||e.call(this)}beginSession(e){!e||e.length===0||(this._sequence=e,this._currentIndex=0,this._consecutiveHits=0,this._hits=0,this._misses=0,this._centsSum=0,this._centsCount=0,this._wrongNoteFrames=0,this._lastWrongMidi=-1,this._startTime=performance.now(),this._state="playing",this._updateUI(),this._emitTarget())}update(e){var a;if(this._state!=="playing")return;const t=this._sequence[this._currentIndex];if(!t)return;if(!e||e<20){this._consecutiveHits=0;return}const s=Oe(e),n=Zt(e);s===t.midi&&Math.abs(n)<=this._tolerance?(this._consecutiveHits++,this._consecutiveHits>=3&&(this._hits++,this._centsSum+=Math.abs(n),this._centsCount++,(a=this.onHit)==null||a.call(this,t),this._advance())):(this._consecutiveHits=0,s!==t.midi&&e>20&&(s===this._lastWrongMidi?(this._wrongNoteFrames++,this._wrongNoteFrames>=5&&(this._misses++,this._wrongNoteFrames=0,this._lastWrongMidi=-1,this._updateStats())):(this._lastWrongMidi=s,this._wrongNoteFrames=1)))}_advance(){var e,t;this._currentIndex++,this._consecutiveHits=0,this._wrongNoteFrames=0,this._lastWrongMidi=-1,this._currentIndex>=this._sequence.length?(this._state="complete",this._updateUI(),this._showSummary(),(e=this.onComplete)==null||e.call(this,{hits:this._hits,misses:this._misses,accuracy:this._getAccuracy(),avgCents:this._getAvgCents(),elapsed:performance.now()-this._startTime}),(t=this.onStop)==null||t.call(this)):(this._updateStats(),this._updateProgress(),this._emitTarget())}_emitTarget(){var t;if(this._currentIndex>=this._sequence.length)return;const e=this._sequence[this._currentIndex];if(e){this._targetNote.textContent="",this._targetNote.appendChild(document.createTextNode(e.noteName));const s=document.createElement("span");s.className="octave",s.textContent=e.octave,this._targetNote.appendChild(s),(t=this.onTargetChange)==null||t.call(this,e)}}_getAccuracy(){const e=this._hits+this._misses;return e===0?0:Math.round(this._hits/e*100)}_getAvgCents(){return this._centsCount===0?0:(this._centsSum/this._centsCount).toFixed(1)}_updateStats(){this._hitsStat.valEl.textContent=this._hits,this._missesStat.valEl.textContent=this._misses;const e=this._hits+this._misses;this._accuracyStat.valEl.textContent=e>0?`${this._getAccuracy()}%`:"-",this._centsStat.valEl.textContent=this._centsCount>0?`${this._getAvgCents()}c`:"-"}_updateProgress(){const e=this._sequence.length,t=this._currentIndex,s=e>0?t/e*100:0;this._progressFill.style.width=`${s}%`,this._progressText.textContent=`${t} / ${e}`}_updateUI(){const e=this._state==="idle",t=this._state==="playing",s=this._state==="complete";this._startBtn.textContent=s?"Restart":"Start Practice",this._startBtn.classList.toggle("trainer-hidden",t),this._stopBtn.classList.toggle("trainer-hidden",!t),this._progressRow.classList.toggle("trainer-hidden",e),t&&this._updateProgress(),s&&(this._progressFill.style.width="100%",this._progressText.textContent=`${this._sequence.length} / ${this._sequence.length}`),this._targetDisplay.classList.toggle("trainer-hidden",!t),this._statsRow.classList.toggle("trainer-hidden",e),(t||s)&&this._updateStats(),s||this._summaryEl.classList.add("trainer-hidden")}_showSummary(){const e=performance.now()-this._startTime,t=Math.round(e/1e3),s=Math.floor(t/60),n=t%60,a=s>0?`${s}m ${n}s`:`${n}s`;this._summaryEl.replaceChildren(),this._summaryEl.classList.remove("trainer-hidden");const o=document.createElement("div");o.className="trainer-summary-title",o.textContent="Practice Complete!",this._summaryEl.appendChild(o);const r=document.createElement("div");r.className="trainer-summary-stats";const c=[{value:`${this._getAccuracy()}%`,label:"Accuracy"},{value:`${this._getAvgCents()}c`,label:"Avg Deviation"},{value:`${this._hits}`,label:"Hits"},{value:`${this._misses}`,label:"Misses"},{value:a,label:"Time"}];for(const h of c){const d=document.createElement("div");d.className="trainer-summary-stat";const l=document.createElement("div");l.className="trainer-summary-stat-value",l.textContent=h.value,d.appendChild(l);const u=document.createElement("div");u.className="trainer-summary-stat-label",u.textContent=h.label,d.appendChild(u),r.appendChild(d)}this._summaryEl.appendChild(r)}}function Ps(i,e,t,s={}){const{octaves:n=1,direction:a="asc"}=s,o=ee[i];if(!o)return[];const r=ts(e,t);if(!r)return[];const{pitchClasses:c}=r,h=[];for(let G=0;G<o.strings.length;G++){const y=o.strings[G];for(let T=0;T<=12;T++){const I=y.frequency*Math.pow(2,T/12),z=Oe(I),g=z%12;if(c.has(g)){const{name:E,octave:F}=Te(z);h.push({midi:z,freq:oe(z),noteName:E,octave:F,pitchClass:g,stringIndex:G,positionIndex:T})}}}if(h.length===0)return[];h.sort((G,y)=>G.midi-y.midi);const d=[];let l=-1;for(const G of h)G.midi!==l&&(d.push(G),l=G.midi);const u=d.filter(G=>G.pitchClass===e);if(u.length===0)return d;const p=u[0].midi,A=p+n*12,D=d.filter(G=>G.midi>=p&&G.midi<=A);if(D.length===0)return[];if(a==="desc")return D.slice().reverse();if(a==="both"){const G=D.slice(),y=D.slice().reverse().slice(1);return G.concat(y)}return D.slice()}const Ft=[{value:"2/4",label:"2/4",beats:2},{value:"3/4",label:"3/4",beats:3},{value:"4/4",label:"4/4",beats:4},{value:"5/4",label:"5/4",beats:5},{value:"6/8",label:"6/8",beats:6},{value:"7/8",label:"7/8",beats:7},{value:"9/8",label:"9/8",beats:9},{value:"12/8",label:"12/8",beats:12}];class Rs{constructor(e){this.container=e,this.onStart=null,this.onStop=null,this.onBpmChange=null,this.onTimeSigChange=null,this.onVolumeChange=null,this._bpm=120,this._beats=4,this._playing=!1,this._beatDots=[],this._build()}get bpm(){return this._bpm}get beats(){return this._beats}_build(){this.container.replaceChildren();const e=document.createElement("div");e.className="metronome-panel";const t=document.createElement("div");t.className="metronome-header";const s=document.createElement("span");s.className="metronome-label",s.textContent="Metronome",t.appendChild(s),this._playBtn=document.createElement("button"),this._playBtn.className="metronome-play-btn",this._playBtn.textContent="▶",this._playBtn.title="Start / Stop",this._playBtn.addEventListener("click",()=>{var u,p;this._playing?(this._playing=!1,this._playBtn.textContent="▶",this._playBtn.classList.remove("active"),this._clearBeatDots(),(u=this.onStop)==null||u.call(this)):(this._playing=!0,this._playBtn.textContent="■",this._playBtn.classList.add("active"),(p=this.onStart)==null||p.call(this))}),t.appendChild(this._playBtn),e.appendChild(t);const n=document.createElement("div");n.className="metronome-controls";const a=document.createElement("div");a.className="metronome-bpm-group";const o=document.createElement("button");o.className="metronome-bpm-btn",o.textContent="−",o.addEventListener("click",()=>this._setBpm(this._bpm-1)),a.appendChild(o),this._bpmSlider=document.createElement("input"),this._bpmSlider.type="range",this._bpmSlider.className="metronome-bpm-slider",this._bpmSlider.min="40",this._bpmSlider.max="220",this._bpmSlider.value=String(this._bpm),this._bpmSlider.addEventListener("input",()=>{this._setBpm(parseInt(this._bpmSlider.value,10))}),a.appendChild(this._bpmSlider),this._bpmDisplay=document.createElement("input"),this._bpmDisplay.type="text",this._bpmDisplay.className="metronome-bpm-display",this._bpmDisplay.value=String(this._bpm),this._bpmDisplay.addEventListener("change",()=>{const u=parseInt(this._bpmDisplay.value,10);isNaN(u)?this._bpmDisplay.value=String(this._bpm):this._setBpm(u)}),this._bpmDisplay.addEventListener("keydown",u=>{u.key==="Enter"&&this._bpmDisplay.blur()}),a.appendChild(this._bpmDisplay);const r=document.createElement("span");r.className="metronome-bpm-unit",r.textContent="BPM",a.appendChild(r);const c=document.createElement("button");c.className="metronome-bpm-btn",c.textContent="+",c.addEventListener("click",()=>this._setBpm(this._bpm+1)),a.appendChild(c),n.appendChild(a);const h=document.createElement("div");h.className="metronome-timesig-wrap",this._timeSigDropdown=new Q(h,{placeholder:"4/4"}),this._timeSigDropdown.setItems(Ft.map(u=>({value:u.value,label:u.label}))),this._timeSigDropdown.value="4/4",this._timeSigDropdown.onChange=u=>{var A;const p=Ft.find(D=>D.value===u);p&&(this._beats=p.beats,this._buildBeatDots(),(A=this.onTimeSigChange)==null||A.call(this,p.beats))},n.appendChild(h);const d=document.createElement("div");d.className="metronome-vol-group";const l=document.createElement("span");l.className="metronome-vol-icon",l.textContent="🔊",d.appendChild(l),this._volSlider=document.createElement("input"),this._volSlider.type="range",this._volSlider.className="metronome-vol-slider",this._volSlider.min="0",this._volSlider.max="1",this._volSlider.step="0.01",this._volSlider.value="0.5",this._volSlider.addEventListener("input",()=>{var u;(u=this.onVolumeChange)==null||u.call(this,parseFloat(this._volSlider.value))}),d.appendChild(this._volSlider),n.appendChild(d),e.appendChild(n),this._beatContainer=document.createElement("div"),this._beatContainer.className="metronome-beats",e.appendChild(this._beatContainer),this.container.appendChild(e),this._buildBeatDots()}_setBpm(e){var t;this._bpm=Math.max(40,Math.min(220,e)),this._bpmSlider.value=String(this._bpm),this._bpmDisplay.value=String(this._bpm),(t=this.onBpmChange)==null||t.call(this,this._bpm)}_buildBeatDots(){this._beatContainer.replaceChildren(),this._beatDots=[];for(let e=0;e<this._beats;e++){const t=document.createElement("span");t.className="metronome-beat-dot",e===0&&t.classList.add("accent"),this._beatContainer.appendChild(t),this._beatDots.push(t)}}_clearBeatDots(){for(const e of this._beatDots)e.classList.remove("lit")}flashBeat(e){this._clearBeatDots(),e>=0&&e<this._beatDots.length&&this._beatDots[e].classList.add("lit")}}const Xs=[{id:"twinkle",genre:"Beginner",abc:`X:1
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
"D"A2A E2G|F A F D3|"G"B3 "A"E2G|"D"F3 D3|]`}],Qs=[{id:"greensleeves",genre:"Folk",abc:`X:1
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
"D"D3 E F2 A2|"G"B2 d2 "D"A4|F2 D2 "A"E2 E2|"D"D6|]`}],$s=[{id:"soldiers-joy",genre:"Old-Time",abc:`X:1
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
"D"d4 d4|"A"c4 c4|"G"B2 B2 "A"A2 G2|"D"F2 E2 D2|]`}],Hs=[{id:"ode-to-joy",genre:"Classical",abc:`X:1
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
"Gm"E3 E G2 F2|E4 D4|"A"^C2 D2 E2 F2|"D"D8|]`}],Ws=[{id:"jingle-bells",genre:"Holiday",abc:`X:1
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
"D"F6 F3 A3|A2 G2 B2 G6|F3 A3 "A"E3 F2 E|"D"D12|]`}],qs=[{id:"riff-power-e",genre:"Rock & Metal",abc:`X:1
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
"C7"z2 C2 E2 G2|B4 G4|"C7"z2 G2 F2 G2|"F"A8|]`}],Vs=[{id:"tech-open-strings",genre:"Technique",abc:`X:1
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
AAAA BBBB cccc dddd|eeee dddd cccc BBBB|AcBd ceBd cAeA a4|]`}],js=[...Xs,...Qs,...$s,...Hs,...Ws,...qs,...Vs].map(i=>({...i,source:"builtin"})),Us=["Beginner","Folk","World","Celtic","Old-Time","Bluegrass","Classical","Rock & Metal","Blues & Jazz","Hymns","Holiday","Technique"],ss={C:0,D:2,E:4,F:5,G:7,A:9,B:11},Ct=["F","C","G","D","A","E","B"],yt=["B","E","A","D","G","C","F"],Js={C:0,G:1,D:2,A:3,E:4,B:5,"F#":6,"C#":7,F:-1,Bb:-2,Eb:-3,Ab:-4,Db:-5,Gb:-6,Cb:-7,"G#":8,"D#":9,"A#":10,"E#":11,"B#":12,Fb:-8},vt={maj:0,ion:0,mix:-1,dor:-2,min:-3,aeo:-3,m:-3,phr:-4,loc:-5,lyd:1};function Je(i){const e=(i||"").trim(),t={tonic:"C",mode:"maj",accidentals:{},tonicPc:0,label:"C"};if(/^(HP|Hp)\b/.test(e))return t.tonic="A",t.mode="mix",t.tonicPc=9,t.accidentals={F:1,C:1},t.label="A Mix",t;if(/^none\b/i.test(e)||e==="")return t;const s=e.match(/^([A-Ga-g])([#b]?)\s*([A-Za-z]*)\s*(.*)$/);if(!s)return t;const n=s[1].toUpperCase()+s[2],a=s[3].toLowerCase();let o="maj";if(a==="m")o="min";else if(a.length>=3){const D=a.slice(0,3);D in vt&&(o=D==="aeo"?"min":D==="ion"?"maj":D)}const c=(Js[n]??0)+vt[o],h={};if(c>0){for(let D=0;D<Math.min(c,7);D++)h[Ct[D]]=1;for(let D=7;D<c;D++)h[Ct[D-7]]=2}else if(c<0){for(let D=0;D<Math.min(-c,7);D++)h[yt[D]]=-1;for(let D=7;D<-c;D++)h[yt[D-7]]=-2}const d=s[4]||"",l=/(\^\^|\^|__|_|=)([A-Ga-g])/g;let u;for(;u=l.exec(d);){const D={"^^":2,"^":1,__:-2,_:-1,"=":0}[u[1]];h[u[2].toUpperCase()]=D}const p=(ss[n[0]]+(n[1]==="#"?1:n[1]==="b"?-1:0)+12)%12,A={maj:"",min:"m",mix:" Mix",dor:" Dor",phr:" Phr",lyd:" Lyd",loc:" Loc"}[o];return t.tonic=n,t.mode=o,t.accidentals=h,t.tonicPc=p,t.label=n+A,t}function ns(i){const e=(i||"").trim();if(e==="C")return{num:4,den:4,text:"4/4"};if(e==="C|")return{num:2,den:2,text:"2/2"};const t=e.match(/^(\d+)(?:\+\d+)*\s*\/\s*(\d+)/);if(t){const n=e.split("/")[0].split("+").map(Number).reduce((a,o)=>a+o,0);return{num:n,den:Number(t[2]),text:`${n}/${t[2]}`}}return null}function ot(i){const e=(i||"").trim().match(/^(\d+)\s*\/\s*(\d+)/);if(e)return Number(e[1])/Number(e[2]);const t=parseFloat(i);return isFinite(t)?t:null}function Ys(i){const e=(i||"").replace(/"[^"]*"/g,"").trim(),t=e.match(/((?:\d+\/\d+\s*)+)=\s*(\d+)/);if(t){const n=t[1].trim().split(/\s+/).reduce((a,o)=>a+(ot(o)||0),0);return Number(t[2])*n*4}const s=e.match(/^(\d+)/);return s?Number(s[1]):null}const Zs={reel:150,jig:165,"slip jig":165,hornpipe:130,polka:140,waltz:120,march:110,strathspey:100,slide:180,mazurka:120,barndance:130,"three-two":120,air:80,hymn:90};function en(i){const e=i.replace(/\r\n?/g,`
`).split(`
`),t=[];let s=null;for(const n of e)/^X:/.test(n)?(s&&t.push(s.join(`
`)),s=[n]):s?s.push(n):/^[TKM]:/.test(n)&&(s=["X:1",n]);return s&&t.push(s.join(`
`)),t}function Ye(i){const e=i.replace(/\r\n?/g,`
`).split(`
`),t={title:"",titles:[],composer:"",origin:"",rhythm:""};let s={num:4,den:4,text:"4/4"},n=!1,a=null,o=null,r=Je("C"),c=!1;const h=[];for(const p of e){const A=p.replace(/(^|[^\\])%.*$/,"$1");if(c)h.push(A);else{const D=A.match(/^([A-Za-z]):\s?(.*)$/);if(!D){if(A.trim()==="")continue;c=!0,h.push(A);continue}const[,G,y]=D;switch(G){case"T":t.titles.push(y.trim());break;case"C":t.composer=t.composer||y.trim();break;case"O":t.origin=t.origin||y.trim();break;case"R":t.rhythm=y.trim().toLowerCase();break;case"M":{const T=ns(y);T&&(s=T,n=!0);break}case"L":a=ot(y);break;case"Q":o=Ys(y);break;case"K":r=Je(y),c=!0;break}}}if(t.title=t.titles[0]||"Untitled",!a){const p=s.num/s.den;a=n&&p<.75?1/16:1/8}o||(o=Zs[t.rhythm]||120);const d={meter:s,unitLen:a,tempo:o,key:r},{bars:l}=tn(h,d),u=sn(l);return nn(t,d,u)}function tn(i,e){let{unitLen:t,key:s}=e,n=e.meter;const a=[];let o=G(),r={},c=null,h=null,d="",l=null,u=!1,p=0,A=1,D=1;function G(){return{events:[],startRepeat:!1,endRepeat:!1,ending:null,part:"",doubleBar:!1,meter:null}}function y(g={}){(o.events.length>0||g.force)&&(o.ending=c,o.part=d,o.meter=n,a.push(o)),o=G(),r={}}function T(){for(let g=o.events.length-1;g>=0;g--)if(o.events[g].type!=="marker")return o.events[g];for(let g=a.length-1;g>=0;g--){const E=a[g].events;for(let F=E.length-1;F>=0;F--)if(E[F].type!=="marker")return E[F]}return null}function I(g,E){switch(g){case"K":s=Je(E);break;case"L":{const F=ot(E);F&&(t=F);break}case"M":{const F=ns(E);F&&(n=F);break}case"P":d=E.trim();break}}for(const g of i){let E=g;const F=E.match(/^([A-Za-z]):\s?(.*)$/);if(F){const[,v,b]=F;if(v==="V"){const w=b.trim().split(/\s+/)[0];l===null&&(l=w),u=w!==l}else v==="w"||v==="W"||u||I(v,b);continue}if(u)continue;E=E.replace(/\\\s*$/,"");let B=0;const S=E.length;for(;B<S;){const v=E[B];if(v===" "||v==="	"||v==="y"||v==="`"){B++;continue}if(v==="["&&/[A-Za-z]/.test(E[B+1]||"")&&E[B+2]===":"){const f=E.indexOf("]",B);if(f>B){const _=E[B+1],M=E.slice(B+3,f);if(_==="V"){const N=M.trim().split(/\s+/)[0];l===null&&(l=N),u=N!==l}else I(_,M);if(B=f+1,u)break;continue}}if(v==='"'){const f=E.indexOf('"',B+1),_=f>B?E.slice(B+1,f):"";/^[A-G]/.test(_)&&(h=_.split(/[\s(/]/)[0]),B=f>B?f+1:S;continue}if(v==="!"||v==="+"){const f=E.indexOf(v,B+1);B=f>B?f+1:B+1;continue}if(v==="{"){const f=E.indexOf("}",B);B=f>B?f+1:S;continue}if(".~HLMOPSTuvJR".includes(v)){B++;continue}if(v===")"){B++;continue}if(v==="("){const f=E.slice(B).match(/^\((\d)(?::(\d)?)?(?::(\d)?)?/);if(f){const _=Number(f[1]);let M=f[2]?Number(f[2]):null;const N=f[3]?Number(f[3]):_;if(!M){const X=n.num%3===0&&n.num>3;M={2:3,3:2,4:3,6:2,8:3}[_]??(X?3:2)}A=M/_,p=N,B+=f[0].length;continue}B++;continue}if(v==="|"||v===":"||v==="["&&(E[B+1]==="|"||/\d/.test(E[B+1]||""))){const f=E.slice(B).match(/^(:*)(\|\]|\[\||\|\||\||\[(?=\d))?(:*)(\[?\d+(?:[-,]\d+)*)?/);if(f&&f[0].length>0){const _=f[1],M=f[2]||"";let N=f[3],X=f[4]||"";const $=_.length>0;!M&&_.length>=2&&(N=":");const j=N.length>0,te=M==="||"||M==="|]"||M==="[|";if(M||$||j){if(o.events.length===0){const H=a[a.length-1];H&&($&&(H.endRepeat=!0),te&&(H.doubleBar=!0))}else $&&(o.endRepeat=!0),te&&(o.doubleBar=!0),y();($||te)&&(c=null)}if(j&&(o.startRepeat=!0,c=null),X){X=X.replace("[","");const H=[];for(const ye of X.split(",")){const[ge,De]=ye.split("-").map(Number);if(De)for(let he=ge;he<=De;he++)H.push(he);else H.push(ge)}c=H}B+=f[0].length;continue}B++;continue}if(v===">"||v==="<"){let f=0;const _=v;for(;E[B]===_;)f++,B++;const M=1-Math.pow(.5,f),N=T();N&&(_===">"?(N.dur*=1+M,D=1-M):(N.dur*=1-M,D=1+M));continue}if(v==="-"){const f=T();f&&f.type==="note"&&(f.tie=!0),B++;continue}if(v==="["){const f=E.indexOf("]",B);if(f>B){const _=E.slice(B+1,f);let M=null,N=null;const X=/(\^\^|\^|__|_|=)?([A-Ga-g])([,']*)(\d*\/*\d*)/g;let $;for(;$=X.exec(_);){const H=_t($[1],$[2],$[3],s,r);N===null&&(N=ve($[4])),(M===null||H>M)&&(M=H)}B=f+1;const j=E.slice(B).match(/^(\d*\/*\d*)/);let te=N??1;j&&j[1]&&(te=ve(j[1]),B+=j[1].length),M!==null&&z({type:"note",midi:M},te);continue}B++;continue}const b=E.slice(B).match(/^(\^\^|\^|__|_|=)?([A-Ga-g])([,']*)(\d*\/*\d*)/);if(b){const f=_t(b[1],b[2],b[3],s,r);z({type:"note",midi:f},ve(b[4])),B+=b[0].length;continue}const w=E.slice(B).match(/^([zx])(\d*\/*\d*)/);if(w){z({type:"rest"},ve(w[2])),B+=w[0].length;continue}const O=E.slice(B).match(/^Z(\d*)/);if(O){const f=O[1]?Number(O[1]):1,_=n.num*(4/n.den);for(let M=0;M<f;M++)o.events.push({type:"rest",dur:_}),M<f-1&&y();B+=O[0].length;continue}B++}}y();function z(g,E){let F=E*t*4;p>0&&(F*=A,p--),D!==1&&(F*=D,D=1),g.dur=F,h&&(g.chord=h,h=null),o.events.push(g)}return{bars:a}}function ve(i){if(!i)return 1;const e=i.match(/^(\d*)(\/*)(\d*)$/);if(!e)return 1;const t=e[1]?Number(e[1]):1;let s=1;return e[2].length>0&&(s=e[3]?Number(e[3]):Math.pow(2,e[2].length),e[3]&&e[2].length>1&&(s=Number(e[3])*Math.pow(2,e[2].length-1))),t/s}function _t(i,e,t,s,n){const a=e.toUpperCase();let o=e===a?4:5;for(const h of t||"")h==="'"?o++:h===","&&o--;const r=a+o;let c;return i?(c={"^^":2,"^":1,__:-2,_:-1,"=":0}[i],n[r]=c):r in n?c=n[r]:c=s.accidentals[a]||0,(o+1)*12+ss[a]+c}function sn(i){const e=[];let t=0,s=1,n=-1,a=0,o=0,r=0;for(;o<i.length&&a++<1e4;){const d=i[o];if(d.startRepeat&&n!==o&&(t=o,s=1),n=-1,d.ending&&!d.ending.includes(s)){o++;continue}if(e.push({...d,pass:s,blockStart:t}),d.endRepeat){if(s<2){s++,o=t,n=t;continue}s=1,t=o+1}else d.doubleBar&&(t=o+1,s=1);o++}const c="ABCDEFGHIJKLMNOPQRSTUVWXYZ",h=new Map;for(const d of e){const l=d.part||d.blockStart;h.has(l)||h.set(l,d.part||c[r++%26]);const u=h.get(l),p=`${l}|${d.pass}`;d.section=d.pass>1?`${u} (repeat)`:u,d.sectionKey=p}return e}function nn(i,e,t){const s=[],n=[],a=[];let o=0;for(const c of t){const h=o;for(const l of c.events){if(l.chord&&n.push({start:o,symbol:l.chord}),l.type==="note"){const u=s[s.length-1];u&&u.tie&&u.midi===l.midi&&Math.abs(u.start+u.dur-o)<1e-6?(u.dur+=l.dur,u.tie=!!l.tie):s.push({midi:l.midi,start:o,dur:l.dur,tie:!!l.tie,bar:a.length})}o+=l.dur}const d=c.meter||e.meter;a.push({start:h,dur:o-h,section:c.section,sectionKey:c.sectionKey,meter:d})}for(const c of s)delete c.tie;const r=[];for(let c=0;c<a.length;c++){const h=a[c],d=r[r.length-1];d&&d.key===h.sectionKey?(d.end=h.start+h.dur,d.barEnd=c+1):r.push({key:h.sectionKey,name:h.section,start:h.start,end:h.start+h.dur,barStart:c,barEnd:c+1})}return{title:i.title,composer:i.composer,origin:i.origin,rhythm:i.rhythm,meter:e.meter,key:e.key,tempo:e.tempo,notes:s,bars:a,sections:r,chords:n,totalBeats:o}}const W=5,an=[.3,.45,.6,.75,.88,1],on=17,rn=12,cn={1:1,2:1,3:2,4:2,5:3,6:3,7:4,8:4},_e=[1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10];function ln(i){const e=["th","st","nd","rd"],t=i%100;return i+(e[(t-20)%10]||e[t]||e[0])}function dn(i){return ee[i].strings.map(t=>Oe(t.frequency))}function hn(i,e){if(i.length===0)return 0;const t=Math.min(...i.map(c=>c.midi)),s=Math.max(...i.map(c=>c.midi)),n=e[0],a=e[e.length-1]+12;let o=0,r=1/0;for(let c=-36;c<=36;c+=12){const h=t+c,d=s+c;let l=0;h<n&&(l+=(n-h)*10),d>a&&(l+=d-a),l+=Math.abs(c)*.01,l<r&&(r=l,o=c)}return o}function un(i,e){var r;const t=e.length,s=i.map(c=>{const h=[];for(let d=0;d<t;d++){const l=c.midi-e[d],u=d===t-1?on:rn;if(l>=0&&l<=u){let p=l<=6?0:l===7?1:4+l;p+=l*.01,h.push({s:d,off:l,cost:p})}}if(h.length===0){const d=c.midi<e[0]?0:t-1;h.push({s:d,off:Math.max(0,c.midi-e[d]),cost:50})}return h}),n=s.map(c=>c.map(()=>({cost:1/0,prev:-1})));(r=s[0])==null||r.forEach((c,h)=>{n[0][h].cost=c.cost});for(let c=1;c<s.length;c++)for(let h=0;h<s[c].length;h++){const d=s[c][h];for(let l=0;l<s[c-1].length;l++){const u=s[c-1][l];let p=Math.abs(d.s-u.s)*.25;u.off>7&&d.off>7?p+=Math.abs(d.off-u.off)*.1:u.off>7!=d.off>7&&d.off!==0&&(p+=.5);const A=n[c-1][l].cost+d.cost+p;A<n[c][h].cost&&(n[c][h]={cost:A,prev:l})}}const a=n.length-1;if(a<0)return;let o=n[a].reduce((c,h,d,l)=>h.cost<l[c].cost?d:c,0);for(let c=a;c>=0;c--){const h=s[c][o];i[c].string=h.s,i[c].offset=h.off,o=n[c][o].prev}}function pn(i){let e=0;for(let t=0;t<i.length;t++){const s=i[t],n=s.offset;if(n===0){s.finger=0,s.base=e,s.position=_e[Math.min(e,_e.length-1)];continue}const a=n-e;if(a<1||a>8){let o=Math.max(0,n-7),r=-1;for(let c=Math.max(0,n-8);c<=n-1;c++){let h=0;for(let d=t;d<Math.min(i.length,t+8);d++){const l=i[d].offset;if(l===0)continue;const u=l-c;if(u>=1&&u<=8)h++;else break}h+=[0,2,4,5,7,9,10,12].includes(c)?.3:0,h-=c*.01,h>r&&(r=h,o=c)}e=o}s.base=e,s.finger=cn[n-e]??4,s.position=_e[Math.min(e,_e.length-1)]}}function An(i){return i.num%3===0&&i.num>3?4/i.den*3:4/i.den}function mn(i,e){return Math.abs(i-e)<.001}function Xe(i,e){const t=i/e;return Math.abs(t-Math.round(t))<.001}function fn(i){const e=[];for(const t of i.sections){const s=t.barEnd-t.barStart,n=s>8?Math.ceil(s/4):s>4?2:1,a=Math.ceil(s/n);for(let o=0;o<n;o++){const r=t.barStart+o*a,c=Math.min(t.barEnd,r+a);if(r>=c)continue;const h=i.bars[r],d=i.bars[c-1];e.push({name:n>1?`${t.name} · ${o+1}`:t.name,section:t.name,start:h.start,end:d.start+d.dur,barStart:r,barEnd:c})}}return e.length===0&&e.push({name:"A",section:"A",start:0,end:i.totalBeats,barStart:0,barEnd:i.bars.length}),e}function gn(i,e,t){for(let s=0;s<e.length;s++){const n=e[s],a=[];if(i.forEach((r,c)=>{r.phrase===s&&a.push(c)}),a.length===0)continue;const o=a.map((r,c)=>{const h=i[r],d=t.bars[h.bar]||{start:0,meter:t.meter},l=d.meter||t.meter,u=An(l),p=h.start-d.start;let A=0;return mn(p,0)?A=4:Xe(p,u*2)?A=3:Xe(p,u)?A=2:Xe(p,u/2)&&(A=1),h.dur>=u-.001&&(A+=1.5),c===0&&(A+=10),A-=c*1e-4,{i:r,w:A}});o.sort((r,c)=>c.w-r.w),o.forEach((r,c)=>{let h=W;for(let d=0;d<=W;d++)if(c<Math.ceil(a.length*an[d])){h=d;break}i[r.i].minLevel=h}),n.noteCount=a.length}}function Dn(i){const e=i.notes;if(e.length===0)return{score:1,label:"Beginner"};const t=i.totalBeats*60/i.tempo,s=e.length/Math.max(1,t),n=Math.max(...e.map(p=>p.position||1)),a=Math.max(...e.map(p=>p.midi))-Math.min(...e.map(p=>p.midi));new Set([0,2,4,5,7,9,11].map(p=>(p+i.key.tonicPc)%12));const o=new Set,r={C:0,D:2,E:4,F:5,G:7,A:9,B:11};for(const[p,A]of Object.entries(r))o.add((A+(i.key.accidentals[p]||0)+12)%12);const c=e.filter(p=>!o.has(p.midi%12)).length/e.length,h=e.reduce((p,A,D)=>p+(D>0&&A.offset!==0&&e[D-1].offset!==0&&A.base!==e[D-1].base?1:0),0),d=Math.min(...e.map(p=>p.dur))*60/i.tempo;let l=1+Math.min(4,s*.75)+(n-1)*.7+c*5+Math.min(1.5,h/Math.max(1,e.length)*15)+(a>19?.8:a>12?.4:0)+(d<.15?1:d<.25?.5:0)+(Object.keys(i.key.accidentals).length>=4?.5:0);l=Math.max(1,Math.min(10,l));const u=l<=2.5?"Beginner":l<=4.5?"Easy":l<=6.5?"Intermediate":l<=8?"Advanced":"Expert";return{score:Math.round(l*10)/10,label:u}}function Bn(i,e){const t=dn(e),s=hn(i.notes,t),n=i.notes.map(c=>({...c,midi:c.midi+s}));un(n,t),pn(n);const a=fn(i);let o=0;for(const c of n){for(;o<a.length-1&&c.start>=a[o].end-1e-6;)o++;c.phrase=o}gn(n,a,i);const r={title:i.title,tempo:i.tempo,meter:i.meter,key:i.key,totalBeats:i.totalBeats,bars:i.bars,chords:i.chords.map(c=>({...c})),transpose:s,tuningKey:e,openMidis:t,notes:n,phrases:a};return r.difficulty=Dn(r),r.maxPosition=Math.max(1,...n.map(c=>c.position||1)),r.range=n.length?{lo:Math.min(...n.map(c=>c.midi)),hi:Math.max(...n.map(c=>c.midi))}:{lo:0,hi:0},r}const rt="vaw.songplay.progress.v1",is="vaw.songplay.usersongs.v1",as="vaw.songplay.settings.v1";function ct(i,e){try{const t=localStorage.getItem(i);return t?JSON.parse(t):e}catch{return e}}function Ie(i,e){try{localStorage.setItem(i,JSON.stringify(e))}catch{}}let be=ct(rt,{});function Ze(i){return be[i]||{plays:0,lastPlayed:0,phraseLevels:{},phraseMastered:{},mastery:0,bestScore:{},bestAccuracy:0,bestStreak:0,medal:{}}}function St(i,e){be[i]=e,Ie(rt,be)}function En(i){delete be[i],Ie(rt,be)}function lt(){return ct(is,[])}function os(i){Ie(is,i)}function Mt(){return{tolerance:35,latencyMs:80,guideVolume:.35,clickVolume:.5,backingVolume:.4,guide:!0,click:!0,backing:!0,showNoteNames:!0,tuningCheck:!0,masterMode:!0,...ct(as,{})}}function Se(i){Ie(as,i)}const et=new Map;let Gn=0;const Le=new Map;function wt(){return[...js,...lt().map(i=>({...i,source:"user"}))]}function dt(i){if(i.parsed)return i.parsed;let e=et.get(i.id);return e||(e=Ye(i.abc),et.set(i.id,e)),e}function Me(i,e){const t=`${i.id}|${e}`;let s=Le.get(t);return s||(s=Bn(dt(i),e),Le.set(t,s)),s}function bn(i,e){const t=dt(i),s=Me(i,e);return{title:t.title,composer:t.composer||t.origin||"",key:t.key.label,meter:t.meter.text,tempo:Math.round(t.tempo),notes:s.notes.length,duration:t.totalBeats*60/t.tempo,difficulty:s.difficulty,maxPosition:s.maxPosition,phrases:s.phrases.length,rhythm:t.rhythm}}function Fn(i){return i.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,40)}function Qe({title:i,abc:e,parsed:t,genre:s="My Songs",origin:n=""}){const a=lt(),r={id:`user-${Fn(i||"song")}-${Date.now().toString(36)}${(Gn++).toString(36)}`,title:i,genre:s,origin:n};return e&&(r.abc=e),t&&(r.parsed=t),a.push(r),os(a),{...r,source:"user"}}function Cn(i){os(lt().filter(e=>e.id!==i)),et.delete(i);for(const e of[...Le.keys()])e.startsWith(i+"|")&&Le.delete(e)}const tt="https://thesession.org",rs={reel:"4/4",jig:"6/8","slip jig":"9/8",hornpipe:"4/4",polka:"2/4",slide:"12/8",waltz:"3/4",barndance:"4/4",strathspey:"4/4","three-two":"3/2",mazurka:"3/4",march:"4/4"},yn={reel:"1/4=140",jig:"3/8=110","slip jig":"3/8=110",hornpipe:"1/4=120",polka:"1/4=140",slide:"3/8=120",waltz:"1/4=120",barndance:"1/4=130",strathspey:"1/4=100","three-two":"1/2=80",mazurka:"1/4=120",march:"1/4=110"},vn=Object.keys(rs);async function cs(i){const e=await fetch(i,{headers:{Accept:"application/json"}});if(!e.ok)throw new Error(`The Session returned ${e.status}`);return e.json()}async function _n(i,{type:e="",page:t=1}={}){const s=new URLSearchParams({format:"json",perpage:"50",page:String(t)});let n="/tunes/popular";i&&(n="/tunes/search",s.set("q",i)),e&&s.set("type",e);const a=await cs(`${tt}${n}?${s}`);return{tunes:(a.tunes||[]).map(o=>({id:o.id,name:o.name,type:o.type,url:o.url})),page:a.page||1,pages:a.pages||1,total:a.total||0}}function Sn(i){const e=(i||"").match(/^([A-G][b#]?)(major|minor|dorian|mixolydian|lydian|phrygian|locrian)?/i);if(!e)return"C";const t=(e[2]||"major").toLowerCase(),s={major:"",minor:"m",dorian:"dor",mixolydian:"mix",lydian:"lyd",phrygian:"phr",locrian:"loc"}[t];return e[1]+s}async function Mn(i){const e=await cs(`${tt}/tunes/${encodeURIComponent(i)}?format=json`),t=(e.type||"").toLowerCase(),s=rs[t]||"4/4",n=yn[t]||"1/4=110",a=(e.settings||[]).map((o,r)=>{const c=String(o.abc||"").replace(/\\r\\n|\\n/g,`
`),h=[`X:${r+1}`,`T:${e.name}`,`R:${t}`,`M:${s}`,"L:1/8",`Q:${n}`,`O:The Session #${e.id} (setting ${r+1})`,`K:${Sn(o.key)}`,c].join(`
`);return{settingId:o.id,key:o.key,abc:h}});return{id:e.id,name:e.name,type:t,url:e.url||`${tt}/tunes/${e.id}`,settings:a}}function $e(i,e){let t=0,s;do s=i.getUint8(e.i++),t=t<<7|s&127;while(s&128);return t}function He(i,e,t){let s="";for(let n=0;n<t;n++)s+=String.fromCharCode(i.getUint8(e+n));return s}function wn(i){const e=new DataView(i);if(He(e,0,4)!=="MThd")throw new Error("Not a MIDI file");const t=e.getUint32(4),s=e.getUint16(10),n=e.getUint16(12);if(n&32768)throw new Error("SMPTE-timed MIDI files are not supported");let a=8+t;const o=[],r={tempo:null,timeSig:null,keySig:null,title:""};for(let c=0;c<s&&a<e.byteLength;c++){const h=He(e,a,4),d=e.getUint32(a+4),l=a+8,u=l+d;if(a=u,h!=="MTrk")continue;const p={i:l};let A=0,D=0;const G=new Map,y=[];let T="",I=null;const z=new Set;for(;p.i<u;){A+=$e(e,p);let g=e.getUint8(p.i);if(g&128)D=g,p.i++;else if(!D)break;const E=D&240,F=D&15;if(D===255){const B=e.getUint8(p.i++),S=$e(e,p);if(B===81&&r.tempo==null){const v=e.getUint8(p.i)<<16|e.getUint8(p.i+1)<<8|e.getUint8(p.i+2);r.tempo=6e7/v}else B===88&&!r.timeSig?r.timeSig={num:e.getUint8(p.i),den:Math.pow(2,e.getUint8(p.i+1))}:B===89&&!r.keySig?r.keySig={sf:e.getInt8(p.i),minor:e.getUint8(p.i+1)===1}:B===3&&(T=He(e,p.i,S),c===0&&!r.title&&(r.title=T));p.i+=S,D=0;continue}if(D===240||D===247){const B=$e(e,p);p.i+=B,D=0;continue}if(E===144||E===128){const B=e.getUint8(p.i++),S=e.getUint8(p.i++),v=F*128+B;if(E===144&&S>0)G.has(v)||G.set(v,{start:A,vel:S});else{const b=G.get(v);b&&(y.push({midi:B,start:b.start,end:A,ch:F,vel:b.vel}),G.delete(v))}z.add(F)}else if(E===160||E===176||E===224)p.i+=2;else if(E===192)I=e.getUint8(p.i++);else if(E===208)p.i+=1;else break}if(y.length>0){y.sort((E,F)=>E.start-F.start||F.midi-E.midi);const g=z.has(9)&&z.size===1;o.push({index:c,name:T||`Track ${c+1}`,notes:y,program:I,isDrums:g})}}return{division:n,tracks:o,meta:r}}const Tn=["Piano","Chromatic Perc.","Organ","Guitar","Bass","Strings","Ensemble","Brass","Reed","Pipe","Synth Lead","Synth Pad","Synth FX","Ethnic","Percussive","SFX"];function Ln(i){const e=i.tracks.filter(n=>!n.isDrums).map(n=>{const a=n.notes.reduce((r,c)=>r+c.midi,0)/n.notes.length,o=n.program!=null?Tn[Math.floor(n.program/8)]:"";return{index:n.index,name:n.name,family:o,count:n.notes.length,avgPitch:a}});let t=null,s=-1/0;for(const n of e){let a=Math.log(n.count+1)*2-Math.abs(n.avgPitch-72)*.15;/lead|melody|vocal|voice|violin|fiddle|solo/i.test(n.name)&&(a+=4),["Synth Lead","Strings","Reed","Pipe","Brass"].includes(n.family)&&(a+=1.5),n.family==="Bass"&&(a-=4),a>s&&(s=a,t=n.index)}return{tracks:e,suggested:t}}function kn(i,e,t){const s=i.tracks.find(b=>b.index===e);if(!s)throw new Error("Track not found");const n=i.division,a=n/8,o=[];for(const b of s.notes){if(b.end-b.start<a)continue;const w=o[o.length-1];if(w&&Math.abs(w.start-b.start)<n/16){b.midi>w.midi&&Object.assign(w,b);continue}o.push({...b})}for(let b=0;b<o.length-1;b++)o[b].end>o[b+1].start&&(o[b].end=o[b+1].start);const r=n/4,c=b=>Math.round(b/r)*r,h=[];for(const b of o){const w=c(b.start),O=Math.max(w+r,c(b.end)),f=h[h.length-1];f&&f.startTick===w||(f&&f.endTick>w&&(f.endTick=w),h.push({midi:b.midi,startTick:w,endTick:O}))}const d=i.meta.timeSig||{num:4,den:4},l=n*d.num*(4/d.den),p=(h.length?Math.floor(h[0].startTick/l):0)*l,A=h.map((b,w)=>({midi:b.midi,start:(b.startTick-p)/n,dur:Math.max(.0625,(b.endTick-b.startTick)/n),i:w})),D=A.length?Math.ceil((A[A.length-1].start+A[A.length-1].dur)/(l/n))*(l/n):l/n,G=l/n,y={num:d.num,den:d.den,text:`${d.num}/${d.den}`},T=[],I=[],z=Math.round(D/G);for(let b=0;b<z;b++){const O=`Part ${Math.floor(b/8)+1}`;T.push({start:b*G,dur:G,section:O,sectionKey:O,meter:y})}for(let b=0;b*8<z;b++){const w=b*8,O=Math.min(z,w+8);I.push({key:`Part ${b+1}`,name:`Part ${b+1}`,start:w*G,end:O*G,barStart:w,barEnd:O})}for(const b of A)b.bar=Math.min(z-1,Math.floor(b.start/G+1e-6));const g=i.meta.keySig,E=["Cb","Gb","Db","Ab","Eb","Bb","F","C","G","D","A","E","B","F#","C#"],F={C:0,"C#":1,Db:1,D:2,Eb:3,E:4,F:5,"F#":6,Gb:6,G:7,Ab:8,A:9,Bb:10,B:11,Cb:11},B=["F","C","G","D","A","E","B"],S=["B","E","A","D","G","C","F"];let v={tonic:"C",mode:"maj",accidentals:{},tonicPc:0,label:"C"};if(g){const b=E[g.sf+7]||"C",w={};g.sf>0&&B.slice(0,g.sf).forEach(_=>{w[_]=1}),g.sf<0&&S.slice(0,-g.sf).forEach(_=>{w[_]=-1});const O=g.minor?(F[b]+9)%12:F[b],f=["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"];v={tonic:f[O],mode:g.minor?"min":"maj",accidentals:w,tonicPc:O,label:f[O]+(g.minor?"m":"")}}return{title:t||i.meta.title||s.name||"Imported MIDI",composer:"",origin:"Imported MIDI",rhythm:"",meter:y,key:v,tempo:Math.round(i.meta.tempo||120),notes:A,bars:T,sections:I,chords:[],totalBeats:D}}function m(i,e,t){const s=document.createElement(i);return e&&(s.className=e),t!=null&&(s.textContent=t),s}function Tt(i){const e=Math.floor(i/60),t=Math.round(i%60);return`${e}:${String(t).padStart(2,"0")}`}const xn=["Beginner","Easy","Intermediate","Advanced","Expert"];class zn{constructor(e){this.container=e,this.onPlay=null,this.tuningKey=Ge,this._view="library",this._query="",this._genre="All",this._difficulty="All",this._sort="recommended",this._selected=null,this._metaCache=new Map,this._build(),this.refresh()}setTuning(e){!ee[e]||e===this.tuningKey||(this.tuningKey=e,this._metaCache.clear(),this.tuningDropdown&&(this.tuningDropdown.value=e),this.refresh())}_meta(e){const t=`${e.id}|${this.tuningKey}`;let s=this._metaCache.get(t);if(!s){try{s=bn(e,this.tuningKey)}catch(n){console.warn("Bad song",e.id,n),s=null}this._metaCache.set(t,s)}return s}_build(){const e=m("div","sb-root");this.root=e;const t=m("div","sb-top"),s=m("div","sb-brand");s.append(m("div","sb-brand-title","Song Play"),m("div","sb-brand-sub","Pick a song · play along · level up")),t.appendChild(s);const n=m("div","sb-tabs");this._tabBtns={};for(const[h,d]of[["library","Library"],["mine","My Songs"],["online","Find Online"],["import","Import"]]){const l=m("button","sb-tab",d);l.addEventListener("click",()=>{this._view!==h&&(this._query=""),this._view=h,this.refresh()}),n.appendChild(l),this._tabBtns[h]=l}t.appendChild(n);const a=m("div","sb-tuning");a.append(m("span","sb-label","Instrument"));const o=m("div","sb-dd");this.tuningDropdown=new Q(o,{placeholder:"Tuning"});const r={};for(const[h,d]of Object.entries(ee))(r[d.family]=r[d.family]||[]).push({value:h,label:d.label});this.tuningDropdown.setGroupedItems(Object.entries(r).map(([h,d])=>({label:h,items:d}))),this.tuningDropdown.value=this.tuningKey,this.tuningDropdown.onChange=h=>this.setTuning(h),a.appendChild(o),t.appendChild(a),e.appendChild(t),this.inputSlot=m("div","sb-input-slot"),e.appendChild(this.inputSlot);const c=m("div","sb-body");this.listPane=m("div","sb-list-pane"),this.detailPane=m("div","sb-detail-pane"),c.append(this.listPane,this.detailPane),e.appendChild(c),this.container.appendChild(e)}refresh(){for(const[e,t]of Object.entries(this._tabBtns))t.classList.toggle("active",e===this._view);this.listPane.replaceChildren(),this._view==="library"||this._view==="mine"?this._renderList():this._view==="online"?this._renderOnline():this._renderImport(),this._renderDetail()}_renderList(){const e=this.listPane,t=this._view==="mine",s=m("div","sb-filters"),n=m("input","sb-search");n.type="search",n.placeholder=t?"Search my songs…":"Search songs, composers, origins…",n.value=this._query,n.addEventListener("input",()=>{this._query=n.value,this._renderCards(d,t)}),s.appendChild(n);const a=m("div","sb-filter-row"),o=m("div","sb-dd sb-dd--small"),r=new Q(o,{placeholder:"Difficulty"});r.setItems([{value:"All",label:"All levels"},...xn.map(l=>({value:l,label:l}))]),r.value=this._difficulty,r.onChange=l=>{this._difficulty=l,this._renderCards(d,t)};const c=m("div","sb-dd sb-dd--small"),h=new Q(c,{placeholder:"Sort"});if(h.setItems([{value:"recommended",label:"Recommended"},{value:"title",label:"Title A–Z"},{value:"easy",label:"Easiest first"},{value:"hard",label:"Hardest first"},{value:"mastery",label:"Mastery"},{value:"recent",label:"Recently played"},{value:"short",label:"Shortest"}]),h.value=this._sort,h.onChange=l=>{this._sort=l,this._renderCards(d,t)},a.append(o,c),s.appendChild(a),!t){const l=m("div","sb-chips");for(const u of["All",...Us]){const p=m("button","sb-chip",u);p.classList.toggle("active",this._genre===u),p.addEventListener("click",()=>{this._genre=u,l.querySelectorAll(".sb-chip").forEach(A=>A.classList.toggle("active",A===p)),this._renderCards(d,t)}),l.appendChild(p)}s.appendChild(l)}e.appendChild(s),this._countEl=m("div","sb-count"),e.appendChild(this._countEl);const d=m("div","sb-cards");e.appendChild(d),this._renderCards(d,t)}_filteredSongs(e){const t=this._query.trim().toLowerCase();let s=wt().filter(o=>e?o.source==="user":o.source==="builtin");const n=[];for(const o of s){const r=this._meta(o);if(r&&!(!e&&this._genre!=="All"&&o.genre!==this._genre)&&!(this._difficulty!=="All"&&r.difficulty.label!==this._difficulty)){if(t){const c=`${r.title} ${r.composer} ${o.genre} ${r.key} ${r.rhythm}`.toLowerCase();if(!t.split(/\s+/).every(h=>c.includes(h)))continue}n.push({song:o,meta:r,progress:Ze(o.id)})}}const a={recommended:(o,r)=>(r.progress.lastPlayed?1:0)-(o.progress.lastPlayed?1:0)||o.meta.difficulty.score-r.meta.difficulty.score,title:(o,r)=>o.meta.title.localeCompare(r.meta.title),easy:(o,r)=>o.meta.difficulty.score-r.meta.difficulty.score,hard:(o,r)=>r.meta.difficulty.score-o.meta.difficulty.score,mastery:(o,r)=>(r.progress.mastery||0)-(o.progress.mastery||0),recent:(o,r)=>(r.progress.lastPlayed||0)-(o.progress.lastPlayed||0),short:(o,r)=>o.meta.duration-r.meta.duration}[this._sort];return n.sort(a),n}_renderCards(e,t){var a;e.replaceChildren();const s=this._filteredSongs(t);if(this._countEl.textContent=`${s.length} song${s.length===1?"":"s"}`,s.length===0){e.appendChild(m("div","sb-empty",t?'No songs yet. Use "Find Online" or "Import" to add tunes, or load a MIDI file of any song you own.':"No songs match these filters."));return}const n=document.createDocumentFragment();for(const{song:o,meta:r,progress:c}of s){const h=m("button","sb-card");((a=this._selected)==null?void 0:a.id)===o.id&&h.classList.add("selected"),h.addEventListener("click",()=>{this._selected=o,e.querySelectorAll(".sb-card").forEach(T=>T.classList.toggle("selected",T===h)),this._renderDetail(),this.root.classList.add("detail-open")});const d=m("div","sb-ring"),l=Math.min(110,c.mastery||0);d.style.setProperty("--pct",String(Math.min(100,l))),d.appendChild(m("span",null,`${l}%`)),l>=100&&d.classList.add("mastered");const u=m("div","sb-card-info");u.append(m("div","sb-card-title",r.title)),u.append(m("div","sb-card-sub",r.composer||o.genre));const p=m("div","sb-card-tags");p.append(m("span","sb-pill sb-pill--genre",o.genre)),p.append(m("span","sb-pill",`${r.key} · ${r.meter}`)),p.append(m("span","sb-pill",Tt(r.duration))),u.appendChild(p);const A=m("div","sb-diff"),D=m("div","sb-diff-bars"),G=Math.ceil(r.difficulty.score/2);for(let T=1;T<=5;T++)D.appendChild(m("span",T<=G?"on":""));A.append(D,m("div","sb-diff-label",r.difficulty.label));const y=Object.values(c.medal||{});if(y.length){const T=["platinum","gold","silver","bronze"].find(I=>y.includes(I));A.appendChild(m("div",`sb-medal-dot sb-medal-dot--${T}`,"●"))}h.append(d,u,A),n.appendChild(h)}e.appendChild(n)}_renderDetail(){var ge,De,he,Dt;const e=this.detailPane;e.replaceChildren();const t=this._selected;if(!t){const x=m("div","sb-detail-empty");x.append(m("div","sb-detail-empty-title","Choose a song")),x.append(m("p",null,"Notes fly toward you on a 3D highway: colours are strings, numbers are fingers. Play them in tune and on time. In Learn a Song mode the difficulty adapts phrase by phrase as you improve.")),e.appendChild(x);return}let s,n;try{s=Me(t,this.tuningKey),n=this._meta(t)}catch(x){e.appendChild(m("div","sb-error",`This song could not be loaded: ${x.message}`));return}const a=Ze(t.id),o=m("button","sb-detail-close","←  Songs");o.addEventListener("click",()=>this.root.classList.remove("detail-open")),e.appendChild(o),e.append(m("h2","sb-detail-title",n.title)),e.append(m("div","sb-detail-sub",[n.composer,t.genre].filter(Boolean).join(" · ")));const r=m("div","sb-stats"),c=(x,P)=>{const q=m("div","sb-stat");q.append(m("div","sb-stat-v",P),m("div","sb-stat-l",x)),r.appendChild(q)};c("Difficulty",`${n.difficulty.score}/10`),c("Notes",String(n.notes)),c("Length",Tt(n.duration)),c("Tempo",`♩=${n.tempo}`),c("Key",n.key),c("Positions",n.maxPosition>1?`1st–${n.maxPosition}${["","st","nd","rd"][n.maxPosition]||"th"}`:"1st"),e.appendChild(r),s.transpose&&e.appendChild(m("div","sb-note",`Transposed ${s.transpose>0?"up":"down"} ${Math.abs(s.transpose/12)} octave${Math.abs(s.transpose)>12?"s":""} to fit ${ee[this.tuningKey].label}.`));const h=m("div","sb-progress"),d=m("div","sb-mastery");d.append(m("div","sb-mastery-label","Mastery"));const l=m("div","sb-mastery-bar"),u=m("div","sb-mastery-fill");u.style.width=`${Math.min(100,a.mastery||0)/1.1}%`,(a.mastery||0)>100&&u.classList.add("over"),l.appendChild(u),d.append(l,m("div","sb-mastery-val",`${a.mastery||0}%`)),h.appendChild(d);const p=m("div","sb-levels");for(const x of s.phrases){const P=x.name.replace(" (repeat)",""),q=((ge=a.phraseLevels)==null?void 0:ge[P])??0,ne=(De=a.phraseMastered)==null?void 0:De[P],Pe=m("div","sb-level");Pe.title=`${x.name}: level ${q}/${W}${ne?" (mastered)":""}`;const Re=m("div","sb-level-fill");Re.style.height=`${20+q/W*80}%`,ne&&Re.classList.add("mastered"),Pe.appendChild(Re),p.appendChild(Pe)}h.appendChild(p);const A=m("div","sb-best"),D=a.bestScore||{},G=["easy","medium","hard","master"].filter(x=>D[x]).map(x=>{var P;return`${x[0].toUpperCase()+x.slice(1)} ${D[x].toLocaleString()}${(P=a.medal)!=null&&P[x]?` (${a.medal[x]})`:""}`}).join(" · ");A.textContent=`Plays: ${a.plays||0} · Best accuracy: ${a.bestAccuracy||0}% · Best streak: ${a.bestStreak||0}${G?` · ${G}`:""}`,h.appendChild(A),e.appendChild(h);const y=m("div","sb-modes"),T=m("div","sb-mode");T.append(m("div","sb-mode-title","Learn a Song")),T.append(m("div","sb-mode-desc","Starts simple. Each phrase you nail adds more notes, until you are playing every note. Mastered phrases fade out (Master Mode) so you play from memory."));const I=m("button","sb-btn sb-btn-primary","Play");I.addEventListener("click",()=>{var x;return(x=this.onPlay)==null?void 0:x.call(this,t,s,{mode:"learn"})}),T.appendChild(I),y.appendChild(T);const z=m("div","sb-mode");z.append(m("div","sb-mode-title","Score Attack")),z.append(m("div","sb-mode-desc","Fixed difficulty. Build streaks for a ×4 multiplier. Miss three notes in a row and you take a strike. Too many strikes and the song ends."));const g=m("div","sb-btn-row");for(const[x,P]of[["easy","Easy"],["medium","Medium"],["hard","Hard"],["master","Master"]]){const q=m("button","sb-btn",P);x==="master"&&!(((he=a.medal)==null?void 0:he.hard)==="gold"||((Dt=a.medal)==null?void 0:Dt.hard)==="platinum")&&(q.title="Tip: earn Gold on Hard first. Master hides the notes as they approach."),q.addEventListener("click",()=>{var ne;return(ne=this.onPlay)==null?void 0:ne.call(this,t,s,{mode:"score",difficulty:x})}),g.appendChild(q)}z.appendChild(g),y.appendChild(z);const E=m("div","sb-mode");E.append(m("div","sb-mode-title","Riff Repeater")),E.append(m("div","sb-mode-desc","Loop any phrases at your own speed and level. Speed Trainer adds 5% each time you clear a loop with 90% accuracy."));const F=m("div","sb-riff-grid"),B=s.phrases.map((x,P)=>({value:String(P),label:`${P+1}. ${x.name}`})),S=m("div","sb-dd sb-dd--small"),v=new Q(S,{placeholder:"From"});v.setItems(B),v.value="0";const b=m("div","sb-dd sb-dd--small"),w=new Q(b,{placeholder:"To"});w.setItems(B),w.value=String(Math.min(s.phrases.length-1,1));const O=m("div","sb-dd sb-dd--small"),f=new Q(O,{placeholder:"Level"});f.setItems([{value:"dynamic",label:"Dynamic"},...Array.from({length:W+1},(x,P)=>({value:String(P),label:P===W?`Level ${P} (all notes)`:`Level ${P}`}))]),f.value=String(W);const _=(x,P)=>{const q=m("label","sb-field");return q.append(m("span","sb-label",x),P),q};F.append(_("From",S),_("To",b),_("Level",O));const M=m("label","sb-field sb-field--wide");M.append(m("span","sb-label","Speed"));const N=m("input");N.type="range",N.min="25",N.max="125",N.step="5",N.value="70";const X=m("span","sb-speed-val","70%");N.addEventListener("input",()=>{X.textContent=`${N.value}%`}),M.append(N,X),F.appendChild(M);const $=m("label","sb-check"),j=m("input");j.type="checkbox",j.checked=!0,$.append(j,m("span",null,"Speed Trainer")),F.appendChild($),E.appendChild(F);const te=m("button","sb-btn sb-btn-primary","Start loop");te.addEventListener("click",()=>{var ne;let x=Number(v.value||0),P=Number(w.value||0);P<x&&([x,P]=[P,x]);const q=f.value==="dynamic"?"dynamic":Number(f.value);(ne=this.onPlay)==null||ne.call(this,t,s,{mode:"riff",riff:{from:x,to:P,level:q,speed:Number(N.value),trainer:j.checked}})}),E.appendChild(te),y.appendChild(E),e.appendChild(y);const H=m("div","sb-detail-foot"),ye=m("button","sb-link","Reset progress");if(ye.addEventListener("click",()=>{confirm(`Reset all progress for "${n.title}"?`)&&(En(t.id),this.refresh())}),H.appendChild(ye),t.source==="user"){const x=m("button","sb-link sb-link--danger","Remove from My Songs");x.addEventListener("click",()=>{confirm(`Remove "${n.title}"?`)&&(Cn(t.id),this._selected=null,this.refresh())}),H.appendChild(x)}if(t.abc){const x=m("button","sb-link","View ABC");x.addEventListener("click",()=>{const P=m("pre","sb-abc",t.abc);x.replaceWith(P)}),H.appendChild(x)}e.appendChild(H)}openRiff(e,t,s){var a;const n=Me(e,this.tuningKey);(a=this.onPlay)==null||a.call(this,e,n,{mode:"riff",riff:{from:t,to:s,level:W,speed:70,trainer:!0}})}_renderOnline(){const e=this.listPane,t=m("div","sb-online");t.append(m("div","sb-online-title","Search The Session")),t.append(m("p","sb-muted","Tens of thousands of traditional Irish, Scottish and other folk tunes, transcribed by the community at thesession.org. Search by name, or leave the box empty to browse the most popular tunes."));const s=m("div","sb-online-row"),n=m("input","sb-search");n.type="search",n.placeholder="e.g. Drowsy Maggie, Kesh, Butterfly…",n.value=this._onlineQuery||"";const a=m("div","sb-dd sb-dd--small"),o=new Q(a,{placeholder:"Any type"});o.setItems([{value:"",label:"Any type"},...vn.map(l=>({value:l,label:l[0].toUpperCase()+l.slice(1)}))]),o.value=this._onlineType||"";const r=m("button","sb-btn sb-btn-primary","Search");s.append(n,a,r),t.appendChild(s);const c=m("div","sb-online-results");t.appendChild(c);const h=m("div","sb-credit");h.innerHTML='Contains information from <a href="https://thesession.org" target="_blank" rel="noopener">The Session</a>, made available under the <a href="https://opendatacommons.org/licenses/odbl/" target="_blank" rel="noopener">Open Database License (ODbL)</a>.',t.appendChild(h),e.appendChild(t);const d=async(l=1)=>{this._onlineQuery=n.value.trim(),this._onlineType=o.value,c.replaceChildren(m("div","sb-muted","Searching…"));try{const u=await _n(this._onlineQuery,{type:this._onlineType,page:l});c.replaceChildren(),c.appendChild(m("div","sb-count",`${u.total.toLocaleString()} tunes · page ${u.page} of ${u.pages}`));for(const A of u.tunes){const D=m("div","sb-online-item");D.append(m("div","sb-online-name",A.name),m("span","sb-pill",A.type));const G=m("button","sb-btn","Open");G.addEventListener("click",()=>this._openSessionTune(A.id,D)),D.appendChild(G),c.appendChild(D)}const p=m("div","sb-btn-row");if(u.page>1){const A=m("button","sb-btn","← Prev");A.addEventListener("click",()=>d(u.page-1)),p.appendChild(A)}if(u.page<u.pages){const A=m("button","sb-btn","Next →");A.addEventListener("click",()=>d(u.page+1)),p.appendChild(A)}c.appendChild(p)}catch(u){c.replaceChildren(m("div","sb-error",`Could not reach The Session (${u.message}). Check your internet connection.`))}};r.addEventListener("click",()=>d(1)),n.addEventListener("keydown",l=>{l.key==="Enter"&&d(1)}),this._onlineAutoRun!==!1&&(this._onlineAutoRun=!1,d(1))}async _openSessionTune(e,t){const s=m("div","sb-online-settings");s.textContent="Loading…",t.after(s);try{const n=await Mn(e);s.replaceChildren(),s.appendChild(m("div","sb-muted",`${n.settings.length} setting${n.settings.length===1?"":"s"}. Each one is a different transcription:`)),n.settings.slice(0,12).forEach((o,r)=>{const c=m("div","sb-online-setting");let h="";try{const l=Ye(o.abc),u=Me({id:`session-${e}-${o.settingId}`,abc:o.abc},this.tuningKey);h=`${l.key.label} · ${u.notes.length} notes · ${u.difficulty.label}`}catch{h="unparseable"}c.append(m("span",null,`Setting ${r+1}`),m("span","sb-muted",h));const d=m("button","sb-btn sb-btn-primary","Add to My Songs");d.addEventListener("click",()=>{const l=Qe({title:n.name,abc:o.abc,origin:`The Session #${n.id}`});this._selected=l,this._view="mine",this.refresh(),this.root.classList.add("detail-open")}),c.appendChild(d),s.appendChild(c)});const a=m("a","sb-link","View on thesession.org ↗");a.href=n.url,a.target="_blank",a.rel="noopener",s.appendChild(a)}catch(n){s.textContent=`Failed to load tune: ${n.message}`}}_renderImport(){const e=this.listPane,t=m("div","sb-import");t.append(m("div","sb-online-title","Import songs")),t.append(m("p","sb-muted","Bring your own music. Load a MIDI file (any song you own: rock, pop, film, games…) and pick the melody track. Or paste or load ABC notation from sites like abcnotation.com. Imported songs stay in this browser under My Songs."));const s=m("div","sb-file-row"),n=m("input");n.type="file",n.accept=".mid,.midi,.abc,.txt,audio/midi,audio/x-midi",n.id="sb-file-input";const a=m("label","sb-btn sb-btn-primary","Choose MIDI / ABC file…");a.htmlFor="sb-file-input",s.append(a,n),t.appendChild(s);const o=m("div","sb-import-out");t.appendChild(o),n.addEventListener("change",async()=>{var l;const d=(l=n.files)==null?void 0:l[0];if(d){o.replaceChildren();try{if(/\.(mid|midi)$/i.test(d.name)){const u=await d.arrayBuffer(),p=wn(u),{tracks:A,suggested:D}=Ln(p);if(A.length===0)throw new Error("No melodic tracks found");o.appendChild(m("div","sb-muted","Pick the track to play (the likely melody is highlighted):"));const G=d.name.replace(/\.(mid|midi)$/i,"");for(const y of A){const T=m("div","sb-online-setting");y.index===D&&T.classList.add("suggested"),T.append(m("span",null,y.name),m("span","sb-muted",`${y.family||"Instrument"} · ${y.count} notes`));const I=m("button","sb-btn sb-btn-primary","Add");I.addEventListener("click",()=>{const z=kn(p,y.index,`${G}${A.length>1?` (${y.name})`:""}`),g=Qe({title:z.title,parsed:z,origin:"MIDI import"});this._selected=g,this._view="mine",this.refresh(),this.root.classList.add("detail-open")}),T.appendChild(I),o.appendChild(T)}}else{const u=await d.text();this._importAbcText(u,o)}}catch(u){o.appendChild(m("div","sb-error",`Import failed: ${u.message}`))}n.value=""}}),t.appendChild(m("div","sb-label sb-label--block","Paste ABC notation"));const r=m("textarea","sb-abc-input");r.placeholder=`X:1
T:My Tune
M:4/4
L:1/8
Q:1/4=100
K:D
|:DEFG A2 FA|...`,r.rows=9,t.appendChild(r);const c=m("div","sb-import-out"),h=m("button","sb-btn sb-btn-primary","Add tune(s)");h.addEventListener("click",()=>this._importAbcText(r.value,c)),t.append(h,c),e.appendChild(t)}_importAbcText(e,t){t.replaceChildren();const s=en(e);if(s.length===0){t.appendChild(m("div","sb-error","No ABC tunes found. A tune needs at least a K: (key) line."));return}let n=0,a=null;for(const o of s)try{const r=Ye(o);if(r.notes.length<2)throw new Error("no notes");a=Qe({title:r.title,abc:o,origin:"ABC import"}),n++}catch(r){t.appendChild(m("div","sb-error",`Skipped a tune: ${r.message}`))}n&&(t.appendChild(m("div","sb-ok",`Added ${n} tune${n===1?"":"s"} to My Songs.`)),this._selected=a,this._view="mine",this.refresh(),this.root.classList.add("detail-open"))}findSong(e){return wt().find(t=>t.id===e)||null}updateProgress(){this._view==="library"||this._view==="mine"?this.refresh():this._renderDetail()}static parsedFor(e){return dt(e)}}const On=[[/^(maj7|M7)/,[0,4,7,11]],[/^(m7|min7|-7)/,[0,3,7,10]],[/^(dim|°)/,[0,3,6]],[/^(aug|\+)/,[0,4,8]],[/^(sus4|sus)/,[0,5,7]],[/^sus2/,[0,2,7]],[/^(m|min|-)/,[0,3,7]],[/^7/,[0,4,7,10]],[/^6/,[0,4,7,9]],[/^/,[0,4,7]]],In={C:0,D:2,E:4,F:5,G:7,A:9,B:11};function Nn(i){const e=(i||"").match(/^([A-G])([#b]?)(.*)$/);if(!e)return null;const t=(In[e[1]]+(e[2]==="#"?1:e[2]==="b"?-1:0)+12)%12,s=e[3];for(const[n,a]of On)if(n.test(s))return{root:t,intervals:a};return{root:t,intervals:[0,4,7]}}class Lt{constructor(e){this.ctx=e,this.master=e.createGain(),this.master.gain.value=.8,this.master.connect(e.destination),this.guideBus=e.createGain(),this.backingBus=e.createGain(),this.clickBus=e.createGain();for(const t of[this.guideBus,this.backingBus,this.clickBus])t.connect(this.master);this._active=new Set}setVolumes({guide:e,backing:t,click:s}){const n=this.ctx.currentTime;e!=null&&this.guideBus.gain.setTargetAtTime(e,n,.02),t!=null&&this.backingBus.gain.setTargetAtTime(t,n,.02),s!=null&&this.clickBus.gain.setTargetAtTime(s,n,.02)}_track(e,t){this._active.add(e),e.onended=()=>this._active.delete(e),e.stop(t)}note(e,t,s,n=.25){const a=this.ctx,o=oe(e),r=a.createOscillator();r.type="sawtooth",r.frequency.value=o;const c=a.createOscillator(),h=a.createGain();c.frequency.value=5.5,h.gain.setValueAtTime(0,t),h.gain.linearRampToValueAtTime(o*.006,t+Math.min(.35,s)),c.connect(h).connect(r.frequency);const d=a.createBiquadFilter();d.type="lowpass",d.frequency.value=Math.min(5e3,o*5),d.Q.value=.8;const l=a.createGain(),u=Math.max(.06,s*.95);l.gain.setValueAtTime(1e-4,t),l.gain.linearRampToValueAtTime(n,t+.04),l.gain.setTargetAtTime(n*.75,t+.05,.1),l.gain.setTargetAtTime(1e-4,t+u,.04),r.connect(d).connect(l).connect(this.guideBus),r.start(t),c.start(t),this._track(r,t+u+.3),this._track(c,t+u+.3)}chord(e,t,s){const n=Nn(e);if(!n)return;const a=this.ctx,o=Math.max(.2,s);for(const h of n.intervals){const d=55+(n.root+h-7+12)%12+0,l=a.createOscillator();l.type="triangle",l.frequency.value=oe(d);const u=a.createGain();u.gain.setValueAtTime(1e-4,t),u.gain.linearRampToValueAtTime(.07,t+.08),u.gain.setTargetAtTime(1e-4,t+o-.05,.08),l.connect(u).connect(this.backingBus),l.start(t),this._track(l,t+o+.4)}const r=a.createOscillator();r.type="sine",r.frequency.value=oe(36+n.root);const c=a.createGain();c.gain.setValueAtTime(1e-4,t),c.gain.linearRampToValueAtTime(.35,t+.01),c.gain.setTargetAtTime(1e-4,t+.05,Math.min(.5,o/2)),r.connect(c).connect(this.backingBus),r.start(t),this._track(r,t+o+.4)}drone(e,t,s){const n=this.ctx;for(const a of[43+(e-7+12)%12,50+(e-2+12)%12]){const o=n.createOscillator();o.type="triangle",o.frequency.value=oe(a);const r=n.createGain();r.gain.setValueAtTime(1e-4,t),r.gain.linearRampToValueAtTime(.06,t+.3),r.gain.setTargetAtTime(1e-4,t+s,.2),o.connect(r).connect(this.backingBus),o.start(t),this._track(o,t+s+1)}}click(e,t=!1,s=null){const n=this.ctx,a=n.createOscillator();a.type="square",a.frequency.value=t?1600:1100;const o=n.createGain();if(o.gain.setValueAtTime(t?.35:.2,e),o.gain.exponentialRampToValueAtTime(1e-4,e+.04),s!=null){const r=n.createGain();r.gain.value=s,a.connect(o).connect(r).connect(this.master)}else a.connect(o).connect(this.clickBus);a.start(e),this._track(a,e+.05)}stopAll(){for(const e of this._active)try{e.stop()}catch{}this._active.clear()}dispose(){this.stopAll(),this.master.disconnect()}}const Kn={C:"#3ddc84",G:"#ff8c1a",D:"#2e8fff",A:"#ffd23f",E:"#ff3b55",B:"#b061ff","F#":"#ff5fd2","C#":"#3ddcc4",F:"#ff5fd2"},kt=["#ff8c1a","#2e8fff","#ffd23f","#ff3b55","#b061ff","#3ddc84"],We=2.6,Pn=.16,xt=.14,Ee={easy:{label:"Easy",level:1,strikes:5},medium:{label:"Medium",level:3,strikes:4},hard:{label:"Hard",level:W,strikes:3},master:{label:"Master",level:W,strikes:3,fade:!0}};function Rn(i,e){return Kn[i==null?void 0:i.name]||kt[e%kt.length]}function C(i,e,t){const s=document.createElement(i);return e&&(s.className=e),t!=null&&(s.textContent=t),s}function zt(i){i=Math.max(0,i);const e=Math.floor(i/60),t=Math.floor(i%60);return`${e}:${String(t).padStart(2,"0")}`}function ue(i){return i.name.replace(" (repeat)","")}class Xn{constructor(e,t){this.container=e,this.deps=t,this.onExit=null,this.onRiffRequest=null,this.settings=Mt(),this._state="idle",this._freq=null,this._freqTime=0,this._raf=null,this._particles=[],this._popups=[],this._synth=null,this._cam=0,this._build(),this._onKey=s=>this._handleKey(s),this._onVisibility=()=>{document.hidden&&this._state==="playing"&&this.pause()},document.addEventListener("visibilitychange",this._onVisibility)}get active(){return this._state==="playing"||this._state==="tuning"||this._state==="paused"}_build(){const e=C("div","sp-root");this.root=e;const t=C("div","sp-hud"),s=C("div","sp-hud-left");this.hudTitle=C("div","sp-title"),this.hudSub=C("div","sp-sub"),s.append(this.hudTitle,this.hudSub);const n=C("div","sp-hud-stats"),a=l=>{const u=C("div","sp-stat"),p=C("div","sp-stat-value","0");return u.append(p,C("div","sp-stat-label",l)),n.appendChild(u),{box:u,v:p}};this.stScore=a("Score"),this.stMult=a("Multiplier"),this.stStreak=a("Streak"),this.stAcc=a("Accuracy"),this.stStrikes=a("Strikes"),t.append(s,n),this.timeline=C("canvas","sp-timeline");const o=C("div","sp-stage");this.canvas=C("canvas","sp-canvas"),o.appendChild(this.canvas),this.stage=o,this.overlay=C("div","sp-overlay hidden"),o.appendChild(this.overlay);const r=C("div","sp-controls");this.btnPause=C("button","sp-btn sp-btn-primary","Pause"),this.btnPause.addEventListener("click",()=>this._state==="paused"?this.resume():this.pause()),this.btnRestart=C("button","sp-btn","Restart"),this.btnRestart.addEventListener("click",()=>this.restart()),this.btnExit=C("button","sp-btn","Library"),this.btnExit.addEventListener("click",()=>this.exit());const c=C("label","sp-speed");c.append(C("span",null,"Speed")),this.speedInput=C("input"),this.speedInput.type="range",this.speedInput.min="25",this.speedInput.max="125",this.speedInput.step="5",this.speedInput.value="100",this.speedVal=C("span","sp-speed-val","100%"),this.speedInput.addEventListener("input",()=>this._setSpeed(Number(this.speedInput.value)/100)),c.append(this.speedInput,this.speedVal);const h=C("div","sp-toggles"),d=(l,u)=>{const p=C("button","sp-chip",u);p.setAttribute("aria-pressed",String(!!this.settings[l])),p.addEventListener("click",()=>{this.settings[l]=!this.settings[l],p.setAttribute("aria-pressed",String(this.settings[l])),Se(this.settings),this._applyVolumes()}),h.appendChild(p)};d("guide","Guide melody"),d("backing","Backing"),d("click","Click"),d("showNoteNames","Note names"),r.append(this.btnPause,this.btnRestart,c,h,this.btnExit),e.append(t,this.timeline,o,r),this.container.appendChild(e),this._ro=new ResizeObserver(()=>this._resize()),this._ro.observe(o),this._ro.observe(this.timeline)}_resize(){const e=window.devicePixelRatio||1,t=this.stage.getBoundingClientRect();this._w=Math.max(200,t.width),this._h=Math.max(160,t.height),this.canvas.width=Math.round(this._w*e),this.canvas.height=Math.round(this._h*e),this.canvas.style.width=this._w+"px",this.canvas.style.height=this._h+"px",this._dpr=e;const s=this.timeline.getBoundingClientRect();this.timeline.width=Math.round(Math.max(100,s.width)*e),this.timeline.height=Math.round(Math.max(10,s.height)*e)}start(e,t,s){var c,h;this.song=e,this.chart=t,this.opts={mode:"learn",difficulty:"hard",...s},this.settings=Mt(),this.progress=Ze(e.id),this.preset=ee[t.tuningKey],this.beatSec=60/t.tempo,this.notes=t.notes.map((d,l)=>({...d,i:l,sec:d.start*this.beatSec,durSec:d.dur*this.beatSec})),this.phrases=t.phrases.map(d=>({...d,sec:d.start*this.beatSec,endSec:d.end*this.beatSec})),this.endSec=t.totalBeats*this.beatSec;{const d=t.meter,l=d.num%3===0&&d.num>3;this._clickSec=(l?3*(4/d.den):4/d.den)*this.beatSec;const u=d.num*(4/d.den)*this.beatSec,p=Math.round(u/this._clickSec);this._countInSec=p>=3?u:u*2}this._barStartSecs=new Set(t.bars.map(d=>Math.round(d.start*this.beatSec*1e3)));const n=this.opts.mode;let a=1;n==="riff"&&(a=(((c=this.opts.riff)==null?void 0:c.speed)??100)/100),this.speedInput.value=String(Math.round(a*100)),this.speedVal.textContent=`${Math.round(a*100)}%`,this.speed=a,this.title=e.title||t.title,this.hudTitle.textContent=this.title;const o=n==="learn"?"Learn a Song":n==="score"?`Score Attack · ${Ee[this.opts.difficulty].label}`:"Riff Repeater";this.hudSub.textContent=`${o} · ${t.key.label} · ${t.meter.text} · ♩=${Math.round(t.tempo)}`,this.stMult.box.style.display=n==="score"?"":"none",this.stStrikes.box.style.display=n==="score"?"":"none",this.stScore.box.style.display=n==="learn"?"none":"",document.addEventListener("keydown",this._onKey),this._resize();const r=this.deps.getCtx();(h=r==null?void 0:r.resume)==null||h.call(r),this._resetRun(),this._pausedAt=null,this._anchorSong=0,this.settings.tuningCheck&&n!=="riff"?this._showTuningCheck():this._beginPlay(),this._loop()}_resetRun(){const e=this.opts.mode;this.score=0,this.streak=0,this.bestStreak=0,this.multiplier=1,this.hits=0,this.misses=0,this.perfects=0,this.strikes=0,this.consecMiss=0,this.failed=!1,this._particles=[],this._popups=[];for(const t of this.notes)t.state="pending",t.frames=0,t.firstMatch=null,t.cents=null,t.holdFrames=0;for(const t of this.phrases)t.level=null,t.evaluated=!1,t.hits=0,t.total=0,t.faded=!1;if(e==="riff"){const t=this.opts.riff;this.rangeStart=this.phrases[t.from].sec,this.rangeEnd=this.phrases[t.to].endSec,this.loopCount=0,this.loopStats=[]}else this.rangeStart=0,this.rangeEnd=this.endSec;this._levelByKey={};for(let t=0;t<this.phrases.length;t++){const s=ue(this.phrases[t]);s in this._levelByKey||(this._levelByKey[s]=this.progress.phraseLevels[s]??0)}}_levelFor(e){const t=this.opts.mode;if(t==="score")return Ee[this.opts.difficulty].level;if(t==="riff"){const s=this.opts.riff.level;return s==="dynamic"?this._levelByKey[ue(this.phrases[e])]:s}return this._levelByKey[ue(this.phrases[e])]}_isMasterFade(e){const t=this.opts.mode;return t==="score"?!!Ee[this.opts.difficulty].fade:t==="learn"&&this.settings.masterMode?!!this.progress.phraseMastered[ue(this.phrases[e])]:!1}_beginPlay(){this._hideOverlay(),this._resetRun();const e=this.deps.getCtx();e&&!this._synth?this._synth=new Lt(e):e&&this._synth&&this._synth.ctx!==e&&(this._synth.dispose(),this._synth=new Lt(e)),this._applyVolumes(),this._seek(this.rangeStart-this._countInSec),this._state="playing",this.btnPause.textContent="Pause",this.btnPause.disabled=!1}_applyVolumes(){if(!this._synth)return;const e=this.settings;this._synth.setVolumes({guide:e.guide?e.guideVolume:0,backing:e.backing?e.backingVolume:0,click:e.click?e.clickVolume:0})}_now(){const e=this.deps.getCtx();return e&&e.state==="running"?e.currentTime:performance.now()/1e3}_clockIsCtx(){const e=this.deps.getCtx();return!!(e&&e.state==="running")}_seek(e){var t;this._anchorSong=e,this._anchorClock=this._now(),this._anchorIsCtx=this._clockIsCtx(),this._scheduledUntil=e,(t=this._synth)==null||t.stopAll(),this._nextBeat=Math.ceil(e/this._clickSec-1e-6)}get songSec(){if(this._state==="paused"||this._state!=="playing")return this._pausedAt??this._anchorSong??0;if(this._anchorIsCtx!==this._clockIsCtx()){const e=this._anchorSong;this._seek(e)}return this._anchorSong+(this._now()-this._anchorClock)*this.speed}_setSpeed(e){const t=this.songSec;this.speed=e,this.speedVal.textContent=`${Math.round(e*100)}%`,this._state==="playing"&&this._seek(t)}pause(){var e;this._state==="playing"&&(this._pausedAt=this.songSec,this._state="paused",(e=this._synth)==null||e.stopAll(),this.btnPause.textContent="Resume",this._showPauseMenu())}resume(){if(this._state!=="paused")return;this._hideOverlay();const e=this._pausedAt-2*this.beatSec;this._state="playing",this._pausedAt=null,this._seek(Math.max(this.rangeStart-this._countInSec,e)),this.btnPause.textContent="Pause"}restart(){this.chart&&(this._pausedAt=null,this._beginPlay())}exit(){var e;this.stop(),(e=this.onExit)==null||e.call(this)}stop(){var e;this._state="idle",(e=this._synth)==null||e.stopAll(),this._hideOverlay(),document.removeEventListener("keydown",this._onKey),this._raf&&cancelAnimationFrame(this._raf),this._raf=null}_handleKey(e){e.target&&(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA")||(e.code==="Space"?(e.preventDefault(),this._state==="playing"?this.pause():this._state==="paused"&&this.resume()):e.key==="Escape"?this._state==="playing"?this.pause():this.exit():(e.key==="r"||e.key==="R")&&this.restart())}update(e){this._freq=e,this._freqTime=performance.now(),this._state==="tuning"?this._updateTuning(e):this._state==="playing"&&this._judge(e)}_evalSec(){return this.songSec-this.settings.latencyMs/1e3*this.speed}_visible(e){const s=this.phrases[e.phrase].level??this._levelFor(e.phrase);return e.minLevel<=s}_judge(e){const t=this._evalSec(),s=Pn*this.speed,n=xt*this.speed,a=this.settings.tolerance;let o=null;e&&(o=69+12*Math.log2(e/440));for(const r of this.notes){if(r.state!=="pending"||r.sec<this.rangeStart-1e-6||r.sec>=this.rangeEnd-1e-6)continue;if(r.sec-s>t)break;if(!this._visible(r))continue;const c=r.sec+Math.max(Math.min(r.durSec,.6*this.speed),.12*this.speed)+n;if(t>c){this._registerMiss(r);continue}if(o==null)continue;const h=(o-r.midi)*100;if(Math.abs(h)<=a){r.firstMatch==null&&(r.firstMatch=t),r.frames++,r.cents=r.cents==null?h:r.cents*.6+h*.4;const d=r.durSec/this.speed<.18?1:2;r.frames>=d&&this._registerHit(r);break}}for(const r of this.notes)if(r.state==="hit"&&!(r.sec+r.durSec<t)){if(r.sec-s>t)break;r.holding=o!=null&&Math.abs((o-r.midi)*100)<=a}this._evaluatePhrases(t)}_registerHit(e){e.state="hit";const t=(e.firstMatch-e.sec)/this.speed,s=Math.abs(t)<.08&&Math.abs(e.cents??0)<20;e.grade=s?"perfect":"good",this.hits++,s&&this.perfects++,this.streak++,this.consecMiss=0,this.bestStreak=Math.max(this.bestStreak,this.streak),this.multiplier=Math.min(4,1+Math.floor(this.streak/10)),this.score+=(s?150:100)*this.multiplier;const n=this.phrases[e.phrase];n.hits++,n.total++;const a=this._notePos(e,0);this._burst(a.x,a.y,this._colorOf(e.string),s?22:12);let o=s?"Perfect":t<0?"Early":"Late";!s&&Math.abs(e.cents??0)>=20&&Math.abs(t)<.08&&(o=e.cents>0?"Sharp":"Flat"),this._popup(a.x,a.y-30,o,s?"#7dffb0":"#ffe27a"),this.streak>0&&this.streak%25===0&&this._popup(this._w/2,this._h*.3,`${this.streak} note streak!`,"#ffffff",1.6)}_registerMiss(e){e.state="miss",this.misses++,this.streak=0,this.multiplier=1,this.consecMiss++;const t=this.phrases[e.phrase];t.total++;const s=this._notePos(e,0);this._popup(s.x,s.y-30,"Miss","#ff6b6b"),this.opts.mode==="score"&&this.consecMiss>=3&&(this.consecMiss=0,this.strikes++,this._popup(this._w/2,this._h*.35,`STRIKE ${this.strikes}`,"#ff4d4d",2),this.strikes>=Ee[this.opts.difficulty].strikes&&(this.failed=!0,this._finish()))}_evaluatePhrases(e){const t=this.opts.mode;for(let s=0;s<this.phrases.length;s++){const n=this.phrases[s];if(n.level==null&&n.sec-We*this.speed<=this.songSec&&(n.level=this._levelFor(s),n.faded=this._isMasterFade(s)),n.evaluated||e<n.endSec+xt*this.speed+.05)continue;if(n.sec<this.rangeStart-1e-6||n.endSec>this.rangeEnd+1e-6){n.evaluated=!0;continue}if(n.evaluated=!0,n.total===0)continue;const a=n.hits/n.total;if(n.acc=a,t==="learn"||t==="riff"&&this.opts.riff.level==="dynamic"){const o=ue(n),r=this._levelByKey[o];a>=.85&&r<W?(this._levelByKey[o]=r+1,this._popup(this._w/2,this._h*.22,"LEVEL UP","#8ad4ff",1.8)):a>=.9&&r===W?this.progress.phraseMastered[o]?n.faded&&(this.progress.phraseMasterCleared=this.progress.phraseMasterCleared||{},this.progress.phraseMasterCleared[o]=!0):(this.progress.phraseMastered[o]=!0,this._popup(this._w/2,this._h*.22,"PHRASE MASTERED","#c58bff",2)):a<.4&&r>0&&(this._levelByKey[o]=r-1,this._popup(this._w/2,this._h*.22,"Level down","#ffb36b",1.4))}}}_schedule(){var c;if(!this._synth||!this._clockIsCtx()||this._state!=="playing")return;const e=.3*this.speed,t=this._scheduledUntil,s=this.songSec+e;if(s<=t)return;const n=h=>this._anchorClock+(h-this._anchorSong)/this.speed,a=this._now(),o=this._clickSec;for(;this._nextBeat*o<s;){const h=this._nextBeat*o;if(h>=t-1e-6&&h<=this.rangeEnd+1e-6){const d=h<this.rangeStart-1e-6;if(this.settings.click||d){const l=d?!1:this._barStartSecs.has(Math.round(h*1e3)),u=n(h);u>=a-.01&&this._synth.click(u,l,d&&!this.settings.click?this.settings.clickVolume:null)}}this._nextBeat++}for(const h of this.notes){if(h.sec<t||h.sec>=s||h.sec<this.rangeStart-1e-6||h.sec>=this.rangeEnd-1e-6||!this._visible(h))continue;const d=n(h.sec);d>=a-.01&&this._synth.note(h.midi,d,h.durSec/this.speed)}const r=this.chart.chords;if(r.length>0)for(let h=0;h<r.length;h++){const d=r[h],l=d.start*this.beatSec;if(l<t||l>=s||l<this.rangeStart-1e-6||l>=this.rangeEnd-1e-6)continue;const u=(((c=r[h+1])==null?void 0:c.start)??this.chart.totalBeats)*this.beatSec,p=n(l);p>=a-.01&&this._synth.chord(d.symbol,p,Math.min(u,this.rangeEnd)/this.speed-l/this.speed)}else for(const h of this.chart.bars){const d=h.start*this.beatSec;if(d<t||d>=s||d<this.rangeStart-1e-6||d>=this.rangeEnd-1e-6)continue;const l=n(d);l>=a-.01&&this._synth.drone(this.chart.key.tonicPc,l,h.dur*this.beatSec/this.speed)}this._scheduledUntil=s}_loop(){this._raf&&cancelAnimationFrame(this._raf);const e=()=>{this._raf=requestAnimationFrame(e),this._state==="playing"&&(performance.now()-this._freqTime>100&&this._judge(null),this._schedule(),this._checkEnd()),this._render(),this._renderTimeline(),this._updateHud()};e()}_checkEnd(){const e=this.songSec;if(this.opts.mode==="riff"){e>=this.rangeEnd+.4*this.speed&&this._riffLoop();return}e>=this.endSec+1.2*this.speed&&this._finish()}_riffLoop(){const e=this.opts.riff;let t=0,s=0;for(const a of this.notes)a.sec<this.rangeStart-1e-6||a.sec>=this.rangeEnd-1e-6||(a.state==="hit"&&s++,(a.state==="hit"||a.state==="miss")&&t++);const n=t?s/t:0;if(this.loopCount++,this.loopStats.push({acc:n,speed:this.speed}),e.trainer&&n>=.9&&this.speed<1){const a=Math.min(1,Math.round((this.speed+.05)*100)/100);this.speed=a,this.speedInput.value=String(Math.round(a*100)),this.speedVal.textContent=`${Math.round(a*100)}%`,this._popup(this._w/2,this._h*.25,`Speed up → ${Math.round(a*100)}%`,"#8ad4ff",1.8)}this._popup(this._w/2,this._h*.4,`Loop ${this.loopCount}: ${Math.round(n*100)}%`,"#ffffff",1.6);for(const a of this.notes)a.sec<this.rangeStart-1e-6||a.sec>=this.rangeEnd-1e-6||(a.state="pending",a.frames=0,a.firstMatch=null,a.cents=null);for(const a of this.phrases)a.evaluated=!1,a.hits=0,a.total=0,a.level=null;this._saveDynamicLevels(),this._seek(this.rangeStart-2*this.beatSec)}_saveDynamicLevels(){(this.opts.mode==="learn"||this.opts.mode==="riff"&&this.opts.riff.level==="dynamic")&&(this.progress.phraseLevels={...this.progress.phraseLevels,...this._levelByKey},this._recomputeMastery(),St(this.song.id,this.progress))}_recomputeMastery(){var s;const e=Object.keys(this._levelByKey);if(e.length===0)return;let t=0;for(const n of e){let o=(this._levelByKey[n]??0)/W*100;this.progress.phraseMastered[n]&&(o=100),(s=this.progress.phraseMasterCleared)!=null&&s[n]&&(o=110),t+=o}this.progress.mastery=Math.round(t/e.length)}_finish(){var o;if(this._state==="results")return;this._pausedAt=this.songSec,this._state="results",this.btnPause.disabled=!0,(o=this._synth)==null||o.stopAll();const e=this.hits+this.misses,t=e?this.hits/e:0,s=this.progress;s.plays=(s.plays||0)+1,s.lastPlayed=Date.now(),s.bestAccuracy=Math.max(s.bestAccuracy||0,Math.round(t*100)),s.bestStreak=Math.max(s.bestStreak||0,this.bestStreak);let n=null,a=!1;if(this.opts.mode==="score"){const r=this.opts.difficulty;this.failed||(n=t>=.98?"platinum":t>=.9?"gold":t>=.75?"silver":t>=.5?"bronze":null),(s.bestScore[r]||0)<this.score&&(s.bestScore[r]=this.score,a=!0);const c={bronze:1,silver:2,gold:3,platinum:4};n&&c[n]>(c[s.medal[r]]||0)&&(s.medal[r]=n)}this.opts.mode==="learn"&&(this.progress.phraseLevels={...this.progress.phraseLevels,...this._levelByKey},this._recomputeMastery()),St(this.song.id,s),this._showResults({acc:t,medal:n,newBest:a})}_colorOf(e){var t;return Rn((t=this.preset)==null?void 0:t.strings[e],e)}_geometry(){const e=this._w,t=this._h,s=this.preset?this.preset.strings.length:4,n=t<360,a=t*(n?.56:.6),o=t*.86,r=(o-a)/Math.max(1,s-1||1),c=o+r*.55,h={x:e/2,y:t*.04},d=e<520?7:9,l=Math.max(26,e*.08),u=(e-l-Math.max(12,e*.08))/d,p=(1/.1-1)/(We*this.speed);return{W:e,H:t,nStr:s,nearTop:a,nearBottom:o,rowH:r,floorY:c,vp:h,span:d,left:l,colW:u,k:p}}_project(e,t,s,n){const a=1/(1+Math.max(-.4/n.k,s)*n.k);return{x:n.vp.x+(e-n.vp.x)*a,y:n.vp.y+(t-n.vp.y)*a,f:a}}_rowY(e,t){return t.nearTop+e*t.rowH}_colX(e,t){return t.left+(e-this._cam+.5)*t.colW}_notePos(e,t){const s=this._geometry();return this._project(this._colX(e.offset,s),this._rowY(e.string,s),t,s)}_render(){const e=this.canvas.getContext("2d");if(!e||!this._w)return;const t=this._dpr||1;e.setTransform(t,0,0,t,0,0);const s=this._geometry(),{W:n,H:a}=s,o=e.createLinearGradient(0,0,0,a);if(o.addColorStop(0,"#05070d"),o.addColorStop(.6,"#0b1222"),o.addColorStop(1,"#101a30"),e.fillStyle=o,e.fillRect(0,0,n,a),!this.chart)return;const r=this.songSec,c=this._state==="playing"?this._evalSec():r,h=We*this.speed;let d=1/0,l=-1/0,u=null;for(const f of this.notes)if(!(f.sec+f.durSec<r-.2)){if(f.sec>r+h*.8)break;this._visible(f)&&(u===null&&f.offset>0&&(u=f.base),f.offset>0&&(d=Math.min(d,f.offset),l=Math.max(l,f.offset)))}let p=this._cam;d!==1/0&&(d-1<this._cam&&(p=Math.max(0,d-1)),l+1>this._cam+s.span&&(p=Math.max(0,l+1-s.span)),l<=s.span-1&&(p=0)),this._cam+=(p-this._cam)*.08,this._anchorBase=u??this._anchorBase??0;const A=f=>f-r,D=Math.floor(this._cam),G=Math.ceil(this._cam+s.span),y=this._project(this._colX(D-.5,s),s.floorY,0,s),T=this._project(this._colX(G+.5,s),s.floorY,0,s),I=this._project(this._colX(D-.5,s),s.floorY,h,s),z=this._project(this._colX(G+.5,s),s.floorY,h,s),g=e.createLinearGradient(0,I.y,0,y.y);g.addColorStop(0,"rgba(30,45,80,0)"),g.addColorStop(1,"rgba(40,60,110,0.55)"),e.fillStyle=g,e.beginPath(),e.moveTo(y.x,y.y),e.lineTo(T.x,T.y),e.lineTo(z.x,z.y),e.lineTo(I.x,I.y),e.closePath(),e.fill();const E=this._anchorBase;{const f=this._project(this._colX(E+.5,s),s.floorY,0,s),_=this._project(this._colX(E+8.5,s),s.floorY,0,s),M=this._project(this._colX(E+8.5,s),s.floorY,h*.6,s),N=this._project(this._colX(E+.5,s),s.floorY,h*.6,s),X=e.createLinearGradient(0,N.y,0,f.y);X.addColorStop(0,"rgba(140,90,255,0)"),X.addColorStop(1,"rgba(140,90,255,0.28)"),e.fillStyle=X,e.beginPath(),e.moveTo(f.x,f.y),e.lineTo(_.x,_.y),e.lineTo(M.x,M.y),e.lineTo(N.x,N.y),e.closePath(),e.fill()}for(let f=D;f<=G+1;f++){const _=this._project(this._colX(f-.5,s),s.floorY,0,s),M=this._project(this._colX(f-.5,s),s.floorY,h,s),N=f-E===2||f-E===4||f-E===5||f-E===7;e.strokeStyle=N?"rgba(180,200,255,0.22)":"rgba(120,140,190,0.12)",e.lineWidth=1,e.beginPath(),e.moveTo(_.x,_.y),e.lineTo(M.x,M.y),e.stroke()}const F=Math.floor(r/this.beatSec),B=Math.ceil((r+h)/this.beatSec),S=this.chart.bars,v=new Set(S.map(f=>Math.round(f.start*1e3)));for(let f=F;f<=B;f++){const _=f*this.beatSec,M=A(_);if(M<-.05||M>h)continue;const N=v.has(Math.round(f*1e3)),X=this._project(this._colX(D-.5,s),s.floorY,M,s),$=this._project(this._colX(G+.5,s),s.floorY,M,s);e.strokeStyle=N?"rgba(200,215,255,0.35)":"rgba(160,180,230,0.12)",e.lineWidth=N?2*X.f+.5:1,e.beginPath(),e.moveTo(X.x,X.y),e.lineTo($.x,$.y),e.stroke()}e.textAlign="left";for(const f of this.phrases){const _=A(f.sec);if(_<0||_>h)continue;const M=this._project(this._colX(G+.6,s),s.floorY,_,s);e.fillStyle="rgba(200,215,255,0.6)",e.font=`600 ${Math.max(9,14*M.f)}px system-ui, sans-serif`,e.fillText(f.name,Math.min(n-60,M.x+4),M.y-4)}const b=s.nStr;for(let f=0;f<b;f++){const _=this._rowY(f,s),M=this._project(this._colX(D-.5,s),_,0,s),N=this._project(this._colX(G+.5,s),_,0,s);e.strokeStyle=this._colorOf(f),e.globalAlpha=.85,e.lineWidth=2.5+(b-f)*.5,e.beginPath(),e.moveTo(M.x,_),e.lineTo(N.x,_),e.stroke(),e.globalAlpha=1,e.fillStyle=this._colorOf(f),e.font="700 13px system-ui, sans-serif",e.textAlign="left",e.fillText(this.preset.strings[f].name,6,_+4)}e.textAlign="center",e.font="600 11px system-ui, sans-serif";for(let f=Math.max(0,D);f<=G;f++){const _=this._colX(f,s),M=f-E;e.fillStyle=M>=1&&M<=8?"rgba(200,180,255,0.85)":"rgba(150,165,200,0.45)",e.fillText(String(f),_,s.floorY+14)}e.fillStyle="rgba(200,180,255,0.85)",e.font="600 11px system-ui, sans-serif",e.textAlign="left",e.fillText(`${ln(this._positionOfBase(E))} position`,10,38);const w=[];for(const f of this.notes)if(!(f.sec+f.durSec<r-.4*this.speed)){if(f.sec>r+h)break;f.sec<this.rangeStart-1e-6||f.sec>=this.rangeEnd-1e-6||this._visible(f)&&w.push(f)}for(let f=w.length-1;f>=0;f--)this._drawNote(e,w[f],r,s,h);if(this._drawPitchCursor(e,s,c),this._drawFx(e),this._state==="playing"&&r<this.rangeStart){const f=Math.ceil((this.rangeStart-r)/this._clickSec-1e-6);f>0&&(e.fillStyle="rgba(255,255,255,0.9)",e.font=`800 ${Math.min(96,a*.22)}px system-ui, sans-serif`,e.textAlign="center",e.fillText(String(f),n/2,a*.4))}const O=this.phrases.find(f=>r>=f.sec&&r<f.endSec);if(e.textAlign="left",e.fillStyle="rgba(220,230,255,0.8)",e.font="600 13px system-ui, sans-serif",O){const f=O.level??this._levelFor(this.phrases.indexOf(O)),_=this.opts.mode==="learn"||this.opts.mode==="riff"&&this.opts.riff.level==="dynamic"?` · Level ${f}/${W}`:"";e.fillText(`${O.name}${_}${O.faded?" · MASTER MODE":""}`,10,20)}e.textAlign="right",e.fillText(`${zt(Math.max(0,r)/this.speed)} / ${zt(this.endSec/this.speed)}`,n-10,20)}_positionOfBase(e){const t=[1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10];return t[Math.max(0,Math.min(t.length-1,Math.round(e)))]}_drawNote(e,t,s,n,a){const o=t.sec-s,r=t.sec+t.durSec-s,c=this._colorOf(t.string),h=this._rowY(t.string,n),d=t.offset===0,l=Math.floor(this._cam),u=Math.ceil(this._cam+n.span);let p=1;if(this.phrases[t.phrase].faded&&(p=Math.max(0,Math.min(1,(o/a-.35)/.25))),t.state==="miss"&&(p*=.35),p<=.01&&t.state!=="hit")return;if(e.save(),e.globalAlpha=p,t.durSec>.3*this.beatSec*2||t.durSec/this.speed>.35){const g=Math.max(0,o),E=Math.min(a,r);if(E>g){const F=d?null:this._colX(t.offset,n),B=d?null:n.colW*.22,S=d?null:this._project(F-B,h,g,n),v=d?null:this._project(F+B,h,g,n),b=d?null:this._project(F+B,h,E,n),w=d?null:this._project(F-B,h,E,n);if(e.fillStyle=c,e.globalAlpha=p*(t.state==="hit"?t.holding?.85:.45:.4),!d)e.beginPath(),e.moveTo(S.x,S.y),e.lineTo(v.x,v.y),e.lineTo(b.x,b.y),e.lineTo(w.x,w.y),e.closePath(),e.fill();else{const O=this._project(this._colX(l,n),h,g,n),f=this._project(this._colX(u,n),h,g,n),_=this._project(this._colX(l,n),h,E,n),M=this._project(this._colX(u,n),h,E,n);e.globalAlpha=p*.18,e.beginPath(),e.moveTo(O.x,O.y),e.lineTo(f.x,f.y),e.lineTo(M.x,M.y),e.lineTo(_.x,_.y),e.closePath(),e.fill()}e.globalAlpha=p}}if(t.state==="hit"){e.restore();return}o<-.02&&t.state;const D=Math.max(0,o);if(d){const g=this._project(this._colX(l+.1,n),h,D,n),E=this._project(this._colX(u-.1,n),h,D,n),F=n.rowH*.32*g.f+3;if(e.fillStyle=c,e.globalAlpha=p*.85,this._roundRect(e,g.x,g.y-F/2,E.x-g.x,F,F/2),e.fill(),e.globalAlpha=p,e.fillStyle="#0b1222",e.font=`800 ${Math.max(9,18*g.f)}px system-ui, sans-serif`,e.textAlign="center",e.fillText("0",(g.x+E.x)/2,g.y+6*g.f),this.settings.showNoteNames&&g.f>.35){const B=Te(t.midi);e.fillStyle="rgba(255,255,255,0.85)",e.font=`600 ${Math.max(8,12*g.f)}px system-ui, sans-serif`,e.fillText(`${B.name}${B.octave}`,(g.x+E.x)/2+40*g.f,g.y-F)}e.restore();return}const G=this._project(this._colX(t.offset,n),h,D,n),y=this._project(this._colX(t.offset,n),n.floorY,D,n),T=n.colW*.78*G.f,I=Math.min(n.rowH*.8,n.colW*.6)*G.f+4;e.strokeStyle=c,e.globalAlpha=p*.35,e.lineWidth=Math.max(1,3*G.f),e.beginPath(),e.moveTo(G.x,G.y),e.lineTo(y.x,y.y),e.stroke(),e.fillStyle=c,e.globalAlpha=p*.25,e.beginPath(),e.ellipse(y.x,y.y,T*.45,3*G.f+1,0,0,Math.PI*2),e.fill(),e.globalAlpha=p;const z=e.createLinearGradient(0,G.y-I/2,0,G.y+I/2);if(z.addColorStop(0,"#ffffff"),z.addColorStop(.25,c),z.addColorStop(1,c),e.fillStyle=z,this._roundRect(e,G.x-T/2,G.y-I/2,T,I,Math.min(8,I/3)),e.fill(),e.strokeStyle=t.state==="miss"?"#ff4d4d":"rgba(255,255,255,0.9)",e.lineWidth=Math.max(1,2*G.f),e.stroke(),e.fillStyle="#0b1222",e.font=`800 ${Math.max(9,I*.62)}px system-ui, sans-serif`,e.textAlign="center",e.fillText(String(t.finger),G.x,G.y+I*.22),this.settings.showNoteNames&&G.f>.3){const g=Te(t.midi);e.fillStyle="rgba(255,255,255,0.9)",e.font=`600 ${Math.max(8,12*G.f)}px system-ui, sans-serif`,e.fillText(`${g.name}${g.octave}`,G.x,G.y-I/2-4*G.f)}e.restore()}_drawPitchCursor(e,t,s){if(!(this._freq&&performance.now()-this._freqTime<150))return;const a=69+12*Math.log2(this._freq/440);let o=null;for(const p of this.notes)if(!(p.state!=="pending"||!this._visible(p))&&!(p.sec+p.durSec<s-.2)){o=p;break}let r;if(o&&Math.abs(o.sec-s)<1.2*this.speed)r=o.string;else{r=0;const p=this.chart.openMidis;for(let A=p.length-1;A>=0;A--)if(a>=p[A]-.5){r=A;break}}const c=a-this.chart.openMidis[r];if(c<-1||c>20)return;const h=this._colX(c,t),d=this._rowY(r,t);let l="#9fb4ff",u="";if(o&&o.string===r){const p=(a-o.midi)*100;Math.abs(p)<=this.settings.tolerance?l="#5dff9e":l="#ffb347",Math.abs(p)<150&&(u=`${p>0?"+":""}${Math.round(p)}¢`)}e.save(),e.shadowColor=l,e.shadowBlur=16,e.strokeStyle=l,e.lineWidth=3,e.beginPath(),e.arc(h,d,11,0,Math.PI*2),e.stroke(),e.restore(),u&&(e.fillStyle=l,e.font="700 11px system-ui, sans-serif",e.textAlign="center",e.fillText(u,h,d+26))}_roundRect(e,t,s,n,a,o){e.beginPath(),e.moveTo(t+o,s),e.arcTo(t+n,s,t+n,s+a,o),e.arcTo(t+n,s+a,t,s+a,o),e.arcTo(t,s+a,t,s,o),e.arcTo(t,s,t+n,s,o),e.closePath()}_burst(e,t,s,n){for(let a=0;a<n;a++){const o=Math.random()*Math.PI*2,r=1.5+Math.random()*4;this._particles.push({x:e,y:t,vx:Math.cos(o)*r,vy:Math.sin(o)*r-2,life:1,color:s})}}_popup(e,t,s,n,a=1){this._popups.push({x:e,y:t,text:s,color:n,life:1,scale:a})}_drawFx(e){for(const t of this._particles)t.x+=t.vx,t.y+=t.vy,t.vy+=.15,t.life-=.03,e.globalAlpha=Math.max(0,t.life),e.fillStyle=t.color,e.fillRect(t.x-2,t.y-2,4,4);this._particles=this._particles.filter(t=>t.life>0),e.textAlign="center";for(const t of this._popups)t.y-=.6,t.life-=.018,e.globalAlpha=Math.max(0,Math.min(1,t.life*1.5)),e.fillStyle=t.color,e.font=`800 ${Math.round(15*t.scale)}px system-ui, sans-serif`,e.fillText(t.text,t.x,t.y);this._popups=this._popups.filter(t=>t.life>0).slice(-14),e.globalAlpha=1}_renderTimeline(){const e=this.timeline,t=e.getContext("2d");if(!t||!this.chart)return;const s=this._dpr||1,n=e.width/s,a=e.height/s;t.setTransform(s,0,0,s,0,0),t.clearRect(0,0,n,a),t.fillStyle="#0b1222",t.fillRect(0,0,n,a);const o=this.endSec||1;for(let c=0;c<this.phrases.length;c++){const h=this.phrases[c],d=h.sec/o*n,l=h.endSec/o*n,u=h.level??this._levelFor(c),p=ue(h),A=this.opts.mode==="learn"&&this.progress.phraseMastered[p],D=h.sec>=this.rangeStart-1e-6&&h.endSec<=this.rangeEnd+1e-6,G=.25+.75*(u/W);t.fillStyle=D?A?"#a46bff":h.evaluated&&h.acc!=null?h.acc>=.85?"#36c46f":h.acc>=.5?"#e0b030":"#d4504f":"#3a5a9a":"rgba(80,90,120,0.3)",t.fillRect(d+1,a-a*G,Math.max(1,l-d-2),a*G)}const r=Math.max(0,this.songSec)/o*n;t.fillStyle="#ffffff",t.fillRect(r-1,0,2,a)}_updateHud(){if(!this.chart||this._state==="idle")return;const e=(this.hits||0)+(this.misses||0);this.stScore.v.textContent=(this.score||0).toLocaleString(),this.stMult.v.textContent=`×${this.multiplier||1}`,this.stStreak.v.textContent=String(this.streak||0),this.stAcc.v.textContent=e?`${Math.round(this.hits/e*100)}%`:"—";const t=this.opts.mode==="score"?Ee[this.opts.difficulty].strikes:0;this.stStrikes.v.textContent=t?`${"✕".repeat(this.strikes||0)}${"·".repeat(Math.max(0,t-(this.strikes||0)))}`:""}_hideOverlay(){this.overlay.classList.add("hidden"),this.overlay.replaceChildren()}_showOverlay(...e){this.overlay.replaceChildren(...e),this.overlay.classList.remove("hidden")}_showTuningCheck(){this._state="tuning";const e=C("div","sp-card");e.append(C("h3",null,"Tune Up")),e.append(C("p","sp-muted",`Play each open string. This song is arranged for ${this.preset.label}.`));const t=C("div","sp-tune-list");this._tuneRows=this.preset.strings.map((o,r)=>{const c=C("div","sp-tune-row"),h=C("span","sp-tune-name",`${o.name}${o.octave}`);h.style.color=this._colorOf(r);const d=C("div","sp-tune-meter"),l=C("div","sp-tune-needle");d.appendChild(l);const u=C("span","sp-tune-val","—");return c.append(h,d,u),t.appendChild(c),{row:c,needle:l,val:u,freq:o.frequency,okFrames:0,done:!1}}),e.appendChild(t);const s=C("div","sp-card-btns"),n=C("button","sp-btn sp-btn-primary","Start song");n.addEventListener("click",()=>this._beginPlay());const a=C("button","sp-btn","Always skip tuning");a.addEventListener("click",()=>{this.settings.tuningCheck=!1,Se(this.settings),this._beginPlay()}),s.append(n,a),e.appendChild(s),this._showOverlay(e)}_updateTuning(e){if(this._tuneRows){for(const t of this._tuneRows){if(!e)continue;const s=1200*Math.log2(e/t.freq);if(Math.abs(s)>80)continue;const n=Math.max(-50,Math.min(50,s));t.needle.style.left=`${50+n}%`,t.val.textContent=`${s>0?"+":""}${Math.round(s)}¢`,Math.abs(s)<8?t.okFrames++:t.okFrames=Math.max(0,t.okFrames-1),t.okFrames>12&&!t.done&&(t.done=!0,t.row.classList.add("ok"),t.val.textContent="✓ in tune")}this._tuneRows.every(t=>t.done)&&(this._tuneRows=null,setTimeout(()=>{this._state==="tuning"&&this._beginPlay()},600))}}_showPauseMenu(){const e=C("div","sp-card");e.append(C("h3",null,"Paused"));const t=C("div","sp-card-btns sp-card-btns--col"),s=C("button","sp-btn sp-btn-primary","Resume");s.addEventListener("click",()=>this.resume());const n=C("button","sp-btn","Restart");n.addEventListener("click",()=>this.restart());const a=C("button","sp-btn","Riff Repeater this phrase");a.addEventListener("click",()=>{var D;const p=this._pausedAt??0;let A=this.phrases.findIndex(G=>p>=G.sec&&p<G.endSec);A<0&&(A=0),this.stop(),(D=this.onRiffRequest)==null||D.call(this,this.song,A,A)});const o=C("button","sp-btn","Back to library");o.addEventListener("click",()=>this.exit()),t.append(s,n,a,o),e.appendChild(t);const r=C("label","sp-setting");r.append(C("span",null,"Latency offset"));const c=C("input");c.type="range",c.min="0",c.max="300",c.step="10",c.value=String(this.settings.latencyMs);const h=C("span",null,`${this.settings.latencyMs} ms`);c.addEventListener("input",()=>{this.settings.latencyMs=Number(c.value),h.textContent=`${c.value} ms`,Se(this.settings)}),r.append(c,h);const d=C("label","sp-setting");d.append(C("span",null,"Pitch tolerance"));const l=C("input");l.type="range",l.min="10",l.max="60",l.step="5",l.value=String(this.settings.tolerance);const u=C("span",null,`±${this.settings.tolerance}¢`);l.addEventListener("input",()=>{this.settings.tolerance=Number(l.value),u.textContent=`±${l.value}¢`,Se(this.settings)}),d.append(l,u),e.append(r,d),this._showOverlay(e)}_showResults({acc:e,medal:t,newBest:s}){const n=C("div","sp-card sp-results"),a=this.failed?"Song Failed":"Song Complete";n.append(C("h3",null,a)),n.append(C("div","sp-muted",this.title));const o=C("div","sp-res-grid"),r=(p,A)=>{const D=C("div","sp-res-item");D.append(C("div","sp-res-value",A),C("div","sp-res-label",p)),o.appendChild(D)};if(r("Accuracy",`${Math.round(e*100)}%`),r("Notes hit",`${this.hits}/${this.hits+this.misses}`),r("Best streak",String(this.bestStreak)),r("Perfect",String(this.perfects)),this.opts.mode==="score"&&r("Score",this.score.toLocaleString()),this.opts.mode==="learn"&&r("Mastery",`${this.progress.mastery}%`),n.appendChild(o),t){const p=C("div",`sp-medal sp-medal--${t}`,`${t.toUpperCase()} MEDAL`);n.appendChild(p)}s&&n.appendChild(C("div","sp-newbest","New high score!"));const c=C("div","sp-res-phrases");let h=null;this.phrases.forEach((p,A)=>{if(p.total===0)return;const D=p.hits/p.total;(!h||D<h.a)&&(h={i:A,a:D});const G=C("div","sp-res-phrase");G.title=`${p.name}: ${Math.round(D*100)}%`;const y=C("div","sp-res-phrase-fill");y.style.height=`${Math.max(6,D*100)}%`,y.style.background=D>=.85?"#36c46f":D>=.5?"#e0b030":"#d4504f",G.appendChild(y),c.appendChild(G)}),n.appendChild(c);const d=C("div","sp-card-btns"),l=C("button","sp-btn sp-btn-primary","Play again");if(l.addEventListener("click",()=>this.restart()),d.appendChild(l),h&&h.a<.9){const p=C("button","sp-btn",`Practice "${this.phrases[h.i].name}"`);p.addEventListener("click",()=>{var A;this.stop(),(A=this.onRiffRequest)==null||A.call(this,this.song,h.i,h.i)}),d.appendChild(p)}const u=C("button","sp-btn","Library");u.addEventListener("click",()=>this.exit()),d.appendChild(u),n.appendChild(d),this._showOverlay(n)}static noteFreq(e){return oe(e)}}function ke(i){const e=((i==null?void 0:i.label)||"").toLowerCase();return/bluetooth|airpods|buds|hands-?free|\bbt\b|hfp|sco/.test(e)?"bluetooth":/usb|interface|scarlett|focusrite|irig|behringer|presonus|audient|motu|zoom|tascam|roland|boss|steinberg|line in|line-in|instrument|guitar|xlr|ux1|um2|evo|ssl/.test(e)?"usb":/headset|wired|headphone|earphone|earpiece|jack|3\.5|trrs|external/.test(e)?"wired":"builtin"}const Qn={usb:"USB audio",wired:"Wired headset",bluetooth:"Bluetooth (adds latency)",builtin:"Built-in mic"};function $n(i,e){let t=i.label||`Input ${e+1}`;return t=t.replace(/^Default\s*[-–]\s*/i,"").replace(/^Communications\s*[-–]\s*/i,""),t}class Hn{constructor(e){this.onDeviceChange=null,this.onChannelMode=null,this.onGainChange=null,this.el=document.createElement("div"),this.el.className="ip-root";const t=document.createElement("span");t.className="sb-label",t.textContent="Input",this.el.appendChild(t);const s=document.createElement("div");s.className="sb-dd ip-dd",this.dd=new Q(s,{placeholder:"Microphone…",title:"Audio input"}),this.dd.onChange=c=>{var h;return(h=this.onDeviceChange)==null?void 0:h.call(this,c)},this.el.appendChild(s);const n=document.createElement("div");n.className="sb-dd ip-ch",this.ch=new Q(n,{placeholder:"Channel",title:"Input channel"}),this.ch.setItems([{value:"mix",label:"Mix (L+R)"},{value:"left",label:"Left / In 1"},{value:"right",label:"Right / In 2"}]),this.ch.value="mix",this.ch.onChange=c=>{var h;return(h=this.onChannelMode)==null?void 0:h.call(this,c)},this.chWrap=n,this.el.appendChild(n);const a=document.createElement("label");a.className="ip-gain",a.title="Input boost (useful for quiet line/USB inputs)";const o=document.createElement("input");o.type="range",o.min="0.25",o.max="4",o.step="0.05",o.value="1",this.gainInput=o;const r=document.createElement("span");r.textContent="×1.0",o.addEventListener("input",()=>{var c;r.textContent=`×${Number(o.value).toFixed(1)}`,(c=this.onGainChange)==null||c.call(this,Number(o.value))}),a.append(o,r),this.el.appendChild(a),this.meter=document.createElement("div"),this.meter.className="ip-meter",this.meterFill=document.createElement("div"),this.meterFill.className="ip-meter-fill",this.meter.appendChild(this.meterFill),this.el.appendChild(this.meter),this.hint=document.createElement("div"),this.hint.className="ip-hint",this.el.appendChild(this.hint),e.appendChild(this.el)}setDevices(e,t){this._inputs=e;const s=e.map((n,a)=>({value:n.deviceId,label:`${$n(n,a)}  ·  ${Qn[ke(n)]}`}));this.dd.setItems(s),t&&s.some(n=>n.value===t)&&(this.dd.value=t),this._updateHint(t)}setCurrent(e){this.dd.value=e,this._updateHint(e)}setChannelCount(e){this.chWrap.classList.toggle("hidden",e<2)}setGain(e){this.gainInput.value=String(e),this.gainInput.dispatchEvent(new Event("input"))}_updateHint(e){var n;const t=(n=this._inputs)==null?void 0:n.find(a=>a.deviceId===e),s=t?ke(t):null;this.hint.textContent=s==="bluetooth"?"Bluetooth mics add a lot of delay. Use a wired or USB input for play-along.":s==="usb"?"USB input: pick the channel your instrument is plugged into.":""}updateLevel(e){const t=Math.max(0,Math.min(1,(e+60)/60));this.meterFill.style.width=`${t*100}%`,this.meterFill.classList.toggle("hot",e>-6)}}/*! Capacitor: https://capacitorjs.com/ - MIT License */var me;(function(i){i.Unimplemented="UNIMPLEMENTED",i.Unavailable="UNAVAILABLE"})(me||(me={}));class qe extends Error{constructor(e,t,s){super(e),this.message=e,this.code=t,this.data=s}}const Wn=i=>{var e,t;return i!=null&&i.androidBridge?"android":!((t=(e=i==null?void 0:i.webkit)===null||e===void 0?void 0:e.messageHandlers)===null||t===void 0)&&t.bridge?"ios":"web"},qn=i=>{const e=i.CapacitorCustomPlatform||null,t=i.Capacitor||{},s=t.Plugins=t.Plugins||{},n=()=>e!==null?e.name:Wn(i),a=()=>n()!=="web",o=l=>{const u=h.get(l);return!!(u!=null&&u.platforms.has(n())||r(l))},r=l=>{var u;return(u=t.PluginHeaders)===null||u===void 0?void 0:u.find(p=>p.name===l)},c=l=>i.console.error(l),h=new Map,d=(l,u={})=>{const p=h.get(l);if(p)return console.warn(`Capacitor plugin "${l}" already registered. Cannot register plugins twice.`),p.proxy;const A=n(),D=r(l);let G;const y=async()=>(!G&&A in u?G=typeof u[A]=="function"?G=await u[A]():G=u[A]:e!==null&&!G&&"web"in u&&(G=typeof u.web=="function"?G=await u.web():G=u.web),G),T=(B,S)=>{var v,b;if(D){const w=D==null?void 0:D.methods.find(O=>S===O.name);if(w)return w.rtype==="promise"?O=>t.nativePromise(l,S.toString(),O):(O,f)=>t.nativeCallback(l,S.toString(),O,f);if(B)return(v=B[S])===null||v===void 0?void 0:v.bind(B)}else{if(B)return(b=B[S])===null||b===void 0?void 0:b.bind(B);throw new qe(`"${l}" plugin is not implemented on ${A}`,me.Unimplemented)}},I=B=>{let S;const v=(...b)=>{const w=y().then(O=>{const f=T(O,B);if(f){const _=f(...b);return S=_==null?void 0:_.remove,_}else throw new qe(`"${l}.${B}()" is not implemented on ${A}`,me.Unimplemented)});return B==="addListener"&&(w.remove=async()=>S()),w};return v.toString=()=>`${B.toString()}() { [capacitor code] }`,Object.defineProperty(v,"name",{value:B,writable:!1,configurable:!1}),v},z=I("addListener"),g=I("removeListener"),E=(B,S)=>{const v=z({eventName:B},S),b=async()=>{const O=await v;g({eventName:B,callbackId:O},S)},w=new Promise(O=>v.then(()=>O({remove:b})));return w.remove=async()=>{console.warn("Using addListener() without 'await' is deprecated."),await b()},w},F=new Proxy({},{get(B,S){switch(S){case"$$typeof":return;case"toJSON":return()=>({});case"addListener":return D?E:z;case"removeListener":return g;default:return I(S)}}});return s[l]=F,h.set(l,{name:l,proxy:F,platforms:new Set([...Object.keys(u),...D?[A]:[]])}),F};return t.convertFileSrc||(t.convertFileSrc=l=>l),t.getPlatform=n,t.handleError=c,t.isNativePlatform=a,t.isPluginAvailable=o,t.registerPlugin=d,t.Exception=qe,t.DEBUG=!!t.DEBUG,t.isLoggingEnabled=!!t.isLoggingEnabled,t},Vn=i=>i.Capacitor=qn(i),fe=Vn(typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{}),Ne=fe.registerPlugin;class ht{constructor(){this.listeners={},this.retainedEventArguments={},this.windowListeners={}}addListener(e,t){let s=!1;this.listeners[e]||(this.listeners[e]=[],s=!0),this.listeners[e].push(t);const a=this.windowListeners[e];a&&!a.registered&&this.addWindowListener(a),s&&this.sendRetainedArgumentsForEvent(e);const o=async()=>this.removeListener(e,t);return Promise.resolve({remove:o})}async removeAllListeners(){this.listeners={};for(const e in this.windowListeners)this.removeWindowListener(this.windowListeners[e]);this.windowListeners={}}notifyListeners(e,t,s){const n=this.listeners[e];if(!n){if(s){let a=this.retainedEventArguments[e];a||(a=[]),a.push(t),this.retainedEventArguments[e]=a}return}n.forEach(a=>a(t))}hasListeners(e){var t;return!!(!((t=this.listeners[e])===null||t===void 0)&&t.length)}registerWindowListener(e,t){this.windowListeners[t]={registered:!1,windowEventName:e,pluginEventName:t,handler:s=>{this.notifyListeners(t,s)}}}unimplemented(e="not implemented"){return new fe.Exception(e,me.Unimplemented)}unavailable(e="not available"){return new fe.Exception(e,me.Unavailable)}async removeListener(e,t){const s=this.listeners[e];if(!s)return;const n=s.indexOf(t);n!==-1&&this.listeners[e].splice(n,1),this.listeners[e].length||this.removeWindowListener(this.windowListeners[e])}addWindowListener(e){window.addEventListener(e.windowEventName,e.handler),e.registered=!0}removeWindowListener(e){e&&(window.removeEventListener(e.windowEventName,e.handler),e.registered=!1)}sendRetainedArgumentsForEvent(e){const t=this.retainedEventArguments[e];t&&(delete this.retainedEventArguments[e],t.forEach(s=>{this.notifyListeners(e,s)}))}}const Ot=i=>encodeURIComponent(i).replace(/%(2[346B]|5E|60|7C)/g,decodeURIComponent).replace(/[()]/g,escape),It=i=>i.replace(/(%[\dA-F]{2})+/gi,decodeURIComponent);class jn extends ht{async getCookies(){const e=document.cookie,t={};return e.split(";").forEach(s=>{if(s.length<=0)return;let[n,a]=s.replace(/=/,"CAP_COOKIE").split("CAP_COOKIE");n=It(n).trim(),a=It(a).trim(),t[n]=a}),t}async setCookie(e){try{const t=Ot(e.key),s=Ot(e.value),n=e.expires?`; expires=${e.expires.replace("expires=","")}`:"",a=(e.path||"/").replace("path=",""),o=e.url!=null&&e.url.length>0?`domain=${e.url}`:"";document.cookie=`${t}=${s||""}${n}; path=${a}; ${o};`}catch(t){return Promise.reject(t)}}async deleteCookie(e){try{document.cookie=`${e.key}=; Max-Age=0`}catch(t){return Promise.reject(t)}}async clearCookies(){try{const e=document.cookie.split(";")||[];for(const t of e)document.cookie=t.replace(/^ +/,"").replace(/=.*/,`=;expires=${new Date().toUTCString()};path=/`)}catch(e){return Promise.reject(e)}}async clearAllCookies(){try{await this.clearCookies()}catch(e){return Promise.reject(e)}}}Ne("CapacitorCookies",{web:()=>new jn});const Un=async i=>new Promise((e,t)=>{const s=new FileReader;s.onload=()=>{const n=s.result;e(n.indexOf(",")>=0?n.split(",")[1]:n)},s.onerror=n=>t(n),s.readAsDataURL(i)}),Jn=(i={})=>{const e=Object.keys(i);return Object.keys(i).map(n=>n.toLocaleLowerCase()).reduce((n,a,o)=>(n[a]=i[e[o]],n),{})},Yn=(i,e=!0)=>i?Object.entries(i).reduce((s,n)=>{const[a,o]=n;let r,c;return Array.isArray(o)?(c="",o.forEach(h=>{r=e?encodeURIComponent(h):h,c+=`${a}=${r}&`}),c.slice(0,-1)):(r=e?encodeURIComponent(o):o,c=`${a}=${r}`),`${s}&${c}`},"").substr(1):null,Zn=(i,e={})=>{const t=Object.assign({method:i.method||"GET",headers:i.headers},e),n=Jn(i.headers)["content-type"]||"";if(typeof i.data=="string")t.body=i.data;else if(n.includes("application/x-www-form-urlencoded")){const a=new URLSearchParams;for(const[o,r]of Object.entries(i.data||{}))a.set(o,r);t.body=a.toString()}else if(n.includes("multipart/form-data")||i.data instanceof FormData){const a=new FormData;if(i.data instanceof FormData)i.data.forEach((r,c)=>{a.append(c,r)});else for(const r of Object.keys(i.data))a.append(r,i.data[r]);t.body=a;const o=new Headers(t.headers);o.delete("content-type"),t.headers=o}else(n.includes("application/json")||typeof i.data=="object")&&(t.body=JSON.stringify(i.data));return t};class ei extends ht{async request(e){const t=Zn(e,e.webFetchExtra),s=Yn(e.params,e.shouldEncodeUrlParams),n=s?`${e.url}?${s}`:e.url,a=await fetch(n,t),o=a.headers.get("content-type")||"";let{responseType:r="text"}=a.ok?e:{};o.includes("application/json")&&(r="json");let c,h;switch(r){case"arraybuffer":case"blob":h=await a.blob(),c=await Un(h);break;case"json":c=await a.json();break;case"document":case"text":default:c=await a.text()}const d={};return a.headers.forEach((l,u)=>{d[u]=l}),{data:c,headers:d,status:a.status,url:a.url}}async get(e){return this.request(Object.assign(Object.assign({},e),{method:"GET"}))}async post(e){return this.request(Object.assign(Object.assign({},e),{method:"POST"}))}async put(e){return this.request(Object.assign(Object.assign({},e),{method:"PUT"}))}async patch(e){return this.request(Object.assign(Object.assign({},e),{method:"PATCH"}))}async delete(e){return this.request(Object.assign(Object.assign({},e),{method:"DELETE"}))}}const ti=Ne("CapacitorHttp",{web:()=>new ei});var Nt;(function(i){i.Dark="DARK",i.Light="LIGHT",i.Default="DEFAULT"})(Nt||(Nt={}));var Kt;(function(i){i.StatusBar="StatusBar",i.NavigationBar="NavigationBar"})(Kt||(Kt={}));class si extends ht{async setStyle(){this.unavailable("not available for web")}async setAnimation(){this.unavailable("not available for web")}async show(){this.unavailable("not available for web")}async hide(){this.unavailable("not available for web")}}Ne("SystemBars",{web:()=>new si});const ni="modulepreload",ii=function(i,e){return new URL(i,e).href},Pt={},ai=function(e,t,s){let n=Promise.resolve();if(t&&t.length>0){let o=function(d){return Promise.all(d.map(l=>Promise.resolve(l).then(u=>({status:"fulfilled",value:u}),u=>({status:"rejected",reason:u}))))};const r=document.getElementsByTagName("link"),c=document.querySelector("meta[property=csp-nonce]"),h=(c==null?void 0:c.nonce)||(c==null?void 0:c.getAttribute("nonce"));n=o(t.map(d=>{if(d=ii(d,s),d in Pt)return;Pt[d]=!0;const l=d.endsWith(".css"),u=l?'[rel="stylesheet"]':"";if(!!s)for(let D=r.length-1;D>=0;D--){const G=r[D];if(G.href===d&&(!l||G.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${d}"]${u}`))return;const A=document.createElement("link");if(A.rel=l?"stylesheet":ni,l||(A.as="script"),A.crossOrigin="",A.href=d,h&&A.setAttribute("nonce",h),document.head.appendChild(A),l)return new Promise((D,G)=>{A.addEventListener("load",D),A.addEventListener("error",()=>G(new Error(`Unable to preload CSS for ${d}`)))})}))}function a(o){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=o,window.dispatchEvent(r),!r.defaultPrevented)throw o}return n.then(o=>{for(const r of o||[])r.status==="rejected"&&a(r.reason);return e().catch(a)})},oi="__capgo_keep_url_path_after_reload",Ve="__capgo_history_stack__",Rt=100,ri=typeof window<"u"&&typeof document<"u"&&typeof history<"u";if(ri){const i=window;if(!i.__capgoHistoryPatched){i.__capgoHistoryPatched=!0;const e=()=>{try{if(i.__capgoKeepUrlPathAfterReload)return!0}catch{}try{return window.localStorage.getItem(oi)==="1"}catch{return!1}},t=()=>{try{const g=window.sessionStorage.getItem(Ve);if(!g)return{stack:[],index:-1};const E=JSON.parse(g);return!E||!Array.isArray(E.stack)||typeof E.index!="number"?{stack:[],index:-1}:E}catch{return{stack:[],index:-1}}},s=(g,E)=>{try{window.sessionStorage.setItem(Ve,JSON.stringify({stack:g,index:E}))}catch{}},n=()=>{try{window.sessionStorage.removeItem(Ve)}catch{}},a=g=>{try{const E=g??window.location.href,F=new URL(E instanceof URL?E.toString():E,window.location.href);return`${F.pathname}${F.search}${F.hash}`}catch{return null}},o=(g,E)=>{if(g.length<=Rt)return{stack:g,index:E};const F=g.length-Rt,B=g.slice(F),S=Math.max(0,E-F);return{stack:B,index:S}},r=g=>{document.readyState==="complete"||document.readyState==="interactive"?g():window.addEventListener("DOMContentLoaded",g,{once:!0})};let c=!1,h=!1,d=!1;const l=()=>{if(!c)return;const g=t(),E=a();if(E){if(g.stack.length===0){g.stack.push(E),g.index=0,s(g.stack,g.index);return}(g.index<0||g.index>=g.stack.length)&&(g.index=g.stack.length-1),g.stack[g.index]!==E&&(g.stack[g.index]=E,s(g.stack,g.index))}},u=(g,E)=>{if(!c||h)return;const F=a(g);if(!F)return;let{stack:B,index:S}=t();B.length===0?(B.push(F),S=B.length-1):E?((S<0||S>=B.length)&&(S=B.length-1),B[S]=F):S>=B.length-1?(B.push(F),S=B.length-1):(B=B.slice(0,S+1),B.push(F),S=B.length-1),{stack:B,index:S}=o(B,S),s(B,S)},p=()=>{if(!c||h)return;const g=t();if(g.stack.length===0){l();return}const E=g.index>=0&&g.index<g.stack.length?g.index:g.stack.length-1,F=a();if(g.stack.length===1&&F===g.stack[0])return;const B=g.stack[0];if(!B)return;h=!0;try{history.replaceState(history.state,document.title,B);for(let b=1;b<g.stack.length;b+=1)history.pushState(history.state,document.title,g.stack[b])}catch{h=!1;return}h=!1;const S=g.stack.length-1,v=E-S;v!==0?history.go(v):(history.replaceState(history.state,document.title,g.stack[E]),window.dispatchEvent(new PopStateEvent("popstate")))},A=()=>{!c||d||(d=!0,r(()=>{d=!1,p()}))};let D=null,G=null;const y=()=>{if(!c||h)return;const g=a();if(!g)return;const E=t(),F=E.stack.lastIndexOf(g);F>=0?E.index=F:(E.stack.push(g),E.index=E.stack.length-1);const B=o(E.stack,E.index);s(B.stack,B.index)},T=()=>{D&&G||(D=history.pushState,G=history.replaceState,history.pushState=function(E,F,B){const S=D==null?void 0:D.call(history,E,F,B);return u(B,!1),S},history.replaceState=function(E,F,B){const S=G==null?void 0:G.call(history,E,F,B);return u(B,!0),S},window.addEventListener("popstate",y))},I=()=>{D&&(history.pushState=D,D=null),G&&(history.replaceState=G,G=null),window.removeEventListener("popstate",y)},z=g=>{if(c===g){c&&(l(),A());return}c=g,c?(T(),l(),A()):(I(),n())};window.addEventListener("CapacitorUpdaterKeepUrlPathAfterReload",g=>{var E;const F=g,B=(E=F==null?void 0:F.detail)===null||E===void 0?void 0:E.enabled;typeof B=="boolean"?(i.__capgoKeepUrlPathAfterReload=B,z(B)):(i.__capgoKeepUrlPathAfterReload=!0,z(!0))}),z(e())}}var Xt;(function(i){i[i.UNKNOWN=0]="UNKNOWN",i[i.UPDATE_NOT_AVAILABLE=1]="UPDATE_NOT_AVAILABLE",i[i.UPDATE_AVAILABLE=2]="UPDATE_AVAILABLE",i[i.UPDATE_IN_PROGRESS=3]="UPDATE_IN_PROGRESS"})(Xt||(Xt={}));var Qt;(function(i){i[i.UNKNOWN=0]="UNKNOWN",i[i.PENDING=1]="PENDING",i[i.DOWNLOADING=2]="DOWNLOADING",i[i.INSTALLING=3]="INSTALLING",i[i.INSTALLED=4]="INSTALLED",i[i.FAILED=5]="FAILED",i[i.CANCELED=6]="CANCELED",i[i.DOWNLOADED=11]="DOWNLOADED"})(Qt||(Qt={}));var $t;(function(i){i[i.OK=0]="OK",i[i.CANCELED=1]="CANCELED",i[i.FAILED=2]="FAILED",i[i.NOT_AVAILABLE=3]="NOT_AVAILABLE",i[i.NOT_ALLOWED=4]="NOT_ALLOWED",i[i.INFO_MISSING=5]="INFO_MISSING"})($t||($t={}));const ae=Ne("CapacitorUpdater",{web:()=>ai(()=>import("./web-1PMQyZfr.js"),[],import.meta.url).then(i=>new i.CapacitorUpdaterWeb)}),ci="https://github.com/lgkeroack/violin/releases/download/web-latest/update.json",li=1800*1e3,we="1.2.0";let je=!1,ls=0,Ht=null;function Wt(i,e){const t=String(i).split(/[.-]/).map(n=>parseInt(n,10)||0),s=String(e).split(/[.-]/).map(n=>parseInt(n,10)||0);for(let n=0;n<Math.max(t.length,s.length);n++){const a=(t[n]||0)-(s[n]||0);if(a)return a}return 0}async function di(){const i=await ti.get({url:`${ci}?t=${Date.now()}`,headers:{Accept:"application/json","Cache-Control":"no-cache"},responseType:"json"});if(i.status<200||i.status>=300)throw new Error(`manifest HTTP ${i.status}`);return typeof i.data=="string"?JSON.parse(i.data):i.data}async function qt(i){var e,t;if(!(je||Ht)){je=!0,ls=Date.now();try{const s=await di();if(!(s!=null&&s.version)||!(s!=null&&s.url))return;const n=await ae.current(),a=((e=n.bundle)==null?void 0:e.version)==="builtin"?we:(t=n.bundle)==null?void 0:t.version;if(Wt(s.version,a)<=0)return;if(s.minNative&&Wt(n.native,s.minNative)<0){i==null||i({needsApk:!0,version:s.version});return}const{bundles:o}=await ae.list();let r=o.find(c=>c.version===s.version&&c.status!=="error");r||(r=await ae.download({url:s.url,version:s.version,checksum:s.checksum||void 0})),await ae.next({id:r.id}),Ht=r,i==null||i({version:s.version,notes:s.notes||"",apply:()=>ae.set({id:r.id})})}catch(s){console.warn("Live update check failed:",(s==null?void 0:s.message)||s)}finally{je=!1}}}async function hi({onReady:i}={}){if(fe.isNativePlatform()){try{await ae.notifyAppReady()}catch(e){console.warn("notifyAppReady failed:",(e==null?void 0:e.message)||e)}qt(i),document.addEventListener("visibilitychange",()=>{!document.hidden&&Date.now()-ls>li&&qt(i)})}}async function ui(){var i,e;if(!fe.isNativePlatform())return{bundle:we,native:"web"};try{const t=await ae.current();return{bundle:((i=t.bundle)==null?void 0:i.version)==="builtin"?we:(e=t.bundle)==null?void 0:e.version,native:t.native}}catch{return{bundle:we,native:"?"}}}function pi({notify:i}={}){if(fe.isNativePlatform())return;const e=document.getElementById("install-btn");let t=null;if(window.addEventListener("beforeinstallprompt",a=>{a.preventDefault(),t=a,e==null||e.classList.remove("hidden")}),e==null||e.addEventListener("click",async()=>{t&&(t.prompt(),await t.userChoice.catch(()=>{}),t=null,e.classList.add("hidden"))}),window.addEventListener("appinstalled",()=>e==null?void 0:e.classList.add("hidden")),!("serviceWorker"in navigator))return;let s=!1;navigator.serviceWorker.addEventListener("controllerchange",()=>{s||(s=!0,window.location.reload())});const n=a=>{i==null||i({text:"A new version is ready.",action:"Reload",onAction:()=>a.postMessage("SKIP_WAITING")})};navigator.serviceWorker.register("./sw.js").then(a=>{a.waiting&&navigator.serviceWorker.controller&&n(a.waiting),a.addEventListener("updatefound",()=>{const o=a.installing;o==null||o.addEventListener("statechange",()=>{o.state==="installed"&&navigator.serviceWorker.controller&&n(o)})}),document.addEventListener("visibilitychange",()=>{document.hidden||a.update().catch(()=>{})})}).catch(a=>console.warn("Service worker registration failed:",a))}function ds(i){var n;(n=document.querySelector(".app-update"))==null||n.remove();const e=document.createElement("div");e.className="app-update";const t=document.createElement("span");if(i.needsApk)t.textContent=`Version ${i.version} needs a newer app install. Download the latest APK from GitHub.`,e.appendChild(t);else{t.textContent=i.customText||`Update ${i.version} downloaded.`;const a=document.createElement("button");a.textContent=i.actionLabel||"Restart now",a.addEventListener("click",()=>{var o;return(o=i.apply)==null?void 0:o.call(i)}),e.append(t,a)}const s=document.createElement("button");s.className="secondary",s.textContent=i.needsApk?"OK":"Later",s.addEventListener("click",()=>e.remove()),e.appendChild(s),document.body.appendChild(e)}hi({onReady:ds});pi({notify:({text:i,action:e,onAction:t})=>ds({version:"",customText:i,actionLabel:e,apply:t})});ui().then(({bundle:i,native:e})=>{const t=document.getElementById("app-version");t&&(t.textContent=e==="web"?`v${i}`:`v${i} · app ${e}`)});const k=new gs,Z=new Ds,Ai=new Es,mi=document.getElementById("pitch-section"),fi=document.getElementById("tuning-section"),gi=document.getElementById("scale-section"),Di=document.getElementById("trainer-section"),Bi=document.getElementById("metronome-section"),Ei=document.getElementById("fingerboard-section"),Gi=document.getElementById("mixer-section"),bi=new _s(mi),ut=new Ss(fi),st=new Ns(gi),se=new Ks(Di),J=new Rs(Bi),de=new Ts(Ei),R=new Fs(Gi);ut.onTuningChange=i=>{de.setTuning(i),Ce.setTuning(i)};const hs=document.getElementById("song-browser-section"),us=document.getElementById("song-player-section"),Ce=new zn(hs),re=new Xn(us,{getCtx:()=>k.ctx});let Ae="workstation",Y=null;async function Fi(){try{"wakeLock"in navigator&&!Y&&(Y=await navigator.wakeLock.request("screen"),Y.addEventListener("release",()=>{Y=null}))}catch{}}function Ci(){var i;(i=Y==null?void 0:Y.release)==null||i.call(Y),Y=null}function ps(i){hs.classList.toggle("hidden",i),us.classList.toggle("hidden",!i),document.body.classList.toggle("playing-song",i)}const U=new Hn(Ce.inputSlot);let V=null,pe=new Set;function ce(){return k.inputs.keys().next().value}function nt(i){const e=document.createElement("div");e.className="app-toast",e.textContent=i,document.body.appendChild(e),setTimeout(()=>e.classList.add("show"),10),setTimeout(()=>{e.classList.remove("show"),setTimeout(()=>e.remove(),400)},3200)}function pt(i){var e,t,s;return((s=(t=(e=i==null?void 0:i.getAudioTracks)==null?void 0:e.call(i)[0])==null?void 0:t.getSettings)==null?void 0:s.call(t).deviceId)||null}async function xe(i){const e=ce();if(e==null)return!1;try{const t=await Z.getInputStream(i);return k.connectInputStream(e,t),le=!0,V=i||pt(t),R.setInputDevice(e,V),U.setCurrent(V),U.setChannelCount(k.getInputChannelCount(e)),Fe(),!0}catch(t){return console.warn("Failed to open input:",t.message),nt("Could not open that input"),!1}}U.onDeviceChange=i=>{Ke(),xe(i)};U.onChannelMode=i=>{const e=ce();e!=null&&k.setInputChannelMode(e,i)};U.onGainChange=i=>{const e=ce();e!=null&&k.setInputGain(e,i)};async function yi(i){R.updateDevices(i);const e=i.inputs.filter(a=>a.deviceId),t=e.filter(a=>!pe.has(a.deviceId)&&a.deviceId!=="default"),s=pe.size>0;pe=new Set(e.map(a=>a.deviceId)),U.setDevices(e,V);const n=t.find(a=>["usb","wired"].includes(ke(a)));if(s&&n){await xe(n.deviceId)&&nt(`Switched input to ${n.label||"external device"}`);return}V&&!pe.has(V)&&await xe(void 0)&&nt("Input unplugged, using the default microphone")}Ce.onPlay=(i,e,t)=>{Ke(),ps(!0),Fi(),requestAnimationFrame(()=>re.start(i,e,t))};re.onExit=()=>{ps(!1),Ci(),Ce.updateProgress()};re.onRiffRequest=(i,e,t)=>{Ce.openRiff(i,e,t)};function As(i){if(i!==Ae){Ae==="songplay"&&re.active&&re.pause(),Ae=i;for(const e of document.querySelectorAll(".app-tab")){const t=e.dataset.tab===i;e.classList.toggle("active",t),e.setAttribute("aria-selected",String(t))}for(const e of document.querySelectorAll("[data-tab-panel]"))e.classList.toggle("hidden",e.dataset.tabPanel!==i);document.body.classList.toggle("tab-songplay",i==="songplay");try{localStorage.setItem("vaw.activeTab",i)}catch{}}}for(const i of document.querySelectorAll(".app-tab"))i.addEventListener("click",()=>As(i.dataset.tab));try{localStorage.getItem("vaw.activeTab")==="songplay"&&As("songplay")}catch{}st.onScaleChange=i=>de.setScale(i);se.onStart=()=>{const i=st.scaleKey,e=st.rootPitchClass,t=ut.currentTuning;if(!i)return;const s=Ps(t,e,i,{octaves:se.octaves,direction:se.direction});s.length!==0&&(de.clearTrainerState(),se.beginSession(s))};se.onTargetChange=i=>{de.setTrainerTarget(i.stringIndex,i.positionIndex)};se.onHit=i=>{de.markTrainerHit(i.stringIndex,i.positionIndex)};se.onStop=()=>{de.clearTrainerState()};let K=null;J.onStart=()=>{!K&&k.ctx&&(K=new Jt(k.ctx),K.onBeat=i=>{J.flashBeat(i)}),K&&(K.bpm=J.bpm,K.beatsPerMeasure=J.beats,K.start())};J.onStop=()=>{K==null||K.stop()};J.onBpmChange=i=>{K&&(K.bpm=i)};J.onTimeSigChange=i=>{K&&(K.beatsPerMeasure=i)};J.onVolumeChange=i=>{K&&K.setVolume(i)};const At=new Map,mt=new Map;let Vt=null,jt=!1;async function ft(){jt||(await k.init(),jt=!0,wi())}async function gt(i){await ft();const e=k.createInput(),t=R.addInputStrip(e,i);if(At.set(e,new Yt(t.meterCanvas)),i)try{const s=await Z.getInputStream(i);k.connectInputStream(e,s)}catch(s){console.warn("Input stream unavailable:",s.message)}return e}function vi(i){k.inputs.size<=1||(k.removeInput(i),R.removeInputStrip(i),At.delete(i))}async function _i(i,e){try{const t=await Z.getInputStream(e);k.switchInputDevice(i,t),i===ce()&&(V=e,U.setCurrent(e),U.setChannelCount(k.getInputChannelCount(i)))}catch(t){console.error("Failed to switch input device:",t)}}async function ms(i){try{await ft();const e=await k.addOutput(i);if(e===-1)return;const t=R.addOutputStrip(e,i);return mt.set(e,new Yt(t.meterCanvas)),e}catch(e){console.error("Failed to add output:",e)}}function Si(i){k.outputs.size<=1||(k.removeOutput(i),R.removeOutputStrip(i),mt.delete(i))}async function Mi(i,e){try{await k.switchOutputDevice(i,e)}catch(t){console.error("Failed to switch output device:",t)}}function wi(){if(Vt)return;let i=0;function e(){const t=Ae==="workstation",s=Ae==="songplay"&&re.active;if(t){for(const[n,a]of At){const o=k.getInputLevel(n);a.draw(o.rmsDb,o.peakDb)}for(const[n,a]of mt){const o=k.getOutputLevel(n);a.draw(o.rmsDb,o.peakDb)}}if(Ae==="songplay"&&!s&&i%3===0){const n=ce();n!=null&&U.updateLevel(k.getInputLevel(n).rmsDb)}if(i++,s||t&&i%2===0){const{data:n,sampleRate:a}=k.getPitchData(),o=Ai.detect(n,a);t&&(bi.update(o),ut.update(o),de.update(o),se.active&&se.update(o)),s&&re.update(o)}t&&R.updateLatency(k.getLatency(),k.getBridgeLatency(),k.getLatencyBreakdown()),Vt=requestAnimationFrame(e)}e()}R.onAddInput=()=>gt();R.onRemoveInput=i=>vi(i);R.onAddOutput=()=>ms();R.onRemoveOutput=i=>Si(i);R.onInputDeviceChange=(i,e)=>_i(i,e);R.onOutputDeviceChange=(i,e)=>Mi(i,e);R.onInputGainChange=(i,e)=>k.setInputGain(i,e);R.onOutputGainChange=(i,e)=>k.setOutputGain(i,e);R.onInputMuteToggle=i=>{const e=k.toggleInputMute(i);R.setInputMuted(i,e)};R.onOutputMuteToggle=i=>{const e=k.toggleOutputMute(i);R.setOutputMuted(i,e)};R.onBufferSizeChange=async i=>{const e=K==null?void 0:K._playing;K&&(K.stop(),K=null);const t=await k.reinitWithBufferSize(i);t&&(K=new Jt(t),K.onBeat=s=>{J.flashBeat(s)},e&&(K.bpm=J.bpm,K.beatsPerMeasure=J.beats,K.start()))};var Ut;const Ti=((Ut=window.matchMedia)==null?void 0:Ut.call(window,"(pointer: coarse)").matches)??!1,ze=document.getElementById("mic-btn");let le=!1;function Ke(){k.ctx&&k.ctx.state!=="running"&&k.ctx.resume().catch(()=>{}),Fe()}for(const i of["pointerdown","touchend","keydown"])window.addEventListener(i,Ke,{passive:!0});function Fe(){const i=k.ctx&&k.ctx.state!=="running",e=!le||i;ze.classList.toggle("hidden",!e),ze.textContent=le?"Tap to start audio":"Enable microphone"}ze.addEventListener("click",async()=>{Ke(),le||await fs(),Fe()});async function fs(){try{const i=await Z.getInputStream();let e=k.inputs.keys().next().value;e==null&&(e=await gt()),k.connectInputStream(e,i),le=!0,V=pt(i);try{const t=await Z.enumerate();R.updateDevices(t),pe=new Set(t.inputs.map(s=>s.deviceId).filter(Boolean)),U.setDevices(t.inputs.filter(s=>s.deviceId),V),R.setInputDevice(e,V)}catch{}}catch(i){console.warn("Microphone unavailable:",i.message),ze.textContent="Microphone blocked: check permissions"}}async function Li(){var o,r;await ft();let i={inputs:[],outputs:[]};try{await Z.requestPermission(),i=await Z.enumerate()}catch(c){console.warn("Mic permission denied or unavailable:",c.message);try{i=await Z.enumerate()}catch{}}R.updateDevices(i),Z.listenForChanges(),Z.onDevicesChanged=c=>yi(c),pe=new Set(i.inputs.map(c=>c.deviceId).filter(Boolean));const e=i.inputs.length>0?i.inputs[0].deviceId:void 0,t=i.outputs.length>0?i.outputs[0].deviceId:void 0;await gt(e),le=[...k.inputs.values()].some(c=>c.stream),!le&&i.inputs.length>0&&await fs();const s=k.inputs.get(ce());V=pt(s==null?void 0:s.stream)||e||null;const n=i.inputs.find(c=>["usb","wired"].includes(ke(c)));n&&n.deviceId!==V&&await xe(n.deviceId),U.setDevices(i.inputs.filter(c=>c.deviceId),V),U.setChannelCount(k.getInputChannelCount(ce()));const a=await ms(t);if(Ti&&a!=null&&a!==-1){const c=k.toggleOutputMute(a);R.setOutputMuted(a,c)}Fe(),(r=(o=k.ctx)==null?void 0:o.addEventListener)==null||r.call(o,"statechange",Fe)}Li();export{Xt as A,ht as W};
