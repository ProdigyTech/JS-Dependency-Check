import e from"path";import{promises as n}from"fs";import t from"app-root-path";import r from"axios";import o from"semver/functions/gte.js";import a from"semver/functions/diff.js";import{d as s,F as d,c as i,S as c,a as p,b as l,r as u}from"./enums-8d1cc76b.js";import g from"cli-table";const h=(e={})=>Object.keys(e).map((n=>({package:n,version:e[n]}))),k=t.path,f=async()=>{const t=e.join(k,"package.json"),r=JSON.parse(await(async({path:e})=>{try{return n.readFile(e)}catch(n){console.error(`Error reading file ${e}`),console.error(n),process.exit(1)}})({path:t}));return{repoInfo:{name:r.name||"",version:r.version||""},dependencies:h(r.dependencies)||[],peerDependencies:h(r.peerDependencies)||[],devDependencies:h(r.devDependencies)||[]}},y=async(e,n)=>{try{const t=[],r=((e,n)=>n.filter((n=>!e.includes(n.package))))(n,e),o=await Promise.all(r.map((async e=>{const n=await m({package:e.package});return await R(n,e)})));return{successfulLookups:o.filter((e=>!e.package.error||(t.push(e),!1))),failedLookups:t}}catch(e){console.error(e),process.exit(1)}},m=async({package:e})=>{const n=`https://registry.npmjs.org/${e}`;try{const{data:e}=await r.get(n),{time:t}=e;return{versionTimeline:t,tags:e["dist-tags"]}}catch(t){return console.error(`There was an issue searching the registry for ${e}, skipping...`),{error:!0,name:e,url:n,stackTrace:t}}},v=({name:e,versionTimeline:n,latest:t,definedVersion:r,error:o=!1,currentPackage:s,stackTrace:d})=>o?{package:{error:o,name:s.package,version:s.version,stackTrace:d}}:{package:{name:e,registry_url:`https://registry.npmjs.org/${e}`,npm_url:`https://www.npmjs.com/package/${e}`,latest:{version:t||r,releaseDate:n[t]||n[r]},current:{version:r,releaseDate:n[r]},upgradeType:`${a(r,t||r)||"N/A"}`.toUpperCase(),error:o}},R=async({versionTimeline:e,tags:n,error:t=!1,stackTrace:r},a)=>new Promise(((s,d)=>{try{if(t)return s(v({error:t,currentPackage:a,stackTrace:r}));const d=(e=>{if(Number.isNaN(Number.parseFloat(e.version))){const n=e.version.split(""),[,...t]=n;return t.join("")}return e.version})(a),{latest:i}=n;let c={};c=o(d,i)?v({name:a.package,versionTimeline:e,definedVersion:d}):v({name:a.package,versionTimeline:e,latest:i,definedVersion:d}),s(c)}catch(e){console.warn(e),d(e)}})),b=(e,n)=>{if(e.length){const t=new g({head:n===d?[n,"Project Version","Error Info"]:[n,"Project Version","Latest Version","Upgrade Type"],colWidths:n===d?[25,25,25]:[25,25,25,25],colors:!0});return e.forEach((({package:e})=>{const{name:n,current:r,latest:o,upgradeType:a,error:s}=e;s?t.push([n,e.version,e.stackTrace]):t.push([n,r.version,o.version,a.toUpperCase()])})),t}return""},w=e.resolve(t.path),D={[i.MAJOR]:e=>"N/A"!=e.upgradeType,[i.PATCH]:e=>e.upgradeType===i.PATCH,[i.MINOR]:e=>e.upgradeType===i.MINOR||e===i.PATCH,[i.PREMAJOR]:e=>e.upgradeType.includes("PRE"),[i.PREMINOR]:e=>e.upgradeType===i.PREMINOR||e===i.PREPATCH,[i.PREPATCH]:e=>e.upgradeType===i.PREPATCH,[i.PRERELEASE]:e=>e.upgradeType===i.PRERELEASE,[i.NONE]:()=>!1},T=({peerDependenciesResult:e,devDependenciesResult:n,dependenciesResult:t})=>[...e,...n,...t].reduce(((e,{package:n})=>{const{upgradeType:t}=n;return e[t]?{...e,[t]:e[t]+1}:{...e,[t]:1}}),{}),$=(e,n=i.MINOR)=>new Promise(((t,r)=>{try{const{devDependencies:r,peerDependencies:o,dependencies:a}=e.packages;let s=[];s=((e,n)=>{let t=[];return D[n]?t=e.filter((({package:e})=>D[n](e))):(console.log(`Unknown failOnKey: ${n} passed in package.json, using default ${i.DEFAULT}`),t=e.filter((({package:e})=>D[i.DEFAULT](e)))),t})([...r,...o,...a],n),s.length>0?t({exitCode:1,failedPackages:s}):(console.log("Dependencies are up to date."),t({exitCode:0,failedPackages:[]}))}catch(e){console.log(e),r({exitCode:1,failedPackages:[]})}})),P=async({peerDependenciesResult:e,devDependenciesResult:n,dependenciesResult:t,failedLookupResult:r,disableTime:o=!1},{name:a,version:i},{failOn:c})=>{try{const l=new Date,u={repoInfo:{name:a,version:i},packages:{devDependencies:n,peerDependencies:e,dependencies:t,failedLookups:r},stats:T({peerDependenciesResult:e,devDependenciesResult:n,dependenciesResult:t}),reportGeneratedAt:{date:!o&&l.toLocaleDateString(),time:!o&&l.toLocaleTimeString()}},{exitCode:h,failedPackages:k}=await $(u,c);return await(p=u,new Promise(((e,n)=>{try{const{devDependencies:n,peerDependencies:t,dependencies:r,failedLookups:o}=p.packages,a=b(n,s.DEV),i=b(t,s.PEER),c=b(r,s.DEP),l=b(o,d);console.log(a.toString()),console.log(i.toString()),console.log(c.toString()),console.log(l.toString()),e()}catch(e){console.error(e),n(e),process.exit(1)}}))),k.length>0&&await(e=>new Promise(((n,t)=>{try{const t=new g({head:["Packages Requiring Attention","Project Version","Latest Version","Upgrade Type"],colWidths:[30,25,25,25],colors:!0});e.forEach((({package:e})=>{const{name:n,current:r,latest:o,upgradeType:a}=e;t.push([n,r.version,o.version,a.toUpperCase()])})),console.log(t.toString()),n()}catch(e){t(e)}})))(k),h>0&&console.log("Out of date dependencies detected. Please upgrade or ignore out of date dependencies. \n Review the Packages Requiring Attention section for more info"),{exitCode:h}}catch(e){console.error(e)}var p},L=({peerDependenciesResult:e,devDependenciesResult:n,dependenciesResult:t,failedLookupResult:r},{name:o,version:a})=>{const{template:s,outdated_counter:d}=O(t,"Dependencies"),{template:i,outdated_counter:c}=O(n,"Dev Dependencies"),{template:p,outdated_counter:l}=O(e,"Peer Dependencies"),{errorTable:u}=E(r),g=j(),h=A({peerDependenciesResult:e,devDependenciesResult:n,dependenciesResult:t,failedLookupResult:r});return`\n        <html>\n        <title> Dependency Check -- Report </title>\n        <head>\n        </head>\n        <style>\n        {\n        font-family: Arial, Helvetica, sans-serif;\n        border-collapse: collapse;\n        width: 100%;\n        }\n\n        div.wrapper{\n        display: flex;\n        flex-direction: column;\n        flex-wrap: wrap;\n        width:100%;\n        }\n\n        .header, .sub-header{\n          flex-direction: row;\n          width:90%;\n        }\n        \n        .legend-table {\n          flex-direction: row;\n          width: 50%;\n          margin-right: 3em;\n        }\n        \n        .dep-table, .dev-table, .peer-table, .error-table {\n             width: 80%;\n             flex-direction: row;\n             min-width: 60%;\n        }\n        .status {\n          min-width: 5em;\n        }\n\n         td, th {\n        border: 1px solid #ddd;\n        padding: 8px;\n        }\n        tr {\n            cursor: pointer;\n        }\n        tr:nth-child(even){background-color: #f2f2f2;}\n\n        tr:hover {background-color: #ddd;}\n\n        #th {\n        padding-top: 12px;\n        padding-bottom: 12px;\n        text-align: left;\n        background-color: #04AA6D;\n        color: white;\n        }\n        </style>\n    \n        <body>\n        <div class="wrapper">\n        <div class=header>\n        <h2>Dependency Check Results for ${o} v${a} </h2>\n        </div>\n        <div class="sub-header">\n          <h3>${(()=>{const e=c+l+d;return 0==e?`🎉 There are ${e} packages that need to be updated. Woohoo! `:1==e?`⚠️ There is ${e} package that needs to be updated - Not bad! `:e>1&&e<10?`⚠️ There are  ${e} packages that need to be updated`:e>=10?`​​⚠️​😱​ Ouch... There are ${e} packages that need to be updated 🙈 Good Luck! `:void 0})()} </h3>\n        </div>\n        \n        <div class="legend-table"> \n          ${g}\n        </div>\n        <div class="stats-table">\n          ${h}\n        </div>\n        <div class="dep-table">\n                ${s}\n        </div>\n        <div class="dev-table">\n                ${i}\n        </div>\n        <div class="peer-table">\n                ${p}\n        </div>\n        <div class="error-table">\n            ${u}\n        </div>\n        </div>\n        </body>\n        </html>\n    `},C=[{key:[c,"N/A"],color:"background-color:green",meaning:"Up to date, no action needed."},{key:["PATCH"],color:"background-color:yellowgreen",meaning:"Patch upgrade, no breaking changes"},{key:["PREPATCH","PREMINOR","MINOR"],color:"background-color:yellow",meaning:"Minor upgrade, possible breaking changes. \n Consult the change log"},{key:["PRERELEASE","MAJOR","PREMAJOR"],color:"background-color:red",meaning:"Major upgrade with breaking changes. \n Consult the change log"}],E=(e=[])=>({errorTable:e.length?`\n                    <h2>Failed Lookups </h2>\n                    <h4>We couldn't locate the packages below in the public npm registry </h4>\n                <table id="result-table-error style="width:100%">\n                    <thead>\n                        <tr>\n                        <td>Package</td>\n                        <td>Current Version</td>\n                        <td>Status</td>\n                        <td>Response Code</td>\n                    </thead>\n                    <tbody>\n                       ${e.map((({package:e})=>`<tr>\n                           <td>${e.name}</td>\n                           <td>${e.version}</td>\n                           <td>${p}</td>\n                           <td>${e.stackTrace.toString()}</td>\n                           </tr>`)).join("")}\n                    </tbody>\n                    </table>`:""}),j=()=>`    \n                    <h4>Legend </h4>\n                <table id="legend">\n                    <thead>\n                        <tr>\n                        <td>Color</td>\n                        <td>Meaning</td>\n                        <td>Upgrade Type</td>\n                    </thead>\n                    <tbody>\n                       ${C.map((({color:e,meaning:n,key:t})=>`<tr>\n                           <td style="${e}"></td>\n                           <td>${n}</td>\n                           <td>${t.join(" ")}</td>\n                           </tr>`)).join("")}\n                    </tbody>\n                    </table>`,O=(e,n)=>{const t=e=>{return(n=e,C.find((({key:e})=>e.includes(n)))).color;var n};let r=0;return{template:e.length?`\n                    <h2>${n}</h2>\n                <table id="result-table-${n} style="width:100%">\n                    <thead>\n                        <tr>\n                        <td>Package</td>\n                        <td>Current Version</td>\n                        <td>Current Release Date</td>\n                        <td>Latest Version</td>\n                        <td>Latest Version Release Date</td>\n                        <td>Status</td>\n                        <td> Upgrade Type </td>\n                        <td> Link to package in registry </td>\n                        <td> Link to package on NPM </td>\n                        </tr>\n                    </thead>\n                    <tbody>\n                       ${e.map((({package:e})=>{const{name:n,registry_url:a,npm_url:s,latest:d,current:i,upgradeType:u}=e,g=((e,n)=>"ERROR"===e||"ERROR"===n?p:o(n,e)?c:l)(d.version,i.version);g===l&&r++;const h=new Date(i.releaseDate).toLocaleDateString(),k=new Date(d.releaseDate).toLocaleDateString();return`<tr>\n                        <td>${n}</td>\n                        <td> ${i.version} </td>\n                        <td>${h}</td>\n                        <td>${d.version} </td>\n                         <td>${k}</td>\n                        <td class="status" style=${t(u.toUpperCase())}>${g}</td>\n                        <td> ${u.toUpperCase()} </td>\n                        <td> <a href=${a} target="_blank"> ${a} </a> </td>\n                        <td> <a href=${s} target="_blank"> ${s} </a> </td>\n                        </tr>`})).join("")}\n                    </tbody>\n                    </table>`:"",outdated_counter:r}},A=({peerDependenciesResult:e,devDependenciesResult:n,dependenciesResult:t})=>{const r=T({peerDependenciesResult:e,devDependenciesResult:n,dependenciesResult:t}),o=Object.keys(r).filter((e=>"N/A"!==e));return o.length?`    \n                    <h4>Stats </h4>\n                <table id="stats">\n                    <thead>\n                        <tr>\n                        <td>Upgrade Type</td>\n                        <td>Package Count</td>\n                    </thead>\n                    <tbody>\n                    ${o.map((e=>`\n                      <tr>\n                      <td>${e.toUpperCase()}</td>\n                      <td>${r[e]}</td>\n                      </tr>\n                      `)).join("")}\n                    </tbody>\n                    </table>`:""},x=async(t,r)=>{try{const o=e.join(w,`dependency-status-report.${r.toLowerCase()}`);await n.writeFile(o,t),console.log(`Wrote report to ${o}`)}catch(e){console.error(e)}};let S=!1;const N=e=>{const n=M.find((e=>e.includes("--report-type=")));if(n){const e=n.split("=");S=!0;const t=Object.keys(u).find((n=>n==e[1]));return t||(console.log(`You've supplied an invalid report type, Valid types are CI, JSON, HTML... You supplied ${e[1]} \n defaulting to HTML`),u.HTML)}return e?.reportType&&Object.keys(u).find((n=>n==e.reportType))||u.HTML},M=process.argv.slice(2),I=async n=>{try{const t=await f(),r=await(async()=>{try{const n=e.join(k,"dependencyCheckConfig.js");return(await import(`${n}`)).default}catch(e){console.error("error reading config file"),console.log(e),process.exit(1)}})(),{peerDependencies:o,dependencies:a,devDependencies:s,repoInfo:d}=t,i=n||N(r);((e,n,t)=>{e?(e.reportType&&n&&t&&(console.log("Looks like you've supplied a reportType config option and a reportType CLI arg. Ignoring the config option from Package.json"),console.log("Report Type: ",n)),e.failOn&&n!==u.CI&&console.log("Looks like you've added a failOn config option. This only works when the report type is CI. Ignoring..."),e.ignorePackages&&console.log(`Ignoring the following packages... ${e.ignorePackages.join(" ")}`)):console.log("Couldn't find config options in your package.json, using default options")})(r,i,S);const c=await(async({peerDependencies:e=[],devDependencies:n=[],dependencies:t=[],config:r={}})=>{const o=[],a=r.ignorePackages||[],{successfulLookups:s,failedLookups:d}=await y(e,a),{successfulLookups:i,failedLookups:c}=await y(n,a),{successfulLookups:p,failedLookups:l}=await y(t,a);return o.push(...l,...c,...d),{peerDependenciesResult:s,devDependenciesResult:i,dependenciesResult:p,failedLookupResult:o}})({peerDependencies:o,dependencies:a,devDependencies:s,config:r});switch(i){case u.HTML:const e=L(c,d);await x(e,u.HTML);break;case u.JSON:const n=(({peerDependenciesResult:e,devDependenciesResult:n,dependenciesResult:t,failedLookupResult:r,disableTime:o=!1},{name:a,version:s})=>{const d=new Date;return JSON.stringify({repoInfo:{name:a,version:s},packages:{devDependencies:n,peerDependencies:e,dependencies:t,failedLookups:r},stats:T({peerDependenciesResult:e,devDependenciesResult:n,dependenciesResult:t}),reportGeneratedAt:{date:!o&&d.toLocaleDateString(),time:!o&&d.toLocaleTimeString()}},null,2)})(c,d);await x(n,u.JSON);break;case u.CI:const t=await P(c,d,r),{exitCode:o}=t;process.exit(o);default:const a=L(c,d);await x(a,u.HTML)}}catch(e){console.log("Something went wrong while running the utility"),console.error(e),process.exit(1)}};I();export{N as getReportType,I as runScript};