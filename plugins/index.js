const fs_plugin = require("./fs-search/fs_index");
const fs_dir_plugin = require("./fs-search/fs_dir_index");
const app_search_plugin = require("./desktop-integration/desktop_index");
const calc_plugin = require("./calculator/calc-index");

function automate(query_string, callback) {
    const apps_promise = new Promise((resolve, reject) => {
        app_search_plugin(query_string, (err, result) => {
            if (err) { reject(err); throw err; }
            resolve(result);
        })
    });

    const fs_promise = new Promise((resolve, reject) => {
        fs_plugin(query_string, (err, result) => {
            if (err) { reject(err); throw err; }
            resolve(result);
        });
    });

    const fs_dir_promise = new Promise((resolve, reject) => {
        fs_dir_plugin(query_string, (err, result) => {
            if (err) { reject(err); throw err; }
            resolve(result);
        });
    });

    const calculator_promise = new Promise((resolve, reject) => {
        calc_plugin(query_string, (err, result) => {
            if (err) {
                resolve(false);
            }

            resolve(result);
        })
    })

    const fliger_query_promise = [fs_promise, fs_dir_promise, apps_promise, calculator_promise];

    Promise.all(fliger_query_promise).then((plugin_suggestions) => {
        var suggestions = [
            { category: "Apps", matches: plugin_suggestions[2] },
            { category: "Files", matches: plugin_suggestions[0] },
            { category: "Folders", matches: plugin_suggestions[1] }
        ];

        if (plugin_suggestions[3]) {
            suggestions.unshift({ category: "Calculator", matches: plugin_suggestions[3] },);
        }

        callback(suggestions);
    })
}

module.exports = { automate, fs_plugin };