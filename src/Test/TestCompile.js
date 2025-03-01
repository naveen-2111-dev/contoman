import path from "path";
import fs from "fs-extra";
import solc from "solc";
import { Deploy_Test } from "./deploy";
import { Instance } from "./instance";
import chalk from "chalk";
import { ethers } from "ethers";
import { AbiCoder } from "ethers";
let ABI_1;
let res1;
let res2;

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

    ABI_1 = readFileSafely(Abi_1);
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

    res1 = await Deploy_Test({ ABI: ABI_1, BYTECODE: BYTE_1 });
    const TestCallerFunc = path.join(ConfigPath, "TestCaller");
    const deploy1 = path.join(TestCallerFunc, "deployed.json");
    const Json_1 = JSON.stringify({ contract_address: res1 }, null, 2);
    fs.writeFileSync(deploy1, Json_1);

    res2 = await Deploy_Test({ ABI: ABI_2, BYTECODE: BYTE_2 });
    const TestFuncCall = path.join(ConfigPath, "TestFunc");
    const deploy2 = path.join(TestFuncCall, "deployed.json");
    const Json_2 = JSON.stringify({ contract_address: res2 }, null, 2);
    fs.writeFileSync(deploy2, Json_2);
  } catch (error) {
    console.log("Error:", error);
  }
}

//interaction
export async function Interaction() {
  try {
    const currentDir = process.cwd();
    const TestDir = path.join(currentDir, "test");

    if (!fs.existsSync(TestDir)) {
      console.error(chalk.red("Error: 'test' directory does not exist."));
      process.exit(1);
    }

    const TestFiles = fs
      .readdirSync(TestDir)
      .filter((item) => item.endsWith(".conto"));

    if (TestFiles.length === 0) {
      console.error(
        chalk.red("Error: No .conto files found in 'test' directory.")
      );
      process.exit(1);
    }

    const TestFile = path.join(TestDir, TestFiles[0]);
    const TestFileContent = fs.readFileSync(TestFile, "utf-8");

    const sections = {};
    const matches = TestFileContent.match(/#(\w+)\s*\n([\s\S]*?)(?=\n#|$)/g);

    if (matches) {
      matches.forEach((match) => {
        const matchResult = match.match(/#(\w+)\s*\n([\s\S]*)/);
        if (matchResult) {
          const key = matchResult[1].trim();
          const value = matchResult[2].trim();
          sections[key] = value;
        }
      });
    }

    const testConfigPath = path.join(TestDir, "test.config");

    if (!fs.existsSync(testConfigPath)) {
      console.error(chalk.red("Error: 'test.config' file is missing."));
      process.exit(1);
    }

    const ConfigData = fs.readFileSync(testConfigPath, "utf-8");
    const JsonData_Config = JSON.parse(ConfigData);
    const ContractName = JsonData_Config.ContractName;

    const BuildDir = path.join(currentDir, "build");
    const ContractBuildDir = path.join(BuildDir, ContractName);
    const contractJsonPath = path.join(
      ContractBuildDir,
      "deployment",
      "contract.json"
    );

    if (!fs.existsSync(contractJsonPath)) {
      console.error(
        chalk.red(
          `Error: contract.json file is missing at '${contractJsonPath}'. Run the deployment script. [or] check the test.config`
        )
      );
      process.exit(1);
    }

    const ContractAddress_Json = JSON.parse(
      fs.readFileSync(contractJsonPath, "utf-8")
    );

    if (!ContractAddress_Json.contractAddress) {
      console.error(
        chalk.red("Error: 'contractAddress' key is missing in contract.json.")
      );
      process.exit(1);
    }

    if (
      JsonData_Config.Contract_Address !== ContractAddress_Json.contractAddress
    ) {
      console.error(
        chalk.red.bold("Error: Contract address mismatch in test.config file.")
      );
      process.exit(1);
    }

    console.log(sections.params, "function", sections.function);

    const contract_instance = await Instance({
      ABI: ABI_1,
      ContractAddress: JsonData_Config.Contract_Address,
    });

    const cont_address = JsonData_Config.Contract_Address;
    const functionName = sections.function;
    const abiCoder = new AbiCoder();

    const types = sections.types.includes(",")
      ? sections.types.split(",").map((t) => t.trim())
      : [sections.types.trim()];

    const param = sections.params.includes(",")
      ? sections.params.split(",").map((p) => p.trim())
      : [sections.params.trim()];

    function parseParamByType(type, param) {
      if (type.includes("[")) {
        const arrayValues = param.split(";").map((item) => item.trim());
        return arrayValues.map((item) =>
          parseParamByType(type.replace(/\[.*\]/, ""), item)
        );
      }

      if (type.startsWith("uint") || type.startsWith("int")) {
        return BigInt(param);
      }

      if (type === "bool") {
        return param.toLowerCase() === "true";
      }

      if (type === "address") {
        return param;
      }

      if (type.startsWith("bytes")) {
        return ethers.utils.hexlify(ethers.utils.toUtf8Bytes(param));
      }

      if (type === "string") {
        return param;
      }

      if (type.startsWith("tuple")) {
        param = param.replace(/[()]/g, "");
        const tupleValues = param.split(";").map((item) => item.trim());
        return tupleValues;
      }

      return param;
    }

    const parsedParams = param.map((param, index) =>
      parseParamByType(types[index], param)
    );

    const encodedParams = abiCoder.encode(types, parsedParams);
    console.log(types, functionName, parsedParams, encodedParams);

    await contract_instance.setTestFuncAddress(
      JsonData_Config.Contract_Address
    );
    console.log("Contract Address:", JsonData_Config.Contract_Address);

    const Function_Caller = await contract_instance.callAnyFunction(
      cont_address,
      functionName,
      encodedParams,
      { gasLimit: ethers.utils.parseUnits("500000", "wei") }
    );

    console.log(Function_Caller);
  } catch (error) {
    console.log(error);
  }
}
