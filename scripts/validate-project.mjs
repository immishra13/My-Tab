import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

async function checkLocalFile(relativePath, source) {
    const resolvedPath = path.resolve(projectRoot, relativePath);

    if (!resolvedPath.startsWith(`${projectRoot}${path.sep}`)) {
        errors.push(`${source} references a path outside the project: ${relativePath}`);
        return;
    }

    try {
        const fileStat = await stat(resolvedPath);
        if (!fileStat.isFile()) {
            errors.push(`${source} references a path that is not a file: ${relativePath}`);
        }
    } catch {
        errors.push(`${source} references a missing file: ${relativePath}`);
    }
}

const manifestPath = path.join(projectRoot, "manifest.json");
let manifest;

try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
} catch (error) {
    errors.push(`manifest.json is not valid JSON: ${error.message}`);
}

if (manifest) {
    if (manifest.manifest_version !== 3) {
        errors.push("manifest.json must use Manifest V3.");
    }

    for (const relativePath of [
        manifest.chrome_url_overrides?.newtab,
        manifest.background?.service_worker,
        manifest.action?.default_popup,
        ...Object.values(manifest.icons ?? {})
    ].filter(Boolean)) {
        await checkLocalFile(relativePath, "manifest.json");
    }
}

const htmlPath = path.join(projectRoot, "index.html");
const html = await readFile(htmlPath, "utf8");
const resourcePattern = /<(?:script|link)\b[^>]*?\b(?:src|href)\s*=\s*["']([^"']+)["'][^>]*>/gi;

for (const [, reference] of html.matchAll(resourcePattern)) {
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference)) {
        continue;
    }

    const localPath = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
    await checkLocalFile(localPath, "index.html");
}

async function validateJavaScript(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            await validateJavaScript(entryPath);
        } else if (entry.isFile() && entry.name.endsWith(".js")) {
            const source = await readFile(entryPath, "utf8");

            try {
                new vm.Script(source, { filename: path.relative(projectRoot, entryPath) });
            } catch (error) {
                errors.push(`${path.relative(projectRoot, entryPath)}: ${error.message}`);
            }
        }
    }
}

await validateJavaScript(path.join(projectRoot, "js"));
await validateJavaScript(path.join(projectRoot, "scripts"));

if (errors.length > 0) {
    console.error(errors.map(error => `- ${error}`).join("\n"));
    process.exitCode = 1;
} else {
    console.log("Project validation passed.");
}
