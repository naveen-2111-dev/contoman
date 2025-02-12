import solc from "solc";
import fs from "fs-extra";
import path from "path";

export async function CompileContracts(projectname) {
  const projectpath = path.join(process.cwd(), projectname);
  const contractpath = path.join(projectpath, "contracts");
  const buildPath = path.join(projectpath, "build");

  if (!fs.existsSync(contractpath)) {
    console.error("Contracts folder not found!");
    return;
  }

  const contractFiles = fs
    .readdirSync(contractpath)
    .filter((file) => file.endsWith(".sol"));

  if (contractFiles.length === 0) {
    console.error("No Solidity contracts found in the contracts folder!");
    return;
  }

  console.log(`Found contracts: ${contractFiles.join(", ")}`);

  fs.ensureDirSync(buildPath);

  contractFiles.forEach((file) => {
    const contractFilePath = path.join(contractpath, file);
    const contractSource = fs.readFileSync(contractFilePath, "utf8");

    const input = {
      language: "Solidity",
      sources: {
        [file]: {
          content: contractSource,
        },
      },
      settings: {
        outputSelection: {
          "*": {
            "*": ["abi", "evm.bytecode.object"],
          },
        },
      },
    };

    const compiled = JSON.parse(solc.compile(JSON.stringify(input)));

    if (!compiled.contracts || !compiled.contracts[file]) {
      console.error(`Compilation failed for ${file}`);
      return;
    }

    for (const contractKey in compiled.contracts[file]) {
      const contractData = compiled.contracts[file][contractKey];

      const abi = contractData.abi;
      const bytecode = contractData.evm.bytecode.object;

      fs.writeFileSync(
        path.join(buildPath, `${contractKey}.abi.json`),
        JSON.stringify(abi, null, 2)
      );
      fs.writeFileSync(
        path.join(buildPath, `${contractKey}.bytecode.txt`),
        bytecode
      );

      console.log(`✅ Compilation successful for ${contractKey}`);
      console.log(
        `ABI saved at: ${path.join(buildPath, `${contractKey}.abi.json`)}`
      );
      console.log(
        `Bytecode saved at: ${path.join(
          buildPath,
          `${contractKey}.bytecode.txt`
        )}`
      );
    }
  });
}

