import { program } from "commander";
import initCommand from "./init.js"; 
import CompileSolc from "./compile.js";

program.addCommand(initCommand); 
program.addCommand(CompileSolc); 

export default program;
