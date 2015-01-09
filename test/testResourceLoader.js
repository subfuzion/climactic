var ResourceManager = require('../lib/resourcemanager');

var packageDetails = {
    packageName: 'aquajs-microservice',
    version: 'latest',
    targetDir: './'
};

//ResourceManager.prototype.downloadResource(packageDetails);
ResourceManager.prototype.findResource(packageDetails);