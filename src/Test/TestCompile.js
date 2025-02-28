import path from "path";
import fs from "fs-extra";
import solc from "solc";
import { Deploy_Test } from "./deploy";

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

    //deploying script params
    const TestCaller = path.join(ConfigPath, "TestCaller");
    const TestFunc = path.join(ConfigPath, "TestFunc");

    fs.ensureDirSync(ConfigPath);
    fs.ensureDirSync(TestCaller);
    fs.ensureDirSync(TestFunc);

    const getFiles = (dir, extension) => {
      return fs
        .readdirSync(dir)
        .filter((file) => file.endsWith(extension))
        .map((file) => path.join(dir, file));
    };

    const Abi_1 = getFiles(TestCaller, ".json");
    const Byte_1 = getFiles(TestCaller, ".txt");
    const Abi_2 = getFiles(TestFunc, ".json");
    const Byte_2 = getFiles(TestFunc, ".txt");

    const readFileSafely = (filesArray) => {
      return filesArray.length > 0
        ? fs.readFileSync(filesArray[0], "utf-8")
        : "File not found";
    };

    const ABI_1 = readFileSafely(Abi_1);
    const ABI_2 = readFileSafely(Abi_2);
    const BYTE_1 = readFileSafely(Byte_1);
    const BYTE_2 = readFileSafely(Byte_2);

    if (
      !ABI_1 ||
      !BYTE_1 ||
      ABI_1 === "File not found" ||
      BYTE_1 === "File not found"
    ) {
      throw new Error("TestCaller contract ABI or Bytecode not found!");
    }

    if (
      !ABI_2 ||
      !BYTE_2 ||
      ABI_2 === "File not found" ||
      BYTE_2 === "File not found"
    ) {
      throw new Error("TestFunc contract ABI or Bytecode not found!");
    }

    const res1 = await Deploy_Test({ ABI: ABI_1, BYTECODE: BYTE_1 });
    const TestCallerFunc = path.join(ConfigPath, "TestCaller");
    const deploy1 = path.join(TestCallerFunc, "deployed.json");
    const Json_1 = JSON.stringify({ contract_address: res1 }, null, 2);
    fs.writeFileSync(deploy1, Json_1);

    const res2 = await Deploy_Test({ ABI: ABI_2, BYTECODE: BYTE_2 });
    const TestFuncCall = path.join(ConfigPath, "TestFunc");
    const deploy2 = path.join(TestFuncCall, "deployed.json");
    const Json_2 = JSON.stringify({ contract_address: res2 }, null, 2);
    fs.writeFileSync(deploy2, Json_2);
  } catch (error) {
    console.log("Error:", error);
  }
}
