import path from "path";
import fs from "fs-extra";
import solc from "solc";

export async function TestContractCompile() {
  try {
    const currentDir = path.dirname(new URL(import.meta.url).pathname);
    const contractDir = path.join(currentDir, "Contract");
    const ConfigPath = path.join(currentDir, "Config");

    if (!fs.existsSync(contractDir)) {
      throw new Error("Contracts folder not found!");
    }

    fs.ensureDirSync(ConfigPath);

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

    if (output.errors) {
      console.error("Compilation Errors:", output.errors);
      process.exit(1);
    }

    for (const file in output.contracts) {
      for (const contractKey in output.contracts[file]) {
        const contractData = output.contracts[file][contractKey];

        const contractBuildPath = path.join(ConfigPath, contractKey);
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
      }
    }
  } catch (error) {
    console.log("Error:", error);
  }
}
