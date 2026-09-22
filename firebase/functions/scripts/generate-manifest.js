const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

async function main() {
  const functionsDir = path.resolve(__dirname, "..");
  const loader = require(
    path.join(
      functionsDir,
      "node_modules/firebase-functions/lib/runtime/loader",
    ),
  );
  const manifest = require(
    path.join(
      functionsDir,
      "node_modules/firebase-functions/lib/runtime/manifest",
    ),
  );

  console.log("Loading functions stack from", functionsDir, "...");
  const stack = await loader.loadStack(functionsDir);
  const wire = manifest.stackToWire(stack);

  const manifestPath = path.join(functionsDir, "functions.yaml");
  const yamlContent = yaml.dump(wire);
  fs.writeFileSync(manifestPath, yamlContent, "utf8");

  console.log(
    `Successfully generated functions.yaml with ${Object.keys(wire.endpoints || {}).length} endpoints at: ${manifestPath}`,
  );
}

main().catch((err) => {
  console.error("Failed to generate functions.yaml:", err);
  process.exit(1);
});
