import { program } from "commander";
import initCommand from "./init.js";
import CompileSolc from "./compile.js";
import DeployCont from "./Deploy.js";
import Ganache from "./ganache.js";

program.addCommand(initCommand);
program.addCommand(CompileSolc);
program.addCommand(DeployCont);
program.addCommand(Ganache);

export default program;
