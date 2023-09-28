import fs from "fs";
import path from "path";

const sampleDir = "public/samples";
const categoryFolders = fs.readdirSync(sampleDir);

const result = {};

categoryFolders.forEach((category) => {
  if (category === ".DS_Store") return;
  const instrumentDir = path.join(sampleDir, category);
  const instrumentFolders = fs.readdirSync(instrumentDir);

  instrumentFolders.forEach((instrument) => {
    if (instrument === ".DS_Store") return;
    const sampleDir = path.join(instrumentDir, instrument);
    const sampleFiles = fs.readdirSync(sampleDir);

    const mapping = {};
    sampleFiles.forEach((file) => {
      if (file === ".DS_Store") return;
      const note = path.basename(file, ".wav").toUpperCase();
      mapping[note] = file;
    });
    result[instrument] = mapping;
  });
});

const samplePath = "src/assets/instruments/samples.json";
fs.writeFileSync(samplePath, JSON.stringify(result, null, 2));
