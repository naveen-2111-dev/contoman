import { Command } from "commander";
import Deploy from "../main/deploy";

const DeployCont = new Command("deploy")
  .description("deploy the contract wih the given rpc")
  .action(() => {
    Deploy();
  });

export default DeployCont;
