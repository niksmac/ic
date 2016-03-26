'use strict';

const Hapi = require('hapi');
var colors = require('colors');
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
var Promise = require("bluebird");

//
// Main:		=> pass: myrwt3ordd
// ======
// 0x806578ad71f7811da0344444b832c4c4bd26e4c8   		Unlocked => true
//
// Users: 		=> pass: myrwt3ord5
// ======
// 0xd64332ccdeb143a7ae0be9ba944d34535a990747
// 0xf22f215f61eaaf3e635e6d73ac4b114f2e71908e
// 0x8564c92e61fb49329d07402e42b29dd57e708d9c
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
    "blockchain_address": "0xd64332ccdeb143a7ae0be9ba944d34535a990747"
  },
  "5555666677771577": {
    "email": "john@pegke.com",
    "uid": 1788,
    "card account_no": "4111133444441577",
    "loan account_no": "LBMUM11112221577",
    "cust_id": "88882577",
    "account_no": "5555666677771577",
    "phone_no": "+919846471003",
    "blockchain_address": "0xf22f215f61eaaf3e635e6d73ac4b114f2e71908e"
  },
  "5555666677771578": {
    "email": "ancellla@pegke.com",
    "uid": 1789,
    "card account_no": "4111133444441578",
    "loan account_no": "LBMUM11112221578",
    "cust_id": "88882578",
    "account_no": "5555666677771578",
    "phone_no": "+919846471004",
    "blockchain_address": "0x8564c92e61fb49329d07402e42b29dd57e708d9c"
  }
};


const server = new Hapi.Server();
server.connection({
  port: 3000
});

server.route({
  method: 'GET',
  path: '/createTransaction',
  handler: function(request, reply) {

    superagent
      .get(
        'http://retailbanking.mybluemix.net/banking/icicibank/fundTransfer?client_id=nikhil@lightrains.com&token=92e7c9813184&srcAccount=5555666677771577&destAccount=5555666677771576&amt=100&type_of_transaction=dth'
      )
      .end(function(err, res) {

        var response = JSON.parse(res.text)
        var data = response[1]
        data.payee = 5555666677771577
        var job = job_queue.create('transaction_job', {
          code: response[0].code,
          data: data,

        }).save(function(err) {
          if (!err) console.log('job id:', job.id);
        });
        reply(res.text);
      });
  }
});

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri.green.bold);
});



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
  if (balance > loyalty_points) {
    transfer_coins(coinbase, dest_blockaddress, loyalty_points)
  }
}


function determine_loyalty_point_for_transaction(bank_acc_data) {
  return (bank_acc_data.transaction_amount / 50)
}

function transfer_coins(from, to, amount) {
  web3.eth.sendTransaction({
    from: from,
    to: to,
    value: web3.toWei(amount, "ether")
  })
}
