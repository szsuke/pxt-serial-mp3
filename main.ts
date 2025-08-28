//% color=#2db2ff icon="\uf001" block="Grove MP3 (KT403A)"
namespace groveMp3 {
    let inited = false

    // EQのモードをenumで定義（ブロックではプルダウン表示される）
    export enum EQMode {
        //% block="Normal"
        Normal = 0,
        //% block="Pop"
        Pop = 1,
        //% block="Rock"
        Rock = 2,
        //% block="Jazz"
        Jazz = 3,
        //% block="Classic"
        Classic = 4,
        //% block="Bass"
        Bass = 5
    }

    // ★ 10Bフレーム（0x7E ... 0xEF）+ チェックサム
    function send(cmd: number, dataH: number, dataL: number) {
        const VER = 0xFF
        const LEN = 0x06
        const FB  = 0x00 // 0x01にすると応答有効
        const sum = (VER + LEN + cmd + FB + dataH + dataL) & 0xFFFF
        const chk = (0xFFFF - sum) & 0xFFFF
        const chkh = (chk >> 8) & 0xFF
        const chkl = chk & 0xFF

        const b = pins.createBuffer(10)
        b.setNumber(NumberFormat.UInt8BE, 0, 0x7E)
        b.setNumber(NumberFormat.UInt8BE, 1, VER)
        b.setNumber(NumberFormat.UInt8BE, 2, LEN)
        b.setNumber(NumberFormat.UInt8BE, 3, cmd)
        b.setNumber(NumberFormat.UInt8BE, 4, FB)
        b.setNumber(NumberFormat.UInt8BE, 5, dataH & 0xFF)
        b.setNumber(NumberFormat.UInt8BE, 6, dataL & 0xFF)
        b.setNumber(NumberFormat.UInt8BE, 7, chkh)
        b.setNumber(NumberFormat.UInt8BE, 8, chkl)
        b.setNumber(NumberFormat.UInt8BE, 9, 0xEF)
        serial.writeBuffer(b)
        basic.pause(30)
    }

    /**
     * 初期化（TX/RX/ボーレート）
     * @param tx micro:bitのTXピン
     * @param rx micro:bitのRXピン
     */
    //% blockId=kt403a_init block="KT403A を初期化 TX %tx RX %rx | 速度 %baud"
    //% tx.defl=SerialPin.P1 rx.defl=SerialPin.P0 baud.defl=BaudRate.BaudRate9600
    export function init(tx: SerialPin, rx: SerialPin, baud: BaudRate) {
        // 子ども向けに「TXはTX」「RXはRX」で接続できるよう、内部で反転処理
        serial.redirect(rx, tx, baud)
        inited = true
        basic.pause(200)
        // CMD 0x09（選択デバイス）、DataL=0x02（microSD）
        send(0x09, 0x00, 0x02)
        basic.pause(200)
    }

    /**
     * 音量を設定 (0-30)
     */
    //% blockId=kt403a_volume block="音量を %vol にする (0~30)"
    //% vol.min=0 vol.max=30 vol.defl=20
    export function setVolume(vol: number) {
        if (!inited) return
        if (vol < 0) vol = 0
        if (vol > 30) vol = 30
        send(0x06, 0x00, vol)
    }

    /**
     * インデックスで再生（SD順序依存）
     */
    //% blockId=kt403a_play_index block="曲番号 %index を再生"
    //% index.min=1 index.defl=1
    export function playIndex(index: number) {
        if (!inited) return
        const dh = (index >> 8) & 0xFF
        const dl = index & 0xFF
        send(0x03, dh, dl)
    }

    /**
     * MP3フォルダの index を再生 (MP3/0001.mp3 など)
     */
    //% blockId=kt403a_play_mp3 block="MP3フォルダの %index を再生"
    //% index.min=1 index.defl=1
    export function playMP3(index: number) {
        if (!inited) return
        const dh = (index >> 8) & 0xFF
        const dl = index & 0xFF
        send(0x12, dh, dl)
    }

    /**
     * フォルダ番号と曲番号で再生 (例: 01/001***.mp3)
     */
    //% blockId=kt403a_play_folder block="フォルダ %folder の 曲 %index を再生"
    //% folder.min=1 folder.max=99 folder.defl=1
    //% index.min=1 index.max=255 index.defl=1
    export function playInFolder(folder: number, index: number) {
        if (!inited) return
        const f = Math.max(1, Math.min(99, folder))
        const t = Math.max(1, Math.min(255, index))
        send(0x0F, f, t)
    }

    // 基本操作
    //% block="停止する"
    export function stop()    { if (inited) send(0x16, 0, 0) }
    //% block="一時停止"
    export function pause()   { if (inited) send(0x0E, 0, 0) }
    //% block="再開"
    export function resume()  { if (inited) send(0x0D, 0, 0) }
    //% block="次の曲"
    export function next()    { if (inited) send(0x01, 0, 0) }
    //% block="前の曲"
    export function prev()    { if (inited) send(0x02, 0, 0) }

    /**
     * EQ設定
     */
    //% blockId=kt403a_eq block="EQ を %mode にする"
    export function setEQ(mode: EQMode) {
        if (!inited) return
        send(0x07, 0x00, mode)
    }
}
