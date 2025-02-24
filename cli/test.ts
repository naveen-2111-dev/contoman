import { Command } from "commander";
import { Test } from "../src/Test/test";

const TestConto = new Command("test")
  .description("test your contract just by running contoman test")
  .action(() => {
    Test();
  });

export default TestConto;
