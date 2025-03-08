#!/usr/bin/env node
import { Command } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, writeFileSync } from 'fs';
import { fetchSubtitles, getAvailableLanguages } from '../youtube.js';
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
  .option('-l, --language <code>', '字幕の言語コード（現在は英語"en"のみ対応）', 'en')
  .action(async (url, options) => {
    try {
      // 言語コードのチェック
      if (options.language !== 'en') {
        console.warn('注意: 現在は英語(en)の字幕のみに対応しています。指定された言語コードは無視されます。');
      }

      console.log('字幕を取得中...');
      const subtitles = await fetchSubtitles(url, 'en');

      console.log('フラッシュカードを生成中...');
      const converter = new SubtitleConverter(subtitles);
      const flashcards = converter.convert();
      const markdown = converter.toMarkdown(flashcards);

      writeFileSync(options.output, markdown, 'utf8');
      console.log(`フラッシュカードを ${options.output} に保存しました`);
      console.log('注意: 現在は英語の字幕のみに対応しています。翻訳機能は今後実装予定です。');
    } catch (error) {
      if (error instanceof Error) {
        console.error('エラーが発生しました:', error.message);
      } else {
        console.error('予期せぬエラーが発生しました');
      }
      process.exit(1);
    }
  });

program
  .command('languages')
  .description('YouTubeの動画で利用可能な字幕の言語コードを表示')
  .argument('<url>', 'YouTube動画のURL')
  .action(async (url) => {
    try {
      const languages = await getAvailableLanguages(url);
      if (languages.length > 0) {
        console.log('利用可能な言語コード:');
        languages.forEach(lang => console.log(`- ${lang}`));
        console.log('\n注意: 現在は英語(en)の字幕のみに対応しています。');
      } else {
        console.log('この動画で利用可能な字幕が見つかりませんでした。');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('エラーが発生しました:', error.message);
      } else {
        console.error('予期せぬエラーが発生しました');
      }
      process.exit(1);
    }
  });

program.parse();