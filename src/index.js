import React from 'react';
import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css'
import App from './components/App';
import Ver from './components/Ver';
import Latest from './components/Latest';

import * as serviceWorker from './serviceWorker';


document.getElementById('up').onclick=function() 
{
    ReactDOM.render(<App />, document.getElementById('root'));
};

document.getElementById('ve').onclick=function() 
{
    ReactDOM.render(<Ver />, document.getElementById('root'));
};


document.getElementById('lat').onclick=function() 
{
    ReactDOM.render(<Latest />, document.getElementById('root'));
};

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
