const fs = require('fs');
const path = require('path');

// Load package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = require(packageJsonPath);

// Get the "types" field from package.json
const typesFilePath = packageJson.types;

if (!typesFilePath) {
  console.error('The "types" field is not defined in package.json.');
  process.exit(1);
}

// Resolve the full path to the types file
const typesFileFullPath = path.resolve(__dirname, typesFilePath);

// Check if the file exists
fs.access(typesFileFullPath, fs.constants.F_OK, (err) => {
  if (err) {
    console.error(`The types file '${typesFileFullPath}' does not exist.`);
    process.exit(1);
  } else {
    console.log(`The types file '${typesFileFullPath}' exists.`);
  }
});
