const CryptoJS = require('crypto-js');
const Block = require('./block');
var EC = require('elliptic').ec;
var ec = new EC('secp256k1');
const fs = require("fs");
const { privateEncrypt } = require('crypto');

class BlockchainUtils{
    claculateHash = (index, previousHash, timestamp, data) => {
        return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
    }

    getLatestBlock = (blockchain) => {
        const latestBlock = blockchain[blockchain.length - 1];
        return latestBlock;
    }

    generateNextBlock = (blockData, blockchain) => {
        const previousBlock = this.getLatestBlock(blockchain);
        const nextIndex = previousBlock.index + 1;
        const nextTimestamp = new Date().getTime()/1000;
        const nextHash = this.claculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
        return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash);
    }

    getGenesisBlock = () => {
        const timestamp = new Date().getTime()/1000;
        const data = process.env.GENESIS_DATA;
        const hash = this.claculateHash(0, "", timestamp, data);
        return new Block(0, "", timestamp, data, hash);
    }

    isValidNewBlock = (newBlock, previousBlock) => {
        if(previousBlock.index + 1 !== newBlock.index){
            console.log('invalid index');
            return false;
        }
        else if(previousBlock.hash !== newBlock.previousHash){
            console.log('invalid previous hash');
            return false;
        }
        else if(this.claculateHash(newBlock.index, newBlock.previousHash, newBlock.timestamp, newBlock.data) !== newBlock.hash){
            console.log('invalid hash');
            return false;
        }

        return true;
    }

    isValidChain = (blockchainToValidate) => {
        if(JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(this.getGenesisBlock())){
            return false;
        }

        var tempBlocks = [blockchainToValidate[0]];
        for(let i = 1; i < blockchainToValidate.length; i++){
            if(this.isValidNewBlock(blockchainToValidate[i], tempBlocks[i-1])){
                tempBlocks.push(blockchainToValidate[i]);
            }
            else{
                return false;
            }
        }

        return true;
    }

    responseLatestMsg = () => {
        // do later
        return "message";
    }

    broadcast = (message) => {
        // do later
        console.log(message);
        return true
    }

    replaceChain = (newBlocks, blockchain) => {
        if(this.isValidChain(newBlocks) && newBlocks.length > blockchain.length){
            console.log('Received blockchain is valid');
            broadcast(responseLatestMsg());
            return newBlocks;
        }
        else{
            console.log('Received blockchain invalid');
            return null;
        }
    }

    hexToBinary = (hexString) => {
        // get each digit and convert to hex and get last 4 digit
        const binaryDigits = hexString.split('').map(hex => 
            parseInt(hex, 16).toString(2).padStart(4, '0')
        );

        // join
        const binaryString = binaryDigits.join('');

        return binaryString;
    }

    hashMatchesDifficulty = (hash, difficulty) => {
        const hashInBinary = this.hexToBinary(hash);
        const requiredPredix = '0'.repeat(difficulty);
        return hashInBinary.startsWith(requiredPredix);
    }

    // find block with diff
    findBlock = (index, previousHash, timestamp, data, difficulty) => {
        let nonce = 0;
        while(true){
            const hash  = this.claculateHash(index, previousHash, timestamp, data, difficulty, nonce);
            if(this.hashMatchesDifficulty(hash, difficulty)){
                return new Block(index, previousHash, timestamp, data, difficulty, nonce);
            }
            nonce++;
        }
    }

    // get diff
    getDifficulty = (aBlockchain, blockchain, difficultyAdjustmentInternval, blockGenerationInterval) => {
        const latestBlock = aBlockchain[blockchain.length - 1];
        if(latestBlock.index % difficultyAdjustmentInternval === 0 && latestBlock.index !==0){
            return getAdjustedDifficulty(latestBlock, aBlockchain, blockchain, difficultyAdjustmentInternval, blockGenerationInterval);
        }
        else{
            return latestBlock.difficulty;
        }
    }

    // get adjust difficulty
    getAdjustedDifficulty = (lastestBlock, aBlockchain, blockchain, difficultyAdjustmentInterval, blockGenerationInterval) => {
        const prevAdjustmentBlock = aBlockchain[blockchain.length - difficultyAdjustmentInterval];
        const timeExpected = blockGenerationInterval * difficultyAdjustmentInterval;
        const timeTaken = lastestBlock.timestamp - prevAdjustmentBlock.timestamp;
        if(timeTaken < timeExpected / 2){
            return prevAdjustmentBlock.diffculty + 1;
        }
        else if(timeTaken > timeExpected * 2){
            return prevAdjustmentBlock.difficulty - 1;
        }
        else{
            return prevAdjustmentBlock.difficulty;
        }
    }

    // create wallet
    generatePrivateKey = () => {
        const keyPair = ec.genKeyPair();
        const privateKey = keyPair.getPrivate();
        return privateKey.toString(16);
    }

    // init Wallet
    initWallet = () => {
        const privateKeyLocation = process.env.PRIVATE_KEY_LOCATION;
        if(!fs.existsSync(privateKeyLocation)){
            console.log("Not exist file path");
            return;
        }

        const newPrivateKey = this.generatePrivateKey();

        fs.appendFileSync(privateKeyLocation, "|");
        fs.appendFileSync(privateKeyLocation, newPrivateKey);
        return newPrivateKey;
    }

    // get public key
    getPublicFromWallet = (privateKey) => {
        const key = ec.keyFromPrivate(privateKey, 'hex');
        return key.getPublic().encode('hex');
    }

    // check exist private key in list
    existPrivateKey(privateKey){
        const privateKeyLocation = process.env.PRIVATE_KEY_LOCATION;
        const data = fs.readFileSync(privateKeyLocation, 'utf-8').toString();
        const privateKeys = data.split('|');

        for(let i = 0; i < privateKeys.length; i++){
            if(privateKeys[i] == privateKey){
                return true;
            }
        }

        return false;
    }
}

module.exports = new BlockchainUtils();