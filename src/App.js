import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import studentsList from "./pages/students/list"

function App() {
  return (
    <Router>
      <div>
        <Route exact path="/" component={studentsList} />
      </div>
    </Router>
  );
}

export default App;