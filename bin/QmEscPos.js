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
        return 'CT';
    };
    class QmEscPos {
        constructor() {
            this.isOpen = false;
            this.PAGE_ROW_SIZE = 28;
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
                printer.style('b').text(opts.content);
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
                    return prev + next + '\n';
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
            this.align = (alignType) => {
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
            const { defaultOpts } = QmEscPos;
            this.device = new escpos.USB();
            this.printer = new escpos.Printer(this.device, defaultOpts);
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
