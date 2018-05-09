/**
 *
 * @author vidy[Of2732号]
 * company qianmi.com
 * Date 2018-05-03
 *
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const maxOfColumnZoom = 0.8;
    exports.PAGE_ROW_SIZE = 30;
    exports.fontSize = (s) => {
        switch (s) {
            case 'small': return 1;
            case 'middle': return 2;
            case 'big': return 3;
            default: return 1;
        }
    };
    exports.sleep = (numberMillis) => {
        let now = new Date();
        let exitTime = now.getTime() + numberMillis;
        while (true) {
            now = new Date();
            if (now.getTime() > exitTime)
                return;
        }
    };
    exports.line = (charNum = 0) => ('-').repeat(charNum);
    exports.empty = (count) => ' '.repeat(count);
    exports.getLength = (str) => {
        let realLength = 0, len = str.length, charCode = -1;
        for (let i = 0; i < len; i++) {
            charCode = str.charCodeAt(i);
            if (charCode >= 0 && charCode <= 128)
                realLength += 1;
            else
                realLength += 2;
        }
        return realLength;
    };
    exports.trim = (s) => {
        if (s.trim) {
            return s.trim();
        }
        return s.replace(/(^\s*)|(\s*$)/g, "");
    };
    exports.split = (array) => {
        return array.reduce((total, cur) => {
            return total + ',' + (typeof cur === 'string' ? cur : cur.toString());
        });
    };
    exports.columnText = (text, lineMax, containCount, algin) => {
        let t = typeof 'string' === text ? text : text.toString();
        let len = exports.getLength(t) > containCount ? containCount : exports.getLength(t);
        const temp = [];
        let tLength = 0;
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            tLength += charCode >= 0 && charCode <= 128 ? 1 : 2;
            if (tLength > len)
                break;
            temp.push(charCode);
        }
        //根据权重截取字段长度
        t = String.fromCharCode(...temp);
        // t = String.fromCharCode(...temp);
        t = t.replace(/�/g, '');
        //�
        let tl = lineMax - len;
        let empty = " ";
        while (tl > 0) {
            switch (algin) {
                //靠左
                case 0:
                    t = t + empty;
                    break;
                case '0':
                    t = t + empty;
                    break;
                case 'left':
                    t = t + empty;
                    break;
                //居中
                case 1:
                    t = tl % 2 == 0 ? empty + t : t + empty;
                    break;
                case '1':
                    t = tl % 2 == 0 ? empty + t : t + empty;
                    break;
                case 'center':
                    t = tl % 2 == 0 ? empty + t : t + empty;
                    break;
                //靠右
                case 'right':
                    t = empty + t;
                    break;
                case '2':
                    t = empty + t;
                    break;
                case 2:
                    t = empty + t;
                    break;
                default: t = empty + t;
            }
            --tl;
        }
        return t;
    };
    /**
     * 打印一行多列
     * @param texts  文本
     * @param weights 每个字段权重
     * @param algins:AlginType  对其方式
     * @param pageWidth 页面可容纳的字符长度
     * @param zoom
     */
    exports.columnsText = (texts, weights, algins, pageWidth, zoom = true) => {
        // if (__DEV__])
        //     console.log('print printColumnsText---', texts);
        //生成打印
        let txtArrays = [];
        let total = weights.reduce((total, cur) => { return total + cur; });
        let maxOfRows = 1;
        texts.forEach((text, index) => {
            let content = text ? text : '';
            let columnRowLength = Math.ceil((weights[index] / total) * pageWidth);
            let algin = algins[index];
            //因为一个单元格无法容纳这么多字符串 ，将自动列换行
            let columRowArray = exports.multiText(content, columnRowLength, algin, zoom);
            let rowCounts = columRowArray.length;
            if (rowCounts >= maxOfRows)
                maxOfRows = rowCounts;
            txtArrays.push(columRowArray);
        });
        let rets = [];
        // for (let index = 0; index <= txtArrays.length; ++index) {
        txtArrays.forEach((columnRows) => {
            // let columnRows: string[] = txtArrays[i];
            //将每一列溢出的行 自动换到下一行打印
            columnRows.forEach((columnRow, i) => {
                columnRow = columnRow ? columnRow : exports.empty(Math.ceil((weights[i] / total) * pageWidth));
                if (columnRow.length == pageWidth && 0 === exports.trim(columnRow).length)
                    return;
                rets[i] = rets[i] ? rets[i] + columnRow : columnRow;
                // rets[i] = getLength(rets[i]) >= pageWidth ? rets[i].substring(0, pageWidth) : rets[i];
            });
        });
        // }
        let t = [];
        rets.forEach(row => {
            if (row.length >= pageWidth && 0 === exports.trim(row).length)
                return;
            t.push(row);
        });
        return t;
    };
    exports.multiText = (text, lineMax, algin, zoom) => {
        let array = [];
        let cl = exports.getLength(text);
        let _containCount = Math.ceil(zoom ? lineMax * maxOfColumnZoom : lineMax);
        do {
            // var l = _containCount < cl ? _containCount : cl;
            // var l = cl;
            // let str = text.substring(0, l);
            //如果是数字 不进行截取
            // let isNumber = /^[0-9]+.?[0-9]*$/.test(text);
            // let str = isNumber ? text : text.substring(0, l);
            let ct = exports.columnText(text, lineMax, _containCount, algin);
            if ('' !== ct) {
                array.push(ct);
            }
            text = text.substring(exports.trim(ct).length, cl);
            cl = exports.getLength(text);
            if (cl < _containCount) {
                array.push(exports.columnText(text, lineMax, _containCount, algin));
            }
        } while (cl >= _containCount);
        return array;
    };
});
