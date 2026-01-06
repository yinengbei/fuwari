import { writeFileSync } from "node:fs";
import { join } from "node:path";

const version = Date.now().toString();
const versionFile = join(process.cwd(), ".version");

writeFileSync(versionFile, version, "utf-8");
console.log(`✓ 构建版本号已生成: ${version}`);
