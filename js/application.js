animationDelay = 0;
minSearchTime = 10;
var mybig = 0;
// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {  
  //alert(document.cookie);
  var manager = new GameManager(4, KeyboardInputManager, HTMLActuator);
});
