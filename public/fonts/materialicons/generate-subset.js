const fs = require('fs');
const { execFile } = require('child_process');

const codepointPath = __dirname + '/v99/MaterialIcons-Regular.codepoints';
const fontPath = __dirname + '/v99/MaterialIcons-Regular.ttf';
const davrosIconsPath = __dirname + '/v99/davros.codepoints';
const outputFontPath = __dirname + '/v99/MaterialIcons-Regular.subset.woff2';

const davrosIcons = fs
  .readFileSync(davrosIconsPath)
  .toString()
  .split('\n')
  .filter((line) => line.length);

console.log('Davros icons in use:');
console.log(davrosIcons);

const codepoints = fs
  .readFileSync(codepointPath)
  .toString()
  .split('\n')
  .filter((line) => line.length);

const codepointLookup = {};

for (let line of codepoints) {
  const [icon, codepoint] = line.split(' ');
  codepointLookup[icon] = codepoint;
}

const neededCodepoints = davrosIcons.map((icon) => codepointLookup[icon]);

const unicodes = ['5f-7a', '30-39', ...neededCodepoints].join(',');

const commandArgs = [
  'subset',
  fontPath,
  `--unicodes=${unicodes}`,
  '--no-layout-closure',
  `--output-file=${outputFontPath}`,
  '--flavor=woff2',
];

console.log();
console.log('Command:');
console.log('fonttools ' + commandArgs.join(' '));

execFile('fonttools', commandArgs, (err, output) => {
  if (err) {
    console.error(err);
  } else {
    console.log(output);
  }
});
