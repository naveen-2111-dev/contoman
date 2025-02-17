import chalk from "chalk";
import * as fs from "fs-extra";
import path from "path";

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
      const [, key, value] = match.match(/#(\w+)\s*\n([\s\S]*)/) || [];
      if (key && value) {
        sections[key] = value.trim();
      }
    });
  }

  console.log(sections.function, sections.params);

  //function testing
  const projectPath = process.cwd();
  const buildpath = path.join(projectPath, "build");
  const abi = fs
    .readdirSync(buildpath)
    .filter((item) => item.endsWith(".json"));
  console.log(abi);
}
