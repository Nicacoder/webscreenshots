import { ArgumentsCamelCase, CommandModule } from "yargs";

type Args = {
  site: string;
};

export const screenshotsCommand: CommandModule<{}, Args> = {
  command: "$0",
  describe: "Capture screenshots of the specified website",

  builder: (yargs) =>
    yargs.option("site", {
      type: "string",
      describe: "The website URL to capture",
      demandOption: true,
    }),

  handler: async (args: ArgumentsCamelCase<Args>) => {
    console.log(`Running for site: ${args.site}`);
  },
};
