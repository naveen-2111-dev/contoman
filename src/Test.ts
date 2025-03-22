import path from "path";
import fs from "fs-extra";
import { ethers } from "ethers";
import contract from "./hooks/useContract";

export async function testContract() {
  const projectdir = process.cwd();
  const testdir = path.join(projectdir, "test/test.conto");

  if (!fs.existsSync(testdir)) {
    console.error("Error: test.conto not found");
    process.exit(1);
  }

  const content = fs.readFileSync(testdir, "utf-8").split("\n");
  let result: Record<string, any> = {};
  let currentKey = "";

  content.forEach((line) => {
    line = line.trim();
    if (line.startsWith("#")) {
      currentKey = line.replace("#", "").trim();
      result[currentKey] = [];
    } else if (line) {
      result[currentKey].push(line);
    }
  });

  Object.keys(result).forEach((key) => {
    if (result[key].length === 1) {
      result[key] = result[key][0];
    }
  });

  if (!result["function"]) {
    console.error("\nError: Function name is mandatory.");
    process.exit(1);
  }

  const functionName = result["function"];
  const types = Array.isArray(result["types"])
    ? result["types"]
    : [result["types"]];
  const params = Array.isArray(result["params"])
    ? result["params"]
    : [result["params"]];

  const args = params.map((param, index) => {
    const type = types[index];

    if (type === "uint256" || type === "int256") {
      return BigInt(param);
    } else if (type === "bytes32") {
      if (param.length > 31) {
        console.warn(`Warning: Truncating '${param}' to 31 characters.`);
        param = param.substring(0, 31);
      }
      return ethers.encodeBytes32String(param.toString());
    } else if (type === "bytes") {
      return ethers.toUtf8Bytes(param.toString());
    } else if (type === "bool") {
      return param.toLowerCase() === "true";
    } else if (type === "address") {
      return ethers.getAddress(param);
    } else if (type === "string") {
      return param.toString();
    } else {
      return param;
    }
  });

  try {
    console.log(`\nCalling function: ${functionName} with args:`, args);
    const res = await contract(functionName, ...args);
    console.log("Contract response:", res);
  } catch (error) {
    console.error("Error executing contract function:", error);
  }
}
