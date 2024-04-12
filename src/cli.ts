import { Command } from 'commander';
import { colourfulUnicorn } from './utils/colourfulUnicorn.js';
import { json } from './core/json.js';
import { ChartType } from './core/types.js';

const program = new Command();

program.name('Mockopejr CLI').description('Mockopejr CLI').version('0.0.1');

program
  .hook('preAction', (_, actionCommand) => {
    colourfulUnicorn.info(`running command: ${actionCommand.name().toUpperCase()}, options: ${JSON.stringify(actionCommand.opts())}`);
  })
  .hook('postAction', (_, actionCommand) => {
    colourfulUnicorn.info(`command ${actionCommand.name().toUpperCase()} executed`);
  });

program
  .command('template')
  .description(
    'The command creates a new JSON file with a template based on the ChartType.',
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
        colourfulUnicorn.error(`Error while creating template: ${JSON.stringify(error)}`);
      }
    },
  );

program.parse();

