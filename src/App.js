import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [databaseStatus, setDatabaseStatus] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/transactions')
      .then(response => response.json())
      .then(data => setTransactions(data));
  }, []);

  const updateDatabase = async () => {
    try {
      const response = await axios.get('http://localhost:5000/update-database');
      console.log(response);
      setTransactions([]); // clear transactions state
      window.location.reload(); // Refresh the page
    } catch (error) {
      console.error(error);
    }
  };

  const clearDatabase = () => {
    axios
      .get('http://localhost:5000/clear-database')
      .then((response) => {
        setDatabaseStatus(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };



  return (
    <div className="container">
      <div className="title">Ethereum Dashboard</div>
      <button onClick={updateDatabase}>Actualiser la base de données</button>
      <button onClick={clearDatabase}>Vider la base de données</button>
      <table>
        <thead>
        <tr>
          <th>Hash</th>
          <th>Block Number</th>
          <th>From</th>
          <th>To</th>
          <th>Value</th>
        </tr>
        </thead>
        <tbody>
        {transactions.map(transaction => (
          <tr key={transaction.id}>
            <td>{transaction.hash}</td>
            <td>{transaction.block_number}</td>
            <td>{transaction.from_address}</td>
            <td>{transaction.to_address}</td>
            <td>{transaction.value}</td>
          </tr>
        ))}
        </tbody>
      </table>
      <p>{databaseStatus}</p>
    </div>
  );
}

export default App;