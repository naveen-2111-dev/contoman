import chalk from "chalk";
import * as fs from "fs-extra";
import path from "path";
import { TestContractCompile } from "./TestCompile";

export async function Test() {
  // TestContractCompile(); //need to remove comment bro.................

  const currentDir = process.cwd();
  const TestDir = path.join(currentDir, "test");

  //reading .conto file

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

  //Reading testconfig data
  const testcon = path.join(TestDir, "test.config");
  const ConfigData = fs.readFileSync(testcon, "utf-8");
  const JsonData_Config = JSON.parse(ConfigData);
  const ContractName = JsonData_Config.ContractName;

  //getting the contract address
  const BuildDir = path.join(currentDir, "build");
  const ContRactBuildDir = path.join(BuildDir, ContractName);
  const DepDir = path.join(ContRactBuildDir, "deployment"); //deployment directory
  const ContractAddress_Json = JSON.parse(
    fs.readFileSync(path.join(DepDir, "contract.json"), "utf-8")
  );

  //checking the contract address is correctness
  if (
    JsonData_Config.Contract_Address !== ContractAddress_Json.contractAddress
  ) {
    console.log(
      chalk.red.bold("check the test.config file Contractaddress not matching")
    );
    process.exit(0);
  }

  console.log("Function:", sections.function);
  console.log("Params:", sections.params);
  console.log("Result:", sections.result);
}
