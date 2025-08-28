# pxt-serial-mp3

Grove MP3 v2.0 (KT403A) を micro\:bit から **UART(シリアル)** で制御する MakeCode 拡張です。SDカード上の MP3 を再生・停止・音量調整などができます。

---

## インストール

MakeCode の **拡張機能を追加** で、このリポジトリの URL を指定します：

```
https://github.com/szsuke/pxt-serial-mp3
```

> リポジトリ名と `pxt.json` の `name` は `pxt-serial-mp3`、バージョンは `0.0.11`。

---

## 配線

* Groveシールド for micro\:bit を使う場合：UART ポートへ接続。
* 直接配線の場合：

  * micro\:bit **TX →** MP3モジュール **TX**
  * micro\:bit **RX →** MP3モジュール **RX**
  * **5V** と **GND** を接続（Groveケーブル推奨）

### 補足

本来 UART は「TX ↔ RX」をクロス接続する必要がありますが、この拡張ライブラリ内部でピン指定を反転処理しています。そのため、**子どもたちは「TXはTX」「RXはRX」と同じ名前同士をつなげば正しく動作**します。教材としても説明しやすくなるように設計しています。

既定ボーレートは **9600 bps**。

---

## SDカードのレイアウト（推奨）

KT403A は複数の再生指定方式を持ちます。安定動作用に次のいずれかを推奨します。

1. **フォルダ＋トラック指定**

   * フォルダ名：`01`〜`99`
   * ファイル名：`001***.mp3` など（頭3桁が番号）
   * 例：`01/001hello.mp3` → `playInFolder(1, 1)`

2. **MP3 フォルダ指定**

   * フォルダ名：`MP3`
   * ファイル名：`0001.mp3`, `0002.mp3`, ...
   * 例：`MP3/0001.mp3` → `playMP3(1)`

> `playIndex(n)` は SD の格納順（FAT の並び）に依存するため、ピンポイント再生には (1)(2) を推奨。

---

## 使い方（サンプル）

ブロック版：

```blocks
// 初期化（TX=P1, RX=P0, 9600bps）
groveMp3.init(SerialPin.P1, SerialPin.P0, BaudRate.BaudRate9600)

// 音量を20に設定
groveMp3.setVolume(20)

// ボタンAで MP3/0001.mp3 を再生
input.onButtonPressed(Button.A, function () {
    groveMp3.playMP3(1)
})

// ボタンBで停止
input.onButtonPressed(Button.B, function () {
    groveMp3.stop()
})
```

TypeScript 版：

```ts
// 初期化
groveMp3.init(SerialPin.P1, SerialPin.P0, BaudRate.BaudRate9600)

// フォルダ01の001を再生
groveMp3.playInFolder(1, 1)

// 音量を15
groveMp3.setVolume(15)

// 一時停止 → 再開
groveMp3.pause()
basic.pause(500)
groveMp3.resume()
```

---

## 提供ブロック / API

* `init(TX, RX, BaudRate)` : 初期化（UARTピンと速度の設定）
* `setVolume(vol)` : 音量設定（0〜30）
* `playIndex(n)` : インデックス指定で再生（SD格納順に依存）
* `playMP3(n)` : `MP3/000n.mp3` の **n** を再生
* `playInFolder(folder, track)` : `01/001***.mp3` のように **フォルダ番号＋曲番号** で再生
* `stop()` / `pause()` / `resume()` / `next()` / `prev()` : 基本操作
* `setEQ(mode)` : イコライザ（0\:Normal〜5\:Bass）

---

## よくあるハマりポイント

* **無音**：TX/RX の入れ違い、5V 未供給、ボーレート未設定、SD のフォーマット/ファイル名不一致。
* **曲番号のズレ**：`playIndex()` は並び順依存。確実再生は `playMP3()` か `playInFolder()`。
* **SD 認識不良**：FAT32（クイック）で再フォーマット、ファイル名は半角英数字・拡張子 `.mp3`。

---

## ライセンス

MIT License
