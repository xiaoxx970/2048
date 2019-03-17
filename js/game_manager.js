function GameManager(size, InputManager, Actuator) {
  this.size         = size; // Size of the grid
  this.inputManager = new InputManager;
  this.actuator     = new Actuator;

  this.running      = false;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));

  this.inputManager.on('think', function() {
    var best = this.ai.getBest();
    this.actuator.showHint(best.move);
  }.bind(this));


  this.inputManager.on('run', function() {
    if (this.running) {
      this.running = false;
      this.actuator.setRunButton('AI玩家');
    } else {
      this.running = true;
      this.run()
      this.actuator.setRunButton('停止');
    }
  }.bind(this));

  this.inputManager.on('save', function () {
    var username = document.getElementsByClassName("username")[0].value;
    if (username != null && username != "") {
      this.actuator.setCookie("username", username);
      this.actuator.setSaveButton("保存成功");
    }
    else {
      this.actuator.setSaveButton("名字为空");
    }
  }.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.actuator.restart();
  this.running = false;
  this.actuator.setRunButton('AI玩家');
  this.setup();
};

// Set up the game
GameManager.prototype.setup = function () {
  this.grid         = new Grid(this.size);
  this.grid.addStartTiles();

  this.ai           = new AI(this.grid);
  this.score        = 0;
  this.over         = false;
  this.won          = false;

  var high = this.actuator.getCookie("high");
  if (high != null && high != "" && high != "undefined") {
    this.highest = high;
  }
  else {
    this.highest = 0;
  }
  this.actuator.setRankTable();
  //this.actuator.clearCookie("score");
  //alert(this.actuator.getCookie("score"));
  this.actuator.loadScore(this.highest);
  var username = this.actuator.getCookie('username');
  if (username != null && username != "") {
    this.actuator.setWelcome("欢迎回来，" + username + "!");
    document.getElementsByClassName("inputname")[0].innerHTML = "";
  }
  else {
    this.actuator.setWelcome("欢迎你，陌生人");
  }
  // Update the actuator
  this.actuate();
  //this.actuator.hehe();
/*   if (this.running) {
    this.running = false;
    this.actuator.setRunButton('AI玩家');
  } else {
    this.running = true;
    this.run()
    this.actuator.setRunButton('停止');
  } */
};


// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  this.actuator.actuate(this.grid, {
    top:   this.highest,
    score: this.score,
    over:  this.over,
    won:   this.won
  });
};

// makes a given move and updates state
GameManager.prototype.move = function(direction) {
  var result = this.grid.move(direction);
  this.score += result.score;

  if (!result.won) {
    if (result.moved) {
      this.grid.computerMove();
    }
  } else {
    this.won = true;
  }

  //console.log(this.grid.valueSum());

  if (!this.grid.movesAvailable()) {
    this.over = true; // Game over!
  }

  this.actuate();
}

// moves continuously until game is over
GameManager.prototype.run = function() {
  var best = this.ai.getBest();
  this.move(best.move);
  var timeout = animationDelay;
  if (this.running && !this.over && !this.won) {
    var self = this;
    setTimeout(function(){
      self.run();
    }, timeout);
  }
  else{
    //this.restart();
  }
}


// var save = document.getElementsByClassName("save-button")[0];
// save.addEventListener('click', SetCookie("xiaoxx",this.score));
