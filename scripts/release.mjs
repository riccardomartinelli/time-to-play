#!/usr/bin/env node
// Release: bumps the version of every package, builds the Docker images and pushes them to Docker Hub.
//
// Usage: npm run release -- [patch|minor|major|<x.y.z>] [--dry-run] [--no-git-push]
//   DOCKERHUB_NAMESPACE  Docker Hub user or organization (required)
//   DOCKER_PLATFORMS     target platforms (default linux/amd64,linux/arm64)
//   DOCKER_BUILDER       buildx builder to use (default: the current one)
//
// --dry-run builds the images for the local platform only, without changing files, pushing or committing.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packageFiles = [
  "package.json",
  "packages/shared/package.json",
  "packages/server/package.json",
  "packages/client/package.json",
];
const images = [
  { name: "time-to-play-server", dockerfile: "packages/server/Dockerfile" },
  { name: "time-to-play-client", dockerfile: "packages/client/Dockerfile" },
];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const gitPush = !args.includes("--no-git-push");
const bump = args.find((arg) => !arg.startsWith("--")) ?? "patch";

function run(command, commandArgs, options = {}) {
  console.log(`\n$ ${command} ${commandArgs.join(" ")}`);
  return execFileSync(command, commandArgs, { cwd: root, stdio: "inherit", ...options });
}

function output(command, commandArgs) {
  return execFileSync(command, commandArgs, { cwd: root, encoding: "utf8" }).trim();
}

function fail(message) {
  console.error(`\nRelease failed: ${message}`);
  process.exit(1);
}

function nextVersion(current, kind) {
  if (/^\d+\.\d+\.\d+$/.test(kind)) return kind;
  const [major, minor, patch] = current.split(".").map(Number);
  if (kind === "major") return `${major + 1}.0.0`;
  if (kind === "minor") return `${major}.${minor + 1}.0`;
  if (kind === "patch") return `${major}.${minor}.${patch + 1}`;
  fail(`unknown version bump "${kind}" (use patch, minor, major or x.y.z)`);
}

function readJson(file) {
  return JSON.parse(readFileSync(join(root, file), "utf8"));
}

function writeVersion(file, version) {
  const json = readJson(file);
  json.version = version;
  writeFileSync(join(root, file), `${JSON.stringify(json, null, 2)}\n`);
}

// 1. Preconditions
const namespace = process.env.DOCKERHUB_NAMESPACE;
if (!namespace) fail("set DOCKERHUB_NAMESPACE to your Docker Hub user or organization");
const platforms = process.env.DOCKER_PLATFORMS ?? "linux/amd64,linux/arm64";
const builder = process.env.DOCKER_BUILDER;

if (!dryRun && output("git", ["status", "--porcelain"]) !== "") {
  fail("the working tree has uncommitted changes");
}

const current = readJson("package.json").version;
const version = nextVersion(current, bump);
if (version === current) fail(`version ${version} is already the current one`);
if (!dryRun && output("git", ["tag", "--list", `v${version}`]) !== "") {
  fail(`tag v${version} already exists`);
}

console.log(`Release ${current} -> ${version}${dryRun ? " (dry run)" : ""}`);
console.log(`Images: ${images.map((image) => `${namespace}/${image.name}`).join(", ")}`);

// 2. Same checks as the CI
run("npm", ["run", "check"]);

// 3. Version bump of the root and of every workspace package, lock file included
if (!dryRun) {
  for (const file of packageFiles) writeVersion(file, version);
  run("npm", ["install", "--package-lock-only", "--ignore-scripts"]);
}

// 4. Docker images, tagged with the version and "latest"
const revision = output("git", ["rev-parse", "HEAD"]);
try {
  for (const image of images) {
    const repository = `${namespace}/${image.name}`;
    run("docker", [
      "buildx",
      "build",
      ...(builder ? ["--builder", builder] : []),
      "--file",
      image.dockerfile,
      "--tag",
      `${repository}:${version}`,
      "--tag",
      `${repository}:latest`,
      "--label",
      `org.opencontainers.image.version=${version}`,
      "--label",
      `org.opencontainers.image.revision=${revision}`,
      ...(dryRun ? ["--load"] : ["--platform", platforms, "--push"]),
      ".",
    ]);
  }
} catch {
  if (!dryRun) run("git", ["checkout", "--", ...packageFiles, "package-lock.json"]);
  fail("Docker build or push failed (is `docker login` done?); version files restored");
}

if (dryRun) {
  console.log(`\nDry run done: images built locally as ${version}, nothing changed or pushed.`);
  process.exit(0);
}

// 5. Release commit and tag
run("git", ["add", ...packageFiles, "package-lock.json"]);
run("git", ["commit", "-m", `Release v${version}`]);
run("git", ["tag", "-a", `v${version}`, "-m", `Release v${version}`]);
if (gitPush) run("git", ["push", "--follow-tags"]);

console.log(`\nReleased v${version}: images pushed to Docker Hub.`);
