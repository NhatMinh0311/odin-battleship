
function renderGameboard(gameboard, id, mode){
    const gameboardSec = document.querySelector(`#${id}`);
    gameboardSec.innerHTML = "";
    gameboardSec.setAttribute("style", `
        display: grid;
        grid-template: repeat(${gameboard.width}, 1fr) / repeat(${gameboard.height}, 1fr);
    `);
    for (let i = 0; i < gameboard.height; i++) {
        for(let j = 0; j < gameboard.width; j++) {
            const spot = document.createElement("div");
            spot.classList.add("spot");
            spot.setAttribute("spot-coordinates", `{"x":${j}, "y":${i}}`);
            if (mode === "visibleShip" && gameboard.playground[i][j] !== null) {
                spot.classList.add("ship-container");
            }
            if (gameboard.shotRecord[i][j]){
                if (gameboard.playground[i][j] !== null){
                    if (gameboard.playground[i][j].isSunk()) {
                        spot.classList.add("sunk-ship");
                    }
                    else {
                        spot.classList.add("hit");
                    }
                }
                else {
                    spot.classList.add("miss");
                }
            }
            gameboardSec.appendChild(spot);
        }
    }
} 

function renderChooseModeBtn() {
    const popUpSec = document.querySelector("#pop-up-sec");
    popUpSec.style.display = "flex";
    popUpSec.style["z-index"] = 1;

    popUpSec.innerHTML = "";
    const modes = ["onePlayer", "twoPlayer"];
    modes.forEach(mode => {
        const modeBtn = document.createElement("button");
        modeBtn.textContent = (mode === "onePlayer") ? "One Player" : "Two Player";
        modeBtn.classList.add("mode-btn");
        modeBtn.setAttribute("value", mode);
        popUpSec.appendChild(modeBtn);
    });
}

function hidePopUpSec() {
    const popUpSec = document.querySelector("#pop-up-sec");
    popUpSec.style.display = "none";
}
function printTurn(name) {
    const monitor = document.querySelector("#monitor");
    monitor.textContent = (name.toLowerCase() === "you") ? "Your turn!" : `${name}'s turn!`;
}
async function getTargetCoordinates(id) {
    let targetCoordinates;
    const waitChoose = new Promise((resolve) => {
        const board = document.querySelector(`#${id}`);
        board.addEventListener("click", (event) => {resolve(event)});
    });
    await waitChoose.then((event) => targetCoordinates = event.target.getAttribute("spot-coordinates"));
    return targetCoordinates;
}

function activateResetBtn() {
    const resetBtn = document.querySelector("#reset-btn");
    resetBtn.addEventListener("click", () => location.reload());
}

function toggleDisplay(node) {
    const displayStatus = node.style.display;
    node.style.display = (displayStatus === 'none') ? 'block' : 'none';
}

function initBtns() {
    const infoBtn = document.querySelector("#instruction-sec > button");
    infoBtn.addEventListener("click", () => toggleDisplay(infoBtn.nextElementSibling));
    activateResetBtn();
}

function printWinner(name) {
    const monitor = document.querySelector("#monitor");
    monitor.textContent = `${name.toUpperCase()} WON!`;
}

function printNameOfPlayers(playerOne, playerTwo) {
    const nameSecOne = document.querySelector(`#${playerOne.boardContainerId}`).previousElementSibling;
    nameSecOne.textContent = playerOne.name;
    const nameSecTwo = document.querySelector(`#${playerTwo.boardContainerId}`).previousElementSibling;
    nameSecTwo.textContent = playerTwo.name;
}
export {
    initBtns,
    renderGameboard, 
    getTargetCoordinates,
    renderChooseModeBtn,
    hidePopUpSec,
    printTurn,
    printWinner,
    printNameOfPlayers
}