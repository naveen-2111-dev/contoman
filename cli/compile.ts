import { Command } from "commander";
import { CompileContracts } from "../src/Compile";

const CompileSolc = new Command("compile")
  .description("compiles code with the given project name")
  .action(() => {
    CompileContracts();
  });

export default CompileSolc;
