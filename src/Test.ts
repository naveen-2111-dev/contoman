import path from "path";
import fs from "fs-extra";

export async function testContract() {
  const projectdir = process.cwd();
  const testdir = path.join(projectdir, "test/test.conto");

  if (!fs.existsSync(testdir)) {
    console.log("test.conto not found");
    process.exit(0);
  }

  const content = fs.readFileSync(testdir, "utf-8").split("\n");
  let result: Record<string, any> = {};
  let currentKey = "";

  content.forEach((line) => {
    line = line.trim();
    if (line.startsWith("#")) {
      currentKey = line.replace("#", "").trim();
      result[currentKey] = [];
    } else if (line) {
      result[currentKey].push(line);
    }
  });

  Object.keys(result).forEach((key) => {
    if (result[key].length === 1) {
      result[key] = result[key][0];
    }
  });

  if (result.function === "function1" || !result.function) {
    console.log("\n function name is mandatory");
  }

  //logic starts
  
}
