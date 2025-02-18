import chalk from "chalk";
import { ethers } from "ethers";
import * as fs from "fs-extra";
import path from "path";
import ora from "ora";
import figlet from "figlet";
import { CompileContracts } from "./Compile";

function showBanner() {
  console.log(
    chalk.white(
      figlet.textSync("CONTOMAN.", {
        font: "ANSI Shadow",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 100,
        whitespaceBreak: true,
      })
    )
  );
}

export default async function Deploy() {
  showBanner();

  const projectdir = process.cwd();
  const configPath = path.join(projectdir, "deploy.config.json");
  const buildPath = path.join(projectdir, "build");

  const spinner = ora({
    text: chalk.yellow("🚀 Preparing contract deployment..."),
    spinner: "dots",
  }).start();

  try {
    const filedet = fs.readFileSync(configPath, "utf-8");
    const Config = JSON.parse(filedet);

    const { RPC, PRIVATE_KEY, CONTRACT_FILE } = Config;

    if (!RPC || RPC === "local") {
      console.error(chalk.red("RPC is missing in deploy.config.json!"));
      process.exit(1);
    }

    if (!PRIVATE_KEY || PRIVATE_KEY === "privatekey") {
      console.error(chalk.red("PRIVATE_KEY is missing in deploy.config.json!"));
      process.exit(1);
    }

    const Provider = new ethers.JsonRpcProvider(RPC);
    const signer = new ethers.Wallet(PRIVATE_KEY, Provider);

    if (!fs.existsSync(buildPath) || fs.readdirSync(buildPath).length === 0) {
      try {
        await CompileContracts();
      } catch (error) {
        console.error(chalk.red("Contract compilation failed."), error);
        process.exit(1);
      }
    }

    const ContractPath = path.join(buildPath, CONTRACT_FILE);

    const ABIfile = fs
      .readdirSync(ContractPath)
      .filter((item) => item.endsWith(".json"));
    const BYTEfile = fs
      .readdirSync(ContractPath)
      .filter((item) => item.endsWith(".txt"));

    if (ABIfile.length === 0 || BYTEfile.length === 0) {
      console.error(
        chalk.red("No ABI or Bytecode files found in build directory.")
      );
      process.exit(1);
    }

    const abiPath = path.join(ContractPath, ABIfile[0]);
    const bytepath = path.join(ContractPath, BYTEfile[0]);
    const abiContent = fs.readFileSync(abiPath, "utf-8");
    const byteContent = fs.readFileSync(bytepath, "utf-8");
    const abiJson = JSON.parse(abiContent);

    const contractFactory = new ethers.ContractFactory(
      abiJson,
      byteContent,
      signer
    );

    spinner.text = `Deploying contract...to ${RPC}`;
    const contract = await contractFactory.deploy();
    spinner.text = "Waiting for contract deployment confirmation...";
    await contract.waitForDeployment();

    const tx = contract.deploymentTransaction();

    spinner.succeed(`Contract deployed at: ${contract.target}`);
    console.log("");
    spinner.stopAndPersist({
      text: `Transaction hash: ${tx?.hash}`,
    });

    const receipt = await tx?.wait();
    const gasUsed = receipt?.gasUsed;

    spinner.stopAndPersist({
      text: `Total Gas used by the contract is: ${gasUsed}`,
    });

    const gasPrice = await Provider.getFeeData();
    const totalGasPrice = gasUsed
      ? Number(gasUsed) * Number(gasPrice.gasPrice)
      : 0;

    spinner.stopAndPersist({
      text: `Total cost to deploy the contract is: ${totalGasPrice} wei`,
    });

    const deploymentJson = {
      contractAddress: contract.target,
      chainInfo: await Provider.getNetwork(),
    };

    const address = path.join(ContractPath, "deployment");

    fs.ensureDirSync(address);
    const deploymentFilePath = path.join(address, "contract.json");
    fs.writeFileSync(
      deploymentFilePath,
      JSON.stringify(deploymentJson, null, 2),
      "utf-8"
    );
    console.log(chalk.cyan("\nDeployment completed successfully!\n"));
  } catch (error) {
    console.error("Error during deployment:", error);
  }
  spinner.stop();
}
