const { initWallet, existPrivateKey, getPublicFromWallet, getBalance, getTransactionHistoryOfWallet } = require("../blockchain/BlockchainUtils");

function getWalletPage(req, res){
    try{
        const address = req.cookies.address;
        const transactionHistory = getTransactionHistoryOfWallet(address);
        console.log(transactionHistory);
        res.render('wallet', {transactionHistory});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error: "Server error, try again"});
    }

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

function getBalanceWallet(req, res){
    try{
        const address = req.query.address;
        const balance = getBalance(address);
        res.status(200).json({balance});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error: "Server error"});
    }
}

function login(req, res){
    try{
        const privateKey = req.body.privateKey;
        console.log("private: ", privateKey);
    
        if(!existPrivateKey(privateKey)){
            res.status(400).json({error: "Invalid Private Key."});
            return;
        }
    
        const address = getPublicFromWallet(privateKey);
        res.status(200).json({ privateKey, address });
    }
    catch(error){
        console.log(error);
        res.status(500).json({error: "Internal Server Error, Try Again!"});
    }
}

module.exports = {
    getWalletPage,
    createNewWallet,
    login,
    getBalanceWallet,
}