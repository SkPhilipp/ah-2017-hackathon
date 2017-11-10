var spacing = 50;
var ritten = 7;
var rackSpacing = {x: 3.2 * spacing, z: 4 * spacing};
var outlines = [];
var outlined = [];
var crates = [];
var racks = [];
var rackConfig = {
    LEFT_BACK: {
        x: -rackSpacing.x,
        z: rackSpacing.z,
        mirrored: false
    },
    LEFT_FRONT: {
        x: rackSpacing.x,
        z: rackSpacing.z,
        mirrored: false
    },
    RIGHT_BACK: {
        x: -rackSpacing.x,
        z: -rackSpacing.z,
        mirrored: true
    },
    RIGHT_FRONT: {
        x: rackSpacing.x,
        z: -rackSpacing.z,
        mirrored: true
    }
};

var demoRackConfig = rackConfig["LEFT_FRONT"];
var demoOffsets = [0, 0, 0, 0, 0];
var demoShelves = [
    [],
    [],
    [],
    [],
    []
];

function rand(min, max) {
    return Math.floor(Math.random() * max) + min;
}

function createModelDefinition(type, small, highlight) {
    return {
        outline: new THREE.MeshBasicMaterial({color: highlight, side: THREE.BackSide}),
        texture: new THREE.TextureLoader().load('textures/type/' + type + '.jpg'),
        size: {
            x: spacing * (small ? (0.7 / 3) : 0.7),
            y: spacing * 0.6,
            z: spacing * 0.7
        }
    }
}

function randBox() {
    var boxes = ["brood", "bulk", "diepvries", "klapkrat", "koelbox", "nfchoudbaar", "nfckoel", "attas"];
    return models[boxes[rand(0, boxes.length - 1)]];
}

var models = {

    brood: createModelDefinition('brood', true, 0x00ff00),
    bulk: createModelDefinition('bulk', false, 0x0000ff),
    diepvries: createModelDefinition('diepvries', true, 0x0000ff),
    klapkrat: createModelDefinition('klapkrat', false, 0x0000ff),
    koelbox: createModelDefinition('koelbox', false, 0xff0000),
    nfchoudbaar: createModelDefinition('nfchoudbaar', true, 0x00ff00),
    nfckoel: createModelDefinition('nfckoel', true, 0x00ff00),
    attas: createModelDefinition('attas', true, 0x00ff00),

    background: {
        texture: new THREE.TextureLoader().load('textures/background.jpg'),
        size: {
            x: spacing * 6,
            y: spacing * 5.5,
            z: 2
        }
    },
    bar: {
        texture: new THREE.TextureLoader().load('textures/bar.jpg'),
        size: {
            x: spacing * 6,
            y: 2,
            z: spacing
        }
    },
    sidebar: {
        texture: new THREE.TextureLoader().load('textures/sidebar.jpg'),
        size: {
            x: 2,
            y: spacing * 5.5,
            z: spacing
        }
    }
};

function addModel(model) {
    var geometry = new THREE.BoxBufferGeometry(model.size.x, model.size.y, model.size.z);
    var material = new THREE.MeshBasicMaterial({map: model.texture});
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    crates.push(mesh);
    mesh._model = model;
    mesh._zana = {
        "tripNumber": rand(1, ritten),
        "packageType": "0.5"
    };
    return mesh;
}

function addRack(config) {
    var rack = {bars: []};

    rack.sidebarLeft = addModel(models.sidebar);
    rack.sidebarLeft.position.setX(-3 * spacing);
    rack.sidebarLeft.position.setY(0.75 * spacing);

    rack.sidebarRight = addModel(models.sidebar);
    rack.sidebarRight.position.setX(3 * spacing);
    rack.sidebarRight.position.setY(0.75 * spacing);

    rack.background = addModel(models.background);
    rack.background.position.setZ((config.mirrored ? -1 : 1) * spacing * 0.5);
    rack.background.position.setY(spacing * 0.75);

    for (var y = -1.5; y <= 2.5; y++) {
        var bar = addModel(models.bar);
        bar.position.setY((y - 0.5) * spacing);
        rack.bars.push(bar);
    }
    var finalBar = addModel(models.bar);
    finalBar.position.setY(3.5 * spacing);
    rack.bars.push(finalBar);

    for (var i in rack.bars) {
        var bar = rack.bars[i];
        bar.position.setX(bar.position.x + config.x);
        bar.position.setZ(bar.position.z + config.z);
    }
    rack.sidebarLeft.position.setX(rack.sidebarLeft.position.x + config.x);
    rack.sidebarLeft.position.setZ(rack.sidebarLeft.position.z + config.z);
    rack.sidebarRight.position.setX(rack.sidebarRight.position.x + config.x);
    rack.sidebarRight.position.setZ(rack.sidebarRight.position.z + config.z);
    rack.background.position.setX(rack.background.position.x + config.x);
    rack.background.position.setZ(rack.background.position.z + config.z);
    rack._config = config;

    racks.push(rack);
    return rack;
}

function fillRack(config) {
    for (var y = -1.5; y <= 2.5; y++) {
        var rowOffset = -2.5 * spacing;
        for (var x = -2.5; x <= 2.5; x++) {
            var crate = addModel(randBox());
            crate._config = config;
            crate.position.setX(rowOffset + (crate.geometry.parameters.width / 2));
            crate.position.setY(y * spacing);
            crate.position.setY(crate.position.y - 10);
            crate.position.setX(crate.position.x + config.x);
            crate.position.setZ(crate.position.z + config.z);
            rowOffset = rowOffset + crate.geometry.parameters.width + (0.2 * spacing);
        }
    }
}

for (var key in rackConfig) {
    if (rackConfig.hasOwnProperty(key)) {
        var rack = rackConfig[key];
        addRack(rack);
        if (key !== "LEFT_FRONT") {
            fillRack(rack);
        }
    }
}

function addOutline(crate) {
    var outlineMesh = new THREE.Mesh(crate.geometry, crate._model.outline);
    outlineMesh.position.setX(crate.position.x);
    outlineMesh.position.setY(crate.position.y);
    crate.position.setZ(crate.position.z + (crate._config.mirrored ? 30 : -30));
    outlineMesh.position.setZ(crate.position.z);
    outlineMesh.scale.multiplyScalar(1.15);
    scene.add(outlineMesh);
    outlines.push(outlineMesh);
    outlined.push(crate);
}

function removeOutlines() {
    for (var i in outlines) {
        scene.remove(outlines[i]);
    }
    outlines = [];
    for (var i in outlined) {
        var crate = outlined[i];
        crate.position.setZ(crate.position.z - (crate._config.mirrored ? 30 : -30));
        scene.remove(crate);
    }
    outlined = [];
}

function rit(index) {
    removeOutlines();
    for (var i in crates) {
        var crate = crates[i];
        if (crate._zana.tripNumber === index) {
            if (crate._model !== models.background
                && crate._model !== models.sidebar
                && crate._model !== models.bar) {
                addOutline(crate);
            }
        }
    }
}

var pushX = 125;
var pushY = 120;

function pushCrate(modelName, y) {
    var crate = addModel(models[modelName]);
    crate._config = demoRackConfig;
    crate.position.setX(pushX - demoOffsets[y] - (crate.geometry.parameters.width / 2));
    crate.position.setY(pushY + demoShelves.length - y * spacing);
    crate.position.setY(crate.position.y - 10);
    crate.position.setX(crate.position.x + demoRackConfig.x);
    crate.position.setZ(crate.position.z + demoRackConfig.z);
    demoOffsets[y] = demoOffsets[y] + crate.geometry.parameters.width + (0.2 * spacing);
    demoShelves[y].push(crate);
}

setInterval(function () {

    $.ajax({
        type: "GET",
        url: "http://-------------------------------/v0/deliverytrolleys",
        contentType: "application/json; charset=utf-8",
        headers: {
            "x-jwt": "------------------------------------"
        },
        dataType: "json",
        success: function (data) {
            // {
            //     "tripNumber": 6,
            //     "position": 2,
            //     "packageType": "diepvries"
            // },
            // {
            //     "tripNumber": 5,
            //     "position": 3,
            //     "packageType": "diepvries"
            // }
            var shelves = data[0]["deliveryTrolleyShelves"];
            console.log("Got results", shelves);
            for (var i in shelves) {
                var shelf = shelves[i]["deliveryPackagesInTrolley"];
                var demoShelf = demoShelves[i];
                for (var si in shelf) {
                    var entry = shelf[si];
                    if (demoShelf.length <= si) {
                        pushCrate(entry.packageType, i);
                    }
                }
            }
        }
    });

}, 1000);

// -- backup procedure

var backup = [
    ["diepvries", "diepvries", "diepvries", "koelbox", "koelbox", "koelbox", "koelbox"],
    ["klapkrat", "klapkrat", "klapkrat", "klapkrat", "klapkrat"],
    ["klapkrat", "nfchoudbaar", "nfchoudbaar", "nfchoudbaar", "klapkrat", "bulk", "bulk"],
    ["brood", "nfchoudbaar", "nfchoudbaar", "nfchoudbaar", "klapkrat", "brood", "bulk"],
    ["koelbox", "koelbox", "nfckoel", "nfckoel", "nfckoel", "nfckoel", "nfckoel", "koelbox"]
];

var backupRow = 0;
var backupColumn = 0;
var backupDone = false;
var backupNext = null;
function backupPushNext() {
    var columns = backup[backupRow];
    pushCrate(columns[backupColumn], backupRow);
    backupColumn++;
    if (backupColumn === columns.length) {
        backupRow++;
        backupColumn = 0;
        if (backupRow === backup.length) {
            backupDone = true;
        }
    }
    if (backupDone !== true) {
        backupNext = setTimeout(backupPushNext, (Math.random() * 1000) + 1000);
    }
}

function toggleBackup() {
    if(backupNext !== null) {
        $("#backup").html("X?");
        clearTimeout(backupNext);
        backupNext = null;
    }
    else {
        $("#backup").html("X!");
        backupNext = setTimeout(function () {
            backupPushNext();
        }, (Math.random() * 1000) + 1000);
    }
}
