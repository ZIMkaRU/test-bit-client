'use strict';

const Wasteland = require('wasteland');
const GrenacheBackend = require('wasteland/backends/Grenache');

const { PeerRPCClient } = require('grenache-nodejs-ws');
const Link = require('grenache-nodejs-link');
const ed = require('ed25519-supercop');

let count = 0;

const link = new Link({
  grape: 'http://127.0.0.1:30001'
});
link.start();

const { publicKey, secretKey } = ed.createKeyPair(ed.createSeed());

const gb = new GrenacheBackend({
  transport: link,
  keys: { publicKey, secretKey }
});

const wl = new Wasteland({ backend: gb });

const peer = new PeerRPCClient(link, {});
peer.init();

const runReq = () => {
  peer.request(
    'rest:bfx:ticker:BTCUSD',
    {},
    { timeout: 100000 },
    (err, hash) => {
      count += 1;
      console.log('---Count--- ', count);

      if (err) console.log('---Error--- ', err.message);

      console.log('---HASH--- ', hash);

      if (!hash) {
        return;
      }

      wl.get(hash, {}, (err, data) => {
        if (err) console.log('---Error--- ', err.message);

        console.log('---Wasteland, data--- ', JSON.stringify(data, null, 3));
      });
    }
  );
};

let interval = setInterval(() => {
  runReq();
}, 3000);
