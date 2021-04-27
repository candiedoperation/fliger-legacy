const glob = require("glob");
const fs = require("fs");

index_desktop_files = (callback) => {
    const global_app_path = "/usr/share/applications/";

    glob(global_app_path + "*.desktop", (err, applications) => {
        if (err) throw err; //callback

        var current_iterating_file = 0;
        var desktop_data_index = [];

        parse_desktop_files = (file_url) => {
            fs.readFile(file_url, "utf8", (err, file_buffer) => {
                var parsed_desktop_entry = file_buffer.split("\n");

                const display_boolean = parsed_desktop_entry.find((entry) => { return entry.startsWith("NoDisplay=") });

                if (!display_boolean == true) {
                    const app_name = parsed_desktop_entry.find((entry) => { return entry.startsWith("Name=") });
                    const app_icon = parsed_desktop_entry.find((entry) => { return entry.startsWith("Icon=") });
                    const app_exec = parsed_desktop_entry.find((entry) => { return entry.startsWith("Exec=") });
                    const preffered_icon_paths = ['/usr/share/icons/hicolor/']
                    console.log({ name: app_name, icon: app_icon, exec: app_exec });

                    glob(preffered_icon_paths + "**/anydesk.*", (err, match_app_icons) => {
                        if (err) throw err;
                        console.log(match_app_icons);
                    })
                } else {
                    console.log(parsed_desktop_entry.find((entry) => { return entry.startsWith("Name=") }).substr(5) + " omitted")
                }

                if ((current_iterating_file + 1) <= (applications.length - 1)) {
                    current_iterating_file++;
                    parse_desktop_files(applications[current_iterating_file]);
                } else {
                    //index the fs
                    //Directly use callback here!
                }
            });
        }

        parse_desktop_files(applications[current_iterating_file]);
    })

}

index_desktop_files();