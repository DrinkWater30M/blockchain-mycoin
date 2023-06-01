const { initWallet, existPrivateKey } = require("../blockchain/BlockchainUtils");

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

function login(req, res){
    try{
        const privateKey = req.body.privateKey;
        console.log("private: ", privateKey);
    
        if(!existPrivateKey(privateKey)){
            res.status(400).json({error: "Invalid Private Key."});
            return;
        }
    
        res.status(200).json({message: "Success."});
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
}