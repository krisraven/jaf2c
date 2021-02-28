import * as  bodyParser from 'body-parser';
import * as express from 'express';

import { Block, generateNextBlock, getBlockchain } from './blockchain';
import { connectToPeers, getSockets, initP2PServer } from './p2p';

const httpPort: number = parseInt(process.env.HTTP_PORT) || 3001;
const p2pPort: number = parseInt(process.env.P2P_PORT) || 6001;

/* communcating with other nodes */
const initHttpServer = (myHttpPort: number) => {
  const app = express();
  app.use(bodyParser.json());
  // list all blocks
  app.get('/blocks', (req, res) => {
    res.send(getBlockchain())
  });
  // create a new block
  app.post('/mineBlock', (req, res) => {
    const newBlock: Block = generateNextBlock(req.body.data);
    res.send(newBlock);
  });
  // list or add peers
  app.get('/peers', (req, res) => {
    connectToPeers(req.body.peer);
    res.send();
  });

  app.listen(myHttpPort, () => {
    console.log('Listening to HTTP on port: ' + myHttpPort)
  });
  // usage would be curl eg curl http://localhost:3001/blocks
}

initHttpServer(httpPort);
initP2PServer(p2pPort);