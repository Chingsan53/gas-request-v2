import "./styles.css";
import { useState } from "react";

const App = () => {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowForm(true);
    if (showForm) {
      setShowForm(false);
    }
  };

  const printInfo = () => {
    console.log(firstName, email, accessCode);
  };

  return (
    <div className="App">
      <div className="main-flex">
        <div className="small-container">
          <img src="./img/charmander.png" className="logo" alt="logo" />
          <div className="title">
            <h2>(SECRET) $1 Off/Gallon</h2>
            <span>Price: FREE</span>
            <button className="button-7" onClick={handleSubmit}>
              {!showForm ? "REQUEST" : "CLOSE"}
            </button>
          </div>
        </div>
      </div>
      {showForm && (
        <div className="form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-container">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="accessCode">Access Code</label>
            <input
              type="accessCode"
              id="accessCode"
              name="accessCode"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
            />
          </div>
          <button className="button-7" onClick={printInfo}>
            SUBMIT
          </button>
          <span>
            *Please use your real email address when submitting the form
          </span>
        </div>
      )}
    </div>
  );
};

export default App;
