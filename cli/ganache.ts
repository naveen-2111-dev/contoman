import { Command } from "commander";
import GanacheServer from "../src/GanacheServer";

const Ganache = new Command("start-conto")
  .description("start your local blockchain instance")
  .action(() => {
    GanacheServer();
  });

export default Ganache;
