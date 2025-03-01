import chalk from "chalk";
import { Interaction, TestContractCompile } from "./TestCompile";

export async function Test() {
  try {
    await TestContractCompile();
    await Interaction();
  } catch (error) {
    console.error(chalk.red("Unexpected error occurred:"), error);
    process.exit(1);
  }
}
