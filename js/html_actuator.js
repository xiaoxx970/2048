function HTMLActuator() {
  this.tileContainer    = document.getElementsByClassName("tile-container")[0];
  this.scoreContainer   = document.getElementsByClassName("score-container")[0];
  this.topscore         = document.getElementsByClassName("top-score")[0];
  this.messageContainer = document.getElementsByClassName("game-message")[0];
  this.sharingContainer = document.getElementsByClassName("score-sharing")[0];
  this.welcomeContainer = document.getElementsByClassName("welcome")[0];
  this.table            = document.getElementsByTagName("table")[0];
  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  
  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);
    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
          //console.log("mybig:"+this.mybig);
        }
      });
    });
    self.updateScore(metadata.score,metadata.top);
    
    if (metadata.over) self.message(false); // You lose
    if (metadata.won) self.message(true); // You win!
  });
};

HTMLActuator.prototype.restart = function () {
  this._score.push(this.score);
  function sequence(a, b) {
    return a - b;
  }
  //this._score.sort(sequence);
  this.setCookie("score", this._score.sort(sequence).reverse());
  this.clearMessage();
};

HTMLActuator.prototype.hehe = function () {
  function sequence(a, b) {
    return a - b;
  }
  function getRandom(start, end) {
    var length = end - start;
    var num = parseInt(Math.random() * (length) + start);
    return num;
  }
  //this._score.sort(sequence);
/*   for (var i = 0; i < 81; i++) {
    this._score.push(getRandom(16000,20000));
  }
  for (var i = 0; i < 22; i++) {
    this._score.push(getRandom(8000, 15000));
  } */
  this.setCookie("score", this._score.sort(sequence).reverse());
  this.clearMessage();
};


HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;
  var element   = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];
  this.applyClasses(element, classes);

  element.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(element, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(element, classes);
    
    //console.log(position);
    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);

      //console.log("this.mybig:"+mybig + "tile.value:"+tile.value);
      if (tile.value > mybig) {
      //  document.getElementsByClassName('tile-container')[0].classList.remove('big');
        this.mybig = tile.value;
        var _cname = 'tile tile-' + mybig + ' tile-position-' + merged.x + '-' + merged.y + ' tile-merged';
        var show = document.getElementsByClassName(_cname)[0];
        element.classList.add("big");
        //console.log(mybig);
      }
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(element, classes);
  }

  // Put the tile on the board
  this.tileContainer.appendChild(element);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.loadScore = function (score) {
  this.clearContainer(this.topscore);
  this.topscore.textContent = score;
}

HTMLActuator.prototype.updateScore = function (score,highest) {
  this.clearContainer(this.scoreContainer);
  var difference = score - this.score;
  this.score = score;
  this.highest = highest;
  if (this.score > highest) {
    this.clearContainer(this.topscore);
    this.highest = this.score;
    this.topscore.textContent = this.highest;
  }

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "你赢了!" : "游戏结束!"

  // if (ga) ga("send", "event", "game", "end", type, this.score);

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
  
  if (this.score >= this.highest) {
    this.highest = this.score;
    this.setCookie("high", this.highest);
  }
};

HTMLActuator.prototype.clearMessage = function () {
  this.messageContainer.classList.remove("game-won", "game-over");
};

HTMLActuator.prototype.showHint = function(hint) {
  document.getElementById('feedback-container').innerHTML = ['↑','→','↓','←'][hint];
}

HTMLActuator.prototype.setRunButton = function(message) {
  document.getElementById('run-button').innerHTML = message;
}

HTMLActuator.prototype.setSaveButton = function (message) {
  document.getElementById('save-button').innerHTML = message;
}

HTMLActuator.prototype.setWelcome = function (message) {
  
  this.welcomeContainer.getElementsByTagName("p")[0].textContent = message;
}

HTMLActuator.prototype.getCookie = function (c_name) {
  if (document.cookie.length > 0) {
    c_start = document.cookie.indexOf(c_name + "=")
    if (c_start != -1) {
      c_start = c_start + c_name.length + 1
      c_end = document.cookie.indexOf(";", c_start)
      if (c_end == -1) c_end = document.cookie.length
      return unescape(document.cookie.substring(c_start, c_end))
    }
  }
  return ""
}

HTMLActuator.prototype.setCookie = function (c_name,value) {
  var expiredays = 365
  var exdate = new Date()
  exdate.setDate(exdate.getDate() + expiredays)
  document.cookie = c_name + "=" + escape(value) +
    ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString())
}

HTMLActuator.prototype.clearCookie = function (c_name) {
  var expiredays = -1
  var exdate = new Date()
  exdate.setDate(exdate.getDate() + expiredays)
  document.cookie = c_name + "=" + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString())
}

HTMLActuator.prototype.setRankTable = function (){
  var _score = this.getCookie("score");
  this._score = _score.split(',');
  if(_score == ""){
    this._score.pop();
    return;
  }
  this.clearContainer(this.table);
  var tr,td;
  tr = this.table.insertRow(this.table.rows.length);
  td = tr.insertCell(tr.cells.length);
  td.innerHTML = "排名";
  td = tr.insertCell(tr.cells.length);
  td.innerHTML = "分数";
  
  for(var i=0;i<this._score.length;i++){
      //循环插入元素
      tr = this.table.insertRow(this.table.rows.length);
      for(var j=0;j<2;j++){
          td = tr.insertCell(tr.cells.length);
          j==0?td.innerHTML = i+1:td.innerHTML = this._score[i];
          

      }
  }
}