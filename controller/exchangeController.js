const { getPublicFromWallet, getBalance, generateTransaction, existPublicKey } = require("../blockchain/BlockchainUtils");

function getExchangepage(req, res){
    res.render('exchange');
}

function sendCoinToAddress(req, res){
    try{
        let {privateKey, toAddress, amount} = req.body;
        amount = parseInt(amount);
        const fromAddress = getPublicFromWallet(privateKey);

        // check balance before send coin
        const balance = getBalance(fromAddress);
        if(balance < amount){
            res.status(400).json({message: "Not enough coin to send", code: 0});
            return;
        }

        // // check to address before send coin
        // if(!existPublicKey(toAddress)){
        //     res.status(400).json({message: "Invalid address", code: 1});
        //     return;
        // }

        // send coin
        generateTransaction(privateKey, fromAddress, toAddress, amount);

        res.status(200).json({message: "success"});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error: "Server error, try again"});
    }
}

module.exports = {
    getExchangepage,
    sendCoinToAddress
}