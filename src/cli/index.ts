import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { screenshotsCommand } from "../commands/screenshots.command";

export function runCli() {
  yargs(hideBin(process.argv))
    .command(screenshotsCommand)
    .demandCommand()
    .help()
    .parse();
}
