/*jslint node: true */
"use strict";

// Stevie's Doc Validator

var fs = require('fs'),
    path = require('path'),
    args = process.argv,
    comment_line_regexp = /^#/,
      blank_line_regexp = /^\s*$/,
       lead_line_regexp = /^([\w\.]+)\s+(.*)$/,
     attrib_line_regexp = /^\s*@\s*([\w]+)\s*=\s*(.+)\s*$/,
    statements = {};


function doTextFileLine(line, state) {
    var match,
        ref;

    if (comment_line_regexp.exec(line)) {
        return;
    }

    if (blank_line_regexp.exec(line)) {         // blank lines delimit statements
        state.current_statement = null;

    } else if (!state.current_statement) {                   // new statement
        match = attrib_line_regexp.exec(line);
        if (match && match.length === 3) {
            return;                                     // no action of attributes for the moment
        }
        match = lead_line_regexp.exec(line);
        if (!match || match.length < 3) {
            console.log("Line " + state.line_nbr + ": invalid lead line: " + line);
//            console.log("Chars 1, 2, end -1 and end: " + line.charCodeAt(0) + ", " + line.charCodeAt(1) + ", " + line.charCodeAt(line.length - 2) + ", " + line.charCodeAt(line.length -1));
        } else {
            ref = state.prefix + match[1];
            if (statements[ref]) {
                console.log("Line " + state.line_nbr + ": duplicate statement: " + ref);
            }
            statements[ref] = match[2];
            state.current_statement = match[2];
            state.count += 1;
        }
    } else {            // continuation line
        state.current_statement += " " + line.trim();
    }
}

function splitFileContent(data, prefix) {
    var lines = data.split("\r\n"),
        state = {
            current_statement: null,
            count : 0,
            prefix: prefix
        },
        i;

    for (i = 0; i < lines.length; i += 1) {
        state.line_nbr = i + 1;
        doTextFileLine(lines[i], state);
    }
    console.log(state.count + " statements (" + Object.keys(statements).length + ") in total");
}

function doTextFile(file, prefix) {
    fs.readFile(file, function (err, data) {
        console.log("validating file: " + file + " having prefix: " + prefix);
        if (err) {
            console.log(err);
        } else {
            data = data.toString('utf8');
            splitFileContent(data, prefix);
        }
    });
}

function doFile(filepath, prefix) {
    fs.stat(filepath, function (err, stats) {
        if (err) {
            console.log(err);
        } else if (stats.isDirectory()) {
            prefix = prefix + path.basename(filepath) + ".";
            fs.readdir(filepath, function (err, files) {
                var i;
                if (err) {
                    console.log(err);
                } else {
                    for (i = 0; i < files.length; i += 1) {
                        doFile(filepath + "/" + files[i], prefix);
                    }
                }
            });
        } else if (filepath.match(/\.txt$|\.statements$/)) {
            doTextFile(filepath, prefix);
        }
    });
}


args.splice(0, 2);
console.log("Starting validator script, args: " + args.length + ", working with 1st arg: " + args[0]);
doFile(args[0], "");
