import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom";
import Axios from "axios";
import AnimalCard from "./components/AnimalCard";
import CreateNewForm from "./components/CreateNewForm";

function App() {
  const [animals, setAnimals] = useState([]);

  useEffect(() => {
    async function go() {
      // axios take the json from /api/animals with the data inside and put it in response - to acss the data you need: resopnse.data
      const response = await Axios.get("/api/animals");
      setAnimals(response.data);
    }
    go();
  }, []);

  return (
    <div className="container">
      <p>
        <a href="/">&laquo; Back to public homepage</a>
      </p>
      <CreateNewForm setAnimals={setAnimals} />
      <div className="animal-grid">
        {animals.map(function (animal) {
          return (
            <AnimalCard
              key={animal._id}
              name={animal.name}
              species={animal.species}
              photo={animal.photo}
              id={animal._id}
              setAnimals={setAnimals}
            />
          );
        })}
      </div>
    </div>
  );
}

//export default App();

// convert the app to an js file ->
//to main.js -> from the #app that also wirrten in main.js
const root = createRoot(document.querySelector("#app"));
root.render(<App />);
