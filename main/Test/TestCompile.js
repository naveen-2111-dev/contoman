import path from "path";
import fs from "fs-extra";
import solc from "solc";

export async function TestContractCompile() {
  try {
    const currentDir = path.dirname(new URL(import.meta.url).pathname);
    const contractDir = path.join(currentDir, "Contract");

    if (!fs.existsSync(contractDir)) {
      throw new Error("Contracts folder not found!");
    }

    const sources = {};

    fs.readdirSync(contractDir).forEach((file) => {
      if (file.endsWith(".sol")) {
        const filePath = path.join(contractDir, file);
        sources[file] = { content: fs.readFileSync(filePath, "utf8") };
      }
    });

    if (!sources["FuncCaller.sol"]) {
      throw new Error("FuncCaller.sol not found in the contract folder!");
    }

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

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    console.log("Compilation Output:", output);

    if (output.errors) {
      console.error("Compilation Errors:", output.errors);
    }
  } catch (error) {
    console.log("Error:", error);
  }
}
