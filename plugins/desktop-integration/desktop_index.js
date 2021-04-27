const glob = require("glob");
const fs = require("fs");
const path = require("path");

index_desktop_files = (callback) => {
    const global_app_path = "/usr/share/applications/";

    glob(global_app_path + "*.desktop", (err, applications) => {
        if (err) throw err; //callback

        var current_iterating_file = 0;
        var desktop_data_index = [];

        parse_desktop_files = (file_url) => {
            increment_loop = (index_update) => {
                desktop_data_index.push(index_update);

                if ((current_iterating_file + 1) <= (applications.length - 1)) {
                    current_iterating_file++;
                    parse_desktop_files(applications[current_iterating_file]);
                } else {
                    //index the fs
                    //Directly use callback here!
                }
            }

            fs.readFile(file_url, "utf8", (err, file_buffer) => {
                var parsed_desktop_entry = file_buffer.split("\n");

                const display_boolean = parsed_desktop_entry.find((entry) => { return entry.startsWith("NoDisplay=") });

                if (!display_boolean == true) {
                    const app_name = parsed_desktop_entry.find((entry) => { return entry.startsWith("Name=") }).substr(5);
                    const app_icon = parsed_desktop_entry.find((entry) => { return entry.startsWith("Icon=") }).substr(5);
                    const app_exec = parsed_desktop_entry.find((entry) => { return entry.startsWith("Exec=") }).substr(5);

                    const preffered_icon_path = '/usr/share/icons/hicolor/';

                    console.log("Application Information:");
                    console.log({ name: app_name, icon: app_icon, exec: app_exec });
                    console.log();

                    if (app_icon === path.basename(app_icon)) { //Check if Icon is aldready a hardcoded path
                        glob(preffered_icon_path + "**/" + app_icon + ".*", (err, match_app_icons) => {
                            if (err) throw err;

                            console.log("Available Application Icons:");

                            if (!match_app_icons.length == 0) { //Check if Icon exists in the third-party folder 'hicolor'
                                console.log(match_app_icons);
                                console.log();

                                //Prioritizing Icon Sizes
                                if (match_app_icons.find((icon_size) => { return icon_size.includes("scalable") })) {
                                    console.log("Scalable icon exists for the app in " + match_app_icons.find((icon_size) => { return icon_size.includes("scalable") }));
                                } else if (match_app_icons.find((icon_size) => { return icon_size.includes("256x256") })) {
                                    console.log("256x256 Icon exists for the app")
                                } else if (match_app_icons.find((icon_size) => { return icon_size.includes("128x128") })) {
                                    console.log("128x128 Icon exists for the app")
                                } else if (match_app_icons.find((icon_size) => { return icon_size.includes("64x64") })) {
                                    console.log("64x64 Icon exists for the app")
                                } else {
                                    console.log("Fallback icon from list " + match_app_icons[0] + " is used");
                                }

                                console.log();
                                increment_loop();

                            } else {
                                fs.readFile("/usr/share/icons/default/index.theme", "utf-8", (err, default_theme) => {
                                    if (err) throw err;

                                    default_theme = default_theme.split("\n");
                                    const fparty_icon_search_path = "/usr/share/icons/" + default_theme.find((theme_settings) => { return theme_settings.startsWith("Inherits=") }).substr(9) + "/";

                                    console.log("Initiating Secondary Search from: " + fparty_icon_search_path);;
                                    console.log();

                                    glob(fparty_icon_search_path + "**/" + app_icon + ".*", (err, matched_icons) => {
                                        if (err) throw err;

                                        if (!matched_icons.length == 0) {
                                            console.log(matched_icons);
                                            console.log();

                                            if (matched_icons.find((icon_size) => { return icon_size.includes("scalable") })) {
                                                console.log("Scalable icon exists for the app in " + matched_icons.find((icon_size) => { return icon_size.includes("scalable") }));
                                            } else if (matched_icons.find((icon_size) => { return icon_size.includes("128") })) {
                                                console.log("128x128 icon exists for the app in " + match_app_icons.find((icon_size) => { return icon_size.includes("128") }));
                                            } else {
                                                console.log("Fallback icon from list " + matched_icons[0] + " is used");
                                            }

                                            console.log();
                                            increment_loop();
                                        } else {
                                            console.log("Using Fliger Default App Icon: images/mime/application-x-executable.svg");
                                            console.log();

                                            increment_loop();
                                        }
                                    })
                                })
                            }
                        })
                    } else {
                        //Icon aldready refers to a path
                        console.log("Using hardcoded icon path: " + app_icon);
                        console.log();

                        increment_loop();
                    }
                } else {
                    console.log("Application Information:");
                    console.log(parsed_desktop_entry.find((entry) => { return entry.startsWith("Name=") }).substr(5) + " omitted")
                    console.log();

                    increment_loop();
                }
            });
        }
        parse_desktop_files(applications[current_iterating_file]);
    })
}

index_desktop_files();