import fs from "fs";
import path from "path";
import _ from "lodash";

const sampleDir = "public/samples";
const categoryFolders = fs.readdirSync(sampleDir);

const result = {};

// Iterate over every category folder
categoryFolders.forEach((category) => {
  if (category === ".DS_Store" || category.endsWith(".md")) return;
  const instrumentDir = path.join(sampleDir, category);
  const instrumentFolders = fs.readdirSync(instrumentDir);

  // Iterate over every instrument in the category
  instrumentFolders.forEach((instrument) => {
    if (instrument === ".DS_Store") return;
    const sampleDir = path.join(instrumentDir, instrument);
    const sampleFiles = fs.readdirSync(sampleDir);

    // Iterate over every sample in the instrument
    const mapping = {};
    sampleFiles.forEach((file) => {
      if (file === ".DS_Store") return;
      const pitch = path.basename(file, ".wav");
      mapping[pitch] = file;
    });

    // Add the instrument to the result
    const key = _.kebabCase(instrument);
    result[key] = mapping;
  });
});

const samplePath = "src/assets/instruments/samples.json";
fs.writeFileSync(samplePath, JSON.stringify(result, null, 2));
