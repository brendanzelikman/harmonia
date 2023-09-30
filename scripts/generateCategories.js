import fs from "fs";
import _ from "lodash";
import path from "path";

const sampleDir = "public/samples";
const categoryFolders = fs.readdirSync(sampleDir);

const result = {};
const orderedCategories = [
  "keyboards",
  "guitars",
  "strings",
  "woodwinds",
  "brass",
  "mallets",
  "kicks",
  "toms",
  "snares",
  "claps",
  "hats",
  "cymbals",
  "percussion",
  "vocals",
];

const orderedCategoryFolders = _.sortBy(categoryFolders, (category) => {
  return orderedCategories.indexOf(category);
});

orderedCategoryFolders.forEach((category) => {
  if (category === ".DS_Store") return;
  const instrumentDir = path.join(sampleDir, category);
  const instrumentFolders = fs.readdirSync(instrumentDir);

  const mappings = [];
  instrumentFolders.forEach((instrument) => {
    if (instrument === ".DS_Store") return;
    const key = instrument;
    const name = _.startCase(instrument);
    mappings.push({ key, name });
  });
  result[category] = mappings;
});

const samplePath = "src/assets/instruments/categories.json";
fs.writeFileSync(samplePath, JSON.stringify(result, null, 2));
