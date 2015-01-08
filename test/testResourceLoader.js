var ResourceManager = require('../lib/resourcemanager');

var packageDetails = {
    packageName: 'aquajs-microservice',
    version: 'latest',
    targetDir: './'
};

ResourceManager.prototype.loadResource(packageDetails);