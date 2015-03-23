
// Stevie's Doc Validator

var fs = require('fs'),
    args = process.argv,
    comment_line_regexp = /^#/,
      blank_line_regexp = /^\s*$/,
       lead_line_regexp = /^([\w\.]+)\s+(.*)$/,
     attrib_line_regexp = /^\s*@\s*([\w]+)\s*=\s*(.+)\s*$/,
    statements = {};


args.splice(0, 2);
console.log(args.length);
doFile(args[0], "");


function doFile(filepath, prefix) {
    console.log("reading file: " + filepath);
    fs.stat(filepath, function (err, stats) {
        if (err) {
            console.log(err);
        } else if (stats.isDirectory()) {
            fs.readdir(filepath, function (err, files) {
                var i;
                if (err) {
                    console.log(err);
                } else {
                    for (i = 0; i < files.length; i += 1) {
                        doFile(filepath + "/" + files[i], prefix + files[i] + ".");
                    }
                }
            });
        } else if (filepath.match(/\.txt$|\.statements$/)) {
            doTextFile(filepath, prefix);
        }
    });
}

function doTextFile(file, prefix) {
    fs.readFile(file, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            data = data.toString('utf8');
            splitFileContent(data);
        }
    });
}

function splitFileContent(data) {
    var lines = data.split("\r\n"),
        i,
        current_statement,
        prefix = "";

    for (i = 0; i < lines.length; i += 1) {
        current_statement = doTextFileLine(lines[i], i + 1, current_statement, prefix)
    }
    console.log(Object.keys(statements).length + " statements");
}

function doTextFileLine(line, line_nbr, current_statement, prefix) {
    var match,
        ref;

    if (comment_line_regexp.exec(line)) {
        return;

    } else if (blank_line_regexp.exec(line)) {         // blank lines delimit statements
        current_statement = null;

    } else if (!current_statement) {                   // new statement
        match = attrib_line_regexp.exec(line);
        if (match && match.length === 3) {
            return;                                     // no action of attributes for the moment
        }
        match = lead_line_regexp.exec(line);
        if (!match || match.length < 3) {
            console.log("Line " + line_nbr + ": invalid lead line: " + line );
            console.log("Chars 1, 2, end -1 and end: " + line.charCodeAt(0) + ", " + line.charCodeAt(1) + ", " + line.charCodeAt(line.length - 2) + ", " + line.charCodeAt(line.length -1));
        } else {
            ref = prefix + match[1];
            if (statements[ref]) {
                console.log("Line " + line_nbr + ": duplicate statement: " + ref);
            }
            statements[ref]   = match[2];
            current_statement = match[2];
        }
    } else {            // continuation line
        current_statement += " " + line.trim();
    }

    return current_statement;
}

