/*
    Fliger
    Copyright (C) 2021  Atheesh  Thirumalairajan
    ../LICENSE
*/

window.ipcRenderer.on("ping", (event, message) => {
    console.log(message);
});

window.ipcRenderer.on("take_query_suggestions", (event, suggestions) => {    suggestions.data.forEach((suggestion) => {
    suggestion.matches.forEach((match) => {
        if (suggestion.category == "Files" || suggestion.category == "Folders") {
            $(".fliger-suggestion-list").prepend(`<a onmouseover="hovered_suggestion(this);" onclick="clicked_suggestion(this);" data-preview='${JSON.stringify(match)}' data-suggtype='${suggestion.category}' class="list-group-item list-group-item-action text-truncate">${match.path_name}</a>`);
        } else if (suggestion.category == "Apps") {
            $(".fliger-suggestion-list").prepend(`<a onmouseover="hovered_suggestion(this);" onclick="clicked_suggestion(this);" data-preview='${JSON.stringify(match)}' data-suggtype='${suggestion.category}' class="list-group-item list-group-item-action text-truncate">${match.app_name}</a>`);
        } else if (suggestion.category == "Calculator") {
            $(".fliger-suggestion-list").prepend(`<a onmouseover="hovered_suggestion(this);" onclick="clicked_suggestion(this);" data-preview='${JSON.stringify(match)}' data-suggtype='${suggestion.category}' class="list-group-item list-group-item-action text-truncate">${match.calc_result}</a>`);
        } else if (suggestion.category == "Fliger") {
            $(".fliger-suggestion-list").prepend(`<a onmouseover="hovered_suggestion(this);" data-suggtype='${suggestion.category}' class="list-group-item list-group-item-action text-truncate">${match.fliger_title}</a>`);
        } else if(suggestion.category == "Wikipedia") {
            $(".fliger-suggestion-list").prepend(`<a onmouseover="hovered_suggestion(this);" onclick="clicked_suggestion(this);" data-preview='${JSON.stringify(match)}' data-suggtype='${suggestion.category}' class="list-group-item list-group-item-action text-truncate">${match.wiki_title}</a>`);
        }
    });
    $(".fliger-suggestion-list").prepend(`<span class="text-muted ml-2 fliger-suggestion-category">${suggestion.category}</span>`);
});
});

function removeCategory(options) {
    console.log($(`.fliger-suggestion-category:contains(${options.categoryName})`));
    $(`.fliger-suggestion-category:contains(${options.categoryName})`)
        .filter((categoryElement) => { console.log(categoryElement) })
        .nextUntil(".fliger-suggestion-category")
        .addBack()
        .remove();
}

function addCategory(options) {
    var newCategory = document.createElement('span');
    $(newCategory).addClass("text-muted ml-2 fliger-suggestion-category");
    $(newCategory).text(options.categoryName);

    if(options.isHighPriority) {
        $(newCategory).data("isHighPriority", true);
        $(".fliger-suggestion-list").prepend(newCategory);
    } else {
        $(newCategory).data("isHighPriority", false);
        console.log($(".fliger-suggestion-list").find("fliger-suggestion-category"));
    }
}