'use strict';

var superagent = require('superagent-bluebird-promise');
var locus = require('locus');
var redis = require('redis');
var kue = require('kue');
var job_queue = kue.createQueue();
job_queue.watchStuckJobs()
var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://127.0.0.1:8545'));
var coinbase = web3.eth.coinbase;
console.log('coinbase', coinbase)
var Promise = require("bluebird");

//
// Main:		=> pass: myrwt3ordd
// ======
// 0x7a9b52d65281d6acc3a5410576031262e854a01e   		Unlocked => true
//
// Users: 		=> pass: myrwt3ord5
// ======
// 0x1b20a140b87663e53d63bcc3e49dd4a6949b5d3e
// 0xc07e1ad306c4aa7a4982983d2903a11e6b23bdcd
// 0x59f9bdccec46a8ad0805e9948bb5036340f1eea5
//

// API Vars
var loyalty_point_url = "https://dashboard.pegke.com/?q=api/send_points"
var vuid = 1704
const accessToken = '92e7c9813184';
var accNos = {
  "5555666677771576": {
    "email": "arun@pegke.com",
    "uid": 1787,
    "card account_no": "4111133444441576",
    "loan account_no": "LBMUM11112221576",
    "cust_id": "88882576",
    "account_no": "5555666677771576",
    "phone_no": "+919846471002",
    "blockchain_address": "0x1b20a140b87663e53d63bcc3e49dd4a6949b5d3e"
  },
  "5555666677771577": {
    "email": "john@pegke.com",
    "uid": 1788,
    "card account_no": "4111133444441577",
    "loan account_no": "LBMUM11112221577",
    "cust_id": "88882577",
    "account_no": "5555666677771577",
    "phone_no": "+919846471003",
    "blockchain_address": "0xc07e1ad306c4aa7a4982983d2903a11e6b23bdcd"
  },
  "5555666677771578": {
    "email": "ancellla@pegke.com",
    "uid": 1789,
    "card account_no": "4111133444441578",
    "loan account_no": "LBMUM11112221578",
    "cust_id": "88882578",
    "account_no": "5555666677771578",
    "phone_no": "+919846471004",
    "blockchain_address": "0x59f9bdccec46a8ad0805e9948bb5036340f1eea5"
  }
};

var app = require('express')();
var server = require('http').createServer(app);
var path = require('path');
var io = require('socket.io')(server);
io.on('connection', function(socket, err) {
  // console.log('connected');


  socket.on('trasnfer', function(data) {

    socket.emit('first', {});

    console.log('trasnfer');
    var payload = data.data
    socket.emit('trasnferAck', {
      "data": payload
    });

    console.dir(payload);
    payload.payee = 5555666677771577
    var job = job_queue.create('transaction_job', {
      code: 200,
      data: payload,
    }).save(function(err) {
      if (!err) console.log('job id:', job.id);
    });

  });
});


// viewed at http://localhost:3000
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

server.listen(3030);


job_queue.process('transaction_job', function(job, done) {
  var payload = job.data
  if (payload.code === 200) {
    var loyalty_points = determine_loyalty_point_for_transaction(payload.data)
    console.log('loyalty_points:', loyalty_points)
    if (loyalty_points != 0) {
      console.log('posting to server')
      add_loyalty_for_bank_account(payload.data, loyalty_points).then(
        function(res) {
          add_loyalty_point_to_block_chain(payload.data, loyalty_points)
        },
        function(error) {
          console.log(error);
        });
    }
  }
});

function add_loyalty_for_bank_account(bank_acc_data, loyalty_points) {
  var customer = bank_acc_data.payee
  var uid = accNos[customer].uid
  var field_contact_number = accNos[customer].phone_no
  return superagent.post(loyalty_point_url).send({
    uid: uid,
    vuid: vuid,
    field_contact_number: field_contact_number,
    points: loyalty_points
  })
}


function add_loyalty_point_to_block_chain(bank_acc_data, loyalty_points) {
  coinbase = web3.eth.coinbase;
  var balance = web3.eth.getBalance(coinbase).toNumber();
  var customer = bank_acc_data.payee
  var dest_blockaddress = accNos[customer].blockchain_address
  console.log('dest_blockaddress', dest_blockaddress)
  console.log('balance', balance)
  console.log('loyalty_points', loyalty_points)
  if (balance > loyalty_points) {
    var a = transfer_coins(coinbase, dest_blockaddress, loyalty_points)
    console.log(a)
  }
}

function determine_loyalty_point_for_transaction(bank_acc_data) {
  return (bank_acc_data.transaction_amount / 50)
}

function transfer_coins(from, to, amount) {
  return (web3.eth.sendTransaction({
    from: from,
    to: to,
    value: web3.toWei(amount, "ether")
  }))
}
