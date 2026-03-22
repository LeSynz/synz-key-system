const express = require('express');
const config = require('./config');  
const errorHandler = require('./middleware/errorHandler');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.json());

// load routes dynamically including subfolders
const routesDir = path.join(__dirname, 'routes');

function loadRoutes(dir, prefix = '') {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadRoutes(fullPath, prefix + '/' + file);
        } else if (file.endsWith('.js')) {
            const routeName = file === 'index.js' ? '' : '/' + file.replace('.js', '');
            const routePath = prefix + routeName || '/';
            const route = require(fullPath);
            app.use(routePath, route);
            console.log(`Loaded route: ${routePath}`);
        }
    });
}
loadRoutes(routesDir);

app.use(errorHandler);

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});