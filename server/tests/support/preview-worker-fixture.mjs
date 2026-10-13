import fs from 'node:fs';
const { log, delay = 50, fail, signal, inspectEnvironment } = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
if (inspectEnvironment) fs.writeFileSync(inspectEnvironment, JSON.stringify({ env: process.env, input: process.argv[2], output: process.argv[3] }));
fs.appendFileSync(log, `start ${process.pid}\n`);
setTimeout(() => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  if (fail) {
    process.stderr.write('warning '.repeat(1500) + '\nFinal renderer failure\n');
    process.exitCode = 1;
    return;
  }
  fs.appendFileSync(log, `end ${process.pid}\n`);
  fs.writeFileSync(process.argv[3], '%PDF-1.7\nfixture end');
}, delay);
