import chalk from "chalk";
import { formatUnits } from "ethers";
import Ganache from "ganache";

export default async function GanacheServer() {
  const ganacheServer = Ganache.server({
    logging: { quiet: true },
    chain: { chainId: 1337 },
    wallet: { totalAccounts: 10, defaultBalance: 100 },
  });

  ganacheServer.listen(8545, async () => {
    console.log(
      chalk.green.bold(
        "🚀 Ganache is running locally at: http://127.0.0.1:8545"
      )
    );

    const provider = ganacheServer.provider;
    const accounts = await provider.request({
      method: "eth_accounts",
      params: [],
    });

    const fetchBalances = async () => {
      console.clear();
      console.log(chalk.blue.bold("\nAvailable Accounts:\n"));

      for (let i = 0; i < accounts.length; i++) {
        const address = accounts[i];

        const balanceWei = await provider.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        });
        const balanceEth = formatUnits(BigInt(balanceWei), 18);

        const privateKey =
          ganacheServer.provider.getInitialAccounts()[address].secretKey;

        console.log(chalk.yellow.bold(`Account ${i + 1}:`));
        console.log(chalk.cyan(`Address: ${address}`));
        console.log(chalk.magenta(`Balance: ${balanceEth} ETH`));
        console.log(chalk.red(`Private Key: ${privateKey}\n`));
      }

      console.log(
        chalk.green.bold(
          "\n🔥 The contracts deployed to Ganache are available locally alone 🔥"
        )
      );
    };

    await fetchBalances();

    setInterval(fetchBalances, 10000);
  });
}
