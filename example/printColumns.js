/**
 *
 * @author vidy[Of2732号]
 * company qianmi.com
 * Date 2018-05-09
 *
 */

const qmEscpos = require('../bin').default;

(async () => {
    const escPos = qmEscpos.create();
    console.log(escPos.getDeviceInfo());
    process.exit(1);
    escPos.setConnectedListener((device => {
        console.log('atttttttttttttach',device);
    }));
    escPos.setDetachListener((device => {
        console.log('dddddddddddatttttttttttttach',device);
    }));
    await escPos.printColumnsText(['商品', '单价', '数量', '小记'],[20,5,5,5], [0,0,0,0]);
    // await escPos.printColumnsText(['可口可乐可口可乐可口可乐可口可乐可口可乐可口可乐可口可乐可口可乐可口可乐可口可乐可口可乐可口可乐可口可乐可口可乐可口可乐可口可乐可口可乐可口可乐', '2.5', '4', '10'],[20,5,5,5], [0,0,0,0]);
    await escPos.printColumnsText(['可口可乐', '2.5', '4', '10'],[20,5,5,5], [0,0,0,0]);
    await escPos.printColumnsText(['可口可乐', '2.5', '4', '10'],[20,5,5,5], [0,0,0,0]);
    await escPos.cut();
    await escPos.close();
    // process.exit(0);
})();
console.log(qmEscpos);