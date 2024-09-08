import { Player, Computer } from "./class";
import { renderChooseModeBtn, renderGameboard, getTargetCoordinates, hidePopUpSec, printTurn, printWinner, printNameOfPlayers } from "./manageDOM";

const roles = {
    "attacker": null,
    "defender": null
}
async function chooseMode() {
    renderChooseModeBtn();
    let mode;
    await new Promise(resolve => {
        const modeBtns = document.querySelectorAll(".mode-btn");
        modeBtns.forEach(modeBtn => {
            modeBtn.addEventListener("click", (event) => {
                mode = event.target.value;
                resolve();
            })
        })
    });
    hidePopUpSec();
    return new Promise(resolve => resolve(mode));
}

async function playGame(mode) {
    if (mode === "onePlayer") {
        await onePlayerGame();
    }
    else if(mode === "twoPlayer") {
        twoPlayerGame();
    }
}

function swapRole() {
    const temp = roles.defender;
    roles.defender = roles.attacker;
    roles.attacker = temp;
}

function implementAttack(defender, coordinates) {
    const attackStatus = defender.ownGameboard.receiveAttack(coordinates);
    if (attackStatus === "miss") {
        swapRole();
    }
}

async function placeShipPhase(player) {
    const randomHandler = function() {
        player.ownGameboard.randomlyPlaceShip();
        renderGameboard(player.ownGameboard, player.boardContainerId, "visibleShip");
    }

    const mouseDownHandler = async function (event) {
        const mouseDownCoordinates = event.target.getAttribute("spot-coordinates");
        let mouseUpCoordinates;
        await new Promise((resolve) => {
            document.querySelector(`#${player.boardContainerId}`).addEventListener("mouseup", (event) => {
                mouseUpCoordinates = event.target.getAttribute("spot-coordinates");
                resolve();
            });
        });
        if (mouseDownCoordinates && mouseDownCoordinates === mouseUpCoordinates) {
            const targetCoordinates = JSON.parse(mouseUpCoordinates);
            const targetShip = player.ownGameboard.playground[targetCoordinates.y][targetCoordinates.x];
            if (targetShip !== null) {
                player.ownGameboard.removeShip(targetShip);
                const newAxis = (targetShip.axis === "X") ? "Y" : "X";
                if (player.ownGameboard.checkSpotIsValidateToPlaceShip(targetShip.coordinates, targetShip, newAxis)) {
                    player.ownGameboard.turnShip(targetShip);
                }
                else {
                    player.ownGameboard.placeShip(targetShip.coordinates, targetShip);
                }
                renderGameboard(player.ownGameboard, player.boardContainerId, "visibleShip");    
            }
        }
        else if (mouseDownCoordinates && mouseUpCoordinates) {
            const oldCoordinates = JSON.parse(mouseDownCoordinates);
            const targetShip = player.ownGameboard.playground[oldCoordinates.y][oldCoordinates.x];
            if (targetShip !== null) {
                const newCoordinates = JSON.parse(mouseUpCoordinates);
                player.ownGameboard.removeShip(targetShip);
                if (player.ownGameboard.checkSpotIsValidateToPlaceShip(newCoordinates, targetShip, targetShip.axis)) {
                    player.ownGameboard.placeShip(newCoordinates, targetShip);
                }
                else {
                    player.ownGameboard.placeShip(targetShip.coordinates, targetShip);
                }
                renderGameboard(player.ownGameboard, player.boardContainerId, "visibleShip");    
            }
        }
    }

    const board = document.querySelector(`#${player.boardContainerId}`);
    const randomlyPlaceBtn = document.querySelector("#random-btn");
    randomlyPlaceBtn.addEventListener("click", randomHandler);
    await new Promise((resolve) => {
        const startBtn = document.querySelector("#start-btn");
        startBtn.addEventListener("click", resolve);
        board.addEventListener("mousedown", mouseDownHandler);
    })
    board.removeEventListener("mousedown", mouseDownHandler);
    randomlyPlaceBtn.removeEventListener("click", randomHandler);
}

async function onePlayerGame() {
    const playerOne = new Player("You", "board-1");
    const playerTwo = new Computer("Computer", "board-2");
    roles.attacker = playerOne;
    roles.defender = playerTwo;
    printNameOfPlayers(playerOne, playerTwo);
    playerOne.ownGameboard.randomlyPlaceShip();
    playerTwo.ownGameboard.randomlyPlaceShip();
    renderGameboard(playerOne.ownGameboard, "board-1", "visibleShip");
    renderGameboard(playerTwo.ownGameboard, "board-2", "noVisibleShip");
    await placeShipPhase(playerOne);
    while (!playerOne.ownGameboard.allShipIsSunk() && !playerTwo.ownGameboard.allShipIsSunk()) {
        printTurn(roles.attacker.name);
        if (roles.attacker instanceof Computer) {
            const targetCoordinates = await playerTwo.autoAttack();
            implementAttack(roles.defender, targetCoordinates);
            renderGameboard(playerOne.ownGameboard, playerOne.boardContainerId, "visibleShip");
        }
        else {
            const targetCoordinatesString = await getTargetCoordinates(roles.defender.boardContainerId);
            if (!targetCoordinatesString) return;
            const targetCoordinates = JSON.parse(targetCoordinatesString);
            implementAttack(roles.defender, targetCoordinates);
            renderGameboard(playerTwo.ownGameboard, playerTwo.boardContainerId, "noVisibleShip");
        }
    }
    const winner = (playerOne.ownGameboard.allShipIsSunk()) ? playerTwo : playerOne;
    printWinner(winner.name);
}

async function twoPlayerGame() {
    const playerOne = new Player("Player 1", "board-1");
    const playerTwo = new Player("Player 2", "board-2");
    roles.attacker = playerOne;
    roles.defender = playerTwo;
    printNameOfPlayers(playerOne, playerTwo);
    playerOne.ownGameboard.randomlyPlaceShip();
    renderGameboard(playerOne.ownGameboard, "board-1", "visibleShip");
    await placeShipPhase(playerOne);
    renderGameboard(playerOne.ownGameboard, "board-1", "noVisibleShip");

    playerTwo.ownGameboard.randomlyPlaceShip();
    renderGameboard(playerTwo.ownGameboard, "board-2", "visibleShip");
    await placeShipPhase(playerTwo);
    renderGameboard(playerTwo.ownGameboard, "board-2", "noVisibleShip");

    while (!playerOne.ownGameboard.allShipIsSunk() && !playerTwo.ownGameboard.allShipIsSunk()) {
        const attacker = roles.attacker;
        const defender = roles.defender;
        printTurn(attacker.name);
        const targetCoordinatesString = await getTargetCoordinates(defender.boardContainerId);
        if (!targetCoordinatesString) return;
        const targetCoordinates = JSON.parse(targetCoordinatesString);
        implementAttack(defender, targetCoordinates);
        renderGameboard(defender.ownGameboard, defender.boardContainerId, "noVisibleShip");
    }
    const winner = (playerOne.ownGameboard.allShipIsSunk()) ? playerTwo : playerOne;
    printWinner(winner.name);
    // alert("It will be release soon :)))");
    // setTimeout(() => location.reload(), 3000);
}

export {
    chooseMode,
    playGame
}