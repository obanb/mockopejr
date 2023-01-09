import { Command } from 'commander';
import axios from 'axios/index.js';
import { testUtils } from './testUtils.js';
import { CmdType } from './types.js';

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
  .argument('<string>', 'chart name')
  .option(
    '--ps, --perSecond <string>',
    'number of active calls per second',
    '1',
  )
  .action(
    (
      chartName: string,
      options: {
        perSecond?: string;
      },
    ) => {
      return new Promise(() => {
        return axios.default
          .post<unknown>(
            `${testUtils.config.localhost}:${8090}/cmd`,
            { type: CmdType.RUN,
              options: {
                perSec: 1,
                url: null,
                buffer: 1,
              },
              identifier: chartName},
            {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
            },
          )
          .catch((e) => {
            console.log(e);
          });
      });

      console.log('RUN');
      console.log(chartName);
      console.log(options?.perSecond);
    },
  );

program
  .command('kill')
  .description('Kill command to execute the active call of a running chart.')
  .argument('<string>', 'chart name')
  .option('--all, --all', 'kills all running charts')
  .option('--h, --hard', 'also deletes the record of an existing chart')
  .action(
    (
      chartName: string,
      options: {
        hard?: string;
      },
    ) => {
      console.log('KILL');
      console.log(chartName);
      console.log(options.hard);
    },
  );

program
  .command('reload')
  .description('Reloads all existing json charts into program memory.')
  .option('--h, --hard', 'also deletes the record of an existing chart')
  .action(() => {
    console.log('RELOAD');
  });

program
  .command('show')
  .description('Displays a list of all JSON charts.')
  .action(() => {
    console.log('show');
  });

program.parse();
