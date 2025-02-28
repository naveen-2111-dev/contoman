import chalk from "chalk";
import * as fs from "fs-extra";
import path from "path";
import { TestContractCompile } from "./TestCompile";

export async function Test() {
  try {
    const currentDir = process.cwd();
    const TestDir = path.join(currentDir, "test");
    await TestContractCompile();

    if (!fs.existsSync(TestDir)) {
      console.error(chalk.red("Error: 'test' directory does not exist."));
      process.exit(1);
    }

    const TestFiles = fs
      .readdirSync(TestDir)
      .filter((item) => item.endsWith(".conto"));

    if (TestFiles.length === 0) {
      console.error(
        chalk.red("Error: No .conto files found in 'test' directory.")
      );
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

    const testConfigPath = path.join(TestDir, "test.config");

    if (!fs.existsSync(testConfigPath)) {
      console.error(chalk.red("Error: 'test.config' file is missing."));
      process.exit(1);
    }

    const ConfigData = fs.readFileSync(testConfigPath, "utf-8");
    const JsonData_Config = JSON.parse(ConfigData);
    const ContractName = JsonData_Config.ContractName;

    const BuildDir = path.join(currentDir, "build");
    const ContractBuildDir = path.join(BuildDir, ContractName);
    const contractJsonPath = path.join(
      ContractBuildDir,
      "deployment",
      "contract.json"
    );

    if (!fs.existsSync(contractJsonPath)) {
      console.error(
        chalk.red(
          `Error: contract.json file is missing at '${contractJsonPath}'. Run the deployment script. [or] check the test.config`
        )
      );
      process.exit(1);
    }

    const ContractAddress_Json = JSON.parse(
      fs.readFileSync(contractJsonPath, "utf-8")
    );

    if (!ContractAddress_Json.contractAddress) {
      console.error(
        chalk.red("Error: 'contractAddress' key is missing in contract.json.")
      );
      process.exit(1);
    }

    if (
      JsonData_Config.Contract_Address !== ContractAddress_Json.contractAddress
    ) {
      console.error(
        chalk.red.bold("Error: Contract address mismatch in test.config file.")
      );
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red("Unexpected error occurred:"), error);
    process.exit(1);
  }
}
