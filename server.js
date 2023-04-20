const express = require('express');
const app = express();
const path = require('path');
const Web3 = require('web3');
const mysql = require('mysql2');
const web3 = new Web3('https://mainnet.infura.io/v3/64560b7bf418421887bc267011c2b5fc');
const { toBN } = web3.utils;
const cors = require('cors');
require('dotenv').config();


// Configure MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Connect to MySQL
connection.connect();

// ajoute les transactions de plus de 10 ETH dans la base de données
async function getLargeTransactions(){
  const txs = await web3.eth.getBlock('latest', true);
  const ethTx = txs.transactions.filter(tx => toBN(tx.value).gt(toBN(10).mul(toBN(10).pow(toBN(18)))));
  console.log(ethTx);

  ethTx.forEach((tx, index) => {
    const sql = `INSERT INTO transactions (hash, from_address, to_address, value) VALUES ('${tx.hash}', '${tx.from}', '${tx.to}', ${tx.value})`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      console.log(`Transaction ${index + 1} inserted`);
    });
  });
}

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

const corsOptions = {
  origin: '*'
};
app.use(cors(corsOptions));


// API endpoint to retrieve transactions
app.get('/transactions', (req, res) => {
  const sql = 'SELECT * FROM transactions WHERE value > 10';
  connection.query(sql, (error, results, fields) => {
    if (error) throw error;
    res.json(results);
  });
});

// API endpoint to update the database
app.get('/update-database', function(req, res) {
  getLargeTransactions();
  res.redirect('/');
});

app.get('/clear-database', (req, res) => {
  function clearDatabase(callback) {
    const sql = 'DELETE FROM transactions'; // Deletes all existing transactions
    connection.query(sql, (error, result) => {
      if (error) {
        console.log(error);
        callback(error, null);
      } else {
        console.log('Database cleared');
        callback(null, result);
      }
    });
  }

  clearDatabase((err, result) => {
    if (err) {
      console.log(err);
      res.sendStatus(500);
    } else {
      res.sendStatus(200);
    }
  });
});




// Handles any requests that don't match the above
app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname+'/public/index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  getLargeTransactions();
});