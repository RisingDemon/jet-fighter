let screenX = 1066;
let screenY = 600;
let m = 70,
  k = 500;
let jimg;
let xpos = 20;
let ypos = 530;
let dx = 0;
let dy = 0;
let diffX = 0,
  diffY = 0;
let j = 5;
let angle;
let socket;
let bullets = [],
  bullets2 = [];
let arrNo, shipNo2;
let myX, myY;
let spaceShips = [];
let triggerPoint = 0;

let score1 = 0;
let score2 = 0;
let outerVar;

// line coordinates
let xLineStart = 0,
      yLineStart = 0,
      xLineEnd = 1066,
      yLineEnd = 0,
      timeLine;

function preload() {
  jimg = loadImage("./assets/aircraft.png");
  bimg = loadImage("./assets/fighter-jet.png");
}
function setup() {
  createCanvas(1067, 600);
  angleMode(DEGREES);

  socket = io();
  io.connect();

  socket.on("connectServer", (arg) => {
    console.log("connected");
    console.log(arg);
  });
  socket.emit("Howdy", "Hello from client");

  frameRate(30);

  socket.on("allLocations", (data) => {
    spaceShips = data;
    console.log(spaceShips);
    if (spaceShips[0].name == yourName.value()) {
      arrNo = 0;
      shipNo2 = 1;
    } else {
      arrNo = 1;
      shipNo2 = 0;
    }

    timeLine = setInterval(timeFun, 1000);
    displayShip();
    // button.mousePressed(displayShip);
  });

  socket.on("initialPos", (data) => {
    if (data.id == socket.id) {
      console.log(data);
      myX = data.x;
      myY = data.y;
    }
  });

  socket.on("receiveBullets", (data) => {
    bullets2.push(data);
  });

  socket.on("receiveAngle", (data) => {
    spaceShips[shipNo2].angle = data.angle;
    spaceShips[shipNo2].x = data.x;
    spaceShips[shipNo2].y = data.y;
  });

  socket.on("playerLeft", (arg) => {
    alert("Player Left");
    // location.reload();
    waitForPeople();
  });

  startScreen();
}

function startScreen() {
  background(60);
  yourName = createInput("Your Name!").attribute("maxlength", 10);
  yourName.position(width / 2 - 75, height / 2 - 60);
  yourName.size(150, 20);

  let button = createButton("Submit");
  button.position(width / 2 - 50, height / 2 - 10);
  button.size(100, 20);
  button.style("cursor: pointer");
  // button.mousePressed(waitForPeople);
  button.mousePressed(joinGame);
}

function joinGame() {
  var data = {
    name: yourName.value(),
  };
  socket.emit("selfLocation", data);
  waitForPeople();
}

function waitForPeople() {
  removeElements();
  background(60);
  let divWaiting = createDiv("");
  divWaiting.html("Waiting for Someone to Join...");
  divWaiting.position(screenX / 2, screenY / 2);
  divWaiting.style("font-size", "36px");
  divWaiting.style("color", "black");
  console.log("waiting");
}

function displayShip() {
  // removeElements();
  background(200);
  angle = atan2(mouseY - myY, mouseX - myX);
  // when angle changes send it to server
  var data = {
    id: socket.id,
    x: myX,
    y: myY,
    angle: angle,
  };
  socket.emit("sendAngle", data);

  // var BAngle = [];

  if (arrNo == 0) {
    push();
    translate(myX, myY);
    rotate(angle + 90);
    var bulAngle = angle + 90;
    imageMode(CENTER);
    image(jimg, 0, 0, 60, 60);
    pop();

    push();
    translate(spaceShips[shipNo2].x, spaceShips[shipNo2].y);
    rotate(spaceShips[shipNo2].angle + 90);
    var bulAngle = angle + 90;
    imageMode(CENTER);
    image(bimg, 0, 0, 60, 60);
    pop();
  } else {
    push();
    translate(spaceShips[shipNo2].x, spaceShips[shipNo2].y);
    rotate(spaceShips[shipNo2].angle + 90);
    var bulAngle = angle + 90;
    imageMode(CENTER);
    image(jimg, 0, 0, 60, 60);
    pop();

    push();
    translate(myX, myY);
    rotate(angle + 90);
    var bulAngle = angle + 90;
    imageMode(CENTER);
    image(bimg, 0, 0, 60, 60);
    pop();
  }

  let div1 = createDiv("");
  let div2 = createDiv("");
  div1.position(180, 10);
  div1.style("font-size", "40px");
  div1.style("color", "black");
  div1.html(score1);
  div2.position(screenX + 250, 10);
  div2.style("font-size", "40px");
  div2.style("color", "black");
  div2.html(score2);

  triggerPoint = 1;
}
function displayBullet() {
  //have to change this later
  for (let i = 0; i < bullets2.length; i++) {
    circle(bullets2[i].bulX, bullets2[i].bulY, 10);
    bullets2[i].bulX = bullets2[i].bulX + 4 * cos(bullets2[i].BAngle);
    bullets2[i].bulY = bullets2[i].bulY + 4 * sin(bullets2[i].BAngle);
    if (
      bullets2[i].bulX > screenX ||
      bullets2[i].bulX < 0 ||
      bullets2[i].bulY < 0 ||
      bullets2[i].bulY > screenY
    ) {
      bullets2.splice(i, 1);
      continue;
    }

    if (
      dist(
        bullets2[i].bulX,
        bullets2[i].bulY,
        myX,
        myY
      ) < 21
    ) {
      //checks if the distance between the bullet and the plane1 is less than 21
      bullets2.splice(i, 1);
      score2++;
    }
  }
}

function draw() {
  background(200);

  if (triggerPoint) {
    removeElements();
    displayShip();
    displayBullet();

    push(); // line for timeline
    stroke(0);
    strokeWeight(4);
    line(xLineStart, yLineStart, xLineEnd, yLineEnd);
    pop();
    
    outerVar = true;

    if (keyIsDown(32)) {
      alert("pause");
    }

    if (keyIsDown(65)) {
      dx = -3;
      myX += dx;
    }

    if (keyIsDown(68)) {
      dx = 3;
      myX += dx;
    }
    if (keyIsDown(87)) {
      dy = -3;
      myY += dy;
    }
    if (keyIsDown(83)) {
      dy = 3;
      myY += dy;
    }


    if (keyIsDown(LEFT_ARROW)) {
      dx = -3;
      myX += dx;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      dx = 3;
      myX += dx;
    }
    if (keyIsDown(UP_ARROW)) {
      dy = -3;
      myY += dy;
    }
    if (keyIsDown(DOWN_ARROW)) {
      dy = 3;
      myY += dy;
    }
    if (myX >= width) {
      myX = 5;
    }
    if (myX <= 0) {
      myX = width;
    }
    if (myY >= height) {
      myY = 5;
    }
    if (myY <= 0) {
      myY = height;
    }
    for (let i = 0; i < bullets.length; i++) {
      console.log(bullets.length);
      circle(bullets[i].bulX, bullets[i].bulY, 10);
      circle(m, k, 10);
      m += 5;
      k += 5;
      bullets[i].bulX = bullets[i].bulX + 4 * cos(bullets[i].BAngle);
      bullets[i].bulY = bullets[i].bulY + 4 * sin(bullets[i].BAngle);
      if (
        bullets[i].bulX > screenX ||
        bullets[i].bulX < 0 ||
        bullets[i].bulY < 0 ||
        bullets[i].bulY > screenY
      ) {
        bullets.splice(i, 1);
        continue;
      }
      if (
        dist(
          bullets[i].bulX,
          bullets[i].bulY,
          spaceShips[shipNo2].x,
          spaceShips[shipNo2].y
        ) < 21
      ) {
        //checks if the distance between the bullet and the plane1 is less than 21
        bullets.splice(i, 1);
        score1++;
        continue;
      }
    }
    //   if(mouseIsPressed){
    //     let bullet = {
    //       bulX: myX,
    //       bulY: myY,
    //       BAngle: angle,
    //     };
    //     bullets.push(bullet);
    //   }
  }
} //draw

function mouseClicked() {
  console.log(triggerPoint);
  if (triggerPoint) {
    let bullet = {
      bulX: myX,
      bulY: myY,
      BAngle: angle,
    };
    bullets.push(bullet);
    socket.emit("sendBullet", bullet);
  }
}

function timeFun() {
  // decrease the line by 1 pixel for each second
  xLineEnd = xLineEnd - 26.65;
  if (xLineEnd < 0) {
    bullets.splice(0, bullets.length);
    clearInterval(timeLine);
    let obj = "Game Over";
    if(score1>score2){
      obj = spaceShips[arrNo].name + " Wins";
    }
    else if(score2>score1){
      obj = spaceShips[shipNo2].name + " Wins";
    }
    else{
      obj = "Draw";
    }
    alert(" TIME OVER!!! ," + obj, +"to restart press Enter key");
    location.reload();
    // socket.emit("finalScore", obj);
  }
  // console.log(yLineStart);
}