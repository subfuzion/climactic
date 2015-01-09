
var fs = require('fs'),
    fsx = require('fs-extra'),
    tarball = require('tarball-extract'),
    path = require("path"),
    registry = "http://sv2lxecxapid01.corp.equinix.com:8080/package/";

function mkdir(packagePath) {
  var dirs = packagePath.split('/');
  var prevDir = dirs.splice(0, 1) + "/";
  while (dirs.length > 0) {
    var curDir = prevDir + dirs.splice(0, 1);
    if (!fs.existsSync(curDir)) {
      fs.mkdirSync(curDir);
    }
    prevDir = curDir + '/';
  }
}

module.exports = {
  downloadPackage: function(details, cb) {
    var packageFile, packageDest;
    var url = registry + details.packageName + '/' + details.version;

    mkdir('./tmp');

    packageFile = path.join('./tmp', details.packageName + '.tgz');
    packageDest = path.join('./tmp', details.packageName);

    tarball.extractTarballDownload(url, packageFile, packageDest, {}, function(err, result) {
      cb(err, result);
    });
  },

  findPackage: function(details, cb) {
    var packagePath = path.join('C:/aqua-workspace/aqua-cli-new', details.packageName);
    var packageDest = path.join(process.cwd(), details.targetDir, details.packageName + '-copy');

    console.log('Copying %s to %s', packagePath, packageDest);
    fsx.copy(packagePath, packageDest, function(err){
      if (err) console.log(err);
    });
  },

  renameFolder: function(src, dest, warn, cb) {
    if (warn) {
      if (fs.existsSync(dest)) {
        cb("Folder/File already exists");
      }
    }
    fs.rename(src, dest, function (err) {
      cb(null, "done");
    });
  }
};
