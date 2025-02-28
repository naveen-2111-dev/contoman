import chalk from "chalk";
import path from "path";
import fs from "fs-extra";
import { ethers } from "ethers";
import type { Test_deploy } from "../../types";

export async function Deploy_Test({ ABI, BYTECODE }: Test_deploy) {
  try {
    const projectdir = process.cwd();
    const configPath = path.join(projectdir, "deploy.config.json");

    if (!fs.existsSync(configPath)) {
      return null;
    }

    const filedet = fs.readFileSync(configPath, "utf-8");
    const Config = JSON.parse(filedet);

    const { RPC, PRIVATE_KEY } = Config;

    if (
      !RPC ||
      RPC === "local" ||
      !PRIVATE_KEY ||
      PRIVATE_KEY === "privatekey"
    ) {
      console.error(
        chalk.red("Error: RPC or PRIVATE_KEY is missing in deploy.config.json!")
      );
      return;
    }

    const provider = new ethers.JsonRpcProvider(RPC);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    const deployer = new ethers.ContractFactory(ABI, BYTECODE, signer);
    const contract = await deployer.deploy();

    if (!contract.target) {
      console.log("nothing");
      return;
    }

    return contract.target;
  } catch (error) {
    return error;
  }
}
