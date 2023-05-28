class Block{
    constructor(index, previousHash, timestamp, data, hash, difficulty, nonce){
        this.index = index;
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash.toString();
        this.difficulty = difficulty;
        this.nonce = nonce;
    }
}

module.exports = Block;