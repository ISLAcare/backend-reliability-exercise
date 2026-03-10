const major = Number(process.versions.node.split(".")[0]);

if (!Number.isFinite(major) || major !== 24) {
  console.error(`Use Node 24.x for this exercise. Current version: ${process.versions.node}`);
  process.exit(1);
}
