var readStructure = require('./readStructure');

readStructure(process.argv[2], function(err, res) {
    if(err) {
        throw err;
    }
    console.log(res);
});