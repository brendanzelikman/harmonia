#!/usr/bin/env node
import fs from "fs";
import readline from "readline";

let currentFile = null;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Try to read a file from the command line arguments
if (process.argv.length > 2) {
  const filename = process.argv[2];
  if (fs.existsSync(filename)) {
    setCurrentFile(filename);
  }
}

function showMainMenu() {
  console.clear();
  console.log("\n=== Harmonia CLI ===");
  console.log("Available commands:");
  console.log("  create <file.json>  - Create a new JSON file");
  console.log("  load <file.json>    - Load an existing JSON file");
  console.log("  exit               - Exit CLI\n");
  promptMainMenu();
}

function promptMainMenu() {
  rl.question("Enter command: ", (input) => {
    const [command, filename] = input.split(" ");

    if (command === "create" && filename) {
      createFile(filename);
    } else if (command === "load" && filename) {
      loadFile(filename);
    } else if (command === "exit") {
      console.log("Exiting...");
      rl.close();
    } else {
      console.log("Invalid command.");
      promptMainMenu();
    }
  });
}

function createFile(filename) {
  if (fs.existsSync(filename)) {
    console.log("File already exists.");
    return promptMainMenu();
  }
  fs.writeFileSync(filename, JSON.stringify({}, null, 2));
  console.log(`Created ${filename}`);
  setCurrentFile(filename);
  showProjectMenu();
}

function loadFile(filename) {
  if (!fs.existsSync(filename)) {
    console.log("File does not exist.");
    return promptMainMenu();
  }
  setCurrentFile(filename);
  showProjectMenu();
}

function setCurrentFile(filename) {
  currentFile = filename;
  console.log(`Loaded ${filename}`);
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  config.currentFile = filename;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function showProjectMenu() {
  console.clear();
  console.log(`\n=== Editing ${currentFile} ===`);
  console.log("Available commands:");
  console.log("  print - Print the current project");
  console.log("  print key - Print the value of a key in the current project");
  console.log("  copy  - Duplicate the current project");
  console.log("  delete - Delete the current project");
  console.log("  exit - Return to main menu\n");
  promptProjectMenu();
}

function promptProjectMenu() {
  rl.question("Enter command: ", (input) => {
    const [command, filename] = input.split(" ");
    if (command === "print" && !filename) {
      const project = JSON.parse(fs.readFileSync(currentFile, "utf8"));
      console.log(JSON.stringify(project, null, 2));
      promptProjectMenu();
    } else if (command === "print") {
      const fields = filename.split(".");
      const project = JSON.parse(fs.readFileSync(currentFile, "utf8"));
      let value = project;
      for (let field of fields) {
        value = value[field];
        if (!value) {
          console.log("Invalid key path.");
          return promptProjectMenu();
        }
      }
      console.log(value);
      promptProjectMenu();
    } else if (command === "copy" && !filename) {
      console.log("Please provide a filename.");
      promptProjectMenu();
    } else if (command === "copy") {
      const project = JSON.parse(fs.readFileSync(currentFile, "utf8"));
      fs.writeFileSync(filename, JSON.stringify(project, null, 2));
      console.log(`Copied to ${filename}`);
      promptProjectMenu();
    } else if (command === "delete" && !filename) {
      console.log("Please provide a filename.");
      promptProjectMenu();
    } else if (command === "delete") {
      fs.unlinkSync(filename);
      console.log(`Deleted ${filename}`);
      promptProjectMenu();
    } else if (command === "exit") {
      currentFile = null;
      showMainMenu();
    } else if (command === "help") {
      showProjectMenu();
    } else {
      console.log("Invalid command.");
      promptProjectMenu();
    }
  });
}

if (!currentFile) {
  showMainMenu();
} else {
  showProjectMenu();
}
