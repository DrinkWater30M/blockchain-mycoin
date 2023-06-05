class TxOut{
    constructor(address, amount){
        this.address = address;
        this.amount = amount;
    }
}

class TxIn{
    constructor(txOutId, txOutIndex, signature){
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
        this.signature = signature;
    }
}

class Transaction{
    constructor(id, txIns, txOuts){
        this.id = id;
        this.txIns = txIns;
        this.txOuts = txOuts;
    }
}

class UnspentTxOut{
    constructor(txOutId, txOutIndex, address, amount){
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
        this.address = address;
        this.amount = amount;
    }
}

module.exports = {
    TxOut,
    TxIn,
    Transaction,
    UnspentTxOut
};