// constants
var gameboardWidth = 300;
var gameboardHeight = 300;

var gridcellWidth = 50;
var gridcellHeight = 50;

var shipWidth = 50;
var shipHeight = 50;

var shipX = Math.round(gameboardWidth/gridcellWidth/2)*gridcellWidth;
var shipY = gameboardHeight - shipWidth/2;
var ship_location = shipX/gridcellWidth;
var ship_total = gameboardWidth/shipWidth;

var board_color = "gray";
var board =
  [[0,0,0,1,0,0],
   [0,0,0,0,1,1],
   [0,0,0,0,0,0],
   [0,0,0,0,0,0],
   [1,1,1,0,0,0],
   [0,0,0,0,1,0],
   [0,0,0,0,1,1],
   [0,0,0,0,0,1],
   [0,0,0,0,0,0],
   [0,1,1,1,0,0],
   [0,0,1,0,0,0],
   [0,0,0,1,0,0]];

var offset = board.length-1;

var amount_earned = 0.000;
var time_elapsed = 0;

var gameover = false;

$(document).ready(function() {
  // initializes the gameboard
  var gameboard = $("<div id='gameboard'></div>");
  $(document.body).append(gameboard);

  var scoreboard = $("<div id='scoreboard'></div>");
  scoreboard.text = amount_earned;
  $(document.body).append(scoreboard);

  //initialize gridcells
  for (var row=0; row < gameboardHeight/gridcellHeight; row++){
    for (var col=0; col < gameboardWidth/gridcellWidth; col++){
      var tempPiece = $("<div class='gridcell' id='gridcell_" + col + "_" + row + "'></div>");
      $(gameboard).append(tempPiece);
      $("#gridcell_" + col + "_" + row).css("left", (col*gridcellWidth) + "px");
      $("#gridcell_" + col + "_" + row).css("top", (row*gridcellHeight) + "px");
      $("#gridcell_" + col + "_" + row).css("background-color", board_color);

    }
  }


  // initializes the ship
  var ship = $("<div class='ship'></div>");
  $(gameboard).append(ship);

  //initialize a falling piece
  var piece = $("<div class='piece'></div>");
  $(gameboard).append(piece);


  // event listener
  $(document).keydown(function(e) {
    if(e.keyCode==37) {
      // left arrow clicked
      if (ship_location > 0 && ship_location <=5){
        shipX -= 50;
      }
      else if(ship_location == 0) {
        shipX = 250;
      }
    } else if(e.keyCode == 39) {
      // right arrow clicked
      if (ship_location >= 0 && ship_location < 5){
        shipX += 50;
        
      }
      else if(ship_location = 5) {
        shipX = 0;
      }
    }
    ship_location = shipX/gridcellWidth;
    console.log(ship_location);
    console.log(($("#gridcell_" + ship_location + "_" + (gameboardHeight/gridcellHeight - 1)).css("background-color") == "blue"));
    if ($("#gridcell_" + ship_location + "_" + (gameboardHeight/gridcellHeight - 1)).css("background-color") == "blue") {
      console.log("collision");
    }
    $(".ship").css("left", shipX + "px");
  });


  // timer for falling piece

  setInterval(function() {
    //color in divs
        // shift all colors down
    $("#scoreboard").text("$ " + amount_earned.toFixed(3))
    for (var row = gameboardHeight/gridcellHeight-1; row>0; row--){
      for (var col=0; col <gameboardWidth/gridcellWidth; col++){
        var colorAbove = $("#gridcell_" + col + "_" + (row - 1)).css("background-color");
        //console.log(colorAbove);
        $("#gridcell_" + col + "_" + row).css("background-color", colorAbove);
        //console.log("#gridcell_" + ship_location + "_" + row);
        console.log($("#gridcell_" + ship_location + "_" + (gameboardHeight/gridcellHeight-1)).css("background-color"));
        if ($("#gridcell_" + ship_location + "_" + (gameboardHeight/gridcellHeight-1)).css("background-color") == "rgb(0,0,255)") {
          console.log("collision"); // don't know why but it isn't detecting collision. 
        }
      }
    }
    //color in first row
    for (var frcol=0; frcol <gameboardWidth/gridcellWidth; frcol++){
      //console.log("gridcell_" + frcol + "_0");
      if (board[offset][frcol] == "1"){
        $("#gridcell_" + frcol + "_0").css("background-color", "blue");
      }
      else if (board[offset][frcol] == "0"){
        $("#gridcell_" + frcol + "_0").css("background-color", board_color);
      }
    }
    // collision detection
    var check_bottom_row = 0;
    if (offset + gameboardHeight/gridcellHeight > board.length) {
      check_bottom_row = (offset + gameboardHeight/gridcellHeight)%board.length;
      //console.log("too much");
    }
    else if (offset + gameboardHeight/gridcellHeight < board.length) {
      check_bottom_row = offset + gameboardHeight/gridcellHeight;
    }
    if ((board[check_bottom_row])[ship_location] == 1) {
      alert("Game Over.");
      document.getElementById("amount_earned").value = amount_earned;
      document.getElementById("time_elapsed").value = time_elapsed;
      document.forms["mturk_form"].submit();
    }


    // change offset to shirt board down
    if (offset == 0) {
      offset = board.length-1;
    }
    else if(offset > 0 && offset <=board.length-1){
      offset--;
    }

    // increment time and money
    if(gameover == false && time_elapsed != 0 && (amount_earned%2 == 0)){
      amount_earned += 0.001;
      time_elapsed = count++;
    }

    if (amount_earned==2) {
      alert("Congratulations. You have beat the game.");
      document.getElementById("amount_earned").value = amount_earned;
      document.getElementById("time_elapsed").value = time_elapsed;
      document.forms["mturk_form"].submit();
    }

    if (gameover) {
      alert("Game Over.")
      document.getElementById("amount_earned").value = amount_earned;
      document.getElementById("time_elapsed").value = time_elapsed;
      document.forms["mturk_form"].submit();
      clearInterval();
    }

    // if collision then alert and submit
  }, 500);

})


// query the current location of the ship.
var local_ship_position = 5;
var is_active = true;
function updateBoard() {
  $.getJSON("//www.codingthecrowd.com/counter.php", {key: “mykey”, data: {localship: local_ship_position, active: is_active}})
      .done(function(json) {
          // do something with the response
       })      
      .fail(function(jqxhr, textStatus, error) {
          var err = textStatus + ", " + error;
          console.log( "Request Failed: " + err );
  });
}
updateBoard();
setTimeout(updateBoard, 1000);