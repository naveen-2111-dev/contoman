import { Command } from "commander";
import GanacheServer from "../main/GanacheServer";

const Ganache = new Command("start-ganache")
  .description("start your local blockchain instance")
  .action(() => {
    GanacheServer();
  });

export default Ganache;
