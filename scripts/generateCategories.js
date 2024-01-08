import fs from "fs";
import _ from "lodash";
import path from "path";

const sampleDir = "src/assets/samples";
const categoryFolders = fs.readdirSync(sampleDir);

// Get the list of categories
const result = {};
const orderedCategories = [
  "Keyboards",
  "Strings",
  "Guitars",
  "Basses",
  "Brass",
  "Woodwinds",
  "Mallets",
  "Bells",
  "Kick Drums",
  "Snare Drums",
  "Tenor Drums",
  "Cymbals",
  "Wood Percussion",
  "Metal Percussion",
  "Trvth Drumkit",
  "Amen Breaks",
  "Animal Sounds",
  "Miscellaneous Sounds",
  "Death Metal Vocals",
];

const orderedCategoryFolders = _.sortBy(categoryFolders, (category) => {
  return orderedCategories.indexOf(category);
});

// Iterate over every category folder
orderedCategoryFolders.forEach((category) => {
  if (category === ".DS_Store" || category.endsWith(".md")) return;

  // Get the list of instruments in the category
  const instrumentDir = path.join(sampleDir, category);
  const instrumentFolders = fs.readdirSync(instrumentDir);
  const mappings = [];

  // Iterate over every instrument in the category
  instrumentFolders.forEach((instrument) => {
    if (instrument === ".DS_Store") return;

    // Add the instrument to the list of mappings
    const key = _.kebabCase(instrument);
    const name = instrument;
    mappings.push({ key, name });
  });

  // Add the category to the result
  result[category] = mappings;
});

// Write the result to a file
const samplePath = "src/assets/instruments/categories.json";
fs.writeFileSync(samplePath, JSON.stringify(result, null, 2));
