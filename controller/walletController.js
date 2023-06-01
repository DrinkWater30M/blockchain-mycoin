const { initWallet } = require("../blockchain/BlockchainUtils");

function getWalletPage(req, res){
    res.render('wallet');
}

function createNewWallet(req, res){
    try{
        const privateKey = initWallet();
        res.status(200).json({privateKey});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error: "Internal Server Error, Try Again!"});
    }
}

module.exports = {
    getWalletPage,
    createNewWallet
}