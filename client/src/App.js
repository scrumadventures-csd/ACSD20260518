import logo from './logo.svg';
import './App.css';
import RegisterGame from './RegisterGame';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Welcome ACSD20260518!
        </p>
      </header>
      <RegisterGame />
    </div>
  );
}

export default App;
