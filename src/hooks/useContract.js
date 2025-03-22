import { Instance } from "./useInstance";

export default async function contract(functionName, ...args) {
  if (!functionName) {
    console.error("Function name is empty");
    process.exit(1);
  }

  const contractInstance = await Instance();

  if (!contractInstance) {
    console.error("Contract instance is not initialized.");
    return;
  }

  if (typeof contractInstance[functionName] !== "function") {
    console.error(`Function "${functionName}" is not found in the contract.`);
    return;
  }

  try {
    console.log(`Calling function: ${functionName} with args:`, args);
    const result = await contractInstance[functionName](...args);

    if (result && result.wait) {
      console.log("Transaction sent, waiting for confirmation...");
      await result.wait();
      console.log("Transaction confirmed.");
    }

    return result;
  } catch (error) {
    console.error(`Error calling contract function "${functionName}":`, error);
  }
}
