class Ship {
    constructor(length) {
        this.length = length;
        this.hitTimes = 0;
        this.axis = "X";
        this.coordinates = {
            "x": 0,
            "y": 0
        }
    }
    hit() {
        if (this.isSunk()) return;
        this.hitTimes++;
    }
    isSunk() {
        return this.hitTimes === this.length;
    }
    toggleShipAxis() {
        this.axis = (this.axis === "X") ? "Y" : "X";
    }
}

class Gameboard {
    constructor() {
        this.height = 10;
        this.width = 10;
        this.playground = this.createPlayground();
        this.shotRecord = this.createRecord();
        this.shipList = [new Ship(5), new Ship(4), new Ship(3), new Ship(3), new Ship(2)];
    }

    removeShip(ship) {
        if (ship.axis === "X") {
            for (let i = 0; i < ship.length; i++) {
                //console.log(this.playground[ship.coordinates.y][ship.coordinates.x + i]);
                this.playground[ship.coordinates.y][ship.coordinates.x + i] = null;
                //console.log(ship.coordinates.y, ship.coordinates.x + i);
                
            }
        }
        else if (ship.axis === "Y") {
            for (let i = 0; i < ship.length; i++) {
                //console.log(this.playground[ship.coordinates.y + i][ship.coordinates.x]);
                //console.log(ship.coordinates.y + i, ship.coordinates.x);
                this.playground[ship.coordinates.y + i][ship.coordinates.x] = null;            
            }
        }
    }
    placeShip(newCoordinates, ship) {
        // if (this.playground[ship.coordinates.y][ship.coordinates.x]) {
        //     this.removeShip(ship);
        // }

        if (ship.axis === "X") {
            for (let i = 0; i < ship.length; i++) {
                this.playground[newCoordinates.y][newCoordinates.x + i] = ship;
            }
        }
        else {
            for (let i = 0; i < ship.length; i++) {
                this.playground[newCoordinates.y + i][newCoordinates.x] = ship;
            }
        }
        ship.coordinates = newCoordinates;
    }
    
    turnShip(ship) {
        ship.toggleShipAxis();
        this.placeShip(ship.coordinates, ship);
    }
    randomlyPlaceShip() {
        const getNumberZeroToNine = function () {
            return Math.floor(Math.random() * 9);
        }
        
        const getRandomAxis =  function () {
            return (Math.floor(Math.random() * 2) === 0) ? "X" : "Y";
        }
        
        const getRandomCoordinates = function () {
            return {
                "x": getNumberZeroToNine(),
                "y": getNumberZeroToNine()
            }
        }
        this.resetPlayground();
        for (const ship of this.shipList) {
            ship.axis = getRandomAxis();
            let tempCoordinates = getRandomCoordinates();
            while (!this.checkSpotIsValidateToPlaceShip(tempCoordinates, ship, ship.axis)) {
                tempCoordinates = getRandomCoordinates();
            }
            this.placeShip(tempCoordinates, ship);
        }
    }

    checkSpotIsValidateToPlaceShip(coordinates, ship, axis) {
        if (axis === "X") {
            if (this.width - coordinates.x < ship.length){
                return false;
            }
            for (let i = 0; i < ship.length; i++) {
                if (this.playground[coordinates.y][coordinates.x + i] !== null) {
                    return false;
                }
            }
            return true;
        }
        else {
            if (this.height - coordinates.y < ship.length){
                return false;
            }
            for (let i = 0; i < ship.length; i++) {
                if (this.playground[coordinates.y + i][coordinates.x] !== null) {
                    return false;
                }
            }
            return true;
        }
    }
    receiveAttack(coordinates){
        if (!coordinates || this.shotRecord[coordinates.y][coordinates.x]) return "invalid";
        this.shotRecord[coordinates.y][coordinates.x] = true;
        if (this.playground[coordinates.y][coordinates.x] !== null) {
            this.playground[coordinates.y][coordinates.x].hit();
            return "hit";
        }
        return "miss";
    }

    allShipIsSunk() {
        const sunkShipList = this.shipList.filter(ship => ship.isSunk());
        return sunkShipList.length === this.shipList.length;
    }

    resetPlayground() {
        this.playground = this.createPlayground();
    }
    
    createPlayground() {
        const playground = [];
        for (let i = 0; i < 10; i++) {
            playground[i] = [];
            for (let j = 0; j < 10; j++) {
                playground[i][j]= null;
            }
        }
        return playground;

    }
    createRecord() {
        const record = [];
        for (let i = 0; i < this.height; i++) {
            record[i] = [];
            for (let j = 0; j < this.width; j++) {
                record[i][j] = false;
            }
        }
        return record;
    }
}

class Player {
    constructor(name, boardContainerId) {
        this.boardContainerId = boardContainerId;
        this.ownGameboard = new Gameboard();
        this.name = name;
    }
}

class Computer extends Player {
    constructor(name, boardContainerId) {
        super(name, boardContainerId);
        this.attackChoices = this.createAttackChoices();
    }
    createAttackChoices() {
        const choice = [];
        for (let i = 0; i < this.ownGameboard.height; i++){
            for (let j = 0; j < this.ownGameboard.width; j++){
                choice.push({
                    "x": j,
                    "y": i
                });
            }
        }
        return choice;
    }
    async autoAttack() {
        const delayOneSecond = new Promise(resolve => {
            setTimeout(resolve, 1000);
        })
        await delayOneSecond;
        const index = Math.floor(Math.random() * this.attackChoices.length);
        this.attackChoices.splice(index, 1);
        return this.attackChoices[index];
    }
}

export {
    Ship,
    Gameboard,
    Player, 
    Computer
}