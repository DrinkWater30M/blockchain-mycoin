const { buyCoinFromStore, getPublicFromWallet } = require("../blockchain/BlockchainUtils");

function getStorePage(req, res){
    res.render('store');
}

function buyCoin(req, res){
    try{
        const amount = req.body.amount;
        const privateKey = req.headers.authorization;
        console.log("private key: ", privateKey);
        console.log("amount: ", amount);
        
        const address = getPublicFromWallet(privateKey);
        const isBuy = buyCoinFromStore(address, amount);

        if(!isBuy){
            res.status(400).json({error: "invalid input"});
            return;
        }

        res.status(200).json({message: "success"});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error: "server error"});
    }
}

module.exports = {
    getStorePage,
    buyCoin
}