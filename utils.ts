interface SubmoduleDetails {
  submodule?: string;
  path?: string;
  url?: string;
};

export function parseGitmoduleFile(data: string): SubmoduleDetails[] {
  const gitModules = data.split("[");
  const subModulesCollections: SubmoduleDetails[] = [];

  for (let i = 0; i < gitModules.length; i++) {
    let submodules = gitModules[i];
    if (/^submodule*/.test(submodules)) {
      let submodule = submodules.split("\n\t");
      let moduleDetails: SubmoduleDetails = {};

      for (let j = 0; j < submodule.length; j++) {
        let parseSubmoduleDetails: string[] = [];
        let sub = submodule[j].replace(/\n/g, "").replace(/\s/g, "").replace(/\"/g, "=");
        parseSubmoduleDetails = sub.split("=");

        switch (parseSubmoduleDetails[0]) {
          case "submodule":
            moduleDetails.submodule = parseSubmoduleDetails[1];
            break;
          case "path":
            moduleDetails.path = parseSubmoduleDetails[1];
            break;
          case "url":
            moduleDetails.url = parseSubmoduleDetails[1];
            break;
        }
      }
      subModulesCollections.push(moduleDetails);
    }
  }
  return subModulesCollections;
}
