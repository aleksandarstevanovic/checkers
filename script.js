window.onload = function() {

  //The initial setup
  const gameBoard = [
    [  0,  1,  0,  1,  0,  1,  0,  1 ],
    [  1,  0,  1,  0,  1,  0,  1,  0 ],
    [  0,  1,  0,  1,  0,  1,  0,  1 ],
    [  0,  0,  0,  0,  0,  0,  0,  0 ],
    [  0,  0,  0,  0,  0,  0,  0,  0 ],
    [  2,  0,  2,  0,  2,  0,  2,  0 ],
    [  0,  2,  0,  2,  0,  2,  0,  2 ],
    [  2,  0,  2,  0,  2,  0,  2,  0 ]
  ];
  const select=new Audio();
  const capture=new Audio();
  const move=new Audio();
  const king=new Audio();
  const reset=new Audio();

  king.src='audio/king.mp3';
  move.src="audio/move.mp3";
  capture.src="audio/capture.mp3";
  select.src="audio/select.mp3";
  reset.src='audio/reset.mp3';
  //arrays to store the instances
  let pieces = [];
  let tiles = [];

  //distance formula
  const dist = function (x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x1-x2),2)+Math.pow((y1-y2),2));
  }
  //Piece object - there are 24 instances of them in a checkers game
  function Piece (element, position) {
    // when jump exist, regular move is not allowed
    // since there is no jump at round 1, all pieces are allowed to move initially
    this.allowedtomove = true;
    //linked DOM element
    this.element = element;

    //positions on gameBoard array in format row, column
    this.position = position;
    //which player's piece i it
    this.player = '';
    //figure out player by piece id

    if(this.element.id < 12)
      this.player = 1;
    else
      this.player = 2;
    //makes object a king
    this.king = false;
    this.makeKing = function () {

      this.element.style.backgroundImage="url('img/king"+this.player+".gif')";
      king.play();
      this.king = true;
    }
    //moves the piece
    Piece.prototype.move = function (tile) {
      
      this.element.classList.remove('selected');
      if(!Board.isValidPlacetoMove(tile.position[0], tile.position[1])) return false;
      //make sure piece doesn't go backwards if it's not a king
      if(this.player == 1 && this.king == false) {
        if(tile.position[0] < this.position[0]) return false;
      } else if (this.player == 2 && this.king == false) {
        if(tile.position[0] > this.position[0]) return false;
      }
      //remove the mark from Board.board and put it in the new spot
      Board.board[this.position[0]][this.position[1]] = 0;
      Board.board[tile.position[0]][tile.position[1]] = this.player;
      this.position = [tile.position[0], tile.position[1]];
      //change the css using board's dictionary
      this.element.style.top= Board.dictionary[this.position[0]];
      this.element.style.left=Board.dictionary[this.position[1]];

      //if piece reaches the end of the row on opposite side crown it a king (can move all directions)
      if(!this.king && (this.position[0] == 0 || this.position[0] == 7 ))
        this.makeKing();
      return true;
    };

    //tests if piece can jump anywhere
  Piece.prototype.canJumpAny = function () {
      if(this.canOpponentJump([this.position[0]+2, this.position[1]+2]) ||
         this.canOpponentJump([this.position[0]+2, this.position[1]-2]) ||
         this.canOpponentJump([this.position[0]-2, this.position[1]+2]) ||
         this.canOpponentJump([this.position[0]-2, this.position[1]-2])) {
        return true;
      } return false;
    };

    //tests if an opponent jump can be made to a specific place
    Piece.prototype.canOpponentJump = function(newPosition) {
      //find what the displacement is
      let dx = newPosition[1] - this.position[1];
      let dy = newPosition[0] - this.position[0];
      //make sure object doesn't go backwards if not a king
      if(this.player == 1 && this.king == false) {
        if(newPosition[0] < this.position[0]) return false;
      } else if (this.player == 2 && this.king == false) {
        if(newPosition[0] > this.position[0]) return false;
      }
      //must be in bounds
      if(newPosition[0] > 7 || newPosition[1] > 7 || newPosition[0] < 0 || newPosition[1] < 0) return false;
      //middle tile where the piece to be conquered sits
      let tileToCheckx = this.position[1] + dx/2;
      let tileToChecky = this.position[0] + dy/2;
      if(tileToCheckx > 7 || tileToChecky > 7 || tileToCheckx < 0 || tileToChecky < 0) return false;
      //if there is a piece there and there is no piece in the space after that
      if(!Board.isValidPlacetoMove(tileToChecky, tileToCheckx) && Board.isValidPlacetoMove(newPosition[0], newPosition[1])) {
        //find which object instance is sitting there
        for(pieceIndex in pieces) {
          if(pieces[pieceIndex].position[0] == tileToChecky && pieces[pieceIndex].position[1] == tileToCheckx) {
            if(this.player != pieces[pieceIndex].player) {
              //return the piece sitting there
              return pieces[pieceIndex];
            }
          }
        }
      }
      return false;
    };

    Piece.prototype.opponentJump = function (tile) {
      let pieceToRemove = this.canOpponentJump(tile.position);
      //if there is a piece to be removed, remove it
      if(pieceToRemove) {
        pieces[pieceIndex].remove();
        return true;
      }
      return false;
    };

    Piece.prototype.remove = function () {
      //remove it and delete it from the gameboard
   
      this.element.style.display="none";

      if(this.player == 1) {

        Board.score.player2 += 1;
        if(Board.score.player2>9) document.getElementById('player2score').style.left='32%';
        document.getElementById('player2score').innerHTML=Board.score.player2;
       

      }
      if(this.player == 2) {
         Board.score.player1 += 1;

       if(Board.score.player1>9) document.getElementById('player1score').style.left='32%';
        document.getElementById('player1score').innerHTML=Board.score.player1;
      }
      Board.board[this.position[0]][this.position[1]] = 0;
      //reset position so it doesn't get picked up by the for loop in the canOpponentJump method
      this.position = [];
      let playerWon = Board.checkifAnybodyWon();
      if(playerWon) {
       
       document.getElementById('winnerText').innerHTML="Player "+playerWon+" has won!";
      $('#winner').modal('hide');
      $('#winner').modal('show');

        
      }
     Board.check_if_jump_exist();
    }
  }

  function Tile (element, position) {
    //linked DOM element
    this.element = element;
    //position in gameboard
    this.position = position;
    //if tile is in range from the piece
    Tile.prototype.inRange = function(piece) {

      for(k of pieces)
        if(k.position[0] == this.position[0] && k.position[1] == this.position[1]) return 'wrong';
      if(!piece.king && piece.player==1 && this.position[0] < piece.position[0]) return 'wrong';
      if(!piece.king && piece.player==2 && this.position[0] > piece.position[0]) return 'wrong';
      if(dist(this.position[0], this.position[1], piece.position[0], piece.position[1]) == Math.sqrt(2)) {
        //regular move
        return 'regular';
      } else if(dist(this.position[0], this.position[1], piece.position[0], piece.position[1]) == 2*Math.sqrt(2)) {
        //jump move
        return 'jump';
      }
    };
  }

  //Board object - controls logistics of game
  let Board = {
    board: gameBoard,
    score : { player1: 0, player2:0},
    playerTurn: 1,
    jumpexist: false,
    continuousjump: false,
    tilesElement: document.querySelector('.tiles'),
    //dictionary to convert position in Board.board to the viewport units
    dictionary: ["0vmin", "10vmin", "20vmin", "30vmin", "40vmin", "50vmin", "60vmin", "70vmin", "80vmin", "90vmin"],
    //initialize the 8x8 board
    initalize: function () {
      
      let countPieces = 0;
      let countTiles = 0;
      for (row in this.board) { //row is the index
        for (column in this.board[row]) { //column is the index
          //whole set of if statements control where the tiles and pieces should be placed on the board
          let node=document.createElement('div');
          node.className='tile';
          node.id="tile"+countTiles;
          node.style.top=this.dictionary[row];
          node.style.left=this.dictionary[column];

          let node1=document.createElement('div');
          node1.className='piece';
          node1.id=countPieces;
          node1.style.top=this.dictionary[row];
          node1.style.left=this.dictionary[column];
          if(row%2 == 1) {
            if(column%2 == 0) {

              this.tilesElement.appendChild(node);
              tiles[countTiles]=new Tile((document.getElementById('tile'+countTiles)),[parseInt(row), parseInt(column)]);

              countTiles += 1;
            }
          } else {
            if(column%2 == 1) {

              this.tilesElement.appendChild(node);
              tiles[countTiles]=new Tile((document.getElementById('tile'+countTiles)),[parseInt(row), parseInt(column)]);

              countTiles += 1;
            }
          }
          if(this.board[row][column] == 1) {

           document.querySelector('.player1pieces').appendChild(node1);          
            pieces[countPieces]=new Piece((document.getElementById(countPieces)),[parseInt(row), parseInt(column)]);
            countPieces += 1;
          } else if(this.board[row][column] == 2) {
           
            document.querySelector('.player2pieces').appendChild(node1);
            pieces[countPieces]=new Piece((document.getElementById(countPieces)),[parseInt(row), parseInt(column)]);
            countPieces += 1;
          }
        }
      }
    },
    //check if the location has an object
    isValidPlacetoMove: function (row, column) {
      


      if(row<0 || row >7 || column < 0 || column > 7) return false;
      if(this.board[Math.round(row)][Math.round(column)] == 0) {
        return true;
      } return false;
    },
    //change the active player - also changes div.turn's CSS
    changePlayerTurn: function () {
      if(this.playerTurn == 1) {
        this.playerTurn = 2;
        document.querySelector('.igrac1').classList.remove('turn');
        document.querySelector('.igrac2').classList.add('turn');
      
        this.check_if_jump_exist()
        return;
      }
      if(this.playerTurn == 2) {
        this.playerTurn = 1;
        //$('.turn').css("background", "linear-gradient(to right, #BEEE62 50%, transparent 50%)");
        document.querySelector('.igrac2').classList.remove('turn');
        document.querySelector('.igrac1').classList.add('turn');
        //document.querySelector('.turn').style.background="linear-gradient(to left, transparent 50%, #BEEE62 50%)";
        this.check_if_jump_exist()
        return;
      }
    },
    checkifAnybodyWon: function () {
      if(this.score.player1 == 12) {
        return 1;
      } else if(this.score.player2 == 12) {
        return 2;
      } return false;
    },
    //reset the game
    clear: function () {
      reset.play();
      setTimeout(function(){
        location.reload();
      },20);

    },
    check_if_jump_exist: function(){

      this.jumpexist = false;
      this.continuousjump = false;
      for(k of pieces){
        k.allowedtomove = false;
        k.element.classList.remove('forced');
        // if jump exist, only set those "jump" pieces "allowed to move"
        if(k.position.length!=0 && k.player == this.playerTurn && k.canJumpAny()){

          this.jumpexist = true
          k.allowedtomove = true;
          k.element.classList.add('forced');

        }
      }
      // if jump doesn't exist, all pieces are allowed to move
      if(!this.jumpexist) {
        for(k of pieces){
         k.allowedtomove = true;
         //k.element.classList.remove('forced');
        }
      }
    },
    // Possibly helpful for communication with back-end.
    str_board: function(){
      ret=""
      for(i in this.board){
        for(j in this.board[i]){
          let found = false
          for(k of pieces){
            if(k.position[0] == i && k.position[1] == j){
              if(k.king) ret += (this.board[i][j]+2)
              else ret += this.board[i][j]
              found = true
              break
            }
          }
          if(!found) ret += '0'
        }
      }
      return ret
    }
  }

  //initialize the board
  Board.initalize();




  /***
  Events
  ***/

  //select the piece on click if it is the player's turn
  //finding pieces avalibe to move
  function avalibe(b){
    let dostupna= document.querySelectorAll('.avalibe');

    dostupna.forEach(function (tile) {
      tile.classList.remove('avalibe');
    })

     if (Board.jumpexist && pieces[b.id].player==Board.playerTurn && pieces[b.id].allowedtomove) {

    for (let polje of tiles){

      if(polje.inRange(pieces[b.id])=='jump'   && polje.inRange(pieces[b.id])!=undefined && pieces[b.id].canOpponentJump(polje.position)) {
        document.querySelector('#'+polje.element.id).classList.add('avalibe');
        break;
      }
    }
  }

      for (let polje of tiles){

      if(polje.inRange(pieces[b.id])=='regular'  && pieces[b.id].player==Board.playerTurn && !Board.jumpexist){
       document.querySelector('#'+polje.element.id).classList.add('avalibe');
      }

  }


    }



 let figure=document.querySelectorAll(".piece");
figure.forEach(function(b){


  b.addEventListener("click",function () {

      let selected;
      avalibe(b);

      const isPlayersTurn = (this.parentElement.className == "player"+Board.playerTurn+"pieces");
      if(isPlayersTurn && !Board.continuousjump && pieces[this.id].allowedtomove) {
       select.play();
        if(this.classList.contains('selected')) selected = true;
        figure.forEach(function(c){
          c.classList.remove('selected');
        });
        if(!selected) {
          b.classList.add('selected');
        }
      }
      else {
        if(isPlayersTurn) {
          if(!Board.continuousjump)

          
            console.log("jump exist for other pieces, that piece is not allowed to move")
          else
            console.log("continuous jump exist, you have to jump the same piece")
        }
      }
    });
});




  //reset game when clear button is pressed
  document.getElementById("cleargame").addEventListener("click",function(){
     reset.pause();
     reset.play();
     setTimeout(function(){
      Board.clear();
    },80);
    
   
  });


  let polja=document.querySelectorAll('.tile');

  polja.forEach(function(b){
    b.addEventListener("click", function () {
      let dostupna= document.querySelectorAll('.avalibe');
      dostupna.forEach(function (tile) {
        tile.classList.remove('avalibe');
      })
        //make sure a piece is selected

        if(document.querySelectorAll('.selected').length!= 0) {
          //find the tile object being clicked

          let tileID = this.id.replace(/tile/,'');
          let tile = tiles[tileID];
          //find the piece being selected

          let piece = pieces[document.querySelector('.selected').id];

          //check if the tile is in range from the object
          const inRange = tile.inRange(piece);
          if(inRange != 'wrong') {
            //if the move needed is jump, then move it but also check if another move can be made (double and triple jumps)
            if(inRange == 'jump') {
              if(piece.opponentJump(tile)) {
                piece.move(tile);
                capture.play();

                if(piece.canJumpAny()) {
                   // Board.changePlayerTurn(); //change back to original since another turn can be made
                   piece.element.classList.add('selected');

                   // exist continuous jump, you are not allowed to de-select this piece or select other pieces
                   Board.continuousjump = true;
                } else {
                  Board.changePlayerTurn()
                }
              }
              //if it's regular then move it if no jumping is available
            } else if(inRange == 'regular' && !Board.jumpexist) {
              if(!piece.canJumpAny()) {
                piece.move(tile);
                move.play();
                Board.changePlayerTurn()
              } else {
                alert("You must jump when possible!");
              }
            }
          }
        }
      })
  })
}
