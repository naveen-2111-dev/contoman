import solc from "solc";
import fs from "fs-extra";
import path from "path";
import ora from "ora";
import chalk from "chalk";

export async function CompileContracts() {
  const projectpath = process.cwd();
  const contractpath = path.join(projectpath, "contracts");
  const buildPath = path.join(projectpath, "build");

  const spinner = ora({
    spinner: "dots",
    text: "Compiling contracts...",
  }).start();

  if (!fs.existsSync(contractpath)) {
    spinner.fail("Contracts folder not found!");
    return;
  }

  const contractFiles = fs
    .readdirSync(contractpath)
    .filter((file) => file.endsWith(".sol"));

  if (contractFiles.length === 0) {
    spinner.fail("No Solidity contracts found in the contracts folder!");
    return;
  }

  fs.ensureDirSync(buildPath);

  contractFiles.forEach((file) => {
    try {
      const contractFilePath = path.join(contractpath, file);
      const contractSource = fs.readFileSync(contractFilePath, "utf8");

      const input = {
        language: "Solidity",
        sources: {
          [file]: {
            content: contractSource,
          },
        },
        settings: {
          outputSelection: {
            "*": {
              "*": ["abi", "evm.bytecode.object"],
            },
          },
        },
      };

      const compiled = JSON.parse(solc.compile(JSON.stringify(input)));

      if (compiled.errors) {
        compiled.errors.forEach((error) => {
          console.error(
            chalk.red(`Error in ${file}: ${error.formattedMessage}`)
          );
        });
        spinner.fail(`Compilation failed for ${file}`);
        return;
      }

      if (!compiled.contracts || !compiled.contracts[file]) {
        spinner.fail(
          `Compilation failed for ${file}: No contract output found`
        );
        return;
      }

      for (const contractKey in compiled.contracts[file]) {
        const contractData = compiled.contracts[file][contractKey];

        const abi = contractData.abi;
        const bytecode = contractData.evm.bytecode.object;

        fs.writeFileSync(
          path.join(buildPath, `${contractKey}.abi.json`),
          JSON.stringify(abi, null, 2)
        );
        fs.writeFileSync(
          path.join(buildPath, `${contractKey}.bytecode.txt`),
          bytecode
        );

        spinner.succeed(
          chalk.green(`Compilation successful for ${contractKey}`)
        );
      }
    } catch (error) {
      spinner.fail(
        `Unexpected error during compilation of ${file}: ${error.message}`
      );
    }
  });
  spinner.stop();
  process.exit(0);
}
