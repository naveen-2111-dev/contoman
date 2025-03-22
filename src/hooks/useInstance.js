import { ethers } from "ethers";
import path from "path";
import fs from "fs-extra";

export async function Instance() {
  try {
    const projectdir = process.cwd();
    const configPath = path.join(projectdir, "deploy.config.json");
    const testdir = path.join(projectdir, "test/test.config");

    const filedet = fs.readFileSync(configPath, "utf-8");
    const Config = JSON.parse(filedet);

    const rawData = fs.readFileSync(testdir, "utf-8");
    try {
      var data = JSON.parse(rawData);
    } catch (err) {
      throw new Error(`Invalid JSON in test.config: ${err.message}`);
    }

    if (!data.ContractName || data.ContractName === "contractName") {
      throw new Error("Please change the contract name in test.config");
    }

    const buildDir = path.join(projectdir, `build/${data.ContractName}`);
    const deploymentDir = path.join(buildDir, "deployment/contract.json");

    const contractRaw = fs.readFileSync(deploymentDir, "utf-8");
    try {
      var contractData = JSON.parse(contractRaw);
    } catch (err) {
      throw new Error(`Invalid JSON in contract.json: ${err.message}`);
    }

    const { RPC, PRIVATE_KEY } = Config;
    const provider = new ethers.JsonRpcProvider(RPC);
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    if (!contractData.contractAddress) {
      throw new Error("contract.json does not contain contractAddress");
    }

    const address = contractData.contractAddress;
    const abiPath = path.join(buildDir, `${data.ContractName}.abi.json`);

    if (!fs.existsSync(abiPath)) {
      throw new Error(`ABI file missing: ${abiPath}`);
    }

    const abi = JSON.parse(fs.readFileSync(abiPath, "utf-8"));

    return new ethers.Contract(address, abi, signer);
  } catch (error) {
    console.error("Instance function failed:", error.message);
  }
}
