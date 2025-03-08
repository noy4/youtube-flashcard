#!/usr/bin/env node
import { Command } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
);

const program = new Command();

program
  .name('youtube-flashcard')
  .description('YouTubeの字幕からフラッシュカードを生成')
  .version(packageJson.version);

program
  .command('convert')
  .description('YouTubeの動画URLからフラッシュカードを生成')
  .argument('<url>', 'YouTube動画のURL')
  .option('-o, --output <path>', '出力ファイルパス', 'flashcards.md')
  .option('-l, --language <code>', '字幕の言語コード', 'ja')
  .action(async (url, options) => {
    try {
      console.log('URL:', url);
      console.log('出力パス:', options.output);
      console.log('言語:', options.language);
      // TODO: 字幕の取得と変換処理を実装
    } catch (error) {
      console.error('エラーが発生しました:', error);
      process.exit(1);
    }
  });

program.parse();