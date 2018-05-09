/**
 *
 * @author vidy[Of2732号]
 * company qianmi.com
 * Date 2018-05-09
 *
 */

const qmEscpos = require('../bin').default;

(async () => {
    console.log(qmEscpos);
    const printer = qmEscpos.create();
    await printer.printColumnsText(['商品', '单价', '数量', '小记'],[20,5,5,5], [0,0,0,0]);
    await printer.printColumnsText(['可口可乐', '2.5', '4', '10'],[20,5,5,5], [0,0,0,0]);
    await printer.printColumnsText(['可口可乐', '2.5', '4', '10'],[20,5,5,5], [0,0,0,0]);
    await printer.printColumnsText(['可口可乐', '2.5', '4', '10'],[20,5,5,5], [0,0,0,0]);
    await printer.cut();
    await printer.close();
})();
console.log(qmEscpos);