import { nodes, root, state } from "membrane";
import { parseGitmoduleFile } from "./utils";

export const Root = {
  configure: async ({ args: { TOKEN } }) => {
    state.token = TOKEN;
  },
  programs: () => ({}),
};

export const ProgramCollection = {
  one: async ({ args: { name } }) => {
    if (!name) {
      throw new Error("Program name is required");
    }
    let url: any;
    try {
      const res = await nodes.github.users
        .one({ name: "membrane-io" })
        .repos.one({ name: "directory" })
        .content.file({ path: name })
        .$query(`{ html_url }`);
      url = res.html_url;
    } catch (error) {
      throw new Error("Program not found");
    }
    const res = repoFromUrl(url).$query(
      `{
          stargazers_count
          url
          name
          pull_requests {
            page {
              items {
                number
                state
                title
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
    return res;
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
      items = await repo.pull_requests.page.items.$query(`{ number }`);
    }
    return items?.length;
  },
  pullRequestsUrls: async ({ obj }) => {
    return obj.pull_requests?.page?.items?.map(
      (item: any) => `${obj.url}/pull/${item.number}`
    );
  },
  isOutdated: async ({ obj }) => {
    return obj.commits?.page.items[0].sha !== obj.sha;
  },
};

function repoFromUrl(url: string): NodeGref<github.Repository> {
  const [, user, repo] = url.match("https://github.com/([^/]+)/([^/]+)");
  return nodes.github.users.one({ name: user }).repos.one({ name: repo });
}
