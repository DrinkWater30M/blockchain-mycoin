const { initWallet, getPublicFromWallet, existPrivateKey } = require("../blockchain/BlockchainUtils");

function Test(req, res){
    initWallet();
    console.log(existPrivateKey('eca493bcbc192a4dd39ac1b1a6ce35056c55ddb7d8c284dsd29d5d3b702121d71e7'))
    res.send(getPublicFromWallet('ec210d3310f3964366e42e4225cd4ea280c872519467aaec5e20c3b8baae4e92'));
}

module.exports = {
    Test
}