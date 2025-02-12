import { Command } from "commander";
import chalk from "chalk";

const CompileSolc = new Command("Compile")
  .description("Prints a hello message")
  .action(() => {
    console.log(chalk.green("👋 Hello from another command!"));
  });

export default CompileSolc;
