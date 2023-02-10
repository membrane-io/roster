import { nodes, root, state } from "membrane";
import { parseGitmoduleFile } from "./utils";

export const Root = {
  configure: async ({ args: { TOKEN } }) => {
    state.token = TOKEN;
  },
  repositories: () => ({}),
};

export const RepositoryCollection = {
  one: async ({ args: { sha, url } }) => {
    if (!sha || !url) {
      throw new Error("Both sha and url are required");
    }
    const [, user, repo] = url.match("https://github.com/([^/]+)/([^/]+)");
    const res = await nodes.github.users
      .one({ name: user })
      .repos.one({ name: repo })
      .$query(
        `{
          stargazers_count
          name
          url
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
    return { ...res, sha };
  },
  items: async ({ self, args }) => {
    const repositories = await nodes.github.users.one({ name: "membrane-io" })
      .repos.one({ name: "directory" })
      .content.dir.$query(`{ name sha html_url size download_url }`);

    return repositories
      .filter((item) => !item.download_url && item.size === 0)
      .map((item) => {
        // type-safe
        const [url] = item.html_url?.match("https://github.com/([^/]+)/([^/]+)") || [];;
        return { name: item.name, url, sha: item.sha };
      });
  },
};

export const Repository = {
  gref: async ({ obj }) => {
    return root.repositories.one({ url: obj.url, sha: obj.sha });
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
  pullRequests: async ({ obj }) => {
    return obj.pull_requests?.page?.items?.length || 0;
  },
  pullRequestsUrls: async ({ obj }) => {
    return obj.pull_requests?.page?.items?.map((item: any) => `${obj.url}/pull/${item.number}`);
  },
  isOutdated: async ({ obj }) => {
    return obj.commits?.page.items[0].sha !== obj.sha;
  },
};
