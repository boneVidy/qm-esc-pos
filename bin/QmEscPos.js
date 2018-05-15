var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "escpos", "./core"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // @ts-ignore
    const escpos = __importStar(require("escpos"));
    const core_1 = require("./core");
    const getAlignType = (align) => {
        switch (align) {
            case 2:
            case '2':
            case 'right':
                return 'RT';
            case 0:
            case '0':
            case 'left':
                return 'LT';
            case 1:
            case '1':
            case 'center':
                return 'CT';
        }
        return 'LT';
    };
    const noop = (device) => { };
    class QmEscPos {
        constructor() {
            this.isOpen = false;
            this.PAGE_ROW_SIZE = 28;
            this.detachHandler = noop;
            this.connectedHandler = noop;
            this.open = () => {
                if (this.isOpen) {
                    return Promise.resolve();
                }
                return new Promise((resolve, reject) => {
                    this.device.open((err) => {
                        if (err) {
                            return reject(err);
                        }
                        this.isOpen = true;
                        resolve();
                    });
                });
            };
            this.print = async (opts) => {
                try {
                    await this.open();
                }
                catch (e) {
                    throw e;
                }
                const { printer } = this;
                const { align, fontSize } = opts;
                if (align) {
                    this.align(align);
                }
                if (fontSize) {
                    switch (fontSize) {
                        case 1:
                        case 'small':
                            this.size(1, 1);
                            break;
                        case 2:
                        case 'middle':
                            this.size(2, 2);
                            break;
                        case 'big':
                        case 3:
                            this.size(3, 3);
                            break;
                        default:
                            break;
                    }
                }
                printer.style('NORMAL').text(opts.content);
            };
            this.printText = async (text, fontSize = 'small', align = 0) => {
                fontSize = typeof fontSize === 'number' ? fontSize : core_1.fontSize(fontSize);
                console.log(...arguments);
                return this.print({ content: text, fontSize, align });
            };
            this.printlnText = async (text, fontSize = 'small', align = 0) => {
                return this.print({
                    content: `${text}\n`,
                    align,
                    fontSize
                });
            };
            this.printColumnsText = async (texts, weights, aligns, zoom = true) => {
                const text = core_1.columnsText(texts, weights, aligns, core_1.PAGE_ROW_SIZE, zoom).reduce((prev, next) => {
                    // return prev + next + '\n' ;
                    return prev + next;
                }, '');
                return this.printText(text);
            };
            this.lineWrap = async (nums) => {
                return this.printText('\n'.repeat(nums));
            };
            this.line = async () => {
                const lineStr = ('-').repeat(this.PAGE_ROW_SIZE);
                this.printlnText(lineStr);
            };
            this.printQrCode = async (text) => {
                await this.open();
                // this.lineWrap(2);
                console.log('------ printQrCode -----', text);
                const { printer } = this;
                return new Promise((resolve, reject) => {
                    this.align('center');
                    printer.qrimage(text, (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve();
                    });
                });
            };
            this.startPrint = async () => {
                return this.open();
            };
            this.endPrint = async () => {
                this.lineWrap(5);
            };
            this.close = async () => {
                const { printer } = this;
                // printer.cut();
                printer.close();
                this.isOpen = false;
            };
            this.getDevice = () => {
                return this.device;
            };
            this.getPrinter = () => {
                return this.printer;
            };
            this.align = (alignType = 0) => {
                const { printer } = this;
                try {
                    printer.align(getAlignType(alignType));
                }
                catch (e) {
                    throw e;
                }
            };
            this.cut = (part = true, feel = 2) => {
                try {
                    this.printer.cut(part, feel);
                }
                catch (e) {
                    throw e;
                }
            };
            this.size = (width, height) => {
                try {
                    this.printer.size(width, height);
                }
                catch (e) {
                    throw e;
                }
            };
            this.setDetachListener = (handler) => {
                this.detachHandler = handler;
            };
            this.setConnectedListener = (handler) => {
                this.connectedHandler = handler;
            };
            this.getDeviceInfo = () => {
                // {
                //     "bLength": 18,
                //     "bDescriptorType": 1,
                //     "bcdUSB": 512,
                //     "bDeviceClass": 0,
                //     "bDeviceSubClass": 0,
                //     "bDeviceProtocol": 0,
                //     "bMaxPacketSize0": 64,
                //     "idVendor": 1155,
                //     "idProduct": 22304,
                //     "bcdDevice": 512,
                //     "iManufacturer": 1,
                //     "iProduct": 2,
                //     "iSerialNumber": 3,
                //     "bNumConfigurations": 1
                // }
                // console.log(this.device.device.deviceDescriptor);
                const { idVendor, idProduct, iManufacturer } = this.device.device.deviceDescriptor;
                return { idVendor, idProduct, iManufacturer };
            };
            const { defaultOpts } = QmEscPos;
            this.device = new escpos.USB();
            this.device.on('detach', (device) => {
                console.warn(`-`.repeat(50) + 'device detach' + `-`.repeat(50));
                console.log(device);
                console.warn(`-`.repeat(50) + 'device detach' + `-`.repeat(50));
                if (this.detachHandler) {
                    this.detachHandler(device);
                }
            });
            this.device.on('connect', (device) => {
                console.log(`-`.repeat(50) + 'device connected' + `-`.repeat(50));
                console.log(device);
                console.log(`-`.repeat(50) + 'device connected' + `-`.repeat(50));
                if (this.connectedHandler) {
                    this.connectedHandler(device);
                    // setImmediate(() => {
                    //     this.connectedHandler(device);
                    // });
                }
            });
            this.printer = new escpos.Printer(this.device, defaultOpts);
            console.log(this.device);
            console.log(this.printer);
        }
        static create() {
            if (!QmEscPos.instance) {
                try {
                    QmEscPos.instance = new QmEscPos();
                }
                catch (e) {
                    throw e;
                }
            }
            return QmEscPos.instance;
        }
    }
    QmEscPos.defaultOpts = { encoding: "GBK" /* default */ };
    exports.QmEscPos = QmEscPos;
});
//# sourceMappingURL=QmEscPos.js.map