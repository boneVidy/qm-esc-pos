(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./QmEscPos"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const QmEscPos_1 = require("./QmEscPos");
    exports.default = QmEscPos_1.QmEscPos;
});
//# sourceMappingURL=index.js.map