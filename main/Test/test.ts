import chalk from "chalk";
import * as fs from "fs-extra";
import path from "path";
import { TestContractCompile } from "./TestCompile";

export async function Test() {
  const currentDir = process.cwd();
  const TestDir = path.join(currentDir, "test");

  const TestFiles = fs
    .readdirSync(TestDir)
    .filter((item) => item.endsWith(".conto"));

  if (TestFiles.length === 0) {
    console.error(chalk.red("test dir does not have any files inside to it"));
    process.exit(1);
  }

  const TestFile = path.join(TestDir, TestFiles[0]);

  const TestFileContent = fs.readFileSync(TestFile, "utf-8");

  const sections: Record<string, string> = {};
  const matches = TestFileContent.match(/#(\w+)\s*\n([\s\S]*?)(?=\n#|$)/g);

  if (matches) {
    matches.forEach((match) => {
      const matchResult = match.match(/#(\w+)\s*\n([\s\S]*)/);
      if (matchResult) {
        const key = matchResult[1].trim();
        const value = matchResult[2].trim();
        sections[key] = value;
      }
    });
  }

  console.log("Function:", sections.function);
  console.log("Params:", sections.params);
  console.log("Result:", sections.result);

  const projectPath = process.cwd();
  const buildpath = path.join(projectPath, "test");
  TestContractCompile();

}
