#!/usr/bin/env bun
import { program } from "commander";
import inquirer from "inquirer";
import * as fs from "fs-extra";
import * as path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url"; 

const __dirname = path.dirname(fileURLToPath(import.meta.url)); 

program
  .command("init")
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
        path.join(__dirname, "boilerplate", "contract.sol"),
        "utf8"
      );
      fs.writeFileSync(contractFilePath, contractTemplate);

      const testFilePath = path.join(testPath, "test.txt"); 
      const testTemplate = fs.readFileSync(
        path.join(__dirname, "boilerplate", "test.txt"),
        "utf8"
      );
      fs.writeFileSync(testFilePath, testTemplate);

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
        path.join(__dirname, "boilerplate", "deploy.config.json"),
        "utf8"
      );
      fs.writeFileSync(
        path.join(projectPath, "deploy.config.json"),
        deployConfig
      );

      const gitignoreContent = fs.readFileSync(
        path.join(__dirname, "boilerplate", "gitignore.txt"),
        "utf8"
      );
      fs.writeFileSync(path.join(projectPath, ".gitignore"), gitignoreContent); 

      console.log(
        chalk.green(`✅ Project '${projectName}' initialized successfully!`)
      );
      console.log(chalk.blue(`Run: cd ${projectName} && bun install`));
    } catch (error) {
      console.error(chalk.red(`Error creating project: ${error}`));
    }
  });

program.parse(process.argv);
