
// Entry point shim for IISNode on SmarterASP
// This ensures IIS finds the script in the root directory and loads dist/index.js
try {
    console.log("Starting server.js shim...");
    require('./dist/index.js');
} catch (error) {
    console.error("CRITICAL ERROR: Could not load dist/index.js");
    console.error("Ensure you have created the 'dist' folder and uploaded the compiled JS files.");
    console.error(error);
    process.exit(1);
}
