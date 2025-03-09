import React from 'react';
import CustomerRequestForm from './components/CustomerRequestForm';
import DJRequestQueue from './components/DJRequestQueue';
import './/App.css';

const App = () => {
  return (
    <div className="App">
      <h1>Goodbar Karaoke Request App</h1>
      <CustomerRequestForm />
      <DJRequestQueue />
    </div>
  );
};

export default App;