/*
    Fliger
    Copyright (C) 2021  Atheesh  Thirumalairajan
    ../../LICENSE
*/

const FlexSearch = require("flexsearch");
const preffered_indexes = require("./preffered_index_paths")[0];
const glob = require("glob");
const fs_path = require("path");
const fs = require("fs");
const index_db_path = fs_path.join(__dirname, "..", "..", "index_db");

var index = FlexSearch.create({
    doc: {
        id: "id",
        field: "path_name"
    }
});

function index_paths(src, glob_wildcard, index_export_path, callback) {
    var paths = [];
    glob(src + glob_wildcard, (err, res) => {
        if (err) {
            console.log('Error: Main Path Indexing Failed', err);
        } else {
            res.forEach((path) => {
                if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
                    var autoIndex = paths.length;

                    if(paths.length != 0) {
                        autoIndex = ((paths[paths.length - 1].id) + 1);
                    }

                    paths.push({
                        id: autoIndex,
                        path_location: path.toString(),
                        path_name: path.substr(path.lastIndexOf("/") + 1)
                    });
                }
            })

            index.add(paths);

            fs.writeFile(fs_path.join(index_db_path, index_export_path), index.export(), { flag: "w" }, (err) => {
                if (err) {
                    callback(err);
                }

                console.log("Directory Path Indexing Complete")
                callback(false, index.search({ query: query_string, limit: 15 }));
            })
        }
    });
};

function initializeSearch(query_string, callback) {
    if (!fs.existsSync(fs_path.join(index_db_path, preffered_indexes.exports_dir_to))) {
        index_paths(preffered_indexes.path_url, preffered_indexes.glob_wildcard, preffered_indexes.exports_dir_to, callback)
    } else {
        fs.readFile(fs_path.join(index_db_path, preffered_indexes.exports_dir_to), (err, file_buffer) => {
            if (err) {
                callback(err);
            } else {
                index.import(file_buffer);
                callback(false, index.search({ query: query_string, limit: 20 }));
            }
        });
    }
}

module.exports = initializeSearch;