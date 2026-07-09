// =============================
// DOM ELEMENTS
// =============================

const gameArea = document.getElementById("gameArea");
const player = document.getElementById("player");

const scoreDisplay = document.getElementById("score");
const levelDisplay = document.getElementById("level");
const levelGoalDisplay = document.getElementById("levelGoal");
const difficultyDisplay = document.getElementById("difficulty");
const pollutionDisplay = document.getElementById("pollution");
const timerDisplay = document.getElementById("timer");

const progressFill = document.getElementById("progressFill");

const resetBtn = document.getElementById("resetBtn");
const retryBtn = document.getElementById("retryBtn");

const gameOverScreen = document.getElementById("gameOverScreen");
const gameMessage = document.getElementById("gameMessage");
const finalScore = document.getElementById("finalScore");

const levelScreen = document.getElementById("levelScreen");
const levelMessage = document.getElementById("levelMessage");
const continueBtn = document.getElementById("continueBtn");


// Difficulty Screen

const difficultyScreen =
document.getElementById("difficultyScreen");

const difficultyButtons =
document.querySelectorAll(".difficultyBtn");



// =============================
// DIFFICULTY SETTINGS
// =============================


const difficultySettings = {

    easy:{
        name:"Easy",
        speedMultiplier:0.8,
        spawnMultiplier:1.3,
        pollution:4,
        timer:35
    },


    medium:{
        name:"Medium",
        speedMultiplier:1,
        spawnMultiplier:1,
        pollution:3,
        timer:30
    },


    hard:{
        name:"Hard",
        speedMultiplier:1.5,
        spawnMultiplier:0.7,
        pollution:2,
        timer:25
    }

};



let selectedDifficulty = "easy";




// =============================
// LEVEL SETTINGS
// =============================


const levels = {

    1:{
        goal:15,
        speed:3.5,
        spawn:1000
    },


    2:{
        goal:30,
        speed:5,
        spawn:650
    },


    3:{
        goal:50,
        speed:8,
        spawn:350
    }

};




// =============================
// VARIABLES
// =============================


let totalWater=0;
let levelWater=0;
let pollution=0;
let timer=30;
let level=1;

let gameRunning=false;

let objectSpeed;
let spawnRate;
let maxPollution;


const objects=[];


let timerInterval;
let spawnInterval;
let animationFrameId;




// =============================
// DIFFICULTY SELECTION
// =============================


difficultyButtons.forEach(button=>{


    button.addEventListener("click",()=>{


        selectedDifficulty =
        button.dataset.difficulty;


        difficultyScreen.classList.add(
            "hidden"
        );


        startGame();


    });


});




// =============================
// START GAME
// =============================


function startGame(){


    totalWater=0;

    level=1;

    gameOverScreen.classList.add(
        "hidden"
    );

    levelScreen.classList.add(
        "hidden"
    );

    startLevel();


}




function startLevel(){


const levelSettings =
levels[level];


const diff =
difficultySettings[selectedDifficulty];



levelWater=0;

pollution=0;


timer =
diff.timer;


objectSpeed =
levelSettings.speed *
diff.speedMultiplier;


spawnRate =
levelSettings.spawn *
diff.spawnMultiplier;


maxPollution =
diff.pollution;



gameRunning=true;



updateHUD();



document.querySelectorAll(".object")
.forEach(obj=>obj.remove());


objects.length=0;


clearInterval(timerInterval);
clearInterval(spawnInterval);



startTimer();



spawnInterval =
setInterval(
spawnObject,
spawnRate
);



gameLoop();


}




// =============================
// HUD
// =============================


function updateHUD(){


scoreDisplay.textContent =
`${totalWater} Liters`;


levelDisplay.textContent =
level;


levelGoalDisplay.textContent =
`${levels[level].goal} Liters`;



difficultyDisplay.textContent =
difficultySettings[selectedDifficulty].name;



difficultyDisplay.className =
selectedDifficulty;



pollutionDisplay.textContent =
`${pollution}/${maxPollution}`;



timerDisplay.textContent =
`${timer}s`;



progressFill.style.width =
`${(levelWater /
levels[level].goal)*100}%`;

}




// =============================
// TIMER
// =============================


function startTimer(){


timerInterval=setInterval(()=>{


if(!gameRunning)
return;


timer--;

updateHUD();


if(timer<=0){

endGame(false);

}


},1000);


}





// =============================
// SPAWN OBJECTS
// =============================


function spawnObject(){


if(!gameRunning)
return;



const item =
document.createElement("div");


item.classList.add("object");



let random=Math.random();

let type;



let waterChance =
selectedDifficulty==="easy"
?0.75
:
selectedDifficulty==="medium"
?0.60
:
0.45;



if(random < waterChance){

type="water";
item.textContent="💧";

}

else if(random < waterChance+.2){

type="skull";
item.textContent="☠️";

}

else if(random<.95){

type="trash";
item.textContent="🗑️";

}

else{

type="pill";
item.textContent="💊";

}



item.classList.add(type);



let x =
Math.random()*
(gameArea.clientWidth-40);



item.style.left =
`${x}px`;

item.style.top="0px";



gameArea.appendChild(item);



objects.push({

element:item,
y:0,
type:type

});


}





// =============================
// GAME LOOP
// =============================


function gameLoop(){


if(!gameRunning)
return;


updateObjects();


animationFrameId =
requestAnimationFrame(gameLoop);


}





// =============================
// MOVEMENT
// =============================


function updateObjects(){


const playerRect =
player.getBoundingClientRect();



for(let i=objects.length-1;i>=0;i--){


let obj=objects[i];


obj.y += objectSpeed;


obj.element.style.top =
`${obj.y}px`;



let rect =
obj.element.getBoundingClientRect();



if(
playerRect.left < rect.right &&
playerRect.right > rect.left &&
playerRect.top < rect.bottom &&
playerRect.bottom > rect.top
){


handleHit(obj);


obj.element.remove();


objects.splice(i,1);


}


else if(obj.y > gameArea.clientHeight){


obj.element.remove();

objects.splice(i,1);


}


}


}





// =============================
// COLLISION
// =============================


function handleHit(obj){


if(obj.type==="water"){


totalWater++;

levelWater++;


showPlusOne();


updateHUD();


if(levelWater>=levels[level].goal){

completeLevel();

}


}



else if(obj.type==="skull"){


pollution++;

updateHUD();



gameArea.classList.add(
"flash-red"
);



setTimeout(()=>{

gameArea.classList.remove(
"flash-red"
);

},400);



if(pollution>=maxPollution){

endGame(false);

}


}



else if(obj.type==="trash"){


totalWater=Math.max(
0,
totalWater-5
);


levelWater=Math.max(
0,
levelWater-5
);


updateHUD();


}



else if(obj.type==="pill"){


pollution=Math.max(
0,
pollution-1
);


updateHUD();


}


}





// =============================
// LEVEL COMPLETE
// =============================


function completeLevel(){


gameRunning=false;


clearInterval(timerInterval);
clearInterval(spawnInterval);



if(level===3){

endGame(true);

return;

}



level++;



levelMessage.innerHTML=

`
🎉 Level Complete!
<br><br>
Level ${level}
<br>
${difficultySettings[selectedDifficulty].name}
`;



levelScreen.classList.remove(
"hidden"
);


}



continueBtn.onclick=startLevel;






// =============================
// END GAME
// =============================


function endGame(win){


gameRunning=false;


clearInterval(timerInterval);
clearInterval(spawnInterval);



gameOverScreen.classList.remove(
"hidden"
);



gameMessage.innerHTML =
win
?
"🏆 Community Saved!"
:
"💧 Water became unsafe.";



finalScore.textContent =
`
Total clean water delivered:
${totalWater} liters
`;

}





// =============================
// PLAYER CONTROL
// =============================


function movePlayer(x){


const rect =
gameArea.getBoundingClientRect();



let pos=x-rect.left;



const halfPlayerWidth = player.offsetWidth / 2;


pos=Math.max(halfPlayerWidth,pos);

pos=Math.min(
    rect.width-halfPlayerWidth,
pos
);



player.style.left =
`${pos}px`;

}



gameArea.addEventListener(
"mousemove",
e=>movePlayer(e.clientX)
);



gameArea.addEventListener(
"touchmove",
e=>{

movePlayer(
e.touches[0].clientX
);

e.preventDefault();

},
{
passive:false
}
);





// =============================
// BUTTONS
// =============================


retryBtn.onclick=startGame;

resetBtn.onclick=()=>{

difficultyScreen.classList.remove(
"hidden"
);

};





// =============================
// SCORE POPUP
// =============================


function showPlusOne(){


const popup =
document.createElement("div");


popup.textContent="+1 💧";


popup.classList.add(
"score-popup"
);


popup.style.left =
player.offsetLeft+"px";


popup.style.top =
player.offsetTop+"px";


gameArea.appendChild(popup);



setTimeout(()=>{

popup.remove();

},700);


}