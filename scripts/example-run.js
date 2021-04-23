const path = require("path");
const exec = require("./lib/shell");
const globby = require("globby");

const rootDir = path.resolve(__dirname, "..");
const examplesDir = path.join(rootDir, "example-projects");
const givenProjName = process.argv[2];
const runCmd = process.argv[3];

///////////////////////////////////////////////////////
// Project Settings
const redirectProjects = [["parcel", "parcel-2"]];
const disabledProjects = ["next", "next-scheduler"];
const pnpSimulatedProjects = ["angular"];
///////////////////////////////////////////////////////

if (!givenProjName) {
  console.error('Must specify an example-project name, or "all"');
  process.exit(1);
}

if (!runCmd) {
  console.error("Must specify a run command");
  process.exit(1);
}

const projNames =
  givenProjName === "all"
    ? globby.sync("*", { cwd: examplesDir, onlyDirectories: true })
    : [givenProjName];

projNames.forEach((projName) => {
  // Rewrite projName to redirect directory
  const redirect = redirectProjects.find(([val]) => val === projName);
  if (redirect) {
    console.info(`Redirecting '${redirect[0]}' to '${redirect[1]}' directory`);
    projName = redirect[1];
  }

  // Don't run disabled projects
  if (disabledProjects.includes(projName)) {
    console.info("This example is disabled till the next major release");
    return;
  }

  const projDir = path.join(examplesDir, projName);

  console.log("");
  console.log("PROJECT:", projName);
  console.log(projDir);

  // Decide whether to simulate pnp or run normal yarn
  let execCmd = [runCmd];
  if (pnpSimulatedProjects.includes(projName)) {
    console.log("Using PnP simulation");
    execCmd = ["example:pnp", projName, runCmd];
  } else {
    console.log("Normal Yarn execution");
  }

  console.log();
  exec.sync(["yarn", "run", ...execCmd], {
    cwd: projDir,
    exitOnError: true,
    live: true,
  });
  console.log();
});
