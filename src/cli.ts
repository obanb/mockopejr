import { Command } from 'commander';
import { colourfulUnicorn } from './utils/colourfulUnicorn.js';
import { json } from './core/json.js';
import { ChartType } from './core/types.js';

const program = new Command();

program.name('Logr CLI').description('Logr CLI').version('0.0.1');

program
  .hook('preAction', (_, actionCommand) => {
    console.log(`running command: ${actionCommand.name().toUpperCase()}`);
    console.log('args: %O', actionCommand.args);
    console.log('options: %o', actionCommand.opts());
  })
  .hook('postAction', (_, actionCommand) => {
    console.log(`command ${actionCommand.name().toUpperCase()} executed`);
  });

program
  .command('run')
  .description(
    'The command starts running the active call of the selected chart.',
  )
  .option(
    '--t, --type <string>',
    'template type (http, graphql)',
    'http',
  )
  .action(
    async(
      options: {
        type?: ChartType;
      },
    ) => {

      try {


        await json.template(options.type)
      } catch (error) {
        console.log(JSON.stringify(error, null, 2))
        colourfulUnicorn.error(`Error making HTTP POST request: ${error.response.data}`);
      }
    },
  );



program.parse();

