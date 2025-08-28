//% color=#2db2ff icon="\uf001" block="Grove MP3 (KT403A)"
namespace groveMp3 {
    let inited = false

    // 内部: コマンド送信 (8バイト固定)
    function send(cmd: number, param: number) {
        const buf = pins.createBuffer(8)
        buf.setNumber(NumberFormat.UInt8LE, 0, 0x7E)
        buf.setNumber(NumberFormat.UInt8LE, 1, 0xFF)
        buf.setNumber(NumberFormat.UInt8LE, 2, 0x06) // length=6 固定
        buf.setNumber(NumberFormat.UInt8LE, 3, cmd & 0xFF)
        buf.setNumber(NumberFormat.UInt8LE, 4, 0x00) // no feedback
        buf.setNumber(NumberFormat.UInt8LE, 5, (param >> 8) & 0xFF) // high
        buf.setNumber(NumberFormat.UInt8LE, 6, param & 0xFF)        // low
        buf.setNumber(NumberFormat.UInt8LE, 7, 0xEF)
        serial.writeBuffer(buf)
        basic.pause(20)
    }

    /**
     * 初期化（TX/RX/ボーレート）
     * @param tx 送信ピン
     * @param rx 受信ピン
     */
    //% blockId=kt403a_init block="KT403A を初期化 TX %tx RX %rx | 速度 %baud"
    //% tx.defl=SerialPin.P1 rx.defl=SerialPin.P0 baud.defl=BaudRate.BaudRate9600
    export function init(tx: SerialPin, rx: SerialPin, baud: BaudRate) {
        serial.redirect(tx, rx, baud)
        inited = true
        basic.pause(100)
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
        send(0x06, vol) // Set Volume
    }

    /**
     * インデックスで再生（SD順序依存）
     */
    //% blockId=kt403a_play_index block="曲番号 %index を再生"
    //% index.min=1 index.defl=1
    export function playIndex(index: number) {
        if (!inited) return
        send(0x03, index) // Play by index
    }

    /**
     * MP3フォルダの index を再生 (MP3/0001.mp3 など)
     */
    //% blockId=kt403a_play_mp3 block="MP3フォルダの %index を再生"
    //% index.min=1 index.defl=1
    export function playMP3(index: number) {
        if (!inited) return
        send(0x12, index) // Play MP3 folder index
    }

    /**
     * フォルダ番号と曲番号で再生 (例: 01/001***.mp3)
     */
    //% blockId=kt403a_play_folder block="フォルダ %folder の 曲 %index を再生"
    //% folder.min=1 folder.max=99 folder.defl=1
    //% index.min=1 index.max=255 index.defl=1
    export function playInFolder(folder: number, index: number) {
        if (!inited) return
        const param = ((folder & 0xFF) << 8) | (index & 0xFF)
        send(0x0F, param) // Play directory + file index
    }

    // 基本操作
    //% block="停止する"
    export function stop() { if (inited) send(0x16, 0) }  // Stop
    //% block="一時停止"
    export function pause() { if (inited) send(0x0E, 0) } // Pause
    //% block="再開"
    export function resume() { if (inited) send(0x0D, 0) } // Resume
    //% block="次の曲"
    export function next() { if (inited) send(0x01, 0) }   // Next
    //% block="前の曲"
    export function prev() { if (inited) send(0x02, 0) }   // Previous

    /**
     * EQ設定 (0:Normal,1:Pop,2:Rock,3:Jazz,4:Classic,5:Bass)
     */
    //% block="EQ を %mode にする (0~5)"
    //% mode.min=0 mode.max=5 mode.defl=0
    export function setEQ(mode: number) {
        if (!inited) return
        if (mode < 0) mode = 0
        if (mode > 5) mode = 5
        send(0x07, mode)
    }
}
