import { ethers } from "ethers";
import path from "path";
import fs from "fs-extra";
import type { Test_interaction } from "../../types";
import chalk from "chalk";

export async function Instance({ ABI, ContractAddress }: Test_interaction) {
  try {
    const dir = process.cwd();
    const deployconfig = path.join(dir, "deploy.config.json");
    if (!fs.existsSync(deployconfig)) {
      return null;
    }

    const filedet = fs.readFileSync(deployconfig, "utf-8");
    const Config = JSON.parse(filedet);

    const { RPC, PRIVATE_KEY } = Config;

    if (!RPC || RPC === "local") {
      console.error(chalk.red("RPC is missing in deploy.config.json!"));
      process.exit(1);
    }

    if (!PRIVATE_KEY || PRIVATE_KEY === "privatekey") {
      console.error(chalk.red("PRIVATE_KEY is missing in deploy.config.json!"));
      process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(RPC);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    const instance = new ethers.Contract(ContractAddress, ABI, signer);

    return instance;
  } catch (error) {
    console.log(error);
  }
}
