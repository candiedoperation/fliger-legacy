/*
    Fliger
    Copyright (C) 2021  Atheesh  Thirumalairajan
    ../LICENSE
*/

const fs_plugin = require("./fs-search/fs_index");
const fs_dir_plugin = require("./fs-search/fs_dir_index");
const app_search_plugin = require("./desktop-integration/desktop_index");
const calc_plugin = require("./calculator/calc-index");
const wiki_plugin = require("./mediawiki-integration/wiki-index");

function automate(query_string, target_window, callback) {
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
    });

    const settings_promise = new Promise((resolve, reject) => {
        if (query_string.toLowerCase().startsWith("fl")) {
            resolve([
                {
                    fliger_title: "About Fliger"
                }
            ]);
        } else {
            resolve(false);
        }
    });

    const wiki_promise = new Promise((resolve, reject) => {
        wiki_plugin(query_string, (err, query_suggestions) => {
            if (err) { reject(false) };
            resolve(query_suggestions);
        });
    }).then((plugin_suggestions, rejection) => {
        if(rejection) { console.log(rejection) }
        console.log(plugin_suggestions);
        target_window.webContents.send("take_query_suggestions", {
            refresh_list: false,
            data: [{ category: "Wikipedia", matches: plugin_suggestions }]
        });
    })

    const fliger_query_promise = [fs_promise, fs_dir_promise, apps_promise, calculator_promise, settings_promise];

    Promise.all(fliger_query_promise).then((plugin_suggestions) => {
        var suggestions = {
            refresh_list: true,
            data: []
        };

        suggestions.data.push(
            { category: "Folders", matches: plugin_suggestions[1] },
            { category: "Files", matches: plugin_suggestions[0] },
            { category: "Apps", matches: plugin_suggestions[2] },
        );

        if (plugin_suggestions[3]) {
            suggestions.data.push({ category: "Calculator", matches: plugin_suggestions[3] });
        }

        if (plugin_suggestions[4]) {
            suggestions.data.push({ category: "Fliger", matches: plugin_suggestions[4] });
        }

        if (plugin_suggestions[5]) {
            suggestions.data.push({ category: "Wikipedia", matches: plugin_suggestions[5] });
        }

        callback(suggestions);
    })
}

module.exports = { automate, fs_plugin, fs_dir_plugin, app_search_plugin, calc_plugin };