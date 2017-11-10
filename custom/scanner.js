var shelfIndex = 1;
var shelves = {
    "1337": {index: 1},
    "13373": {index: 2},
    "133737": {index: 3},
    "1337373": {index: 4},
    "13373737": {index: 5}
};

function submit(barcode) {
    $.ajax({
        type: "POST",
        url: "http://"-----------------------------------/v0/deliverypackage",
        headers: {
            "x-jwt": "-----------------------------------"
        },
        data: JSON.stringify({
            trolleyId: 1,
            shelfId: shelfIndex,
            packagingId: barcode
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "json"
    });
}

function handle(barcode) {
    var shelf = shelves[barcode];
    if (shelf !== undefined) {
        shelfIndex = shelf.index;
    }
    else {
        submit(barcode);
    }
}

$(document).ready(function () {
    var consoleElement = document.getElementById('console');
    var ws = new WebSocket("ws://127.0.0.1:12345/");
    ws.onmessage = function (event) {
        console.log(event);
        var match = /\((\d+)/g.exec(event.data);
        if (match !== null) {
            var barcode = match[1];
            console.log(barcode);
            handle(barcode);
        }
        else {
            console.log("bruh")
        }
    };
    ws.onclose = function () {
        consoleElement.innerHTML = "[D]";
    };
    ws.onopen = function () {
        consoleElement.innerHTML = "[C]";
    };
});
