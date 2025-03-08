#!/usr/bin/env node
import { Command } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync } from 'fs';
import { fetchSubtitles } from '../youtube.js';
import { SubtitleConverter } from '../converter.js';

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
      console.log('字幕を取得中...');
      const subtitles = await fetchSubtitles(url, options.language);

      console.log('フラッシュカードを生成中...');
      const converter = new SubtitleConverter(subtitles);
      const flashcards = converter.convert();
      const markdown = converter.toMarkdown(flashcards);

      writeFileSync(options.output, markdown, 'utf8');
      console.log(`フラッシュカードを ${options.output} に保存しました`);
    } catch (error) {
      console.error('エラーが発生しました:', error);
      process.exit(1);
    }
  });

program.parse();