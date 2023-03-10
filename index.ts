import { nodes, root, state } from "membrane";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { ProgramDetail, Programs, RepinMessage } from "./ui.jsx";

export const Root = {
  status: async () => {
    const url = (state.url = state.url || (await nodes.process.endpointUrl));
    return `[Open](${url})`;
  },
  programs: () => ({}),
};

export const ProgramCollection = {
  one: async ({ args: { name } }) => {
    if (!name) {
      throw new Error("Program name is required");
    }
    let url: any;
    let sha: any;
    try {
      const res = await nodes.github.users
        .one({ name: "membrane-io" })
        .repos.one({ name: "directory" })
        .content.file({ path: name })
        .$query(`{ html_url, sha }`);
      url = res.html_url;
      sha = res.sha;
    } catch (error) {
      throw new Error("Program not found");
    }
    const res = await repoFromUrl(url).$query(
      `{
          stargazers_count
          name
          description
          updated_at
          pull_requests {
            page(state: "open") {
              items {
                number
                state
                title
                body
              }
            }
          }
          content {
            file(path: "memconfig.json") {
              content
            }
          }
          commits {
            page(page: 1, pageSize: 1) {
              items {
                sha
              }
            }
          }
        }`
    );
    return { ...res, name, url, sha };
  },
  items: async ({ self, args, info }) => {
    const programs = await nodes.github.users
      .one({ name: "membrane-io" })
      .repos.one({ name: "directory" })
      .content.dir.$query(`{ name sha html_url size download_url }`);

    const isSubmodule = (item: any) => !item.download_url && item.size === 0;

    return programs.filter(isSubmodule).map((item) => {
      return { name: item.name, html_url: item.html_url };
    });
  },
};

export const Program = {
  gref: async ({ obj }) => {
    return root.programs.one({ name: obj.name });
  },
  stars: async ({ obj }) => {
    return obj.stargazers_count;
  },
  expressions: async ({ obj }) => {
    const { expressions } = JSON.parse(obj.content?.file?.content as string);
    return (expressions && Object.keys(expressions).length) || 0;
  },
  types: async ({ obj }) => {
    const { schema } = JSON.parse(obj.content?.file?.content as string);
    return schema.types.length || 0;
  },
  pullRequests: async ({ self, obj }) => {
    let items = obj.pull_requests?.page?.items;
    if (items === undefined && obj.html_url) {
      const repo = repoFromUrl(obj.html_url);
      items = await repo.pull_requests.page.items.$query(
        `{ number title state body }`
      );
    }
    return items;
  },
  lastCommit: async ({ obj }) => {
    return obj.commits?.page.items[0].sha;
  },
  isOutdated: async ({ obj }) => {
    return obj.commits?.page.items[0].sha !== obj.sha;
  },
  update: async ({ obj }) => {
    const { name, url } = obj;
    const [, user, repo] = url.match("https://github.com/([^/]+)/([^/]+)");
    // get the parent repo sha
    const parent: any = await nodes.directory.branches.one({ name: "main" })
      .commit.sha;
    // get the submodule sha
    const children: any = await nodes.github.users
      .one({ name: user })
      .repos.one({ name: repo })
      .branches.one({ name: "main" }).commit.sha;

    // create tree and return sha
    const tree: any = await nodes.directory.createTree({
      base: parent,
      tree: children,
      path: name,
    });

    // commit the tree and return sha
    const commit: any = await nodes.directory.commits.create({
      message: `Sync ${name}`,
      tree,
      parents: parent,
    });

    // repin driver - update master to point to your commit
    await nodes.directory.branches
      .one({ name: "main" })
      .update({ sha: commit, ref: "heads/main" });
  },
};

export async function endpoint({
  args: { path, query, headers, method, body },
}) {
  switch (path) {
    case "/": {
      let { cache } = parseQS(query);
      let programs = state.programs;
      let currentTime = new Date().getTime();
      if (!programs || cache === "false") {
        programs = await root.programs.items.$query(
          `{ name, pullRequests { number } }`
        );
        state.programs = programs;
        state.lastRefreshTime = currentTime;
      }

      const timeElapsed = Math.floor(
        (Date.now() - state.lastRefreshTime) / 1000 / 60
      );
      const refreshedAt = `Refreshed ${timeElapsed} minute${
        timeElapsed === 1 ? "" : "s"
      } ago`;

      const body = renderToString(
        createElement(Programs, { programs, refreshedAt })
      );
      return html(body);
    }
    case "/update-program": {
      const { name } = parseQS(query);
      if (!name) {
        return "Unknown Program";
      }

      await root.programs.one({ name }).update();
      const body = renderToString(createElement(RepinMessage, { name }));
      return html(body);
    }
    case "/program": {
      const { name } = parseQS(query);
      const program = await root.programs
        .one({ name })
        .$query(
          `{ name, description, url, stars, lastCommit, expressions, types, updated_at, pullRequests { number title state body }, isOutdated }`
        );
      const body = renderToString(createElement(ProgramDetail, { program }));
      return html(body);
    }
    default:
      console.log("Unknown Endpoint:", path);
  }
}

function repoFromUrl(url: string): github.Repository {
  const [, user, repo] = url.match("https://github.com/([^/]+)/([^/]+)")!;
  return nodes.github.users.one({ name: user }).repos.one({ name: repo });
}

const parseQS = (qs: string): Record<string, string> =>
  Object.fromEntries((new URLSearchParams(qs) as any).entries());

function html(body: string) {
  return `<!DOCTYPE html>
    <head>
      <meta charset="utf-8" />
      <title>Membrane roster</title>
      <link rel="stylesheet" href="https://www.membrane.io/light.css">
    </head>
    <body>
      ${body}
    </body>
    <style>
    body {
      font-size: 12px;
    }
    table, th, td {
      border: none;
      border-collapse: collapse;
      padding: 5px;
    }
    .header{
      padding-bottom: 10px;
    }
    .link:link { text-decoration: none; }
    .link:visited { text-decoration: none; }
    .link:hover { text-decoration: underline; }
    .link:active { text-decoration: underline; }
    .container {
      inset: 0;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
    </style>
    </html>
  `;
}
