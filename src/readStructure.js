var fs = require('fs');
var path = require('path');

module.exports = readStructure;

function readStructure(root, callback) {
    var tasks = [root];
    
    collect({
        filenames: [],
        dirnames: [
            path.resolve(root)
        ]
    }, callback);
    
    function collect(structure, callback) {
        if (!tasks.length) {
            return callback(null, structure);
        }
        
        var dir = tasks.shift();
        
        readDir(dir, function(err, struct) {
            if (err) {
                return callback(err);
            }
            pushAll(structure.filenames, struct.files);
            pushAll(structure.dirnames, struct.dirs);
            pushAll(tasks, struct.dirs);
            collect(structure, callback);
        });
    }
    
    function readDir(dir, callback) {
        fs.readdir(dir, function(err, names) {
            if (err) {
                return callback(err);
            }
            
            names = names.sort();
            
            var result = {
                files: [],
                dirs: [],
                elementsCount: function() {
                    return this.files.length + this.dirs.length;
                },
                add: function(file, stat) {
                    if (stat.isFile()) {
                        this.files.push(file);
                    } else if (stat.isDirectory()) {
                        this.dirs.push(file);
                    }
                    return this.elementsCount();
                }
            };
            
            if (names.length) {
                names.forEach(function (name) {
                    var file = path.resolve(dir, name);
                    fs.stat(file, function (err, stat) {
                        if (err) {
                            return callback(err);
                        }

                        if (names.length === result.add(file, stat)) {
                            callback(null, result);
                        }
                    });
                });
                
            } else {
                callback(null, result);
            }
            
        });
    }
    
    function pushAll(collection, array) {
        Array.prototype.push.apply(collection, array);
    }
}