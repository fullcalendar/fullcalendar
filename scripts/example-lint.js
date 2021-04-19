const path = require("path");
const exec = require("./lib/shell");
const globby = require("globby");

const rootDir = path.resolve(__dirname, "..");
const examplesDir = path.join(rootDir, "example-projects");
const givenProjName = process.argv[2] || "all";

const projNames =
  givenProjName === "all"
    ? globby.sync("*", { cwd: examplesDir, onlyDirectories: true })
    : [givenProjName];


for (let projName of projNames) {
  const projDir = path.join(examplesDir, projName);

  console.log("");
  console.log("PROJECT:", projName);
  console.log(projDir);

  exec.sync(["yarn", "run", "prettier", "--write", "./src"], {
    cwd: projDir,
    exitOnError: false,
    live: true,
  });

  exec.sync(["yarn", "run", "eslint", "--fix", "./src/**/*[.tsx,.ts,.jsx,.js]"], {
    cwd: projDir,
    exitOnError: false,
    live: true,
  });

  console.log("");
}