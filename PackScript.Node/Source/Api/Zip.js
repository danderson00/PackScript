(function() {
    require('node-zip');
    var fs = require('fs');

    Pack.api.Zip = {
        archive: function(to, files) {
            var zip = new JSZip();
            
            for (var file in files)
                if (files.hasOwnProperty(file))
                    zip.file(file, Pack.api.Files.getFileContents(files[file]));
            
            fs.writeFileSync(to, zip.generate({ base64: false, compression: 'DEFLATE' }), 'binary');
        }
    };
})();