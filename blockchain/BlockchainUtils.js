const CryptoJS = require("crypto-js");
const Block = require("./block");
var EC = require("elliptic").ec;
var ec = new EC("secp256k1");
const fs = require("fs");
const { privateEncrypt } = require("crypto");
const { UnspentTxOut, Transaction, TxIn, TxOut } = require("./transaction");
const { v4: uuidv4 } = require("uuid");

class BlockchainUtils {
  claculateHash = (index, previousHash, timestamp, data) => {
    return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
  };

  getLatestBlock = (blockchain) => {
    const latestBlock = blockchain[blockchain.length - 1];
    return latestBlock;
  };

  generateNextBlock = (blockData, blockchain) => {
    const previousBlock = this.getLatestBlock(blockchain);
    const nextIndex = previousBlock.index + 1;
    const nextTimestamp = new Date().getTime() / 1000;
    const nextHash = this.claculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
    return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash);
  };

  getGenesisBlock = () => {
    const timestamp = new Date().getTime() / 1000;
    const data = process.env.GENESIS_DATA;
    const hash = this.claculateHash(0, "", timestamp, data);
    return new Block(0, "", timestamp, data, hash);
  };

  isValidNewBlock = (newBlock, previousBlock) => {
    if (previousBlock.index + 1 !== newBlock.index) {
      console.log("invalid index");
      return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
      console.log("invalid previous hash");
      return false;
    } else if (
      this.claculateHash(newBlock.index, newBlock.previousHash, newBlock.timestamp, newBlock.data) !== newBlock.hash
    ) {
      console.log("invalid hash");
      return false;
    }

    return true;
  };

  isValidChain = (blockchainToValidate) => {
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(this.getGenesisBlock())) {
      return false;
    }

    var tempBlocks = [blockchainToValidate[0]];
    for (let i = 1; i < blockchainToValidate.length; i++) {
      if (this.isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
        tempBlocks.push(blockchainToValidate[i]);
      } else {
        return false;
      }
    }

    return true;
  };

  responseLatestMsg = () => {
    // do later
    return "message";
  };

  broadcast = (message) => {
    // do later
    console.log(message);
    return true;
  };

  replaceChain = (newBlocks, blockchain) => {
    if (this.isValidChain(newBlocks) && newBlocks.length > blockchain.length) {
      console.log("Received blockchain is valid");
      broadcast(responseLatestMsg());
      return newBlocks;
    } else {
      console.log("Received blockchain invalid");
      return null;
    }
  };

  hexToBinary = (hexString) => {
    // get each digit and convert to hex and get last 4 digit
    const binaryDigits = hexString.split("").map((hex) => parseInt(hex, 16).toString(2).padStart(4, "0"));

    // join
    const binaryString = binaryDigits.join("");

    return binaryString;
  };

  hashMatchesDifficulty = (hash, difficulty) => {
    const hashInBinary = this.hexToBinary(hash);
    const requiredPredix = "0".repeat(difficulty);
    return hashInBinary.startsWith(requiredPredix);
  };

  // find block with diff
  findBlock = (index, previousHash, timestamp, data, difficulty) => {
    let nonce = 0;
    while (true) {
      const hash = this.claculateHash(index, previousHash, timestamp, data, difficulty, nonce);
      if (this.hashMatchesDifficulty(hash, difficulty)) {
        return new Block(index, previousHash, timestamp, data, difficulty, nonce);
      }
      nonce++;
    }
  };

  // get diff
  getDifficulty = (aBlockchain, blockchain, difficultyAdjustmentInternval, blockGenerationInterval) => {
    const latestBlock = aBlockchain[blockchain.length - 1];
    if (latestBlock.index % difficultyAdjustmentInternval === 0 && latestBlock.index !== 0) {
      return getAdjustedDifficulty(
        latestBlock,
        aBlockchain,
        blockchain,
        difficultyAdjustmentInternval,
        blockGenerationInterval
      );
    } else {
      return latestBlock.difficulty;
    }
  };

  // get adjust difficulty
  getAdjustedDifficulty = (
    lastestBlock,
    aBlockchain,
    blockchain,
    difficultyAdjustmentInterval,
    blockGenerationInterval
  ) => {
    const prevAdjustmentBlock = aBlockchain[blockchain.length - difficultyAdjustmentInterval];
    const timeExpected = blockGenerationInterval * difficultyAdjustmentInterval;
    const timeTaken = lastestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) {
      return prevAdjustmentBlock.diffculty + 1;
    } else if (timeTaken > timeExpected * 2) {
      return prevAdjustmentBlock.difficulty - 1;
    } else {
      return prevAdjustmentBlock.difficulty;
    }
  };

  // create wallet
  generatePrivateKey = () => {
    const keyPair = ec.genKeyPair();
    const privateKey = keyPair.getPrivate();
    return privateKey.toString(16);
  };

  // init Wallet
  initWallet = () => {
    const privateKeyLocation = process.env.PRIVATE_KEY_LOCATION;
    if (!fs.existsSync(privateKeyLocation)) {
      console.log("Not exist file path");
      return;
    }

    const newPrivateKey = this.generatePrivateKey();

    fs.appendFileSync(privateKeyLocation, "|");
    fs.appendFileSync(privateKeyLocation, newPrivateKey);
    return newPrivateKey;
  };

  // get public key
  getPublicFromWallet = (privateKey) => {
    const key = ec.keyFromPrivate(privateKey, "hex");
    const publicKey = key.getPublic().encode("hex");
    return publicKey;
  };

  // check exist private key in list
  existPrivateKey(privateKey) {
    const privateKeyLocation = process.env.PRIVATE_KEY_LOCATION;
    const data = fs.readFileSync(privateKeyLocation, "utf-8").toString();
    const privateKeys = data.split("|");

    for (let i = 0; i < privateKeys.length; i++) {
      if (privateKeys[i] == privateKey) {
        return true;
      }
    }

    return false;
  }

  // check exist private key in list
  existPublicKey(address) {
    const privateKeyLocation = process.env.PRIVATE_KEY_LOCATION;
    const data = fs.readFileSync(privateKeyLocation, "utf-8").toString();
    const privateKeys = data.split("|");

    for (const privateKey of privateKeys) {
      if (privateKey && this.getPublicFromWallet(privateKey) == address) {
        return true;
      }
    }

    return false;
  }

  // get unspent output pool
  getUnspentOutputPool = () => {
    const unspentOutputLocation = process.env.UNSPENT_OUTPUT_POOL_LOCATION;
    let data = fs.readFileSync(unspentOutputLocation);
    try {
      const jsonData = JSON.parse(data);
      return jsonData;
    } catch {
      return [];
    }
  };

  // add a unspent output to pool
  addToUnspentOutputPool = (unspentOutputs) => {
    const unspentOutputPool = this.getUnspentOutputPool();
    const newData = [...unspentOutputPool, ...unspentOutputs];

    const unspentOutputLocation = process.env.UNSPENT_OUTPUT_POOL_LOCATION;
    fs.writeFileSync(unspentOutputLocation, JSON.stringify(newData));
  };

  // transfer unspent outputs to spent outputs
  transferUnspentOutputsToSpentOutputs = (unspentOutputs) => {
    // remove unspent outputs in pool
    const unspentOutputPool = this.getUnspentOutputPool();
    let newData = unspentOutputPool;
    for (const unspentOutput of unspentOutputs) {
      console.log(unspentOutput)
      console.log(newData);
      newData = newData.filter(un => un.txOutId != unspentOutput.txOutId || un.txOutIndex != unspentOutput.txOutIndex);
    }

    const unspentOutputLocation = process.env.UNSPENT_OUTPUT_POOL_LOCATION;
    fs.writeFileSync(unspentOutputLocation, JSON.stringify(newData));

    // add unspent outputs to spent output pool
    this.addToSpentOutputPool(unspentOutputs);
  };

  // get spent output pool
  getSpentOutputPool = () => {
    const spentOutputLocation = process.env.SPENT_OUTPUT_POOL_LOCATION;
    let data = fs.readFileSync(spentOutputLocation);
    try {
      const jsonData = JSON.parse(data);
      return jsonData;
    } catch {
      return [];
    }
  };

  // add spent outputs to pool
  addToSpentOutputPool = (spentOutputs) => {
    const spentOutputPool = this.getSpentOutputPool();
    const newData = [...spentOutputPool, ...spentOutputs];

    const spentOutputLocation = process.env.SPENT_OUTPUT_POOL_LOCATION;
    fs.writeFileSync(spentOutputLocation, JSON.stringify(newData));
  };

  // get transaction pool
  getTransactionPool = () => {
    const transactionPoolLocation = process.env.TRANSACTION_POOL_LOCATION;
    let data = fs.readFileSync(transactionPoolLocation);
    try {
      const jsonData = JSON.parse(data);
      return jsonData;
    } catch {
      return [];
    }
  };

  // add a unspent output to pool
  addToTransactionPool = (transactions) => {
    const transactionPool = this.getTransactionPool();
    const newData = [...transactionPool, ...transactions];

    const transactionPoolLocation = process.env.TRANSACTION_POOL_LOCATION;
    fs.writeFileSync(transactionPoolLocation, JSON.stringify(newData));
  };

  // buy coin from store with no fee
  buyCoinFromStore = (address, amount) => {
    try {
      const txOutId = process.env.STORE_TRANSACTION_ID;
      const newUnspentOutput = new UnspentTxOut(txOutId, uuidv4(), address, parseInt(amount));
      this.addToUnspentOutputPool([newUnspentOutput]);

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  // find unspent output of wallet
  findUnspentOutputs = (address) => {
    const unspentOutputPool = this.getUnspentOutputPool();

    const unspentOutputs = unspentOutputPool.filter((un) => un.address == address);
    return unspentOutputs;
  };

  // calc balance of wallet
  getBalance = (address) => {
    const unspentOutputs = this.findUnspentOutputs(address);
    const totalAmount = unspentOutputs.reduce((prev, cur) => prev + parseInt(cur.amount), 0);

    return totalAmount;
  };

  // generate transaction id from inputs and outputs
  getTransactionId = (transaction) => {
    const txInContent = transaction.txIns.map((txIn) => txIn.txOutId + txIn.txOutIndex).reduce((a, b) => a + b, "");

    const txOutContent = transaction.txOuts.map((txOut) => txOut.address + txOut.amount).reduce((a, b) => a + b, "");

    return CryptoJS.SHA256(txInContent + txOutContent).toString();
  };

  // find a unspent output from unspent outputs
  findUnspentOutput = (txOutId, txOutIndex, aUnspentTxOuts) => {
    const unspentOutput = aUnspentTxOuts.find((un) => un.txOutId == txOutId && un.txOutIndex == txOutIndex);
    return unspentOutput;
  };

  // sign a transaction
  signTxIn = (transaction, txInIndex, privateKey, aUnspentTxOuts) => {
    const txIn = transaction.txIns[txInIndex];

    const dataToSign = transaction.id;
    const referencedUnspentTxOut = this.findUnspentOutput(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts);
    if (referencedUnspentTxOut == null) {
      console.log("Could not find referenced txOut");
      throw Error();
    }

    const referencedAddress = referencedUnspentTxOut.address;

    if (this.getPublicFromWallet(privateKey) != referencedAddress) {
      console.log("Not match the address");
      throw Error();
    }

    const key = ec.keyFromPrivate(privateKey, "hex");
    const derSignature = key.sign(dataToSign).toDER();
    const derBuffer = Buffer.from(derSignature, "binary");
    const signature = derBuffer.toString("hex");

    return signature;
  };

  // find unspent output for amount
  findUnspentOutputsForAmount = (amount, myUnspentTxOuts) => {
    let currentAmount = 0;
    const includeUnspentTxOuts = [];
    for (const unspentTxOut of myUnspentTxOuts) {
      includeUnspentTxOuts.push(unspentTxOut);
      currentAmount += parseInt(unspentTxOut.amount);
      if (currentAmount >= amount) {
        const leftOverAmount = currentAmount - amount;
        return { unspentOutputsForAmount: includeUnspentTxOuts, leftOverAmount };
      }
    }
  };

  // generate transaction
  generateTransaction = (privateKey, fromAddress, toAddress, amount) => {
    // get unspent output to create txinputs
    const unspentOutputs = this.findUnspentOutputs(fromAddress);
    const infoAboutUnspentOutputs = this.findUnspentOutputsForAmount(amount, unspentOutputs);
    const unspentOutputsForAmount = infoAboutUnspentOutputs.unspentOutputsForAmount;
    const leftOverAmount = infoAboutUnspentOutputs.leftOverAmount;

    // create transaction inputs
    const txIns = [];
    for (const unspentOutput of unspentOutputsForAmount) {
      const txIn = new TxIn(unspentOutput.txOutId, unspentOutput.txOutIndex, "");
      txIns.push(txIn);
    }

    // create transaction outputs
    const txOutForToAddress = new TxOut(toAddress, amount);
    const txOuts = [txOutForToAddress];
    if (leftOverAmount > 0) {
      const txOutForFromAddress = new TxOut(fromAddress, leftOverAmount);
      txOuts.push(txOutForFromAddress);
    }

    // create new transaction
    const newTransaction = new Transaction("", txIns, txOuts);
    newTransaction.id = this.getTransactionId(newTransaction);

    // sign for txin in transaction
    for (let i = 0; i < newTransaction.txIns.length; i++) {
      newTransaction.txIns[i].signature = this.signTxIn(newTransaction, i, privateKey, unspentOutputs);
    }

    // handle data after create new transaction
    this.storeData(newTransaction, unspentOutputsForAmount);
  };

  // handle store data to file
  storeData = (newTransaction, unSpentOutputs) => {
    // store new transaction
    this.addToTransactionPool([newTransaction]);

    // transfer unspent outputs was used to spent outputs
    this.transferUnspentOutputsToSpentOutputs(unSpentOutputs);

    // store new unspent outputs
    const newUnspentOutputs = [];
    for (let i = 0; i < newTransaction.txOuts.length; i++) {
      const newUnspentOutput = new UnspentTxOut(
        newTransaction.id,
        i,
        newTransaction.txOuts[i].address,
        newTransaction.txOuts[i].amount
      );
      newUnspentOutputs.push(newUnspentOutput);
    }
    this.addToUnspentOutputPool(newUnspentOutputs);
  };
}

module.exports = new BlockchainUtils();
