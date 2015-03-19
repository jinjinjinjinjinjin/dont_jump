var myGame = angular.module('myGame', []);

myGame.controller('canvasCtrl', function($log){
	$log.log("enter canvasCtrl");
	var canvas =  document.getElementById("bg");
	var context = canvas.getContext("2d");

	context.beginPath();
	context.moveTo(0, 20);
	context.lineTo(0, 320);
	context.lineTo(340, 320);
	context.lineTo(340, 20);
	context.lineTo(0, 320);
	context.moveTo(340, 320);
	context.lineTo(0, 20);
	context.strokeStyle = "#999";
	context.stroke();	

	context.beginPath();
	context.scale(2, 1);
	context.arc(85, 45, 30, 0, 2 * Math.PI, true);	
	context.strokeStyle = "#999";
	context.stroke();	

	this.dismissAlert = function() {
		$log.log("enter dismissAlert");
		document.getElementById("alertBox").style.visibility = "hidden";
	}
})
.controller('gameCtrl', function($log, $scope, gameFactory){
	$log.log("enter gameCtrl");
	var position, player, piece;
	$scope.color = [
		{name: "Red", value: "#d9534f"},
		{name: "Marine", value: "#337ab7"},
		{name: "Orange", value: "#f0ad4e"},
		{name: "Green", value: "#5cb85c"},
		{name: "Blue", value: "#5bc0de"},
	];
	$scope.mode = [
		{name: "2 Players 1 PC", players: ["Player 1", "Player 2"]},
		{name: "1 Player VS 1 Robot", players: ["Player 1", "Robot 1"]}
	];
	$scope.modeSelected = 0;//by default, game mode is "2 Players 1 PC"

	player = [
		{color: 4, onMove: true},//by default, player1 is btn-info, on blue
		{color: 3, onMove: false} //by default, player2 is btn-success, on green
	];

	resetConfig = function() {
		position = [
			{x: -10, y: 10, isOccupied: false, nextTo: [1,4]},
			{x: -10, y: 290, isOccupied: false, nextTo: [0,2,4]},
			{x: 300, y: 290, isOccupied: false, nextTo: [1,3,4]},
			{x: 300, y: 10, isOccupied: false, nextTo: [2,4]},
			{x: 145, y: 145, isOccupied: false, nextTo: [0,1,2,3]}
		];

		piece = [
			{position:0},
			{position:3},//piece[0] and piece[1] belong to player[0]
			{position:1},
			{position:2},//piece[2] and piece[3] belong to player[1]
			{position:4}//this is vacant piece
		];

		player[0].onMove = true;
		player[1].onMove = false;
	};

	drawPiece = function(color, index, isEnabled) {
		var element = document.createElement("a");
		var pIndex = piece[index].position;
		element.setAttribute("class", "pieceStyle");
		if(isEnabled) element.setAttribute("href", "#");
		element.setAttribute("id", index);
		element.setAttribute("style", "background:" + color + ";top:" + position[pIndex].y + "px;left:" + position[pIndex].x + "px;");
		gameFactory.canvas.appendChild(element);
		position[index].isOccupied = (color !== "") ? true : false; 
	};

	movePiece = function(vacant, from, to) {
		$log.log("movePiece from " + from + " to " + to);
		var i,j;
		for(i = 0; i < position[from].nextTo.length; i++) {
			if(to == position[from].nextTo[i]) {
				gameFactory.selectedPiece.style.top = position[to].y + "px";
				gameFactory.selectedPiece.style.left = position[to].x + "px";
				piece[gameFactory.selectedPiece.id].position = to;
				position[to].isOccupied = true;

				vacant.style.top = position[from].y + "px";
				vacant.style.left = position[from].x + "px";
				piece[vacant.id].position = from;
				position[from].isOccupied = false;

				player[1].onMove = !player[1].onMove;
				player[0].onMove = !player[0].onMove;

				for(j = 0; j < 4; j ++) {
					element = document.getElementById("" + j);
					if(j < 2) {
						player[1].onMove ? element.removeAttribute("href") : element.setAttribute("href", "#");
					} else {
						player[0].onMove ? element.removeAttribute("href") : element.setAttribute("href", "#");
					}
				}
				checkMove();
			} else {
				$log.log("can not move");
			}
		}
		if($scope.modeSelected == 0) { //for mode 2 players, need to reset selectedPiece so next player could select his piece
			gameFactory.selectedPiece = null;
		} else {
			gameFactory.selectedPiece = vacant;//for mode with robot, the last selectedPiece is the vacant piece, robot will need it to caculate his move
		}
		setTimeout(function(){
			if($scope.modeSelected == 1 && player[1].onMove == true) {
				$log.log("robot should move");
				//$log.log(gameFactory.selectedPiece);
				//$log.log("vacant position : " + piece[vacant.id].position);
				//$log.log("piece 2 position : " + piece[2].position);
				//$log.log("piece 3 position : " + piece[3].position);
				var nextToArr = position[piece[vacant.id].position].nextTo; 
				for(i = 0; i < nextToArr.length; i++) {
					if(piece[2].position == nextToArr[i]) {
						$log.log("move piece 2");
						gameFactory.selectedPiece = document.getElementById("2");
						movePiece(vacant, piece[2].position, piece[vacant.id].position);		
						break;			
					} else if(piece[3].position == nextToArr[i]) {
						$log.log("move piece 3");
						gameFactory.selectedPiece = document.getElementById("3");
						movePiece(vacant, piece[3].position, piece[vacant.id].position);
						break;
					}
				}
				gameFactory.selectedPiece = null;
			}
		}, 500)
	};	

	checkMove = function() {
		$log.log("checkMove");
		var vacant = document.getElementById(4);
		var i;
		var flag = true;
		var msg;
		if(player[1].onMove) {
			for(i = 0; i < position[piece[2].position].nextTo.length; i++) {
				flag &= position[position[piece[2].position].nextTo[i]].isOccupied;
			}
			for(i = 0; i < position[piece[3].position].nextTo.length; i++) {
				flag &= position[position[piece[3].position].nextTo[i]].isOccupied;
			}	
		}
		if(player[0].onMove) {
			for(i = 0; i < position[piece[0].position].nextTo.length; i++) {
				flag &= position[position[piece[0].position].nextTo[i]].isOccupied;
			}
			for(i = 0; i < position[piece[1].position].nextTo.length; i++) {
				flag &= position[position[piece[1].position].nextTo[i]].isOccupied;
			}	
		}		
		if(flag) {
			msg = "Congratuations ! "
			msg += player[1].onMove ? $scope.color[player[0].color].name : $scope.color[player[1].color].name;
			msg += " wins!";
			$log.log(msg);
			displayMsg(msg);
		}
	};

	displayMsg = function(msg) {
		var element = document.getElementById("alertMsg");

		element.innerHTML = msg;
		document.getElementById("alertBox").style.visibility = "visible";
	};

	this.startGame = function() {
		$log.log("enter startGame");
		this.removeGame();

		resetConfig();

		drawPiece($scope.color[player[0].color].value, 0, player[0].onMove);
		drawPiece($scope.color[player[0].color].value, 1, player[0].onMove);
		drawPiece($scope.color[player[1].color].value, 2, player[1].onMove);
		drawPiece($scope.color[player[1].color].value, 3, player[1].onMove);
		drawPiece("", 4, true);

		gameFactory.canvas.addEventListener('click', function(e){
			//$log.log("click" + e.target.id);
			var target = e.target;
			if(target.style.background !=="" && target.href) { //onMove Player's piece has been selected
				gameFactory.selectedPiece = target;
				$log.log("new selectedPiece : id = " + e.target.id + " position = " + piece[e.target.id].position);
			} else {
				if(gameFactory.selectedPiece !== null && target.style.background ==="") { //vacant position has been selected
					movePiece(target, piece[gameFactory.selectedPiece.id].position, piece[target.id].position);					
				}
				
			}
		});
	};

	this.removeGame = function() {
		while(gameFactory.canvas.lastChild) {
			gameFactory.canvas.removeChild(gameFactory.canvas.lastChild);
		}
	};

	this.showMode = function() {
		var element = document.getElementById("modeMenu");
		if(element.style.display == "block") {
			element.style.display = "none";
		} else {
			element.setAttribute("style", "display:block;");
		}
	};

	this.showColorSet = function(mode) {
		var element = document.getElementById("playerColorSet");
		element.style.visibility = "visible";
		document.getElementById("modeMenu").style.display = "none";
		$scope.modeSelected = mode;
	};

	this.showPlayer1Color = function() {
		var element = document.getElementById("colorPlayer0");
		if(element.style.display == "block") {
			element.style.display = "none";
		} else {
			element.setAttribute("style", "display:block;");
		}
	};

	this.showPlayer2Color = function() {
		var element = document.getElementById("colorPlayer1");
		if(element.style.display == "block") {
			element.style.display = "none";
		} else {
			element.setAttribute("style", "display:block;");
		}
	};		

	this.setColor = function(playerIndex, colorIndex) {
		$log.log("enter changeColor player = " + playerIndex + " colorIndex = " + colorIndex);
		var element = document.getElementById("colorPlayer" + playerIndex);
		element.style.display = "none";
		element = document.getElementById("colorButton" + playerIndex);
		element.setAttribute("style", "background:" + $scope.color[colorIndex].value);
		player[playerIndex].color = colorIndex;

		element = document.getElementById(0);
		if(element) {
			if(playerIndex == 0) {
				element.style.background = $scope.color[colorIndex].value;
				element = document.getElementById(1);
				element.style.background = $scope.color[colorIndex].value;
			} else {
				element = document.getElementById(2);
				element.style.background = $scope.color[colorIndex].value;
				element = document.getElementById(3);
				element.style.background = $scope.color[colorIndex].value;								
			}
		}
	}
})
.factory('gameFactory', function(){
	var gameConfig =  {
		canvas : document.getElementById("gameCanvas"),
		selectedPiece : null
	};
	return gameConfig;
})
