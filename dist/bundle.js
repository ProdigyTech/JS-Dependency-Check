#! /usr/bin/env node
import e from "path";
import { promises as n } from "fs";
import t from "semver/functions/gte.js";
import r from "axios";
import a from "semver/functions/diff.js";
import s from "app-root-path";
const d = (e = {}) =>
    Object.keys(e).map((n) => ({ package: n, version: e[n] })),
  o = (e, n) => {
    let r = 0;
    return {
      template: e.length
        ? `\n                    <h2>${n}</h2>\n                <table id="result-table-${n}">\n                    <thead>\n                        <tr>\n                        <td>Package</td>\n                        <td>Current Version</td>\n                        <td>Current Release Date</td>\n                        <td>Latest Version</td>\n                        <td>Latest Version Release Date</td>\n                        <td>Status</td>\n                        <td> Upgrade Type </td>\n                        <td> Link to package in registry </td>\n                        <td> Link to package on NPM </td>\n                        </tr>\n                    </thead>\n                    <tbody>\n                       ${e
            .map(({ package: e }) => {
              const {
                  name: n,
                  registry_url: a,
                  npm_url: s,
                  latest: d,
                  current: o,
                  upgradeType: i,
                } = e,
                c = ((e, n) => (t(n, e) ? "UP TO DATE" : "OUTDATED"))(
                  d.version,
                  o.version
                );
              "OUTDATED" === c && r++;
              const p = new Date(o.releaseDate).toLocaleDateString(),
                l = new Date(d.releaseDate).toLocaleDateString();
              return `<tr>\n                        <td>${n}</td>\n                        <td> ${
                o.version
              } </td>\n                        <td>${p}</td>\n                        <td>${
                d.version
              } </td>\n                         <td>${l}</td>\n                        <td style=${
                "OUTDATED" === c
                  ? "background-color:red"
                  : "background-color:green"
              }>${c}</td>\n                        <td> ${i.toUpperCase()} </td>\n                        <td> <a href=${a} target="_blank"> ${a} </a> </td>\n                        <td> <a href=${s} target="_blank"> ${s} </a> </td>\n                        </tr>`;
            })
            .join(
              ""
            )}\n                    </tbody>\n                    </table>`
        : "",
      outdated_counter: r,
    };
  },
  i = process.env.DEP_CHECK_WHITELIST || [],
  c = async (e, n) => {
    try {
      const t = ((e, n) => n.filter((n) => !e.includes(n.package)))(n, e);
      return await Promise.all(
        t.map(async (e) => {
          const n = await p({ package: e.package });
          return await u(n, e);
        })
      );
    } catch (e) {
      console.error(e), process.exit(1);
    }
  },
  p = async ({ package: e }) => {
    const { data: n } = await r.get(`https://registry.npmjs.org/${e}`),
      { time: t } = n;
    return { versionTimeline: t, tags: n["dist-tags"] };
  },
  l = ({ name: e, versionTimeline: n, latest: t, definedVersion: r }) => ({
    package: {
      name: e,
      registry_url: `https://registry.npmjs.org/${e}`,
      npm_url: `https://www.npmjs.com/package/${e}`,
      latest: { version: t || r, releaseDate: n[t] || n[r] },
      current: { version: r, releaseDate: n[r] },
      upgradeType: a(r, t || r) || "N/A",
    },
  }),
  u = async ({ versionTimeline: e, tags: n }, r) =>
    new Promise((a, s) => {
      try {
        const s = (() => {
            if (Number.isNaN(Number.parseFloat(r.version))) {
              const e = r.version.split(""),
                [n, ...t] = e;
              return t.join("");
            }
            return r.version;
          })(),
          { latest: d } = n;
        let o = {};
        (o = t(s, d)
          ? l({ name: r.package, versionTimeline: e, definedVersion: s })
          : l({
              name: r.package,
              versionTimeline: e,
              latest: d,
              definedVersion: s,
            })),
          a(o);
      } catch (e) {
        console.warn(e), s(e);
      }
    });
global.__basedir = s.path;
const g = await (async () => {
    const t = e.join(__basedir, "package.json"),
      r = JSON.parse(
        await (async ({ path: e, encoding: t, ...r }) => {
          try {
            return n.readFile(e);
          } catch (n) {
            console.error(`Error reading file ${e}`),
              console.error(n),
              process.exit(1);
          }
        })({ path: t })
      );
    return {
      repoInfo: { name: r.name || "", version: r.version || "" },
      dependencies: d(r.dependencies) || [],
      peerDependencies: d(r.peerDependencies) || [],
      devDependencies: d(r.devDependencies) || [],
    };
  })(),
  { peerDependencies: m, dependencies: h, devDependencies: v, repoInfo: D } = g,
  b = await (async ({
    peerDependencies: e = [],
    devDependencies: n = [],
    dependencies: t = [],
  }) => {
    const r = i.length > 0 ? i.split(",") : [];
    return {
      peerDependenciesResult: await c(e, r),
      devDependenciesResult: await c(n, r),
      dependenciesResult: await c(t, r),
    };
  })({ peerDependencies: m, dependencies: h, devDependencies: v }),
  y = (({
    peerDependenciesResult: e,
    devDependenciesResult: n,
    dependenciesResult: t,
  }) => {
    const { template: r, outdated_counter: a } = o(t, "Dependencies"),
      { template: s, outdated_counter: d } = o(n, "Dev Dependencies"),
      { template: i, outdated_counter: c } = o(e, "Peer Dependencies");
    return `\n        <html>\n        <title> Dependency Check -- Report </title>\n        <head>\n        </head>\n        <style>\n        {\n        font-family: Arial, Helvetica, sans-serif;\n        border-collapse: collapse;\n        width: 100%;\n        }\n\n         td, th {\n        border: 1px solid #ddd;\n        padding: 8px;\n        }\n        tr {\n            cursor: pointer;\n        }\n        tr:nth-child(even){background-color: #f2f2f2;}\n\n        tr:hover {background-color: #ddd;}\n\n        #th {\n        padding-top: 12px;\n        padding-bottom: 12px;\n        text-align: left;\n        background-color: #04AA6D;\n        color: white;\n        }\n        </style>\n    \n        <body>\n        <h1> Results Below: </h1>\n        <h3>${(() => {
      const e = d + c + a;
      return 0 == e
        ? `🎉 There are ${e} Packages that need to be updated. Woohoo! `
        : 1 == e
        ? `⚠️ There is ${e} Package that needs to be updated - Not bad! `
        : e > 1 && e < 10
        ? `⚠️ There are  ${e} Packages that need to be updated`
        : e >= 10
        ? `​​⚠️​😱​ Ouch... There are ${e} Packages that need to be updated 🙈 Good Luck! `
        : void 0;
    })()} </h3>\n        <div class="dep-table">\n                ${r}\n        </div>\n        <div class="dev-table">\n                ${s}\n        </div>\n        <div class="peer-table">\n                ${i}\n        </div>\n        </body>\n    `;
  })(b);
await (async (t) => {
  try {
    const r = e.join(__basedir, "dependency-status-report.html");
    await n.writeFile(r, t), console.log(`Wrote report to ${r}`);
  } catch (e) {
    console.error(e);
  }
})(y);
