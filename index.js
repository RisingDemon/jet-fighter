import express from "express";
import { Server } from "socket.io";
const app = express();
app.use(express.static("public"));
const port = process.env.PORT || 3000;
const server = app.listen(port);
const io = new Server(server);

// screen size 1066 x 600
let spaceShips = [];
// genarate random number between 50 and 1000
let xposInitial = Math.floor(Math.random() * (951)) + 50;
let yposInitial = Math.floor(Math.random() * (500)) + 50;
let x1posInitial = Math.floor(Math.random() * (951)) + 50;
let y1posInitial = Math.floor(Math.random() * (500)) + 50;
let score1 = 0,
  score2 = 0;
let bulTime, shieldInterval, invisibleInterval;

class ships {
    constructor(id, name, x, y, score) {
      this.id = id;
      this.name = name;
      this.x = x;
      this.y = y;
      this.score = score;
    }
  }

  function multiBulletFun() {
    console.log("in multiBulletFun");
    // generate random coordinates
    let x = Math.floor(Math.random() * (975) +66);
    let y = Math.floor(Math.random() * (510) + 66);
    io.emit("multiBullet", { x: x, y: y });
  }
  function shieldFun() {
    console.log("in shieldFun");
    // generate random coordinates
    let x = Math.floor(Math.random() * (975) +66);
    let y = Math.floor(Math.random() * (510) + 66);
    io.emit("shield", { x: x, y: y });
  }
  function invisibleFun() {
    console.log("in invisibleFun");
    // generate random coordinates
    let x = Math.floor(Math.random() * (975) +66);
    let y = Math.floor(Math.random() * (510) + 66);
    io.emit("invisible", { x: x, y: y });
  }

  io.on("connection", (socket) => {
    socket.emit("connectServer", "Hello from server");
  
    console.log("a user connected" + socket.id);
    socket.on("Howdy", (arg) => {
      console.log(arg);
    });
  
    socket.on("selfLocation", (arg) => {
  
      // check if there is any space ship in the array
      if (spaceShips.length == 0) {
        console.log("in if");
        // create a new space ship
        let spaceShip = new ships(
          socket.id,
          arg.name,
          xposInitial,
          yposInitial,
          score1
        );
        // add the space ship to the array
        spaceShips.push(spaceShip);
        socket.emit("initialPos", {
          id: spaceShip.id,
          x: spaceShip.x,
          y: spaceShip.y,
          // send a random angle
          angle: Math.floor(Math.random() * (360)),
        });
      }
      // check if there is any space ship in the array
      else if (spaceShips.length == 1) {
        console.log("in else if");
        let spaceShip = new ships(
          socket.id,
          arg.name,
          x1posInitial,
          y1posInitial,
          score2
          );
          spaceShips.push(spaceShip);
          socket.emit("initialPos", {
            id: spaceShip.id,
            x: spaceShip.x,
            y: spaceShip.y,
            angle: Math.floor(Math.random() * (360)),
          });
      }
  
      // console.log(arg);
      // console.log(spaceShips);
      if (spaceShips.length == 2) {
        console.log("2 players connected");
        // time for bullet
        bulTime= setInterval(multiBulletFun, 9000);
        // setinterval for shield with random time
        let shieldTime = Math.floor(Math.random() * (12000)) + 6000;
        shieldInterval = setInterval(shieldFun, shieldTime);
        let invisibleTime = Math.floor(Math.random() * (12000)) + 6000;
        invisibleInterval = setInterval(invisibleFun, invisibleTime);

        io.emit("allLocations", spaceShips);
      }
    });

    socket.on("sendBullet", (arg) => {
        // console.log(arg);
        socket.broadcast.emit("receiveBullets", arg);
        }
    );
    socket.on("sendAngle", (arg) => {
        // console.log(arg);
        socket.broadcast.emit("receiveAngle", arg);
    }
    );
    socket.on("shieldIsOn", (arg) => {
      socket.broadcast.emit("shieldOnBroadcast", arg);
    });
    socket.on("invisibleIsOn", (arg) => {
      socket.broadcast.emit("invisibleOnBroadcast", arg);
    });
    socket.on("clearBulletImg", (arg) => {
      socket.broadcast.emit("clearBulletImgBroadcast", arg);
    });
    socket.on("disconnect", function () {
      console.log("Disconnected: " + socket.id);
      clearInterval(bulTime);
      clearInterval(shieldInterval);
      clearInterval(invisibleInterval);
      for (var i = 0; i < spaceShips.length; i++) {
        if (socket.id == spaceShips[i].id) {
          spaceShips.splice(i, 1);
          break;
        }
      }
      socket.emit("playerLeft", "You have been disconnected");
    });

});