import * as React from "react";

type Program = {
  name: string;
  pullRequests: number;
  pullRequestsUrls: string[];
  url: string;
  stars: number;
  expressions: number;
  types: number;
  isOutdated: boolean;
};

type ProgramListProps = {
  programs: Program[];
};

type ProgramDetailProps = {
  program: Program;
};

function ProgramList({ programs }: ProgramListProps) {
  return (
    <table>
      <thead>
        <tr style={{ textAlign: "left" }}>
          <th>Program</th>
          <th>Pull Requests</th>
        </tr>
      </thead>
      <tbody>
        {programs.map((program) => (
          <tr key={program.name}>
            <td>
              <a href={`/program?name=${program.name}`}>{program.name}</a>
            </td>
            <td>{program.pullRequests}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Programs({ directory }: { directory: Program[] }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
      }}
    >
      <section>
        <ProgramList programs={directory} />
      </section>
    </div>
  );
}

export function ProgramDetail({ program }: ProgramDetailProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
      }}
    >
      <section>
        <a style={{ padding: "2px 4px" }} className="button" href="javascript:history.back()">
          <span>&#8592;&#32;</span>Back
        </a>
        <ul style={{ listStyleType: "none", paddingInlineStart: "10px" }}>
          <li>
            Program:{" "}
            <a target="_blank" rel="noopener noreferrer" href={`${program.url}`}>
              {program.name}
            </a>
          </li>
          <li>
            Pull Requests: {program.pullRequests}
            <ul>
              {program.pullRequestsUrls.map((url) => (
                <li type="square" key={url}>
                  <a target="_blank" href={fixUrl(url)}>
                    {getPr(url)}
                  </a>
                </li>
              ))}
            </ul>
          </li>
          <li>Stars: {program.stars}</li>
          <li>Expressions: {program.expressions}</li>
          <li>Program Types: {program.types}</li>
          <li>Is outdated: {program.isOutdated ? "True" : "False"}</li>
        </ul>
      </section>
    </div>
  );
}

function fixUrl(url: string) {
  const regex = /\/tree\/[a-zA-Z0-9]+/;
  return url.replace(regex, "");
}

function getPr(url: string) {
  const [id] = url.match(/(\d+)$/)!;
  return id;
}
