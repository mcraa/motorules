import React, { useState } from 'react';
import './App.css';
import WindowControl from './components/WindowControl';

import { Link, Route } from "react-router-dom";

import {
  BottomNavigation,
  BottomNavigationAction,
  Drawer
} from '@material-ui/core';
import {
  BorderAll as IconWindow,
  Tune as IconConditions,
  SettingsApplicationsOutlined as IconMotors,
  Dashboard as IconDashboard
} from '@material-ui/icons';
import { 
  Container,
  Img,
  Navbar
} from 'rendition'

import Rules from './components/Rules';
import Motors from './components/Motors';
import { getSensorData } from './services/Api';

function App() {
  let [page, setPage] = useState(0)
  let [drawer, setDrawer] = useState(false)
  let [drawerText, setDrawerText] = useState<{[name: string]: string | number}>({})
  
  const toggleDrawer =
    (open: boolean) =>
    async (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      if (open) {
        let sensors = await getSensorData()
        setDrawerText(sensors)
      }

      setDrawer(open);
    };

  return (
      <div className="App">
        <React.Fragment key="left">
          <Drawer
            anchor="left"
            open={drawer}
            onClose={() => setDrawer(false)}
          >
            <Container backgroundColor='#22272e' color='lightgray' height='100vh'>
              <h3>Current readings</h3>
              <ul>
                {Object.keys(drawerText).map(k => <li key={k}><b>{k}</b>: {drawerText[k]}</li>)}
              </ul>
            </Container>
          </Drawer>
        </React.Fragment>
        <Navbar 
          brand={
            <Container 
              style={{display: 'flex', alignItems: 'center'}}  
              onClick={toggleDrawer(true)}
            >
              <Img src="/balena.png" style={{height: '30px'}}/>
              <IconDashboard /> 
              Curtains
            </Container>}
          style={{backgroundColor: 'rgb(42, 80, 111)', color: 'rgb(165, 222, 55)'}}
        >          
        </Navbar>
        <Container backgroundColor='#22272e' color='lightgray' style={{overflow: 'auto', height: '100vh'}}>
          <Route exact path="/" component={WindowControl}/>
          <Route exact path="/rules" component={Rules}/>
          <Route exact path="/motors" component={Motors}/>
        </Container>
        <BottomNavigation showLabels className="bottom-bar" value={page} >
          <BottomNavigationAction 
            classes={{label: 'bottom-bar-label'}}
            component={Link}
            to="/"
            label="Home" 
            onClick={() => setPage(0)}
            icon={<IconWindow />} 
          /> 
          <BottomNavigationAction 
            classes={{label: 'bottom-bar-label'}}
            component={Link}
            to="/rules"
            label="Rules"
            onClick={() => setPage(1)}
            icon={<IconConditions />}
          />
          <BottomNavigationAction 
            classes={{label: 'bottom-bar-label'}}
            component={Link}
            to="/motors"
            label="Motors"
            onClick={() => setPage(2)}
            icon={<IconMotors />}
          />        
        </BottomNavigation>
      </div>
  );
}

export default App;
