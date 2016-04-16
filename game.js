// constants - can change any of these
var gameboardWidth = 300;
var gameboardHeight = 300;

var cellW = 50;
var cellH = 50;

var shipW = 50;
var shipH = 50;

// the following change based on the variables above. 
var shipX = Math.round(gameboardWidth/cellW/2)*cellW;
var shipY = gameboardHeight - shipW/2;
var ship_location = shipX/cellW;
var ship_total = gameboardWidth/shipW;

//collective ship
var collective_location = ship_location;


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
var collectiveGameover=false;

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
$(document).ready(function() {

// all the initialization code ------------------------------------------------
  // initializes the gameboard
  var gameboard = $("<div id='gameboard'></div>");
  $(document.body).append(gameboard);

  //initialize gridcells in gameboard and colors them
  for (var row=0; row < gameboardHeight/cellH; row++){
    for (var col=0; col < gameboardWidth/cellW; col++){
      var tempPiece = $("<div class='gridcell' id='cell_" + col + "_" + row + "'></div>");
      $(gameboard).append(tempPiece);
      $("#cell_" + col + "_" + row).css("left", (col*cellW) + "px");
      $("#cell_" + col + "_" + row).css("top", (row*cellH) + "px");
      $("#cell_" + col + "_" + row).css("background-color", board_color);
    }
  }

  // initializes the ship
  var ship = $("<div class='ship'></div>");
  $(gameboard).append(ship);

  // initializes the collective ship
  var cShip = $("<div class='collective-ship'></div>");
  $(gameboard).append(cShip);

  //initialize a falling piece (WORK IN PROGRESS)
  // var piece = $("<div class='piece'></div>");
  // $(gameboard).append(piece);

   // initializes div for scoreboard
  var scoreboard = $("<div id='scoreboard'></div>");
  scoreboard.text = amount_earned;
  $(document.body).append(scoreboard);

// ----------------------------------------------------------------------------

// this follows the local ship
  // event listener
  $(document).keydown(function(e) {
    if(e.keyCode==37) {
      // left arrow clicked
   		//normal case
      if (ship_location > 0 && ship_location <=5){
        shipX -= 50;
      }
      else if(ship_location == 0) {
        shipX = 250;
      }
      	// edge (ha!) case
    } else if(e.keyCode == 39) {
      // right arrow clicked
      	// normal case
      if (ship_location >= 0 && ship_location < 5){shipX += 50;}
      	// edge case
      else if(ship_location = 5) {shipX = 0;}
    }
    ship_location = shipX/cellW;
    // send the information about the current location of the ship to the collective ship. 
    $.ajax({
    	url: '//www.codingthecrowd.com/counter.php';
    	context: document.body;
    	data: {
    		key: 'winniel',
    		data: {'local_ship':ship_location, 'is_active': true, 'mediator':'average'},
    		
    	};
    	datatype: 'jsonp';
    	success: function(json){
    		var count = json.count;
    		var sumPos = 0;
    		var posArray = [];
    		// go through each person's position
    		for (var i=0; i < count; i++){
    			indiv_pos = json.results[i].data['local_ship'];
    			if (json.results[i].data['is_active'] == true) {
    				sumPos += indiv_pos;
    				posArray.push(indiv_pos);
    			}
    		}
    		// average mediator
    		if (mediator == 'average') {
    			collective_location = Math.floor(sumPos/count);
    			cShip.css("left", collective_location + "px");  
    		}
    		// better mediator takes mode of all positions
    		else if (mediator == 'better') {
    			collective_location = Math.mode(posArray);
    		}
    	}
    	error: function(jqxhr, textStatus, error) {
          	var err = textStatus + ", " + error;
          	console.log( "Request Failed: " + err );
  		};
  		complete: function () {
  			setTimeout(updateBoard, 500);
  		}
    })

    console.log(ship_location);
    console.log(($("#cell_" + ship_location + "_" + (gameboardHeight/cellH - 1)).css("background-color") == "blue"));
    // if the ship's next move will run into a piece.
    if ($("#cell_" + ship_location + "_" + (gameboardHeight/cellH - 1)).css("background-color") == "blue") {
      console.log("collision");
    }
    $(".ship").css("left", shipX + "px");
  });



// query the current location of the ship.
var local_ship_position = ship_location;
var is_active = true;
function updateBoard() {
 	$.getJSON("//www.codingthecrowd.com/counter.php", {key: “winniel”, data: {localship: local_ship_position, active: is_active}})
      .done(function(json) {
          // do something with the response
            var count = json.count;
    		var sumPos = 0;
    		var posArray = [];
    		// go through each person's position
    		for (var i=0; i < count; i++){
    			indiv_pos = json.results[i].data['local_ship'];
    			if (json.results[i].data['is_active'] == true) {
    				sumPos += indiv_pos;
    				posArray.push(indiv_pos);
    			}
    		}
    		// average mediator
    		if (mediator == 'average') {
    			collective_location = Math.floor(sumPos/count);
    			cShip.css("left", collective_location + "px");  
    		}
    		// better mediator takes mode of all positions
    		else if (mediator == 'better') {
    			collective_location = Math.mode(posArray);

    		// ============== Move board functions ============================
    		// shift all colors down
		    $("#scoreboard").text("$ " +amount_earned.toFixed(3));
		    for (var row = gameboardHeight/cellH-1; row>0; row--){
		      for (var col=0; col <gameboardWidth/cellW; col++){
		        var colorAbove = $("#cell_" + col + "_" + (row - 1)).css("background-color");
		        //console.log(colorAbove);
		        $("#cell_" + col + "_" + row).css("background-color", colorAbove);
		        //console.log("#cell_" + ship_location + "_" + row);
		        console.log($("#cell_" + ship_location + "_" + (gameboardHeight/cellH-1)).css("background-color"));
		        // gamemboardHeight/cellH is 5, -1 to get the index of the bottom row, -1 again to get the row above that
		        if ($("#cell_" + ship_location + "_" + (gameboardHeight/cellH-2)).css("background-color") == "rgb(0,0,255)") {
		          console.log("collision"); // don't know why but it isn't detecting collision. 
		        }
		      }
		    }
		    // color in first row
		    for (var frcol=0; frcol <gameboardWidth/cellW; frcol++){
		      //console.log("cell_" + frcol + "_0");
		      if (board[offset][frcol] == "1"){
		        $("#cell_" + frcol + "_0").css("background-color", "blue");
		      }
		      else if (board[offset][frcol] == "0"){
		        $("#cell_" + frcol + "_0").css("background-color", board_color);
		      }
		    }
		    // collision detection // this follows the collective ship
		    var check_bottom_row = 0;
		    if (offset + gameboardHeight/cellH > board.length) {
		      check_bottom_row = (offset + gameboardHeight/cellH)%board.length;
		      //console.log("too much");
		    }
		    else if (offset + gameboardHeight/cellH < board.length) {
		      check_bottom_row = offset + gameboardHeight/cellH;
		    }
		    if ((board[check_bottom_row])[collective_location] == 1) {
		      alert("Game Over.");
		      document.getElementById("amount_earned").value = amount_earned;
		      document.getElementById("time_elapsed").value = time_elapsed;
		      document.forms["mturk_form"].submit();
		    }


		    // change offset to shift board down
		    if (offset == 0) {
		      offset = board.length-1;
		    }
		    else if(offset > 0 && offset <=board.length-1){
		      offset--;
		    }

		    // ============== Score and time functions ========================
		    // increment time and money
		    time_elapsed++;
		    if(gameover == false && time_elapsed != 0 && (amount_earned < 2)){
		      amount_earned += 0.001;
		      console.log(amount_earned);
		      $("#scoreboard").text("$ " +amount_earned.toFixed(3));
		    }

		    if (amount_earned==2) {
		      	alert("Congratulations. You have beat the game.");
		      	document.getElementById("amount_earned").value = amount_earned;
		      	document.getElementById("time_elapsed").value = time_elapsed;
		      	document.forms["mturk_form"].submit();
		    }

		    // ============== Game Over functions =============================
		    if (gameover) {
		   		clearTimeout(timer);
		      	alert("Game Over.")
		      	document.getElementById("amount_earned").value = amount_earned;
		      	document.getElementById("time_elapsed").value = time_elapsed;
		      	document.forms["mturk_form"].submit();
		      	clearTimeout(timer);
		      	//gameover = false;
		    }
       })      
      .fail(function(jqxhr, textStatus, error) {
          var err = textStatus + ", " + error;
          console.log( "Request Failed: " + err );
  	});
}
// updateBoard(); // commenented out because what if you get gameover in the first round
var timer = setTimeout(updateBoard, 1000);