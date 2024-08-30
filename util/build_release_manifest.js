const crypto = require("crypto");
const fs = require("fs");
const packageJson = require("../package.json");

const manifest = {
    timestamp: new Date().toISOString(),
    version: packageJson.version,
    sha256sums: {

    }
}

const binaries = {
    "valetudo-armv7": "./build/valetudo-armv7",
    "valetudo-armv7-lowmem": "./build/valetudo-armv7-lowmem",
    "valetudo-aarch64": "./build/valetudo-aarch64",

    "valetudo-armv7.upx": "./build/valetudo-armv7.upx",
    "valetudo-armv7-lowmem.upx": "./build/valetudo-armv7-lowmem.upx",
    "valetudo-aarch64.upx": "./build/valetudo-aarch64.upx",
}

Object.values(binaries).forEach((path, i) => {
    const name = Object.keys(binaries)[i];

    try {
        const bin = fs.readFileSync(path);
        const checksum = crypto.createHash("sha256");
        checksum.update(bin);

        manifest.sha256sums[name] = checksum.digest("hex");
    } catch(e) {
        if(e.code === "ENOENT") {
            // eslint-disable-next-line no-console
            console.warn(`Couldn't find ${name} at ${path}`);
        } else {
            // eslint-disable-next-line no-console
            console.error(e);
        }
    }
})

if (process.argv.length > 2 && process.argv[2] === "nightly") {
    manifest.version = "nightly";

    try {
        manifest.changelog = fs.readFileSync("./build/changelog_nightly.md").toString();
    } catch(e) {
        //intentional
    }
}

fs.writeFileSync("./build/valetudo_release_manifest.json", JSON.stringify(manifest, null, 2))
