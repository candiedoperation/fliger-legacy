window.ipcRenderer.on("ping", (event, message) => {
    console.log(message);
});

window.ipcRenderer.on("take_query_suggestions", (event, suggestions) => {
    $(".fliger-suggestion-list").empty();
    suggestions.forEach((suggestion) => {
        $(".fliger-suggestion-list").append(`<span class="text-muted ml-2">${suggestion.category}</span>`);
        /*$(".fliger-suggestion-list").append(`<a href="#" onmouseover="hovered_suggestion(this);" data-preview='${JSON.stringify(suggestion.matches[0])}' class="list-group-item list-group-item-action active">${suggestion.matches[0].path_name}</a>`);
        suggestion.matches.shift();*/
        suggestion.matches.forEach((match) => {
            if(suggestion.category == "Files" || suggestion.category == "Folders") {
                $(".fliger-suggestion-list").append(`<a onmouseover="hovered_suggestion(this);" data-preview='${JSON.stringify(match)}' data-suggtype='${suggestion.category}' class="list-group-item list-group-item-action text-truncate">${match.path_name}</a>`);
            } else if(suggestion.category == "Apps") {
                $(".fliger-suggestion-list").append(`<a onmouseover="hovered_suggestion(this);" data-preview='${JSON.stringify(match)}' data-suggtype='${suggestion.category}' class="list-group-item list-group-item-action text-truncate">${match.app_name}</a>`);
            }
        })
    });
});

window.ipcRenderer.on("clear_suggestion_preview", (event, message) => {
    $(".fliger-preview-watermark").removeClass("d-none").addClass("d-flex"); //Show Watermark Panel

    $(".fliger-preview-simple").removeClass("d-flex").addClass("d-none"); //Hide All Other Panels
    $(".fliger-preview-simple").find("img").attr("src", "");
    $(".fliger-preview-simple").find("video").attr("src", "");
});

function hovered_suggestion(suggestion) {
    update_preview_panel($(suggestion).data("preview"), $(suggestion).data("suggtype"));
}

function getFileIcon(file_extension, suggestion_url, callback) {
    var mime_identifier = window.mimetypes.lookup(file_extension);

    if (mime_identifier != false) {
        mime_identifier = mime_identifier.replace("/", "-");

        if (mime_identifier.includes("mp4")) {
            callback(("file://" + suggestion_url), { isVid: true });
        } else if (mime_identifier.includes("image")) {
            callback(("file://" + suggestion_url), { isImg: true, img_100: true });
        } else {
            console.log(mime_identifier);
            $.ajax({
                url: "images/mime/" + mime_identifier + ".svg",
                type: "HEAD",
                success: () => { callback(("images/mime/" + mime_identifier + ".svg"), { isImg: true, img_100: false }) },
                error: () => { callback(("images/mime/application-x-generic.svg"), { isImg: true, img_100: false }) },
            });
        }
    } else {
        callback("images/mime/application-x-generic.svg");
    }
}

function update_preview_panel(preview_data, suggestion_type) {
    switch (suggestion_type) {
        case "Folders": {
            $(".fliger-preview-simple").find("img").attr("src", "images/folder.svg");
            $(".fliger-preview-simple").find("img").removeClass("d-none w-100");

            $(".fliger-preview-simple").find("video").attr("src", "");
            $(".fliger-preview-simple").find("video").addClass("d-none");

            $(".fliger-preview-simple").find(".fliger-preview-text").text(preview_data.path_name);
            $(".fliger-preview-simple").find(".fliger-preview-subtext").text(preview_data.path_location);

            $(".fliger-preview-watermark").removeClass("d-flex").addClass("d-none");
            $(".fliger-preview-simple").removeClass("d-none").addClass("d-flex");
            break;
        }

        case "Files": {
            getFileIcon(preview_data.path_name.substr(preview_data.path_name.lastIndexOf(".") + 1), preview_data.path_location, (file_icon, attrs) => {
                if (attrs.isImg === true) {
                    $(".fliger-preview-simple").find("img").removeClass("d-none");

                    $(".fliger-preview-simple").find("video").attr("src", "");
                    $(".fliger-preview-simple").find("video").addClass("d-none");

                    if (attrs.img_100) {
                        $(".fliger-preview-simple").find("img").addClass("w-100");
                    } else {
                        $(".fliger-preview-simple").find("img").removeClass("w-100");
                    }

                    $(".fliger-preview-simple").find("img").attr("src", file_icon);
                } else if (attrs.isVid === true) {
                    $(".fliger-preview-simple").find("img").addClass("d-none");
                    $(".fliger-preview-simple").find("img").attr("src", "");

                    $(".fliger-preview-simple").find("video").removeClass("d-none");
                    $(".fliger-preview-simple").find("video").attr("src", file_icon);
                }

                $(".fliger-preview-simple").find(".fliger-preview-text").text(preview_data.path_name);
                $(".fliger-preview-simple").find(".fliger-preview-subtext").text(preview_data.path_location);
                $(".fliger-preview-watermark").removeClass("d-flex").addClass("d-none");
                $(".fliger-preview-simple").removeClass("d-none").addClass("d-flex");
            });
            break;
        }

        case "Apps": {
            if (preview_data.app_icon.startsWith("/")) {
                preview_data.app_icon = "file://" + preview_data.app_icon;
            }

            $(".fliger-preview-simple").find("img").attr("src", preview_data.app_icon);
            $(".fliger-preview-simple").find(".fliger-preview-text").text(preview_data.app_name);
            $(".fliger-preview-simple").find(".fliger-preview-subtext").text("Click the suggestion to launch the Application");

            change_preview_panel("simple-preview-panel");
            break;
        }
    }
}

function change_preview_panel(panel_type) {
    switch(panel_type) {
        case "watermark-panel": {
            $(".fliger-preview-template").addClass("d-none").removeClass("d-flex");
            $(".fliger-preview-watermark").addClass("d-flex").removeClass("d-none");
            break;
        }

        case "simple-preview-panel": {
            $(".fliger-preview-template").addClass("d-none").removeClass("d-flex");
            $(".fliger-preview-simple").addClass("d-flex").removeClass("d-none");
            break;            
        }
    }
}