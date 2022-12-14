/*
    Fliger
    Copyright (C) 2021  Atheesh  Thirumalairajan
    ../LICENSE
*/

$(() => {
    $("#fl-launchBox").focus();
});

$("#fl-launchBox").on("input", () => {
    if (!$("#fl-launchBox").val().trim() == "") {
        window.ipcRenderer.send("display_suggestions", true);
        window.ipcRenderer.send("fliger_query_string", $("#fl-launchBox").val());
    } else {
        window.ipcRenderer.send("display_suggestions", false);
    }
});

window.ipcRenderer.on("ping", (event, message) => {
    console.log(message);
});

window.ipcRenderer.on("isQueryEmpty", (event, message) => {
    if ($("#fl-launchBox").val().trim() == "") {
        window.ipcRenderer.send("isQueryEmpty", true);
    } else {
        window.ipcRenderer.send("isQueryEmpty", false);
    }
});

window.ipcRenderer.on("clear_inpur_query", (event, message) => {
    $("#fl-launchBox").val("");
});