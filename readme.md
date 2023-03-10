# obs-auto-fade-bgm

OBS で配信するときに、BGM をループ再生し、シーンを変えたときに自動でフェードイン/アウトしてくれるブラウザソースを提供します。
画面には設定項目が表示されるので、「対話」機能で設定項目を触ることができます。

## DEMO

> **Note**
> 気が向いたら使用例の GIF 画像を作成する

## Features

とりあえず簡単に実装できるようにつくりました。

## Requirement

-   OBS 27 over (検証は OBS 28.1.2 で行ってます。ブラウザが使えたらとりあえず動くと思う)

## Installation

1. シーンにブラウザソースを追加する
2. URL を打ち込む。 (https://dododoshirouto.github.io/obs-auto-fade-bgm/)
3. 音声を OBS に取り込む
4. ページへのアクセス権限を設定する

## Usage

1. 「対話」機能で、操作画面を開く
1. 音声ファイルを読み込む
1. BGM を鳴らすシーンを選ぶ

## Note

アドレスの後ろにクエリ文字をつけることで、チェックつけとくシーンを初期設定することができる。
`?scenes=[シーン名をコンマ区切り]`
URL の仕様上、シーン名に「#」「?」「&」を含めることはできません。
空白などは含まれていても大丈夫です。

`?fadetime=[ミリ秒数]`
フェードの時間を指定できます

`?fadein=[true|false]`
フェードインをするかどうかを指定できます

## Author

-   Author: [どどど素人](https://www.twitter.com/super_amateur_c)
-   Organization: [PACkage Inc.](https://www.twitter.com/package_2018)

## License

利用、改変は自由です。
