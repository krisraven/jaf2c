import * as CryptoJS from 'crypto-js';
import { broadcastLatest } from './p2p';

/* Block strtucture */
class Block {
  public index: number;
  public hash: string;
  public previousHash: string;
  public timestamp: number;
  public data: string;

  constructor(
    index: number,
    hash: string,
    previousHash: string,
    timestamp: number,
    data: string
  ) {
    this.index = index;
    this.hash = hash;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
  }
}

/* Block Hash */
const calculateHash = (
  index: number,
  previousHash: string,
  timestamp: number,
  data: string
): string => CryptoJS.SHA256(index + previousHash + timestamp + data).toString();

const calculateHashForBlock = (block: Block): string =>
  calculateHash(block.index, block.previousHash, block.timestamp, block.data);

const addBlock = (newBlock: Block) => {
  if (isValidNewBlock(newBlock, getLatestBlock())) {
    blockchain.push(newBlock);
  }
};

const genesisBlock: Block = new Block(
  0,
  "36da6afc3a921823786534932c2b715487d4c14378abed4f8167695e6337db87",
  null,
  1614415803000,
  "The Genesis Block!"
);

/* generates block */
const generateNextBlock = (blockData: string) => {
  const previousBlock: Block = getLatestBlock();
  const nextIndex: number = previousBlock.index + 1;
  const nextTimestamp: number = new Date().getTime() / 1000;
  const nextHash: string = calculateHash(
    nextIndex,
    previousBlock.hash,
    nextTimestamp,
    blockData
  );
  const newBlock: Block = new Block(
    nextIndex,
    nextHash,
    previousBlock.hash,
    nextTimestamp,
    blockData
  );
  addBlock(newBlock);
  broadcastLatest();
  return newBlock;
};

let blockchain: Block[] = [genesisBlock]; // in memory JS array to store blockchain

const getBlockchain = (): Block[] => blockchain;

const getLatestBlock = (): Block => blockchain[blockchain.length - 1];

/* validates single block */
const isValidBlockStructure = (block: Block): boolean => {
  return (
    typeof block.index === "number" &&
    typeof block.hash === "string" &&
    typeof block.previousHash === "string" &&
    typeof block.timestamp === "string" &&
    typeof block.data === "string"
  );
};

/* validates integrity of block */
const isValidNewBlock = (newBlock: Block, previousBlock: Block): boolean => {
  if (previousBlock.index + 1 !== newBlock.index) {
    console.log("invalid index");
    return false;
  } else if (previousBlock.hash !== newBlock.previousHash) {
    console.log("invalid previous hash");
    return false;
  } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
    console.log(
      typeof newBlock.hash + "" + typeof calculateHashForBlock(newBlock)
    );
    console.log(
      "invalid hash: " + calculateHashForBlock(newBlock) + "" + newBlock.hash
    );
    return false;
  }
  return true;
};

/* validate full chain of blocks */
const isValidChain = (blockchainToValidate: Block[]): boolean => {
  const isValidGenesis = (block: Block): boolean => {
    return JSON.stringify(block) === JSON.stringify(genesisBlock);
  };
  // must match genesis block
  if (!isValidGenesis(blockchainToValidate[0])) {
    return false;
  }
  // validate every block after genesis block using the previous method
  for (let i = 1; i < blockchainToValidate.length; i++) {
    if (
      !isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])
    ) {
      return false;
    }
  }
  return true;
};

const addBlockToChain = (newBlock: Block) => {
  if (isValidNewBlock(newBlock, getLatestBlock())) {
    blockchain.push(newBlock);
    return true;
  }
  return false;
};

/* choosing the longest chain */
const replaceChain = (newBlocks: Block[]) => {
  if (isValidChain(newBlocks) && newBlocks.length > getBlockchain().length) {
    console.log(
      "Received blockchain is valid. Replacing current blockchain with received blockchain"
    );
    blockchain = newBlocks;
    broadcastLatest();
  } else {
    console.log("received blockchain invalid");
  }
};

export { Block, getBlockchain, getLatestBlock, generateNextBlock, isValidBlockStructure, replaceChain, addBlockToChain };
