import './style.css'
import { chooseMode, playGame } from './components/GameController';
import { initBtns } from './components/manageDOM';


chooseMode().then(mode => {
    initBtns();
    playGame(mode)
});
