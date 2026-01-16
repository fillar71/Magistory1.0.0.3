
// Entry point shim for IISNode on SmarterASP
// This ensures IIS finds the script in the root directory
try {
    // Load the actual compiled application from the dist folder
    require('./dist/index.js');
} catch (error) {
    console.error("CRITICAL ERROR: Could not load dist/index.js");
    console.error("Ensure you have run 'npm run build' and the 'dist' folder exists.");
    console.error(error);
    process.exit(1);
}
