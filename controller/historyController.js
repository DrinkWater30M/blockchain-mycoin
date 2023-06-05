const { getTransactionHistory } = require("../blockchain/BlockchainUtils");

function getHistoryPage(req, res){
    try{
        const transactionHistory = getTransactionHistory();
        console.log(transactionHistory);
        res.render('history', {transactionHistory});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error: "Server error, try again"});
    }
}

module.exports = {
    getHistoryPage,
}