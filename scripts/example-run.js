const path = require("path");
const exec = require("./lib/shell");
const globby = require("globby");

let rootDir = path.resolve(__dirname, "..");
let examplesDir = path.join(rootDir, "example-projects");
let givenProjName = process.argv[2];
let runCmd = process.argv[3];

if (!givenProjName) {
  console.error('Must specify an example-project name, or "all"');
  process.exit(1);
}

if (!runCmd) {
  console.error("Must specify a run command");
  process.exit(1);
}

let projNames =
  givenProjName === "all"
    ? globby.sync("*", { cwd: examplesDir, onlyDirectories: true })
    : [givenProjName];

for (let projName of projNames) {
  // Rewrite projDir and projName to redirect parcel to parcel-2 directory
  if (projName === "parcel") {
    console.info("Redirecting to 'parcel-2' directory");
    projName = "parcel-2";
  } else if (projName === "next" || projName === "next-scheduler") {
    console.info("This example is disabled till the next major release");
    process.exit();
  }

  const projDir = path.join(examplesDir, projName);

  console.log("");
  console.log("PROJECT:", projName);
  console.log(projDir);

  if (projName === "angular") {
    console.log("Using PnP simulation");
    console.log();
    exec.sync(["yarn", "run", "example:pnp", projName, runCmd], {
      cwd: rootDir,
      exitOnError: true,
      live: true,
    });
  } else {
    console.log("Normal Yarn execution");
    console.log();
    exec.sync(["yarn", "run", runCmd], {
      cwd: projDir,
      exitOnError: true,
      live: true,
    });
  }

  console.log("");
}
