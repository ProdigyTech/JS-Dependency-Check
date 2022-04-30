#!/usr/bin/env node
import e from "path";
import { promises as n } from "fs";
import t from "app-root-path";
import r from "axios";
import a from "semver/functions/gte.js";
import s from "semver/functions/diff.js";
const d = (e = {}) =>
    Object.keys(e).map((n) => ({ package: n, version: e[n] })),
  o = t.path,
  i = async () => {
    const t = e.join(o, "package.json"),
      r = JSON.parse(
        await (async ({ path: e }) => {
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
  },
  c = process.env.DEP_CHECK_WHITELIST || [],
  l = async (e, n) => {
    try {
      const t = [],
        r = ((e, n) => n.filter((n) => !e.includes(n.package)))(n, e),
        a = await Promise.all(
          r.map(async (e) => {
            const n = await p({ package: e.package });
            return await g(n, e);
          })
        );
      return {
        successfulLookups: a.filter((e) => !e.package.error || (t.push(e), !1)),
        failedLookups: t,
      };
    } catch (e) {
      console.error(e), process.exit(1);
    }
  },
  p = async ({ package: e }) => {
    const n = `https://registry.npmjs.org/${e}`;
    try {
      const { data: e } = await r.get(n),
        { time: t } = e;
      return { versionTimeline: t, tags: e["dist-tags"] };
    } catch (t) {
      return (
        console.error(
          `There was an issue searching the registry for ${e}, skipping...`
        ),
        { error: !0, name: e, url: n, stackTrace: t }
      );
    }
  },
  u = ({
    name: e,
    versionTimeline: n,
    latest: t,
    definedVersion: r,
    error: a = !1,
    currentPackage: d,
    stackTrace: o,
  }) =>
    a
      ? {
          package: {
            error: a,
            name: d.package,
            version: d.version,
            stackTrace: o,
          },
        }
      : {
          package: {
            name: e,
            registry_url: `https://registry.npmjs.org/${e}`,
            npm_url: `https://www.npmjs.com/package/${e}`,
            latest: { version: t || r, releaseDate: n[t] || n[r] },
            current: { version: r, releaseDate: n[r] },
            upgradeType: s(r, t || r) || "N/A",
            error: a,
          },
        },
  g = async (
    { versionTimeline: e, tags: n, error: t = !1, stackTrace: r },
    s
  ) =>
    new Promise((d, o) => {
      try {
        if (t) return d(u({ error: t, currentPackage: s, stackTrace: r }));
        const o = ((e) => {
            if (Number.isNaN(Number.parseFloat(e.version))) {
              const n = e.version.split(""),
                [, ...t] = n;
              return t.join("");
            }
            return e.version;
          })(s),
          { latest: i } = n;
        let c = {};
        (c = a(o, i)
          ? u({ name: s.package, versionTimeline: e, definedVersion: o })
          : u({
              name: s.package,
              versionTimeline: e,
              latest: i,
              definedVersion: o,
            })),
          d(c);
      } catch (e) {
        console.warn(e), o(e);
      }
    }),
  h = { JSON: "JSON", HTML: "HTML" },
  k = e.resolve(t.path),
  m = ({
    peerDependenciesResult: e,
    devDependenciesResult: n,
    dependenciesResult: t,
  }) =>
    [...e, ...n, ...t].reduce((e, { package: n }) => {
      const { upgradeType: t } = n;
      return e[t] ? { ...e, [t]: e[t] + 1 } : { ...e, [t]: 1 };
    }, {}),
  v = [
    {
      key: ["UP TO DATE", "N/A"],
      color: "background-color:green",
      meaning: "Up to date, no action needed.",
    },
    {
      key: ["PATCH"],
      color: "background-color:yellowgreen",
      meaning: "Patch upgrade, no breaking changes",
    },
    {
      key: ["PREPATCH", "PREMINOR", "MINOR"],
      color: "background-color:yellow",
      meaning:
        "Minor upgrade, possible breaking changes. \n Consult the change log",
    },
    {
      key: ["PRERELEASE", "MAJOR", "PREMAJOR"],
      color: "background-color:red",
      meaning: "Major upgrade with breaking changes. \n Consult the change log",
    },
  ],
  b = (e = []) => ({
    errorTable: e.length
      ? `\n                    <h2>Failed Lookups </h2>\n                    <h4>We couldn't locate the packages below in the public npm registry </h4>\n                <table id="result-table-error style="width:100%">\n                    <thead>\n                        <tr>\n                        <td>Package</td>\n                        <td>Current Version</td>\n                        <td>Status</td>\n                        <td>Response Code</td>\n                    </thead>\n                    <tbody>\n                       ${e
          .map(
            ({ package: e }) =>
              `<tr>\n                           <td>${
                e.name
              }</td>\n                           <td>${
                e.version
              }</td>\n                           <td>UNKNOWN</td>\n                           <td>${e.stackTrace.toString()}</td>\n                           </tr>`
          )
          .join(
            ""
          )}\n                    </tbody>\n                    </table>`
      : "",
  }),
  y = () =>
    `    \n                    <h4>Legend </h4>\n                <table id="legend">\n                    <thead>\n                        <tr>\n                        <td>Color</td>\n                        <td>Meaning</td>\n                        <td>Upgrade Type</td>\n                    </thead>\n                    <tbody>\n                       ${v
      .map(
        ({ color: e, meaning: n, key: t }) =>
          `<tr>\n                           <td style="${e}"></td>\n                           <td>${n}</td>\n                           <td>${t.join(
            " "
          )}</td>\n                           </tr>`
      )
      .join("")}\n                    </tbody>\n                    </table>`,
  f = (e, n) => {
    const t = (e) => {
      return ((n = e), v.find(({ key: e }) => e.includes(n))).color;
      var n;
    };
    let r = 0;
    return {
      template: e.length
        ? `\n                    <h2>${n}</h2>\n                <table id="result-table-${n} style="width:100%">\n                    <thead>\n                        <tr>\n                        <td>Package</td>\n                        <td>Current Version</td>\n                        <td>Current Release Date</td>\n                        <td>Latest Version</td>\n                        <td>Latest Version Release Date</td>\n                        <td>Status</td>\n                        <td> Upgrade Type </td>\n                        <td> Link to package in registry </td>\n                        <td> Link to package on NPM </td>\n                        </tr>\n                    </thead>\n                    <tbody>\n                       ${e
            .map(({ package: e }) => {
              const {
                  name: n,
                  registry_url: s,
                  npm_url: d,
                  latest: o,
                  current: i,
                  upgradeType: c,
                } = e,
                l = ((e, n) =>
                  "ERROR" === e || "ERROR" === n
                    ? "UNKNOWN"
                    : a(n, e)
                    ? "UP TO DATE"
                    : "OUTDATED")(o.version, i.version);
              "OUTDATED" === l && r++;
              const p = new Date(i.releaseDate).toLocaleDateString(),
                u = new Date(o.releaseDate).toLocaleDateString();
              return `<tr>\n                        <td>${n}</td>\n                        <td> ${
                i.version
              } </td>\n                        <td>${p}</td>\n                        <td>${
                o.version
              } </td>\n                         <td>${u}</td>\n                        <td class="status" style=${t(
                c.toUpperCase()
              )}>${l}</td>\n                        <td> ${c.toUpperCase()} </td>\n                        <td> <a href=${s} target="_blank"> ${s} </a> </td>\n                        <td> <a href=${d} target="_blank"> ${d} </a> </td>\n                        </tr>`;
            })
            .join(
              ""
            )}\n                    </tbody>\n                    </table>`
        : "",
      outdated_counter: r,
    };
  },
  D = ({
    peerDependenciesResult: e,
    devDependenciesResult: n,
    dependenciesResult: t,
  }) => {
    const r = m({
        peerDependenciesResult: e,
        devDependenciesResult: n,
        dependenciesResult: t,
      }),
      a = Object.keys(r).filter((e) => "N/A" !== e);
    return a.length
      ? `    \n                    <h4>Stats </h4>\n                <table id="stats">\n                    <thead>\n                        <tr>\n                        <td>Upgrade Type</td>\n                        <td>Package Count</td>\n                    </thead>\n                    <tbody>\n                    ${a
          .map(
            (e) =>
              `\n                      <tr>\n                      <td>${e.toUpperCase()}</td>\n                      <td>${
                r[e]
              }</td>\n                      </tr>\n                      `
          )
          .join(
            ""
          )}\n                    </tbody>\n                    </table>`
      : "";
  },
  w = async (t, r) => {
    try {
      const a = e.join(k, `dependency-status-report.${r.toLowerCase()}`);
      await n.writeFile(a, t), console.log(`Wrote report to ${a}`);
    } catch (e) {
      console.error(e);
    }
  },
  R = () => $.find((e) => Object.values(h).includes(e)) || h.HTML,
  $ = process.argv.slice(2),
  T = R();
(async () => {
  if ("ci" !== process.env.NODE_ENV)
    try {
      const e = await i(),
        {
          peerDependencies: n,
          dependencies: t,
          devDependencies: r,
          repoInfo: a,
        } = e,
        s = await (async ({
          peerDependencies: e = [],
          devDependencies: n = [],
          dependencies: t = [],
        }) => {
          const r = [],
            a = c.length > 0 ? c.split(",") : [],
            { successfulLookups: s, failedLookups: d } = await l(e, a),
            { successfulLookups: o, failedLookups: i } = await l(n, a),
            { successfulLookups: p, failedLookups: u } = await l(t, a);
          return (
            r.push(...u, ...i, ...d),
            {
              peerDependenciesResult: s,
              devDependenciesResult: o,
              dependenciesResult: p,
              failedLookupResult: r,
            }
          );
        })({ peerDependencies: n, dependencies: t, devDependencies: r });
      if (T && T != h.HTML) {
        const e = ((
          {
            peerDependenciesResult: e,
            devDependenciesResult: n,
            dependenciesResult: t,
            failedLookupResult: r,
            disableTime: a = !1,
          },
          { name: s, version: d }
        ) => {
          const o = new Date();
          return JSON.stringify(
            {
              repoInfo: { name: s, version: d },
              packages: {
                devDependencies: n,
                peerDependencies: e,
                dependencies: t,
                failedLookups: r,
              },
              stats: m({
                peerDependenciesResult: e,
                devDependenciesResult: n,
                dependenciesResult: t,
              }),
              reportGeneratedAt: {
                date: !a && o.toLocaleDateString(),
                time: !a && o.toLocaleTimeString(),
              },
            },
            null,
            2
          );
        })(s, a);
        await w(e, h.JSON);
      } else {
        const e = ((
          {
            peerDependenciesResult: e,
            devDependenciesResult: n,
            dependenciesResult: t,
            failedLookupResult: r,
          },
          { name: a, version: s }
        ) => {
          const { template: d, outdated_counter: o } = f(t, "Dependencies"),
            { template: i, outdated_counter: c } = f(n, "Dev Dependencies"),
            { template: l, outdated_counter: p } = f(e, "Peer Dependencies"),
            { errorTable: u } = b(r),
            g = y(),
            h = D({
              peerDependenciesResult: e,
              devDependenciesResult: n,
              dependenciesResult: t,
              failedLookupResult: r,
            });
          return `\n        <html>\n        <title> Dependency Check -- Report </title>\n        <head>\n        </head>\n        <style>\n        {\n        font-family: Arial, Helvetica, sans-serif;\n        border-collapse: collapse;\n        width: 100%;\n        }\n\n        div.wrapper{\n        display: flex;\n        flex-direction: column;\n        flex-wrap: wrap;\n        width:100%;\n        }\n\n        .header, .sub-header{\n          flex-direction: row;\n          width:90%;\n        }\n        \n        .legend-table {\n          flex-direction: row;\n          width: 50%;\n          margin-right: 3em;\n        }\n        \n        .dep-table, .dev-table, .peer-table, .error-table {\n             width: 80%;\n             flex-direction: row;\n             min-width: 60%;\n        }\n        .status {\n          min-width: 5em;\n        }\n\n         td, th {\n        border: 1px solid #ddd;\n        padding: 8px;\n        }\n        tr {\n            cursor: pointer;\n        }\n        tr:nth-child(even){background-color: #f2f2f2;}\n\n        tr:hover {background-color: #ddd;}\n\n        #th {\n        padding-top: 12px;\n        padding-bottom: 12px;\n        text-align: left;\n        background-color: #04AA6D;\n        color: white;\n        }\n        </style>\n    \n        <body>\n        <div class="wrapper">\n        <div class=header>\n        <h2>Dependency Check Results for ${a} v${s} </h2>\n        </div>\n        <div class="sub-header">\n          <h3>${(() => {
            const e = c + p + o;
            return 0 == e
              ? `🎉 There are ${e} packages that need to be updated. Woohoo! `
              : 1 == e
              ? `⚠️ There is ${e} package that needs to be updated - Not bad! `
              : e > 1 && e < 10
              ? `⚠️ There are  ${e} packages that need to be updated`
              : e >= 10
              ? `​​⚠️​😱​ Ouch... There are ${e} packages that need to be updated 🙈 Good Luck! `
              : void 0;
          })()} </h3>\n        </div>\n        \n        <div class="legend-table"> \n          ${g}\n        </div>\n        <div class="stats-table">\n          ${h}\n        </div>\n        <div class="dep-table">\n                ${d}\n        </div>\n        <div class="dev-table">\n                ${i}\n        </div>\n        <div class="peer-table">\n                ${l}\n        </div>\n        <div class="error-table">\n            ${u}\n        </div>\n        </div>\n        </body>\n        </html>\n    `;
        })(s, a);
        await w(e, h.HTML);
      }
    } catch (e) {
      console.log("Something went wrong while running the utility"),
        console.error(e),
        process.exit(1);
    }
})();
export { R as getReportType };
