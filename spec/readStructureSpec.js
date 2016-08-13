describe('Read Structure', function() {

    var rewire = require('rewire');
    var readStructure = rewire('../src/readStructure');
    var path = require('path');
    
    readStructure.__set__('fs', {
        readdir: function(dir, callback) {
            var result = [];
            dir = dir.split(path.sep).pop();
            switch(dir) {
                case 'foo':
                    result = ['bar', 'f2.txt', 'f1.txt'];
                    break;
                case 'bar':
                    result = ['baz', 'bar1.txt', 'bar2.txt'];
                    break;
                case 'baz':
                    result = [];
                    break;
                default:
                    return callback(new Error('Error'));
            }
            callback(null, result);
        },
        stat: function(name, callback) {
            callback(null, {
                isFile: function() {
                    return name.endsWith('.txt');
                },
                isDirectory: function() {
                    return !this.isFile();
                }
            })
        }
    });
    
    it('Should fail for non existing path', function(done) {
        readStructure('fooZ', function(error, result) {
           expect(error).toBeTruthy();
           expect(result).toEqual(void 0);
           done();
        });
    });
    
    it('Should read sample structure ignoring files order', function(done) {
        readStructure('foo', function(error, result) {

            function toAbsolutePath (file) {
                return path.resolve('.', file);
            }
            
            var expectation = {
                filenames: [
                    'foo/f1.txt',
                    'foo/f2.txt',
                    'foo/bar/bar1.txt',
                    'foo/bar/bar2.txt'
                ].map(toAbsolutePath),
                dirnames: [
                    'foo',
                    'foo/bar',
                    'foo/bar/baz'
                ].map(toAbsolutePath)
            };
            
            expect(error).toEqual(null);
            expect(result).toEqual(expectation);
            done();
        });
    }); 
    
});