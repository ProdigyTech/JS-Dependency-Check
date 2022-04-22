#! /usr/bin/env node
import e from "path";
import { promises as n } from "fs";
import t from "axios";
import s from "app-root-path";
const r = (e = {}) =>
    Object.keys(e).map((n) => ({ package: n, version: e[n] })),
  a = (e, n) =>
    `\n                    <h2>${n}</h2>\n                <table id="result-table-${n}">\n                    <thead>\n                        <tr>\n                        <td>Dependency Name</td>\n                        <td>Current Version</td>\n                        <td>Latest Version</td>\n                        <td>Status</td>\n                        </tr>\n                    </thead>\n                    <tbody>\n                       ${e
      .map(({ package: e }) => {
        const { name: n, latest: t, current: s } = e,
          r = ((e, n) => (e >= n ? "UP TO DATE" : "OUTDATED"))(
            t.version,
            s.version
          );
        return `<tr>\n                        <td>${n}</td>\n                        <td> ${
          s.version
        } </td>\n                        <td>${
          t.version
        } </td>\n                        <td style=${
          "OUTDATED" === r ? "background-color:red" : "background-color:green"
        }>${r}</td></tr>`;
      })
      .join("")}\n                    </tbody>\n                    </table>`,
  i = process.env.DEP_CHECK_WHITELIST,
  o = async (e, n) => {
    try {
      const t = ((e, n) => n.filter((n) => !e.includes(n.package)))(n, e);
      return await Promise.all(
        t.map(async (e) => {
          const n = await d({ package: e.package });
          return await p(n, e);
        })
      );
    } catch (e) {
      console.error(e), process.exit(1);
    }
  },
  d = async ({ package: e }) => {
    const { data: n } = await t.get(`https://registry.npmjs.org/${e}`),
      { time: s } = n;
    return { versionTimeline: s, tags: n["dist-tags"] };
  },
  c = ({ name: e, versionTimeline: n, latest: t, definedVersion: s }) => ({
    package: {
      name: e,
      latest: { version: t || s, releaseDate: n[t] || n[s] },
      current: { version: s, releaseDate: n[s] },
    },
  }),
  p = async ({ versionTimeline: e, tags: n }, t) =>
    new Promise((s, r) => {
      try {
        const r = (() => {
            if (Number.isNaN(Number.parseFloat(t.version))) {
              const e = t.version.split(""),
                [n, ...s] = e;
              return s.join("");
            }
            return t.version;
          })(),
          { latest: a } = n;
        let i = {};
        (i = c(
          r !== a
            ? {
                name: t.package,
                versionTimeline: e,
                latest: a,
                definedVersion: r,
              }
            : { name: t.package, versionTimeline: e, definedVersion: r }
        )),
          s(i);
      } catch (e) {
        console.warn(e), r(e);
      }
    });
global.__basedir = s.path;
const l = await (async () => {
    const t = e.join(__basedir, "package.json"),
      s = JSON.parse(
        await (async ({ path: e, encoding: t, ...s }) => {
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
      repoInfo: { name: s.name || "", version: s.version || "" },
      dependencies: r(s.dependencies) || [],
      peerDependencies: r(s.peerDependencies) || [],
      devDependencies: r(s.devDependencies) || [],
    };
  })(),
  { peerDependencies: v, dependencies: m, devDependencies: D, repoInfo: u } = l,
  g = await (async ({
    peerDependencies: e = [],
    devDependencies: n = [],
    dependencies: t = [],
  }) => {
    const s = i.split(",");
    return {
      peerDependenciesResult: await o(e, s),
      devDependenciesResult: await o(n, s),
      dependenciesResult: await o(t, s),
    };
  })({ peerDependencies: v, dependencies: m, devDependencies: D }),
  y = (({
    peerDependenciesResult: e,
    devDependenciesResult: n,
    dependenciesResult: t,
  }) =>
    `\n        <html>\n        <title> Dependency Check -- Report </title>\n        <body>\n        <h1> Results Below: </h1>\n        <div class="dep-table">\n                ${a(
      t,
      "Dependencies"
    )}\n        </div>\n        <div class="dev-table">\n                ${a(
      n,
      "Dev Dependencies"
    )}\n        </div>\n        <div class="peer-table">\n                ${a(
      e,
      "Peer Dependencies"
    )}\n        </div>\n        </body>\n    `)(g);
await (async (t) => {
  try {
    const s = e.join(__basedir, "dependency-status-report.html");
    await n.writeFile(s, t), console.log(`Wrote report to ${s}`);
  } catch (e) {
    console.error(e);
  }
})(y);
