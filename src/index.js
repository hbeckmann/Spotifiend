import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import { DashboardContextProvider } from './context/DashboardContext';

ReactDOM.render(
  <React.StrictMode>
    <DashboardContextProvider>
      <App />
    </DashboardContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorker.unregister();
