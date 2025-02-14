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
  const address = path.join(buildPath, "deployment");

  try {
    const filedet = fs.readFileSync(configPath, "utf-8");
    const Config = JSON.parse(filedet);

    const { RPC, PRIVATE_KEY } = Config;
    const Provider = new ethers.JsonRpcProvider(RPC);
    const signer = new ethers.Wallet(PRIVATE_KEY, Provider);

    const spinner = ora({
      text: chalk.yellow("🚀 Preparing contract deployment..."),
      spinner: "dots",
    }).start();

    const ABIfile = fs
      .readdirSync(buildPath)
      .filter((item) => item.endsWith(".json"));
    const BYTEfile = fs
      .readdirSync(buildPath)
      .filter((item) => item.endsWith(".txt"));

    if (!ABIfile || !BYTEfile) {
      try {
        await CompileContracts();
        spinner.succeed("Contract compiled successfully.");
      } catch (error) {
        spinner.fail("Contract compilation failed.");
        return;
      }
    }

    if (ABIfile.length === 0) {
      spinner.fail("No ABI JSON file found in build directory.");
      return;
    }

    if (BYTEfile.length === 0) {
      spinner.fail("No Bytecode file found in build directory.");
      return;
    }

    const abiPath = path.join(buildPath, ABIfile[0]);
    const bytepath = path.join(buildPath, BYTEfile[0]);
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
}
