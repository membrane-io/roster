import * as React from "react";
import { marked } from "marked";

type Program = {
  name: string;
  description: string;
  pullRequests: any[];
  url: string;
  stars: number;
  expressions: number;
  types: number;
  isOutdated: boolean;
  updated_at: boolean;
  lastCommit: string;
};

type ProgramTableProps = {
  programs: Program[];
  refreshedAt: string;
};

type ProgramDetailProps = {
  program: Program;
};

function RefreshButton({ refreshedAt }) {
  return (
    <form action="/refresh" method="POST" style={{ paddingTop: "10px" }}>
      <input type="submit" value="&#10226;&#32;Refresh" />
      <span
        style={{
          marginLeft: "10px",
          fontSize: "10px",
          letterSpacing: ".05ch;",
          opacity: ".5",
        }}
      >
        {refreshedAt}
      </span>
    </form>
  );
}

export function RepinMessage({ name }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <section>
          <div className="header">
            <a
              className="link button"
              style={{ padding: "2px 4px" }}
              href={`/`}
            >
              <span>&#8592;&#32;</span>Back
            </a>
          </div>
          <div>
            <span>The program {name} was updated</span>
          </div>
        </section>
      </div>
    </div>
  );
}

export function ProgramTable({ programs }: { programs: Program[] }) {
  return (
    <div>
      <table>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th>Program</th>
            <th>Pull Requests</th>
            <th> </th>
          </tr>
        </thead>
        <tbody>
          {programs.map((program) => (
            <tr key={program.name}>
              <td>
                <span
                  style={{
                    display: "inline-block",
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    backgroundColor: program.isOutdated ? "#ff0000" : "#00ff00",
                    marginRight: "5px",
                  }}
                ></span>
                <a className="link" href={`/program?name=${program.name}`}>
                  {program.name}
                </a>
              </td>
              <td>
                {program.pullRequests.map((pr) => (
                  <a href={`${program.url}/pull/${pr.number}`}>#{pr.number}</a>
                ))}
              </td>
              <td>
                {program.isOutdated && (
                  <a
                    className="link button-small button"
                    href={`/update-program?name=${program.name}`}
                  >
                    ⇡ Update
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Programs({ programs, refreshedAt }: ProgramTableProps) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <section>
            <h2>Program directory</h2>
            <ProgramTable programs={programs} />
            <RefreshButton refreshedAt={refreshedAt} />
          </section>
        </div>
      </div>
    </div>
  );
}

function ProgramInfo({ program }: ProgramDetailProps) {
  return (
    <div style={{ marginTop: "10px", width: "100%" }}>
      <div>
        <a
          style={{ fontSize: "12px" }}
          className="link"
          href={fixUrl(program.url)}
          target="_black"
        >
          <span>{program.name}</span>
        </a>
        <span style={{ fontSize: "10px", opacity: "0.5" }}>
          <span style={{ marginLeft: "5px" }}>
            {program.lastCommit.substring(0, 8)}
          </span>
          <span> </span>
          <span>({program.isOutdated ? "Outdated" : "Up-to-date"})</span>
        </span>
      </div>
      <div>
        <p>{program.description}</p>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <span style={{ marginRight: "16px" }}>
          <svg
            width="18"
            height="16"
            version="1.1"
            aria-hidden="true"
            style={{
              transform: "scale(0.85) translateY(-1px)",
              verticalAlign: "middle",
            }}
          >
            <path
              fillRule="evenodd"
              fill="#666"
              d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"
            ></path>
          </svg>
          {program.stars}
        </span>
        <span style={{ marginRight: "16px" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            style={{ transform: "scale(1.0)", verticalAlign: "middle" }}
          >
            <path
              fill="#444"
              d="M3 12.045c0-.99.15-1.915.45-2.777A6.886 6.886 0 0 1 4.764 7H6.23a7.923 7.923 0 0 0-1.25 2.374 8.563 8.563 0 0 0 .007 5.314c.29.85.7 1.622 1.23 2.312h-1.45a6.53 6.53 0 0 1-1.314-2.223 8.126 8.126 0 0 1-.45-2.732M10 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm4.25-8.987-.24 2.156 2.187-.61.193 1.47-1.992.14 1.307 1.74-1.33.71-.914-1.833-.8 1.822-1.38-.698 1.296-1.74-1.98-.152.23-1.464 2.14.61-.24-2.158h1.534M21 12.045c0 .982-.152 1.896-.457 2.744A6.51 6.51 0 0 1 19.236 17h-1.453a8.017 8.017 0 0 0 1.225-2.31c.29-.855.434-1.74.434-2.66 0-.91-.14-1.797-.422-2.66a7.913 7.913 0 0 0-1.248-2.374h1.465a6.764 6.764 0 0 1 1.313 2.28c.3.86.45 1.782.45 2.764"
            />
          </svg>
          <span title="expressions">{program.expressions}</span>
        </span>
        <span style={{ marginRight: "16px" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            style={{ transform: "scale(0.85)", verticalAlign: "middle" }}
          >
            <path d="M0 0h24v24H0V0z" fill="none" />
            <path
              fill="#666"
              d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"
            />
          </svg>
          <span title="Types">{program.types}</span>
        </span>
      </div>
    </div>
  );
}

export function ProgramDetail({ program }: ProgramDetailProps) {
  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: 800,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <section
            style={{
              alignSelf: "center",
              minWidth: "800px",
              position: "relative",
            }}
          >
            <h2>{program.name}</h2>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <div>
                <a
                  className="link button"
                  style={{ padding: "2px 4px" }}
                  href="/"
                >
                  <span>&#8592;&#32;</span>Back
                </a>
              </div>
              {program.isOutdated && (
                <div>
                  <a
                    className="link button"
                    style={{ marginLeft: "5px", padding: "2px 4px" }}
                    href={`/update-program?name=${program.name}`}
                  >
                    <span>&#8593;&#32;</span>Update program
                  </a>
                </div>
              )}
            </div>
            <ProgramInfo program={program} />
          </section>
          {program.pullRequests.map((item) => (
            <PullRequest
              url={`${fixUrl(program.url)}/pull/`}
              pullRequest={item}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PullRequest({ url, pullRequest }) {
  const color = pullRequest.state === "open" ? "#00ff1033" : "#ff000033";
  const pullRequestHtml = marked.parse(pullRequest.body || "");
  return (
    <section key={url}>
      <h2>Pull Request - {pullRequest.number}</h2>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <a
          className="link"
          href={`${url}${pullRequest.number}`}
          target="_black"
        >
          <span>#{pullRequest.number} </span>
          <span>{pullRequest.title}</span>
        </a>
        <div
          style={{
            border: "1px dashed #202120ba",
            width: "50px",
            backgroundColor: color,
            textAlign: "center",
            padding: "1px 5px",
            marginLeft: "5px",
          }}
        >
          {pullRequest.state}
        </div>
      </div>
      {pullRequestHtml?.length ? (
        <div dangerouslySetInnerHTML={{ __html: pullRequestHtml }} />
      ) : (
        <div>No description</div>
      )}
    </section>
  );
}

function fixUrl(url: string) {
  const regex = /\/tree\/[a-zA-Z0-9]+/;
  return url.replace(regex, "");
}
