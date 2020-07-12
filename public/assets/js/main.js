const diceArray = ["1", "2", "3", "4", "5", "6"];
const plrArray = ["plRed", "plBlue", "plYellow", "plGreen"];
let plrNext = 0;
let round = 1;

function autoPlay() {
    const playerFirst = plrArray[Math.floor(Math.random() * plrArray.length)];
    plrNext = Number(Object.keys(plrArray).find(key => plrArray[key] === playerFirst));
    localStorage.removeItem('text_log');
    this.intervalGame = setInterval(this.run.bind(this), 500);
    //run();
}

function run() {
    let endGame = false;
    plrArray.forEach(function(val){
        const home = getPosByCode(val).home;
        const plrName = getPosByCode(val).name;
        let count = 0;
        $(".safe."+home).each(function() {
            count += Number($(this).children().length);
        });
        if (count == 4) {
            endGame = true;
            clearInterval(this.intervalGame);
            const msg = {
                round: round,
                type: "Win",
                detail: plrName+" win. End game!"
            };
            const localLog = localStorage.getItem('text_log');
            if (localLog) {
                let dataLog = JSON.parse(localLog);
                dataLog.push(msg);
                dataLog.sort((a, b) => (a.round < b.round) ? 1 : -1);
                document.getElementById('w3review').value = JSON.stringify(dataLog, undefined, 4);
                localStorage.setItem('text_log', JSON.stringify(dataLog));
            }
        }
    });
    // End game
    if (endGame) { return false }

    // Continue game
    const diceValue = diceArray[Math.floor(Math.random() * diceArray.length)];
    $("#dice").attr("data-chal-count", diceValue);
    const qlt = plrArray.length-1;
    const code = plrArray[plrNext]; //plrArray[1]; //
    $("#plrName").html(getPosByCode(code).name);
    $("#plrDice").html(diceValue);
    let plrIcon;
    let plrName;
    switch(code) {
        case "plRed":
            plrIcon = ".kati.rd";
            plrName = "kati rd";
            break;
        case "plBlue":
            plrIcon = ".kati.bl";
            plrName = "kati bl";
            break;
        case "plYellow":
            plrIcon = ".kati.yl";
            plrName = "kati yl";
            break;
        default:
            plrIcon = ".kati.gn";
            plrName = "kati gn";
    }
    const dataPlayerBoard = checkPlayerOnBoard(code, plrName, plrIcon);
    const dataPlayerSale = checkPlayerOnSale(code, plrName, plrIcon);
    let priority = false;
    let textLog;
    let dataPlrInfo = {
        round: round,
        player: getInfoByName(plrName).name,
        dice: diceValue
    };
    if (dataPlayerSale.length > 0) {
        const dataPlrHomeRight = findPlayerRight(dataPlayerSale, diceValue);
        if (dataPlrHomeRight) {
            priority = true;
            const dataPlrHomeMove = actMove(dataPlrHomeRight, diceValue, plrName);
            textLog = {...dataPlrInfo, ...dataPlrHomeMove };
        }
    }

    if (!priority) {
        if (dataPlayerBoard.length > 0) {
            const dataPlrBoardRight = findPlayerRight(dataPlayerBoard, diceValue);
            const dataPlrBoardMove = actMove(dataPlrBoardRight, diceValue, plrName);
            if (dataPlrBoardMove.type === "stop") {
                const dataNewJoinBoard = joinBoard(diceValue, code, plrIcon, plrName);
                textLog = {...dataPlrInfo, ...dataNewJoinBoard };
            } else {
                textLog = {...dataPlrInfo, ...dataPlrBoardMove };
            }
        } else {
            const dataStartJoinBoard = joinBoard(diceValue, code, plrIcon, plrName);
            textLog = {...dataPlrInfo, ...dataStartJoinBoard };
        }
    }

    let arrayLog = [];
    const localLog = localStorage.getItem('text_log');
    if (localLog) {
        let dataLog = JSON.parse(localLog);
        dataLog.push(textLog);
        dataLog.sort((a, b) => (a.round < b.round) ? 1 : -1);
        document.getElementById('w3review').value = JSON.stringify(dataLog, undefined, 4);
        localStorage.setItem('text_log', JSON.stringify(dataLog));
    } else {
        arrayLog.push(textLog);
        document.getElementById('w3review').value = JSON.stringify(arrayLog, undefined, 4);
        localStorage.setItem('text_log', JSON.stringify(arrayLog));
    }

    round++;
    plrNext++;
    // Additional turns
    if (diceValue == 6 || diceValue == 1) {
        plrNext = plrNext-1;
    }
    // Return first player
    if (plrNext > qlt) {
        plrNext = 0;
    }
}

function getPosByCode($code) {
    switch($code) {
        case "plRed":
            return {
                start: "t1",
                end: "t52",
                home: "sfr",
                name: "Red",
                stepLimit: 52
            };
            break;
        case "plBlue":
            return {
                start: "t14",
                end: "t13",
                home: "sfb",
                name: "Blue",
                stepLimit: 52
            };
            break;
        case "plYellow":
            return {
                start: "t27",
                end: "t26",
                home: "sfy",
                name: "Yellow",
                stepLimit: 52
            };
            break;
        default:
            return {
                start: "t40",
                end: "t39",
                home: "sfg",
                name: "Green",
                stepLimit: 52
            };
    }
}

function getInfoByName($name) {
    switch($name) {
        case "kati rd":
            return {
                element: ".kati.rd",
                code: "plRed",
                name: "Red"
            };
            break;
        case "kati bl":
            return {
                element: ".kati.bl",
                code: "plBlue",
                name: "Blue"
            };
            break;
        case "kati yl":
            return {
                element: ".kati.yl",
                code: "plYellow",
                name: "Yellow"
            };
            break;
        default:
            return {
                element: ".kati.gn",
                code: "plGreen",
                name: "Green"
            };
    }
}

function checkPlayerOnBoard($code, $name, $icon) {
    const array = [];
    $(".column.step").each(function() {
        const icon = $(this).find($icon);
        if (icon.length > 0) {
            const data = {
                type: "broad",
                pos: $(this).attr("id"),
                step: Number($(this).children().attr("data-step-count")),
                player: icon,
                code: $code,
                name: $name
            };
            array.push(data);
        }
    });
    return array;
}

function checkPlayerOnSale($code, $name, $icon) {
    const array = [];
    $(".column.safe").each(function() {
        const icon = $(this).find($icon);
        if (icon.length > 0) {
            const data = {
                type: "home",
                pos: $(this).attr("id"),
                step: Number($(this).children().attr("data-step-count")),
                player: icon,
                code: $code,
                name: $name
            };
            array.push(data);
        }
    });
    return array;
}

function checkPlayerInBox($vt, $name) {
    let result;
    const elBox = $("#" + $vt);
    const elBoxChild = elBox.children();
    if (elBoxChild.length > 0) {
        const elBoxChildClass = elBoxChild.attr("class");
        const plrInfo = getInfoByName(elBoxChildClass);
        const plrTyle = $name === elBoxChildClass ? "team" : "enemy";
        result = {
            elBoxChild: elBoxChild,
            elBoxChildClass: elBoxChildClass,
            element: plrInfo.element,
            code: plrInfo.code,
            name: plrInfo.name,
            tyle: plrTyle
        }
    } else {
        result = {
            tyle: "empty"
        }
    }
    return result;
}

function checkMoveRange($code, $name, $type, $from, $to) {
    let result;
    const plrInfoPos = getPosByCode($code);
    const posEnd = Number(plrInfoPos.end.split("t")[1]);
    const posHome = plrInfoPos.home;
    const from = $type === "home" ? Number($from.split(posHome)[1]) : Number($from.split("t")[1]);
    const to = Number($to);
    const boxArray = [];
    let temp = 1;
    let goHome = false;
    let inHome = false;
    for (let i = 1; i <= to; i++) {
        const step = from + i;
        if ($type === "home") {
            goHome = true;
            inHome = true;
            break;
        }
        if (posEnd == from) {
            goHome = true;
            break;
        }
        if (posEnd == step) {
            goHome = true;
            boxArray.push(plrInfoPos.end);
            break;
        }
        if (step > 52) {
            const tempStep = temp;
            const tempVt = "t" + tempStep;
            boxArray.push(tempVt);
            temp++;
        } else {
            const vt = "t" + step;
            boxArray.push(vt);
        }
    }
    if (goHome) {
        if (inHome) {
            for (let j = 1; j <= to; j++) {
                const homeStep = from + j;
                const homeSale = posHome + homeStep;
                boxArray.push(homeSale);
            }
        } else {
            const diceRest = to - Number(boxArray.length);
            for (let j = 1; j <= diceRest; j++) {
                const homeSale = posHome + j;
                boxArray.push(homeSale);
            }
        }
    }
    result = {
        status: true,
        type: goHome ? "home" : "broad",
        to: boxArray[boxArray.length-1]
    };
    Object.keys(boxArray).forEach(function(key){
        const lastArray = boxArray.length-1;
        const elBox = $("#" + boxArray[key]);
        const elBoxChild = elBox.children();
        if (Number(key) == Number(lastArray)) {
            const elBoxChildClass = elBoxChild.attr("class");
            if ($name === elBoxChildClass) {
                result = {
                    status: false,
                };
            }
            if (goHome) {
                const homeEnd = Number(boxArray[key].split(posHome)[1]);
                if (homeEnd > 5) {
                    result = {
                        status: false,
                    };
                }
            }
        } else {
            if (elBoxChild.length > 0) {
                result = {
                    status: false,
                };
            }
        }
    });
    return result;
}

function findPlayerRight($player, $dice) {
    let result;
    $player.sort((a, b) => (a.step < b.step) ? 1 : -1);
    for (let i = 0; i < $player.length; i++) {
        const data = $player[i];
        const code = data.code;
        const name = data.name;
        const pos = data.pos;
        const type = data.type;
        const dataMoveRange = checkMoveRange(code, name, type, pos, $dice);
        if (dataMoveRange.status) {
            result = {
                data: $player[i],
                type: dataMoveRange.type,
                to: dataMoveRange.to
            };
            break;
        }
    }
    return result;
}

function killEnemy($enemy) {
    if ($enemy) {
        $enemy.elBoxChild.remove();
        const elHomeEnemy = $("#" + $enemy.code);
        const qltEnemy = elHomeEnemy.attr("data-kati-count");
        elHomeEnemy.attr('data-kati-count', Number(qltEnemy) + 1);
        const elHBoxEnemy = elHomeEnemy.find(".bg-circle");
        elHBoxEnemy.each(function () {
            const ch = $(this).children();
            if (ch.length == 0) {
                $(this).append($enemy.elBoxChild);
            }
        });
    }
}

function joinBoard($dice, $code, $icon, $name) {
    if ($dice == 6 || $dice == 1) {
        const elHome = $("#" + $code);
        let qlt = elHome.attr("data-kati-count");
        if (qlt > 0) {
            elHome.attr('data-kati-count', --qlt);
            const plrIcon = elHome.find($icon)[0];
            const posDefault = getPosByCode($code);
            const dataInBox = checkPlayerInBox(posDefault.start, $name);
            switch(dataInBox.tyle) {
                case "enemy":
                    killEnemy(dataInBox);
                    plrIcon.remove();
                    $("#" + posDefault.start).append($(plrIcon).attr('data-step-count', 1));
                    return {
                        type: "kill",
                        detail: "Destroy the enemy ("+ dataInBox.name +")."
                    };
                    break;
                case "team":
                    return {
                        type: "stop",
                        detail: "Turn over!"
                    };
                    break;
                default:
                    plrIcon.remove();
                    $("#" + posDefault.start).append($(plrIcon).attr('data-step-count', 1));
                    return {
                        type: "join",
                        detail: "Join to broad"
                    };
            }
        }
        return {
            type: "stop",
            detail: "Turn over!"
        };
    }
    return {
        type: "stop",
        detail: "Turn over!"
    };
}

function actMove($dataMove, $dice, $name) {
    if ($dataMove) {
        const plrData = $dataMove.data;
        const plrTo = $dataMove.to;
        const dataInBox = checkPlayerInBox(plrTo, $name);
        let stepCount = Number(plrData.player.attr("data-step-count"));
        switch(dataInBox.tyle) {
            case "enemy":
                killEnemy(dataInBox);
                $("#" + plrTo).append($(plrData.player).attr('data-step-count', stepCount+Number($dice)));
                return {
                    type: "kill",
                    detail: "Destroy the enemy ("+ dataInBox.name +")."
                };
                break;
            case "team":
                return {
                    type: "stop",
                    detail: "Can not move. Turn over!"
                };
                break;
            default:
                $("#" + plrTo).append($(plrData.player).attr('data-step-count', stepCount+Number($dice)));
                return {
                    type: "move",
                    detail: "Go to step: "+plrTo
                };
        }
    }
    return {
        type: "stop",
        detail: "Can not move. Turn over!"
    };
}
