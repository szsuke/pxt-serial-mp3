//% color=#5C81A6 icon="\uf001" block="Serial MP3"
namespace SerialMP3 {
    let inited = false
    let _tx: SerialPin = SerialPin.P1
    let _rx: SerialPin = SerialPin.P2
    let _baud: BaudRate = BaudRate.BaudRate9600

    function ensureInit() {
        if (!inited) {
            serial.redirect(_tx, _rx, _baud)
            serial.setTxBufferSize(32)
            serial.setRxBufferSize(8)
            inited = true
        }
    }

    function send(cmd: number, params: number[] = []) {
        ensureInit()
        // LEN = 自分自身(1) + CMD(1) + PARAMS 個数
        const len = 2 + params.length
        const arr: number[] = [0x7E, len, cmd, ...params, 0x7E]
        const buf = pins.createBufferFromArray(arr)
        serial.writeBuffer(buf)
    }

    //% block="MP3 初期化 TX %tx RX %rx 速度 %baud"
    //% tx.defl=SerialPin.P1 rx.defl=SerialPin.P2 baud.defl=BaudRate.BaudRate9600
    export function init(tx: SerialPin, rx: SerialPin, baud: BaudRate) {
        _tx = tx
        _rx = rx
        _baud = baud
        inited = false
        ensureInit()
    }

    //% block="MP3 一時停止/再開"
    export function pauseResume() { send(0xA3) }

    //% block="MP3 停止"
    export function stop() { send(0xA4) }

    //% block="MP3 次の曲"
    export function next() { send(0xA5) }

    //% block="MP3 前の曲"
    export function prev() { send(0xA6) }

    //% block="MP3 音量を %level にする (0–31)"
    //% level.min=0 level.max=31 level.defl=20
    export function setVolume(level: number) {
        if (level < 0) level = 0
        if (level > 31) level = 31
        send(0xA7, [level]) // 例: 7E 03 A7 14 7E
    }

    export enum PlayMode {
        //% block="単曲"
        One = 0,
        //% block="単曲リピート"
        OneRepeat = 1,
        //% block="全曲リピート"
        AllRepeat = 2,
        //% block="ランダム"
        Random = 3
    }

    //% block="MP3 再生モードを %mode にする"
    export function setPlayMode(mode: PlayMode) {
        send(0xA9, [mode])
    }

    //% block="MP3 曲番号 %index を再生 (SD通し番号)"
    //% index.min=1 index.max=65535 index.defl=1
    export function playByIndex(index: number) {
        if (index < 1) index = 1
        if (index > 65535) index = 65535
        const hi = (index >> 8) & 0xFF
        const lo = index & 0xFF
        send(0xA0, [hi, lo]) // 例: 7E 04 A0 00 01 7E
    }
}
