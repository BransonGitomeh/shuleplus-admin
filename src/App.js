import React from "react";
import { Route, HashRouter, useHistory, Redirect } from "react-router-dom";

import home from "./pages/home";
import students from "./pages/students";
import student from "./pages/student";
import parents from "./pages/parents";
import classes from "./pages/classes";
import teachers from "./pages/teachers";
import drivers from "./pages/drivers";
import buses from "./pages/buses"
import routes from "./pages/routes"
import schedules from "./pages/schedules"
import complaints from "./pages/complaints"
import trips from "./pages/trips"
import trip from "./pages/trip"
import communications from "./pages/communications"

import login from "./pages/auth/login";
import website from "./pages/website";

import recover from "./pages/auth/recover";
import register from "./pages/auth/register";

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    localStorage.getItem('authorization')
      ? <Component {...props} />
      : <Redirect to='/' />
  )} />
)

class App extends React.Component {
  render() {

    return (<HashRouter>
      {/* overal stuff */}
      <Route exact path="/" component={website} />
      <Route exact path="/register" component={register} />
      <Route exact path="/recover" component={recover} />
      <Route exact path="/auth" component={login} />

      {/* main admin stuff */}
      <PrivateRoute exact path="/home" component={home} />
      <PrivateRoute path="/students" component={students} />
      <PrivateRoute path="/student/:id" component={student} />
      <PrivateRoute path="/schedules" component={schedules} />
      <PrivateRoute path="/parents" component={parents} />
      <PrivateRoute path="/drivers" component={drivers} />
      <PrivateRoute path="/buses" component={buses} />
      <PrivateRoute path="/routes" component={routes} />
      <PrivateRoute path="/messages" component={complaints} />
      <PrivateRoute path="/classes" component={classes} />
      <PrivateRoute path="/teachers" component={teachers} />
      <PrivateRoute path="/comms" component={communications} />
      <PrivateRoute path="/reports/bus/:id" component={students} />
      <PrivateRoute path="/trips/:filter" component={trips} />
      <PrivateRoute path="/trip/:id" component={trip} />

      {/* super admin routes */}



      {/* teacher routes */}



      {/* 3rd party admin routes */}
    </HashRouter>)

  }
}

export default App;
