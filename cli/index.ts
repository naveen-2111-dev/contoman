import { program } from "commander";
import initCommand from "./init.js";
import CompileSolc from "./compile.js";
import DeployCont from "./Deploy.js";
import Ganache from "./ganache.js";
import TestConto from "./test.js";

program.addCommand(initCommand);
program.addCommand(CompileSolc);
program.addCommand(DeployCont);
program.addCommand(Ganache);
program.addCommand(TestConto);

export default program;
