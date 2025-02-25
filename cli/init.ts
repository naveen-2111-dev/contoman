#!/usr/bin/env bun
import { Command } from "commander";
import inquirer from "inquirer";
import * as fs from "fs-extra";
import * as path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const boilerplatePath = path.join(__dirname, "../templates");

const Init = new Command("init")
  .description("Initialize a new contract project")
  .action(async () => {
    const { projectName }: { projectName: string } = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: "Enter project folder name:",
      },
    ]);

    const projectPath: string = path.join(process.cwd(), projectName);
    const contractsPath: string = path.join(projectPath, "contracts");
    const testPath: string = path.join(projectPath, "test");

    try {
      fs.ensureDirSync(projectPath);
      fs.ensureDirSync(contractsPath);
      fs.ensureDirSync(testPath);

      const contractFilePath = path.join(contractsPath, "Contract.sol");
      const contractTemplate = fs.readFileSync(
        path.join(boilerplatePath, "contract.sol"),
        "utf8"
      );
      fs.writeFileSync(contractFilePath, contractTemplate);

      const testFilePath = path.join(testPath, "test.conto");
      const TestConfig = path.join(testPath, "test.config");
      const testTemplate = fs.readFileSync(
        path.join(boilerplatePath, "test.conto"),
        "utf8"
      );
      const TestConfigPath = fs.readFileSync(
        path.join(boilerplatePath, "test.config"),
        "utf8"
      );
      fs.writeFileSync(testFilePath, testTemplate);
      fs.writeFileSync(TestConfig, TestConfigPath);

      const packageJson = {
        name: projectName,
        version: "1.0.0",
        scripts: {
          test: 'echo "No tests yet"',
        },
      };
      fs.writeJsonSync(path.join(projectPath, "package.json"), packageJson, {
        spaces: 2,
      });

      const deployConfig = fs.readFileSync(
        path.join(boilerplatePath, "deploy.config.json"),
        "utf8"
      );
      fs.writeFileSync(
        path.join(projectPath, "deploy.config.json"),
        deployConfig
      );

      const gitignoreContent = fs.readFileSync(
        path.join(boilerplatePath, "gitignore.txt"),
        "utf8"
      );
      fs.writeFileSync(path.join(projectPath, ".gitignore"), gitignoreContent);

      console.log(
        chalk.green(`Project '${projectName}' initialized successfully!`)
      );
      console.log(chalk.blue(`Run: cd ${projectName} && bun install`));
    } catch (error) {
      console.error(chalk.red(`Error creating project: ${error}`));
    }
  });

export default Init;
