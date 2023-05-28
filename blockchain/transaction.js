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

const getTransactionId = (transaction) => {
    const txInContent = transaction.txIns.map(txIn => txIn.txOutId + txIn.txOutIndex).reduce((a,b) => a + b, '');

    const txOutContent = transaction.txOuts.map(txOut => txOut.address + txOut.amount).reduce((a,b) => a + b, '');

    return CryptoJS.SHA256(txInContent + txOutContent).toString();
}

const signTxIn = (transaction, txInIndex, privateKey, aUnspentTxOuts) => {
    const txIn = transaction.txIns[txInIndex];
    
    const dataToSign = transaction.id;
    const referenceUnspentTxOut = findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts);

    if(referenceUnspentTxOut == null){
        console.log('Could not find referenced txOut');
        throw Error();
    }
    const referencedAddress = referenceUnspentTxOut.address;

    if(getPublicKey(privateKey) !== referencedAddress){
        console.log('Not match the address that is referenced in txIn');
        throw Error();
    }

    const key = ec.keyFromPrivate(privateKey, 'hex');
    const signature = toHexString(key.sign(dataToSign).toDER());
    
    return signature;
}

module.exports = {
    TxOut,
    TxIn,
    Transaction,
    getTransactionId,
};