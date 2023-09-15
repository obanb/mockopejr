import { Command } from 'commander';
import axios from 'axios/index.js';
import { CmdType } from './api/types.js';
import { colourfulUnicorn } from './utils/colourfulUnicorn.js';

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
  .option('--url, --url <string>', 'target URL')
  .action(
    async(
      chartName: string,
      options: {
        perSecond?: string;
        url?: string;
        buffer?: number;
      },
    ) => {

      try {
        const response = await axios.default.post<unknown>(
          `http://localhost:${process.env.APP_PORT}/cmd`,
          {
            type: CmdType.RUN,
            options: {
              perSec: options.perSecond,
              url: options.url,
              buffer: options.buffer,
            },
            identifier: chartName,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        );

        // Log the response if necessary
        console.log(response.data);
      } catch (error) {
        console.log(JSON.stringify(error, null, 2))
        colourfulUnicorn.error(`Error making HTTP POST request: ${error.response.data}`);
      }
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
      console.log(options);
      return new Promise(() => {
        return axios.default
          .post<unknown>(
            `localhost"${process.env.APP_PORT}/cmd`,
            { type: CmdType.KILL, identifier: chartName },
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
    },
  );

program
  .command('pause')
  .description('Pauses the active call.')
  .argument('<string>', 'chart name')
  .action((chartName: string) => {
    return new Promise(() => {
      return axios.default
        .post<unknown>(
          `localhost"${process.env.APP_PORT}/cmd`,
          { type: CmdType.PAUSE, identifier: chartName },
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
  });

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

