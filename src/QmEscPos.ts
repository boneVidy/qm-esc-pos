// @ts-ignore
import * as escpos from "escpos";
import * as usb from 'usb';
import {AlginType, fontSize as fs, FontSize, PAGE_ROW_SIZE, columnsText} from "./core";

export type PrintOpts = {
    align?: AlginType;
    content: string;
    fontSize?: FontSize;
}
type QmEscPosAlignType = 'CT' | 'LT' | 'RT';
const getAlignType = (align: AlginType): QmEscPosAlignType => {
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

const noop = (device: usb.Device) => {};
export type DeviceConnectedHandler = (device?: usb.Device) => void;
export type DeviceDetachHandler = (device?: usb.Device) => void;
export class QmEscPos {
    private static defaultOpts = {encoding: "GBK" /* default */};
    private printer: any;
    private device: any;
    private isOpen = false;
    private readonly PAGE_ROW_SIZE = 28;
    private static instance: QmEscPos;
    private detachHandler  = noop;
    private connectedHandler = noop;
    public static create() {
        if (!QmEscPos.instance) {
            try {
                QmEscPos.instance = new QmEscPos();
            } catch (e) {
                throw e;
            }
        }
        return QmEscPos.instance;
    }

    private constructor() {
        const {defaultOpts} = QmEscPos;
        this.device = new escpos.USB();
        this.device.on('detach', (device: usb.Device) => {
            console.warn(`-`.repeat(50) + 'device detach' + `-`.repeat(50));
            console.log(device);
            console.warn(`-`.repeat(50) + 'device detach' + `-`.repeat(50));
            if (this.detachHandler) {
                this.detachHandler(device);
            }
        });
        this.device.on('connect', (device: usb.Device) => {
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

    private open = () => {
        if (this.isOpen) {
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            this.device.open((err: any) => {
                if (err) {
                    return reject(err);
                }
                this.isOpen = true;
                resolve();
            })
        });
    };
    public print = async (opts: PrintOpts) => {

        try {
            await this.open();
        } catch (e) {
            throw e;
        }
        const {printer} = this;
        const {align, fontSize} = opts;
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

    public printText = async (text: string, fontSize: FontSize = 'small', align: AlginType = 0) => {
        fontSize = typeof fontSize === 'number' ? fontSize : fs(fontSize);
        console.log(...arguments);
        return this.print({content: text, fontSize, align});
    };

    public printlnText = async (text: String, fontSize: FontSize = 'small', align: AlginType = 0) => {
        return this.print({
            content: `${text}\n`,
            align,
            fontSize
        })
    };

    public printColumnsText = async (texts: Array<string>, weights: Array<number>, aligns: Array<AlginType>, zoom = true) => {
        const text = columnsText(texts, weights, aligns, PAGE_ROW_SIZE, zoom).reduce((prev, next) => {
            // return prev + next + '\n' ;
            return prev + next;
        }, '');
        return this.printText(text);
    };

    public lineWrap = async (nums: number) => {
        return this.printText('\n'.repeat(nums));
    };
    public line = async () => {
        const lineStr = ('-').repeat(this.PAGE_ROW_SIZE);
        this.printlnText(lineStr);
    };

    public printQrCode = async (text: string) => {
        await this.open();
        // this.lineWrap(2);
        console.log('------ printQrCode -----', text);
        const {printer} = this;
        return new Promise((resolve, reject) => {
            this.align('center');
            printer.qrimage(text, (err: any) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            })
        });
    };

    public startPrint = async () => {
        return this.open();
    };

    public endPrint = async () => {
        this.lineWrap(5);

    };

    public close = async () => {
        const {printer} = this;
        // printer.cut();
        printer.close();
        this.isOpen = false;
    };


    public getDevice = () => {
        return this.device;
    };

    public getPrinter = () => {
        return this.printer;
    };


    private align = (alignType: AlginType = 0) => {
        const {printer} = this;
        try {
            printer.align(getAlignType(alignType));
        } catch (e) {
            throw e;
        }
    };

    public cut = (part = true, feel = 2) => {
        try {
            this.printer.cut(part, feel);
        } catch (e) {
            throw e;
        }
    };


    public size = (width: number, height: number) => {
        try {
            this.printer.size(width, height);
        } catch (e) {
            throw e;
        }
    };


    public setDetachListener  = (handler: DeviceDetachHandler) => {
        this.detachHandler = handler;
    };

    public setConnectedListener = (handler: DeviceConnectedHandler) => {
        this.connectedHandler = handler;
    };

    public getDeviceInfo = () => {
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
        const {idVendor, idProduct, iManufacturer} = this.device.device.deviceDescriptor;
        return {idVendor, idProduct, iManufacturer};
    }


}