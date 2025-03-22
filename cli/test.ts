import { Command } from "commander";
import { testContract } from "../src/Test";

const Test = new Command("test")
  .description("test the contract with the config and .conto file")
  .action(() => {
    testContract();
  });

export default Test;
