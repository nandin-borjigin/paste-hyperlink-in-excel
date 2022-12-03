const fs = require("node:fs/promises");
const path = require("node:path");
const pkg = require("./package.json");

const variables = {
  dev: {
    domain: "localhost:3000",
  },
  prod: {
    domain: "gray-sky-08c20320f.2.azurestaticapps.net",
  },
};

const outputPath = {
  dev: path.join(__dirname, "manifest.dev.xml"),
  prod: path.join(__dirname, "public", "manifest.xml"),
};

function generateManifest(env) {
  const vars = {
    ...variables[env],
    version: pkg.version,
  };
  const out = outputPath[env];
  fs.readFile(path.join(__dirname, "manifest", "template.xml"), "utf8")
    .then((template) => {
      let manifest = template;
      for (const [key, value] of Object.entries(vars)) {
        manifest = manifest.replace(new RegExp(`<% ${key} %>`, "g"), value);
      }
      return manifest;
    })
    .then((manifest) => {
      fs.writeFile(out, manifest, "utf-8");
    });
}

generateManifest("dev");
generateManifest("prod");
