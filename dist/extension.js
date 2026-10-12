"use strict";var $=Object.create;var w=Object.defineProperty;var O=Object.getOwnPropertyDescriptor;var N=Object.getOwnPropertyNames;var F=Object.getPrototypeOf,R=Object.prototype.hasOwnProperty;var L=(o,t)=>{for(var n in t)w(o,n,{get:t[n],enumerable:!0})},I=(o,t,n,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of N(t))!R.call(o,a)&&a!==n&&w(o,a,{get:()=>t[a],enumerable:!(r=O(t,a))||r.enumerable});return o};var x=(o,t,n)=>(n=o!=null?$(F(o)):{},I(t||!o||!o.__esModule?w(n,"default",{value:o,enumerable:!0}):n,o)),D=o=>I(w({},"__esModule",{value:!0}),o);var j={};L(j,{activate:()=>U});module.exports=D(j);var e=x(require("vscode")),y=x(require("https")),g=x(require("fs")),v=x(require("path")),B="normahub.apiKey",f;function U(o){f=e.window.createStatusBarItem(e.StatusBarAlignment.Right,100),f.command="normahub.switchModel",f.tooltip="NormaHub: \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u0434\u043B\u044F \u0432\u044B\u0431\u043E\u0440\u0430 \u043C\u043E\u0434\u0435\u043B\u0438 \u0438\u043B\u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",T(),f.show(),o.subscriptions.push(f);let t=new P(o);o.subscriptions.push(e.window.registerWebviewViewProvider("normahub.controlView",t)),o.subscriptions.push(e.commands.registerCommand("normahub.configureProject",()=>A(o)),e.commands.registerCommand("normahub.switchModel",()=>K()),e.commands.registerCommand("normahub.testPing",()=>S()),e.commands.registerCommand("normahub.openBilling",()=>{e.env.openExternal(e.Uri.parse("https://normahub.cc"))}),e.commands.registerCommand("normahub.explainSelection",()=>_(o,"explain")),e.commands.registerCommand("normahub.generateTests",()=>_(o,"test")))}function T(){let n=e.workspace.getConfiguration("normahub").get("defaultModel","claude-sonnet-5-5").replace("claude-","").replace("-flash","");f.text=`$(hubot) NormaHub: ${n}`}async function C(o){let t=await o.secrets.get(B);if(t&&t.trim())return t.trim();let n=process.env.NORMAHUB_API_KEY||process.env.OPENAI_API_KEY;return n?n.trim():""}async function K(){let o=[{label:"claude-sonnet-5-5",description:"Claude Sonnet 5.5",detail:"\u041E\u043F\u0442\u0438\u043C\u0430\u043B\u044C\u043D\u043E \u0434\u043B\u044F \u043D\u0430\u043F\u0438\u0441\u0430\u043D\u0438\u044F \u043A\u043E\u0434\u0430, \u0430\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u044B \u0438 \u0441\u0438\u0441\u0442\u0435\u043C\u043D\u043E\u0433\u043E \u0434\u0438\u0437\u0430\u0439\u043D\u0430"},{label:"gpt-6-astra",description:"GPT-6 Astra",detail:"\u0424\u043B\u0430\u0433\u043C\u0430\u043D \u0440\u0430\u0441\u0441\u0443\u0436\u0434\u0435\u043D\u0438\u0439, \u0441\u043B\u043E\u0436\u043D\u044B\u0445 \u0430\u043B\u0433\u043E\u0440\u0438\u0442\u043C\u043E\u0432 \u0438 \u043C\u0430\u0442\u0435\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0439 \u043B\u043E\u0433\u0438\u043A\u0438"},{label:"deepseek-v4.1-flash",description:"DeepSeek v4.1 Flash",detail:"\u0412\u044B\u0441\u043E\u043A\u0430\u044F \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u043E\u0442\u043A\u043B\u0438\u043A\u0430 \u0438 \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u0447\u043D\u044B\u0439 \u0430\u0432\u0442\u043E\u043A\u043E\u043C\u043F\u043B\u0438\u0442"},{label:"claude-opus-5",description:"Claude Opus 5",detail:"\u0413\u043B\u0443\u0431\u043E\u043A\u0438\u0439 \u0441\u043A\u0432\u043E\u0437\u043D\u043E\u0439 \u0430\u0443\u0434\u0438\u0442 \u0431\u043E\u043B\u044C\u0448\u0438\u0445 \u043A\u043E\u0434\u043E\u0432\u044B\u0445 \u0431\u0430\u0437"}],t=await e.window.showQuickPick(o,{placeHolder:"\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0430\u043A\u0442\u0438\u0432\u043D\u0443\u044E \u043C\u043E\u0434\u0435\u043B\u044C \u0434\u043B\u044F \u0440\u0430\u0431\u043E\u0442\u044B \u0432 \u0440\u0435\u0434\u0430\u043A\u0442\u043E\u0440\u0435"});t&&(await e.workspace.getConfiguration("normahub").update("defaultModel",t.label,e.ConfigurationTarget.Global),e.window.showInformationMessage(`\u0410\u043A\u0442\u0438\u0432\u043D\u0430\u044F \u043C\u043E\u0434\u0435\u043B\u044C: ${t.label}`),T())}async function A(o){let t=e.workspace.workspaceFolders;if(!t||t.length===0)return e.window.showWarningMessage("\u0414\u043B\u044F \u043F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u0438\u044F \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438 \u043E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0440\u0430\u0431\u043E\u0447\u0443\u044E \u043F\u0430\u043F\u043A\u0443 \u043F\u0440\u043E\u0435\u043A\u0442\u0430."),[];let n=t[0].uri.fsPath,r=e.workspace.getConfiguration("normahub"),a=await C(o)||"nr_hub_YOUR_API_KEY",s=r.get("baseUrl","https://api.normahub.cc/v1"),u=r.get("defaultModel","claude-sonnet-5-5"),d=r.get("fastModel","deepseek-v4.1-flash"),i=[],c=`# NormaHub AI Gateway Configuration
# Direct connection in CIS/Russia without VPN

OPENAI_BASE_URL="${s}"
OPENAI_API_KEY="${a}"

[Preferences]
preferred_coding_model = "${u}"
fast_autocomplete_model = "${d}"
`;g.writeFileSync(v.join(n,".cursorrules"),c,"utf-8"),i.push(".cursorrules");let p=v.join(n,".cursor","rules");g.existsSync(p)||g.mkdirSync(p,{recursive:!0});let l=`---
description: NormaHub direct gateway routing
globs: *
---

Always use standard OpenAI-compatible endpoints with Base URL: ${s}
Preferred models:
- Primary: ${u}
- Fast Autocomplete: ${d}
`;g.writeFileSync(v.join(p,"normahub.mdc"),l,"utf-8"),i.push(".cursor/rules/normahub.mdc");let m=`openai-api-base: ${s}
openai-api-key: ${a}
model: openai/${u}
editor-model: openai/${d}
stream: true
cache-prompts: true
`;g.writeFileSync(v.join(n,".aider.conf.yml"),m,"utf-8"),i.push(".aider.conf.yml");let b=`# NormaHub AI Configuration for Windsurf Cascade
Base URL: ${s}
Model: ${u}
Fast Model: ${d}
`;g.writeFileSync(v.join(n,".windsurfrules"),b,"utf-8"),i.push(".windsurfrules");let E=`# Cline Rules
Provider: OpenAI-compatible
Base URL: ${s}
Model: ${u}
`;g.writeFileSync(v.join(n,".clinerules"),E,"utf-8"),i.push(".clinerules");let h={customModes:[{slug:"normahub-architect",name:"NormaHub Architect",roleDefinition:`Senior Architect powered by ${u} via ${s}`,groups:["read","edit","command"]}]};g.writeFileSync(v.join(n,"cline_custom_modes.json"),JSON.stringify(h,null,2),"utf-8"),i.push("cline_custom_modes.json");let M=`# \u041F\u0440\u044F\u043C\u043E\u0439 \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u0444\u043B\u0430\u0433\u043C\u0430\u043D\u0441\u043A\u0438\u043C \u043C\u043E\u0434\u0435\u043B\u044F\u043C \u0431\u0435\u0437 VPN: https://normahub.cc
OPENAI_BASE_URL="${s}"
OPENAI_API_KEY="${a}"
DEFAULT_MODEL="${u}"
FAST_MODEL="${d}"
`;return g.writeFileSync(v.join(n,".env.normahub.example"),M,"utf-8"),i.push(".env.normahub.example"),e.window.showInformationMessage(`\u0421\u043E\u0437\u0434\u0430\u043D\u043E ${i.length} \u043A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0445 \u0444\u0430\u0439\u043B\u043E\u0432 \u0434\u043B\u044F Cursor, Windsurf, Aider, Cline.`),i}function S(o){let t=Date.now(),n=y.get("https://api.normahub.cc/v1/models",r=>{let a=Date.now()-t;o?o(a):e.window.showInformationMessage(`\u0428\u043B\u044E\u0437 NormaHub \u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D. \u041F\u0438\u043D\u0433: ${a} \u043C\u0441 (\u041F\u0440\u044F\u043C\u043E\u0439 \u043A\u0430\u043D\u0430\u043B \u0420\u0424, \u0431\u0435\u0437 VPN).`)});n.on("error",r=>{o?o(-1,r.message):e.window.showErrorMessage(`\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0438 \u0441\u0432\u044F\u0437\u0438 \u0441\u043E \u0448\u043B\u044E\u0437\u043E\u043C: ${r.message}`)}),n.setTimeout(5e3,()=>{n.destroy(),o&&o(-1,"\u0422\u0430\u0439\u043C\u0430\u0443\u0442 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u044F (5\u0441)")})}async function _(o,t){let n=e.window.activeTextEditor;if(!n){e.window.showWarningMessage("\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0444\u0430\u0439\u043B \u0441 \u043A\u043E\u0434\u043E\u043C \u0438 \u0432\u044B\u0434\u0435\u043B\u0438\u0442\u0435 \u0444\u0440\u0430\u0433\u043C\u0435\u043D\u0442.");return}let r=n.document.getText(n.selection);if(!r.trim()){e.window.showWarningMessage("\u0412\u044B\u0434\u0435\u043B\u0438\u0442\u0435 \u0443\u0447\u0430\u0441\u0442\u043E\u043A \u043A\u043E\u0434\u0430 \u0434\u043B\u044F \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438 \u0432 \u043C\u043E\u0434\u0435\u043B\u044C.");return}let a=await C(o);if(!a){e.window.showErrorMessage("API-\u043A\u043B\u044E\u0447 \u043D\u0435 \u0437\u0430\u0434\u0430\u043D. \u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u043A\u043B\u044E\u0447 \u0432 \u0431\u043E\u043A\u043E\u0432\u043E\u0439 \u043F\u0430\u043D\u0435\u043B\u0438 NormaHub.");return}let s=e.workspace.getConfiguration("normahub"),u=s.get("baseUrl","https://api.normahub.cc/v1"),d=s.get("defaultModel","claude-sonnet-5-5"),i=t==="explain"?`\u041F\u0440\u043E\u0432\u0435\u0434\u0438 \u0438\u043D\u0436\u0435\u043D\u0435\u0440\u043D\u044B\u0439 \u0440\u0430\u0437\u0431\u043E\u0440 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u0444\u0440\u0430\u0433\u043C\u0435\u043D\u0442\u0430 \u043A\u043E\u0434\u0430. \u0423\u043A\u0430\u0436\u0438 \u043D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435, \u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0435 \u0440\u0438\u0441\u043A\u0438, \u0433\u0440\u0430\u043D\u0438\u0447\u043D\u044B\u0435 \u0443\u0441\u043B\u043E\u0432\u0438\u044F \u0438 \u0441\u043F\u043E\u0441\u043E\u0431\u044B \u043E\u043F\u0442\u0438\u043C\u0438\u0437\u0430\u0446\u0438\u0438:

\`\`\`
${r}
\`\`\``:`\u041D\u0430\u043F\u0438\u0448\u0438 \u0438\u0441\u0447\u0435\u0440\u043F\u044B\u0432\u0430\u044E\u0449\u0438\u0439 \u043D\u0430\u0431\u043E\u0440 unit-\u0442\u0435\u0441\u0442\u043E\u0432 \u0434\u043B\u044F \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E \u043A\u043E\u0434\u0430 (\u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439 pytest \u0434\u043B\u044F Python \u0438\u043B\u0438 vitest/jest \u0434\u043B\u044F TS/JS). \u041F\u043E\u043A\u0440\u043E\u0439 \u0433\u0440\u0430\u043D\u0438\u0447\u043D\u044B\u0435 \u0443\u0441\u043B\u043E\u0432\u0438\u044F \u0438 \u043D\u0435\u0433\u0430\u0442\u0438\u0432\u043D\u044B\u0435 \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0438:

\`\`\`
${r}
\`\`\``;await e.window.withProgress({location:e.ProgressLocation.Notification,title:t==="explain"?`NormaHub: \u0410\u043D\u0430\u043B\u0438\u0437 \u043A\u043E\u0434\u0430 (${d})...`:`NormaHub: \u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u0442\u0435\u0441\u0442\u043E\u0432 (${d})...`,cancellable:!1},async()=>{try{let c=await H(u,a,d,i),p=await e.workspace.openTextDocument({content:c,language:"markdown"});await e.window.showTextDocument(p,{viewColumn:e.ViewColumn.Beside})}catch(c){e.window.showErrorMessage(`\u041E\u0448\u0438\u0431\u043A\u0430 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F \u0437\u0430\u043F\u0440\u043E\u0441\u0430: ${c.message}`)}})}function H(o,t,n,r){return new Promise((a,s)=>{let u=new URL(`${o}/chat/completions`),d=JSON.stringify({model:n,messages:[{role:"user",content:r}],temperature:.2}),i=y.request(u,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`,"Content-Length":Buffer.byteLength(d)},timeout:3e4},c=>{let p="";c.on("data",l=>{p+=l}),c.on("end",()=>{if(c.statusCode&&c.statusCode>=200&&c.statusCode<300)try{let m=JSON.parse(p).choices?.[0]?.message?.content||"\u041E\u0442\u0432\u0435\u0442 \u043F\u0443\u0441\u0442";a(m)}catch(l){s(new Error(`\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0430\u0440\u0441\u0438\u043D\u0433\u0430 \u043E\u0442\u0432\u0435\u0442\u0430: ${l.message}`))}else s(new Error(`HTTP ${c.statusCode}: ${p}`))})});i.on("error",c=>s(c)),i.on("timeout",()=>{i.destroy(),s(new Error("\u0422\u0430\u0439\u043C\u0430\u0443\u0442 \u0437\u0430\u043F\u0440\u043E\u0441\u0430 \u043A \u0448\u043B\u044E\u0437\u0443 (30\u0441)"))}),i.write(d),i.end()})}var P=class{constructor(t){this._context=t}async resolveWebviewView(t,n,r){this._view=t,t.webview.options={enableScripts:!0,localResourceRoots:[this._context.extensionUri]};let a=async()=>{let s=await C(this._context);t.webview.html=this._getHtmlForWebview(s)};await a(),t.webview.onDidReceiveMessage(async s=>{switch(s.type){case"saveKey":s.value?(await this._context.secrets.store(B,s.value.trim()),e.window.showInformationMessage("API-\u043A\u043B\u044E\u0447 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D \u0432 \u0437\u0430\u0449\u0438\u0449\u0435\u043D\u043D\u043E\u043C \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435 (SecretStorage).")):(await this._context.secrets.delete(B),e.window.showInformationMessage("API-\u043A\u043B\u044E\u0447 \u0443\u0434\u0430\u043B\u0435\u043D.")),await a();break;case"changeModel":await e.workspace.getConfiguration("normahub").update("defaultModel",s.value,e.ConfigurationTarget.Global),T(),await a();break;case"configureProject":let d=await A(this._context);t.webview.postMessage({type:"configDone",files:d});break;case"testPing":S((i,c)=>{t.webview.postMessage({type:"pingResult",latency:i,error:c})});break;case"openBilling":e.env.openExternal(e.Uri.parse("https://normahub.cc"));break;case"runPlayground":await this._handlePlaygroundRequest(s.prompt,s.model);break}})}async _handlePlaygroundRequest(t,n){if(!this._view)return;let r=await C(this._context);if(!r){this._view.webview.postMessage({type:"playgroundError",error:"API-\u043A\u043B\u044E\u0447 \u043D\u0435 \u0437\u0430\u0434\u0430\u043D. \u0423\u043A\u0430\u0436\u0438\u0442\u0435 \u043A\u043B\u044E\u0447 \u0432\u043E \u0432\u043A\u043B\u0430\u0434\u043A\u0435 \u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430."});return}let s=e.workspace.getConfiguration("normahub").get("baseUrl","https://api.normahub.cc/v1"),u=Date.now(),d=0;try{let i=new URL(`${s}/chat/completions`),c=JSON.stringify({model:n||"deepseek-v4.1-flash",messages:[{role:"user",content:t}],stream:!0}),p=y.request(i,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${r}`,"Content-Length":Buffer.byteLength(c)},timeout:25e3},l=>{if(l.statusCode&&(l.statusCode<200||l.statusCode>=300)){let m="";l.on("data",b=>{m+=b}),l.on("end",()=>{this._view?.webview.postMessage({type:"playgroundError",error:`HTTP ${l.statusCode}: ${m}`})});return}l.on("data",m=>{d||(d=Date.now()-u,this._view?.webview.postMessage({type:"playgroundTtft",ttft:d}));let b=m.toString().split(`
`);for(let E of b){let h=E.trim();if(h.startsWith("data: ")&&h!=="data: [DONE]")try{let k=JSON.parse(h.slice(6)).choices?.[0]?.delta?.content;k&&this._view?.webview.postMessage({type:"playgroundChunk",text:k})}catch{}}}),l.on("end",()=>{let m=Date.now()-u;this._view?.webview.postMessage({type:"playgroundDone",totalTime:m,ttft:d||m})})});p.on("error",l=>{this._view?.webview.postMessage({type:"playgroundError",error:l.message})}),p.write(c),p.end()}catch(i){this._view.webview.postMessage({type:"playgroundError",error:i.message})}}_getHtmlForWebview(t){let r=e.workspace.getConfiguration("normahub").get("defaultModel","claude-sonnet-5-5");return`<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NormaHub Gateway</title>
    <style>
        :root {
            --nh-accent: #2563eb;
            --nh-success: #16a34a;
            --nh-danger: #dc2626;
            --nh-surface: var(--vscode-editor-background);
            --nh-border: var(--vscode-widget-border, #333333);
        }
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-sideBar-background);
            padding: 10px;
            margin: 0;
            line-height: 1.4;
        }
        .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid var(--nh-border);
            padding-bottom: 8px;
            margin-bottom: 10px;
        }
        .title {
            font-weight: 600;
            font-size: 12px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }
        .badge {
            font-size: 10px;
            color: #4ade80;
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .tabs {
            display: flex;
            border-bottom: 1px solid var(--nh-border);
            margin-bottom: 10px;
            gap: 4px;
        }
        .tab {
            font-size: 11px;
            padding: 4px 8px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            color: var(--vscode-descriptionForeground);
            user-select: none;
        }
        .tab.active {
            color: var(--vscode-foreground);
            border-bottom-color: var(--vscode-activityBar-activeBorder, #007acc);
            font-weight: 600;
        }
        .tab-panel {
            display: none;
        }
        .tab-panel.active {
            display: block;
        }
        .card {
            background-color: var(--nh-surface);
            border: 1px solid var(--nh-border);
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 10px;
        }
        .card-title {
            font-size: 11px;
            font-weight: 600;
            color: var(--vscode-descriptionForeground);
            text-transform: uppercase;
            margin-bottom: 6px;
        }
        input[type="text"], input[type="password"], select, textarea {
            width: 100%;
            box-sizing: border-box;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border, #444);
            padding: 5px 8px;
            border-radius: 2px;
            font-size: 12px;
            outline: none;
            font-family: inherit;
        }
        textarea {
            resize: vertical;
            min-height: 50px;
            font-family: var(--vscode-editor-font-family, monospace);
        }
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 6px 10px;
            border-radius: 2px;
            cursor: pointer;
            font-size: 12px;
            width: 100%;
            margin-top: 6px;
            font-weight: 500;
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        button.secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        button.secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        .code-output {
            background-color: var(--vscode-editor-background);
            border: 1px solid var(--nh-border);
            border-radius: 2px;
            padding: 8px;
            font-family: var(--vscode-editor-font-family, monospace);
            font-size: 11px;
            white-space: pre-wrap;
            max-height: 180px;
            overflow-y: auto;
            margin-top: 6px;
        }
        .metric-row {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">NormaHub AI Gateway</div>
        <div class="badge" id="netStatus">\u25CF \u041F\u0440\u044F\u043C\u043E\u0439 \u043A\u0430\u043D\u0430\u043B RU</div>
    </div>

    <div class="tabs">
        <div class="tab active" data-tab="configTab">\u041F\u0440\u043E\u0435\u043A\u0442</div>
        <div class="tab" data-tab="playgroundTab">\u041F\u043B\u0435\u0439\u0433\u0440\u0430\u0443\u043D\u0434</div>
        <div class="tab" data-tab="diagTab">\u0428\u043B\u044E\u0437</div>
    </div>

    <!-- TAB 1: CONFIGURATION -->
    <div class="tab-panel active" id="configTab">
        <div class="card">
            <div class="card-title">\u0410\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044F</div>
            <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 4px;">
                \u041A\u043B\u044E\u0447: <code>${t?`${t.slice(0,8)}...${t.slice(-4)}`:"\u041A\u043B\u044E\u0447 \u043D\u0435 \u0437\u0430\u0434\u0430\u043D"}</code>
            </div>
            <input type="password" id="apiKeyInput" placeholder="nr_hub_..." />
            <button id="saveKeyBtn">\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0432 SecretStorage</button>
            <button class="secondary" id="billingBtn">\u041F\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u0431\u0430\u043B\u0430\u043D\u0441 (\u0421\u0411\u041F)</button>
        </div>

        <div class="card">
            <div class="card-title">\u0410\u043A\u0442\u0438\u0432\u043D\u0430\u044F \u043C\u043E\u0434\u0435\u043B\u044C</div>
            <select id="modelSelect">
                <option value="claude-sonnet-5-5" ${r==="claude-sonnet-5-5"?"selected":""}>Claude Sonnet 5.5 (\u041A\u043E\u0434 / \u0410\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u0430)</option>
                <option value="gpt-6-astra" ${r==="gpt-6-astra"?"selected":""}>GPT-6 Astra (\u0421\u043B\u043E\u0436\u043D\u0430\u044F \u043B\u043E\u0433\u0438\u043A\u0430)</option>
                <option value="deepseek-v4.1-flash" ${r==="deepseek-v4.1-flash"?"selected":""}>DeepSeek v4.1 Flash (\u0410\u0432\u0442\u043E\u043A\u043E\u043C\u043F\u043B\u0438\u0442)</option>
                <option value="claude-opus-5" ${r==="claude-opus-5"?"selected":""}>Claude Opus 5 (\u0420\u0435\u0444\u0430\u043A\u0442\u043E\u0440\u0438\u043D\u0433)</option>
            </select>
        </div>

        <div class="card">
            <div class="card-title">\u041A\u043E\u043D\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u044F \u043F\u0440\u043E\u0435\u043A\u0442\u0430 \u0432 1 \u043A\u043B\u0438\u043A</div>
            <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 6px;">
                \u0413\u0435\u043D\u0435\u0440\u0438\u0440\u0443\u0435\u0442 \u0444\u0430\u0439\u043B\u044B \u0434\u043B\u044F Cursor (.cursorrules, .cursor/rules), Windsurf, Aider \u0438 Cline.
            </div>
            <button id="configProjBtn">\u0421\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043A\u043E\u043D\u0444\u0438\u0433\u0438</button>
            <div id="configStatus" style="font-size: 11px; color: #4ade80; margin-top: 4px;"></div>
        </div>
    </div>

    <!-- TAB 2: PLAYGROUND -->
    <div class="tab-panel" id="playgroundTab">
        <div class="card">
            <div class="card-title">\u0422\u0435\u0441\u0442\u043E\u0432\u044B\u0439 \u0437\u0430\u043F\u0440\u043E\u0441 \u043A \u0448\u043B\u044E\u0437\u0443</div>
            <textarea id="promptInput" placeholder="\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043F\u0440\u043E\u043C\u043F\u0442 \u0434\u043B\u044F \u0442\u0435\u0441\u0442\u0430 (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u041D\u0430\u043F\u0438\u0448\u0438 quicksort \u043D\u0430 Python \u0441 \u0442\u0438\u043F\u0430\u043C\u0438)..."></textarea>
            <select id="playgroundModel" style="margin-top: 6px;">
                <option value="deepseek-v4.1-flash">DeepSeek v4.1 Flash (\u0411\u044B\u0441\u0442\u0440\u044B\u0439)</option>
                <option value="claude-sonnet-5-5">Claude Sonnet 5.5 (\u0418\u043D\u0436\u0435\u043D\u0435\u0440\u043D\u044B\u0439)</option>
                <option value="gpt-6-astra">GPT-6 Astra (\u041B\u043E\u0433\u0438\u043A\u0430)</option>
            </select>
            <button id="runPlaygroundBtn">\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u043F\u0440\u043E\u0441</button>
            <div class="metric-row">
                <span id="ttftMetric">TTFT: --</span>
                <span id="totalTimeMetric">\u0412\u0440\u0435\u043C\u044F: --</span>
            </div>
            <div class="code-output" id="playgroundOutput" style="display: none;"></div>
        </div>
    </div>

    <!-- TAB 3: DIAGNOSTICS -->
    <div class="tab-panel" id="diagTab">
        <div class="card">
            <div class="card-title">\u0421\u0435\u0442\u0435\u0432\u0430\u044F \u0434\u0438\u0430\u0433\u043D\u043E\u0441\u0442\u0438\u043A\u0430</div>
            <button class="secondary" id="pingBtn">\u0417\u0430\u043C\u0435\u0440\u0438\u0442\u044C \u0441\u0435\u0442\u0435\u0432\u043E\u0439 \u043E\u0442\u043A\u043B\u0438\u043A</button>
            <div class="metric-row" style="margin-top: 6px;">
                <span>\u042D\u043D\u0434\u043F\u043E\u0438\u043D\u0442:</span>
                <code>api.normahub.cc/v1</code>
            </div>
            <div class="metric-row">
                <span>\u0417\u0430\u0434\u0435\u0440\u0436\u043A\u0430:</span>
                <span id="pingOutput" style="font-weight: 600;">\u041D\u0435 \u0437\u0430\u043C\u0435\u0440\u044F\u043B\u0430\u0441\u044C</span>
            </div>
        </div>

        <div class="card">
            <div class="card-title">\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044F \u0438 SDK</div>
            <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 6px;">
                \u041E\u0444\u0438\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u0430\u0442\u0430\u043B\u043E\u0433 \u043C\u043E\u0434\u0435\u043B\u0435\u0439, \u0442\u0430\u0440\u0438\u0444\u044B \u0438 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044F API.
            </div>
            <button class="secondary" id="docsBtn">\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044E</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        // Tabs logic
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                const targetId = tab.getAttribute('data-tab');
                document.getElementById(targetId).classList.add('active');
            });
        });

        // Config actions
        document.getElementById('saveKeyBtn').addEventListener('click', () => {
            const val = document.getElementById('apiKeyInput').value;
            vscode.postMessage({ type: 'saveKey', value: val });
        });

        document.getElementById('billingBtn').addEventListener('click', () => {
            vscode.postMessage({ type: 'openBilling' });
        });

        document.getElementById('modelSelect').addEventListener('change', (e) => {
            vscode.postMessage({ type: 'changeModel', value: e.target.value });
        });

        document.getElementById('configProjBtn').addEventListener('click', () => {
            vscode.postMessage({ type: 'configureProject' });
        });

        // Diagnostics
        document.getElementById('pingBtn').addEventListener('click', () => {
            const out = document.getElementById('pingOutput');
            out.textContent = '\u0417\u0430\u043C\u0435\u0440...';
            vscode.postMessage({ type: 'testPing' });
        });

        document.getElementById('docsBtn').addEventListener('click', () => {
            vscode.postMessage({ type: 'openBilling' });
        });

        // Playground
        const runBtn = document.getElementById('runPlaygroundBtn');
        const promptInput = document.getElementById('promptInput');
        const playgroundOutput = document.getElementById('playgroundOutput');
        const ttftMetric = document.getElementById('ttftMetric');
        const totalTimeMetric = document.getElementById('totalTimeMetric');

        runBtn.addEventListener('click', () => {
            const prompt = promptInput.value.trim();
            if (!prompt) return;

            playgroundOutput.style.display = 'block';
            playgroundOutput.textContent = '\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043A \u0448\u043B\u044E\u0437\u0443...\\n';
            ttftMetric.textContent = 'TTFT: \u0437\u0430\u043C\u0435\u0440...';
            totalTimeMetric.textContent = '\u0412\u0440\u0435\u043C\u044F: \u0437\u0430\u043C\u0435\u0440...';
            runBtn.disabled = true;

            const selectedModel = document.getElementById('playgroundModel').value;
            vscode.postMessage({
                type: 'runPlayground',
                prompt: prompt,
                model: selectedModel
            });
        });

        window.addEventListener('message', event => {
            const msg = event.data;
            if (msg.type === 'pingResult') {
                const out = document.getElementById('pingOutput');
                if (msg.latency >= 0) {
                    out.textContent = msg.latency + ' \u043C\u0441 (\u041F\u0440\u044F\u043C\u043E\u0439 RU)';
                    out.style.color = '#4ade80';
                } else {
                    out.textContent = '\u041E\u0448\u0438\u0431\u043A\u0430: ' + (msg.error || '\u0442\u0430\u0439\u043C\u0430\u0443\u0442');
                    out.style.color = '#f87171';
                }
            } else if (msg.type === 'configDone') {
                const status = document.getElementById('configStatus');
                status.textContent = '\u0421\u043E\u0437\u0434\u0430\u043D\u043E ' + (msg.files ? msg.files.length : 0) + ' \u0444\u0430\u0439\u043B\u043E\u0432 (.cursorrules, .windsurfrules, .aider...)';
            } else if (msg.type === 'playgroundTtft') {
                ttftMetric.textContent = 'TTFT: ' + msg.ttft + ' \u043C\u0441';
            } else if (msg.type === 'playgroundChunk') {
                if (playgroundOutput.textContent === '\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043A \u0448\u043B\u044E\u0437\u0443...\\n') {
                    playgroundOutput.textContent = '';
                }
                playgroundOutput.textContent += msg.text;
                playgroundOutput.scrollTop = playgroundOutput.scrollHeight;
            } else if (msg.type === 'playgroundDone') {
                totalTimeMetric.textContent = '\u0412\u0440\u0435\u043C\u044F: ' + msg.totalTime + ' \u043C\u0441';
                runBtn.disabled = false;
            } else if (msg.type === 'playgroundError') {
                playgroundOutput.textContent += '\\n[\u041E\u0448\u0438\u0431\u043A\u0430]: ' + msg.error;
                playgroundOutput.style.color = '#f87171';
                runBtn.disabled = false;
            }
        });
    </script>
</body>
</html>`}};0&&(module.exports={activate});
