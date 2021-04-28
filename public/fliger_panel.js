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
            if (suggestion.category == "Files" || suggestion.category == "Folders") {
                $(".fliger-suggestion-list").append(`<a onmouseover="hovered_suggestion(this);" onclick="clicked_suggestion(this);" data-preview='${JSON.stringify(match)}' data-suggtype='${suggestion.category}' class="list-group-item list-group-item-action text-truncate">${match.path_name}</a>`);
            } else if (suggestion.category == "Apps") {
                $(".fliger-suggestion-list").append(`<a onmouseover="hovered_suggestion(this);" onclick="clicked_suggestion(this);" data-preview='${JSON.stringify(match)}' data-suggtype='${suggestion.category}' class="list-group-item list-group-item-action text-truncate">${match.app_name}</a>`);
            } else if (suggestion.category == "Calculator") {
                $(".fliger-suggestion-list").append(`<a onmouseover="hovered_suggestion(this);" onclick="clicked_suggestion(this);" data-preview='${JSON.stringify(match)}' data-suggtype='${suggestion.category}' class="list-group-item list-group-item-action text-truncate">${match.calc_result}</a>`);
            }
        })
    });
});

window.ipcRenderer.on("clear_suggestion_preview", (event, message) => {
    change_preview_panel("watermark-panel");
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
            change_preview_panel("simple-preview-panel", "images/folder.svg", preview_data.path_name, preview_data.path_location);
            break;
        }

        case "Files": {
            getFileIcon(preview_data.path_name.substr(preview_data.path_name.lastIndexOf(".") + 1), preview_data.path_location, (file_icon, attrs) => {
                if (attrs.isImg === true) {
                    if (attrs.img_100) {
                        change_preview_panel("image-preview-panel", file_icon, preview_data.path_name, preview_data.path_location);
                    } else {
                        change_preview_panel("simple-preview-panel", file_icon, preview_data.path_name, preview_data.path_location)
                    }
                } else if (attrs.isVid === true) {
                    change_preview_panel("video-preview-panel", file_icon, preview_data.path_name, preview_data.path_location);
                }
            });
            break;
        }

        case "Apps": {
            if (preview_data.app_icon.startsWith("/")) {
                preview_data.app_icon = "file://" + preview_data.app_icon;
            }

            change_preview_panel("simple-preview-panel", preview_data.app_icon, preview_data.app_name, "Click the suggestion to launch the Application");
            break;
        }

        case "Calculator": {
            change_preview_panel("simple-preview-panel", "images/calculator.svg", preview_data.calc_result, preview_data.calc_subtext);
        }
    }
}

function clicked_suggestion(suggestion) {
    var suggestion_type = $(suggestion).data("suggtype");
    var suggestion_data = $(suggestion).data("preview");

    if (suggestion_type == "Apps") {
        window.ipcRenderer.send("exec-term-command", suggestion_data.app_exec);
    } else if (suggestion_type == "Files" || suggestion_type == "Folders") {
        window.ipcRenderer.send("open-default-app", suggestion_data.path_location);
    } else if (suggestion_type == "Calculator") {
        window.electronClipboard.writeText($(suggestion).text());
        showToast("Copied result to clipboard");

        $("#info-toast").on("hidden.bs.toast", () => {
            window.ipcRenderer.send("fliger-suggestion-default", { src: "fliger_panel.js" });
        });
    }
}

function change_preview_panel(panel_type, source, text, subtext) {
    $(".fliger-video-preview").find("video").attr("src", "");
    $(".fliger-image-preview").find("img").attr("src", "");

    switch (panel_type) {
        case "watermark-panel": {
            $(".fliger-preview-template").addClass("d-none").removeClass("d-flex");
            $(".fliger-preview-watermark").addClass("d-flex").removeClass("d-none");

            $(".fliger-preview-watermark").find(".fliger-preview-text").text(text);
            $(".fliger-preview-watermark").find(".fliger-preview-subtext").text(subtext);
            break;
        }

        case "simple-preview-panel": {
            $(".fliger-preview-template").addClass("d-none").removeClass("d-flex");
            $(".fliger-preview-simple").addClass("d-flex").removeClass("d-none");

            $(".fliger-preview-simple").find("img").attr("src", source);
            $(".fliger-preview-simple").find(".fliger-preview-text").text(text);
            $(".fliger-preview-simple").find(".fliger-preview-subtext").text(subtext);
            break;
        }

        case "video-preview-panel": {
            $(".fliger-preview-template").addClass("d-none").removeClass("d-flex");
            $(".fliger-video-preview").addClass("d-flex").removeClass("d-none");

            $(".fliger-video-preview").find("video").attr("src", source);
            $(".fliger-video-preview").find(".fliger-preview-text").text(text);
            $(".fliger-video-preview").find(".fliger-preview-subtext").text(subtext);
            break;
        }

        case "image-preview-panel": {
            $(".fliger-preview-template").addClass("d-none").removeClass("d-flex");
            $(".fliger-image-preview").addClass("d-flex").removeClass("d-none");

            $(".fliger-image-preview").find("img").attr("src", source);
            $(".fliger-image-preview").find(".fliger-preview-text").text(text);
            $(".fliger-image-preview").find(".fliger-preview-subtext").text(subtext);
            break;
        }
    }
}

function showToast(message) {
    $("#info-toast").find(".toast-header").text(message);
    $("#info-toast").toast('show');
}