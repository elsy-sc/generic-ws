export class BootstrapUtil {
  static logStartupInfo(startTime: number, port: string | number, networkIP?: string, version?: string) {

    const cyan = (text: string) => `\x1b[36m${text}\x1b[0m`;
    const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
    const bold = (text: string) => `\x1b[1m${text}\x1b[0m`;
    const magenta = (text: string) => `\x1b[35m${text}\x1b[0m`;
    const gray = (text: string) => `\x1b[90m${text}\x1b[0m`;

    console.log('');
    const execTime = Date.now() - startTime;
    console.log(`  ${magenta('NESTJS')} ${green(`v${version}`)}  ${gray('ready in')} ${bold(execTime.toString())} ${gray('ms')}`);
    console.log('');
    console.log(`  ${green('➜')}  ${bold('Local:')}   ${cyan(`http://localhost:${port}/`)}`);
    if (networkIP) {
      console.log(`  ${green('➜')}  ${bold('Network:')} ${cyan(`http://${networkIP}:${port}/`)}`);
    }
    console.log('');
  }
}