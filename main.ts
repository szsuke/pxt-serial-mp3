//% color=#5C81A6 icon="\uf001" block="Serial MP3"
namespace SerialMP3 {
    let inited = false
    let _tx: SerialPin = SerialPin.P1
    let _rx: SerialPin = SerialPin.P2
    let _baud: BaudRate = BaudRate.BaudRate9600
    let _paused = false

    function ensureInit() {
        if (!inited) {
            serial.redirect(_tx, _rx, _baud)
            serial.setTxBufferSize(32)
            serial.setRxBufferSize(32)
            basic.pause(200)
            // デバイス選択: microSD (CMD=0x09, DL=0x02)
            {
                const b = pins.createBuffer(8)
                b[0]=0x7E; b[1]=0xFF; b[2]=0x06; b[3]=0x09; b[4]=0x00; b[5]=0x00; b[6]=0x02; b[7]=0xEF
                serial.writeBuffer(b)
            }
            basic.pause(200)
            inited = true
        }
    }

    function send2(cmd: number, dh: number, dl: number) {
        ensureInit()
        const buf = pins.createBuffer(8)
        buf[0]=0x7E; buf[1]=0xFF; buf[2]=0x06
        buf[3]=cmd & 0xFF
        buf[4]=0x00 // no feedback
        buf[5]=dh & 0xFF
        buf[6]=dl & 0xFF
        buf[7]=0xEF
        serial.writeBuffer(buf)
    }
    function send0(cmd: number) { send2(cmd, 0, 0) }

    //% block="MP3 初期化 TX %tx RX %rx 速度 %baud"
    //% tx.defl=SerialPin.P1 rx.defl=SerialPin.P2 baud.defl=BaudRate.BaudRate9600
    export function init(tx: SerialPin, rx: SerialPin, baud: BaudRate) {
        _tx = tx; _rx = rx; _baud = baud
        inited = false
        ensureInit()
    }

    // 仕様上トグルは無いので簡易トグルを実装
    //% block="MP3 一時停止/再開"
    export function pauseResume() {
        _paused = !_paused
        send0(_paused ? 0x0E : 0x0D) // 0x0E=pause, 0x0D=play
    }

    //% block="MP3 停止"
    export function stop() { send0(0x16) }

    //% block="MP3 次の曲"
    export function next() { send0(0x01) }

    //% block="MP3 前の曲"
    export function prev() { send0(0x02) }

    //% block="MP3 音量を %level にする (0–31)"
    //% level.min=0 level.max=31 level.defl=20
    export function setVolume(level: number) {
        if (level < 0) level = 0
        if (level > 31) level = 31
        send2(0x06, 0x00, level) // CMD=0x06 指定音量
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
        switch (mode) {
            case PlayMode.One:        send2(0x11, 0x00, 0x00); break // loop all off
            case PlayMode.OneRepeat:  send2(0x19, 0x00, 0x00); break // repeat current
            case PlayMode.AllRepeat:  send2(0x11, 0x00, 0x01); break // loop all on
            case PlayMode.Random:     send2(0x28, 0x00, 0x00); break // shuffle
        }
    }

    //% block="MP3 曲番号 %index を再生 (通し番号)"
    //% index.min=1 index.max=2999 index.defl=1
    export function playByIndex(index: number) {
        if (index < 1) index = 1
        if (index > 2999) index = 2999
        const hi = (index >> 8) & 0xFF
        const lo = index & 0xFF
        send2(0x03, hi, lo) // CMD=0x03 指定番号再生
    }
}
