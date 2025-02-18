import solc from "solc";
import fs from "fs-extra";
import path from "path";
import ora from "ora";
import chalk from "chalk";

export async function CompileContracts() {
  const projectPath = process.cwd();
  const contractPath = path.join(projectPath, "contracts");
  const buildPath = path.join(projectPath, "build");

  const spinner = ora({
    spinner: "dots",
    text: "Compiling contracts...",
  }).start();

  if (!fs.existsSync(contractPath)) {
    spinner.fail("Contracts folder not found!");
    return;
  }

  const contractFiles = fs
    .readdirSync(contractPath)
    .filter((file) => file.endsWith(".sol"));

  if (contractFiles.length === 0) {
    spinner.fail("No Solidity contracts found in the contracts folder!");
    return;
  }

  fs.ensureDirSync(buildPath);

  const sources = {};
  contractFiles.forEach((file) => {
    const contractFilePath = path.join(contractPath, file);
    const contractSource = fs.readFileSync(contractFilePath, "utf8");
    sources[file] = { content: contractSource };
  });

  const input = {
    language: "Solidity",
    sources,
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"],
        },
      },
    },
  };

  let compiled;
  try {
    compiled = JSON.parse(solc.compile(JSON.stringify(input)));
  } catch (error) {
    spinner.fail(`Solidity compilation error: ${error.message}`);
    return;
  }

  if (compiled.errors) {
    compiled.errors.forEach((error) => {
      console.error(chalk.red(`Error: ${error.formattedMessage}`));
    });
    spinner.fail("Compilation failed due to errors.");
    return;
  }

  if (!compiled.contracts) {
    spinner.fail("Compilation failed: No contract output found.");
    return;
  }

  for (const file in compiled.contracts) {
    for (const contractKey in compiled.contracts[file]) {
      const contractData = compiled.contracts[file][contractKey];

      const contractBuildPath = path.join(buildPath, contractKey);
      fs.ensureDirSync(contractBuildPath);

      const abi = contractData.abi;
      const bytecode = contractData.evm.bytecode.object;

      fs.writeFileSync(
        path.join(contractBuildPath, `${contractKey}.abi.json`),
        JSON.stringify(abi, null, 2)
      );
      fs.writeFileSync(
        path.join(contractBuildPath, `${contractKey}.bytecode.txt`),
        bytecode
      );

      spinner.succeed(chalk.green(`Compilation successful for ${contractKey}`));
    }
  }

  spinner.stop();
}
