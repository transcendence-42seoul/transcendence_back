// Global Variables
enum DIRECTION {
  IDLE = 0,
  UP = 1,
  DOWN = 2,
  LEFT = 3,
  RIGHT = 4,
}

const ROUNDS: number[] = [7];
const COLORS = ['#1abc9c', '#2ecc71', '#3498db', '#8c52ff', '#9b59b6'];

const Ball = {
  new: function (
    this: { canvas: HTMLCanvasElement },
    incrementedSpeed?: number,
  ) {
    return {
      width: 18,
      height: 18,
      x: this.canvas.width / 2 - 9,
      y: this.canvas.height / 2 - 9,
      moveX: DIRECTION.IDLE,
      moveY: DIRECTION.IDLE,
      speed: incrementedSpeed || 7,
    };
  },
};

type Side = 'left' | 'right';

type PlayerType = {
  width: number;
  height: number;
  x: number;
  y: number;
  score: number;
  move: DIRECTION;
  speed: number;
};

// The ai object (The two lines that move up and down)
const Ai = {
  new: function (this: { canvas: HTMLCanvasElement }, side: Side) {
    return {
      width: 18,
      height: 180,
      x: side === 'left' ? 150 : this.canvas.width - 150,
      y: this.canvas.height / 2 - 35,
      score: 0,
      move: DIRECTION.IDLE,
      speed: 8,
    };
  },
};

class CGame {
  public canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D | null;
  public player: PlayerType;
  public ai;
  public ball;
  public running;
  public turn: PlayerType | null;
  public timer;
  public color: string;
  public over: boolean;
  public round: number;

  constructor() {
    this.canvas = document.querySelector('canvas')!;
    this.context = this.canvas.getContext('2d');

    this.canvas.width = 1400;
    this.canvas.height = 1000;

    this.canvas.style.width = this.canvas.width / 2 + 'px';
    this.canvas.style.height = this.canvas.height / 2 + 'px';

    this.player = Ai.new.call(this, 'left');
    this.ai = Ai.new.call(this, 'right');
    this.ball = Ball.new.call(this);

    this.ai.speed = 5;
    this.running = this.over = false;
    this.turn = this.ai;
    this.timer = this.round = 0;
    this.color = '#8c52ff';
  }

  makeInit = () => {
    this.canvas = document.querySelector('canvas')!;
    this.context = this.canvas.getContext('2d');

    this.canvas.width = 1400;
    this.canvas.height = 1000;

    this.canvas.style.width = this.canvas.width / 2 + 'px';
    this.canvas.style.height = this.canvas.height / 2 + 'px';

    this.player = Ai.new.call(this, 'left');
    this.ai = Ai.new.call(this, 'right');
    this.ball = Ball.new.call(this);

    this.ai.speed = 5;
    this.running = this.over = false;
    this.turn = this.ai;
    this.timer = this.round = 0;
    this.color = '#8c52ff';
  };

  initialize = () => {
    this.menu();
    this.listen();
  };

  endGameMenu = (text: string) => {
    if (this.context) {
      // Change the canvas font size and color
      this.context.font = '45px Courier New';
      this.context.fillStyle = this.color;

      // Draw the rectangle behind the 'Press any key to begin' text.
      this.context.fillRect(
        this.canvas.width / 2 - 350,
        this.canvas.height / 2 - 48,
        700,
        100,
      );

      // Change the canvas color;
      this.context.fillStyle = '#ffffff';

      // Draw the end game menu text ('Game Over' and 'Winner')
      this.context.fillText(
        text,
        this.canvas.width / 2,
        this.canvas.height / 2 + 15,
      );

      setTimeout(() => {
        this.makeInit();
        document.removeEventListener('keydown', this.keydownfunction);
        document.removeEventListener('keyup', this.keyupfunction);
        this.initialize();
      }, 3000);
    } else {
      console.error('context is null');
    }
  };

  menu = () => {
    // Draw all the Pong objects in their current state
    this.draw(); // 현재 상태를 draw해준다.

    if (!this.context) return;
    // Change the canvas font size and color
    this.context.font = '50px Courier New';
    this.context.fillStyle = this.color;

    // Draw the rectangle behind the 'Press any key to begin' text.
    this.context.fillRect(
      this.canvas.width / 2 - 350,
      this.canvas.height / 2 - 48,
      700,
      100,
    );

    // Change the canvas color;
    this.context.fillStyle = '#ffffff';

    // Draw the 'press any key to begin' text
    this.context.fillText(
      'Press any key to begin',
      this.canvas.width / 2,
      this.canvas.height / 2 + 15,
    );
  };

  // Update all objects (move the player, ai, ball, increment the score, etc.)
  update = () => {
    if (!this.over) {
      // If the ball collides with the bound limits - correct the x and y coords.
      if (this.ball.x <= 0) this._resetTurn(this.ai, this.player);
      if (this.ball.x >= this.canvas.width - this.ball.width)
        this._resetTurn(this.player, this.ai);
      if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
      if (this.ball.y >= this.canvas.height - this.ball.height)
        this.ball.moveY = DIRECTION.UP;

      // Move player if they player.move value was updated by a keyboard event
      if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
      else if (this.player.move === DIRECTION.DOWN)
        this.player.y += this.player.speed;

      // On new serve (start of each turn) move the ball to the correct side
      // and randomize the direction to add some challenge.
      if (this._turnDelayIsOver() && this.turn) {
        this.ball.moveX =
          this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
        this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][
          Math.round(Math.random())
        ];
        this.ball.y =
          Math.floor(Math.random() * this.canvas.height - 200) + 200;
        this.turn = null;
      }

      // If the player collides with the bound limits, update the x and y coords.
      if (this.player.y <= 0) this.player.y = 0;
      else if (this.player.y >= this.canvas.height - this.player.height)
        this.player.y = this.canvas.height - this.player.height;

      // Move ball in intended direction based on moveY and moveX values
      if (this.ball.moveY === DIRECTION.UP)
        this.ball.y -= this.ball.speed / 1.5;
      else if (this.ball.moveY === DIRECTION.DOWN)
        this.ball.y += this.ball.speed / 1.5;
      if (this.ball.moveX === DIRECTION.LEFT) this.ball.x -= this.ball.speed;
      else if (this.ball.moveX === DIRECTION.RIGHT)
        this.ball.x += this.ball.speed;

      // Handle ai (AI) UP and DOWN movement
      if (this.ai.y > this.ball.y - this.ai.height / 2) {
        if (this.ball.moveX === DIRECTION.RIGHT)
          this.ai.y -= this.ai.speed / 1.5;
        else this.ai.y -= this.ai.speed / 4;
      }
      if (this.ai.y < this.ball.y - this.ai.height / 2) {
        if (this.ball.moveX === DIRECTION.RIGHT)
          this.ai.y += this.ai.speed / 1.5;
        else this.ai.y += this.ai.speed / 4;
      }

      // Handle ai (AI) wall collision
      if (this.ai.y >= this.canvas.height - this.ai.height)
        this.ai.y = this.canvas.height - this.ai.height;
      else if (this.ai.y <= 0) this.ai.y = 0;

      // Handle Player-Ball collisions
      if (
        this.ball.x - this.ball.width <= this.player.x &&
        this.ball.x >= this.player.x - this.player.width
      ) {
        if (
          this.ball.y <= this.player.y + this.player.height &&
          this.ball.y + this.ball.height >= this.player.y
        ) {
          this.ball.x = this.player.x + this.ball.width;
          this.ball.moveX = DIRECTION.RIGHT;
        }
      }

      // Handle ai-ball collision
      if (
        this.ball.x - this.ball.width <= this.ai.x &&
        this.ball.x >= this.ai.x - this.ai.width
      ) {
        if (
          this.ball.y <= this.ai.y + this.ai.height &&
          this.ball.y + this.ball.height >= this.ai.y
        ) {
          this.ball.x = this.ai.x - this.ball.width;
          this.ball.moveX = DIRECTION.LEFT;
        }
      }
    }

    // Handle the end of round transition
    // Check to see if the player won the round.
    if (this.player.score === ROUNDS[this.round]) {
      // Check to see if there are any more rounds/levels left and display the victory screen if
      // there are not.
      if (!ROUNDS[this.round + 1]) {
        this.over = true;

        setTimeout(() => {
          this.endGameMenu('Winner!');
        }, 1000);
      } else {
        // If there is another round, reset all the values and increment the round number.
        this.color = this._generateRoundColor();
        this.player.score = this.ai.score = 0;
        this.player.speed += 0.5;
        this.ai.speed += 1;
        this.ball.speed += 1;
        this.round += 1;
      }
    }
    // Check to see if the ai/AI has won the round.
    else if (this.ai.score === ROUNDS[this.round]) {
      this.over = true;

      setTimeout(() => {
        this.endGameMenu('Game Over!');
      }, 1000);
    }
  };

  // Draw the objects to the canvas element
  draw = () => {
    if (!this.context) return;
    // Clear the Canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Set the fill style to black
    this.context.fillStyle = this.color;

    // Draw the background
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Set the fill style to white (For the paddles and the ball)
    this.context.fillStyle = '#ffffff';

    // Draw the Player
    this.context.fillRect(
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height,
    );

    // Draw the Ai
    this.context.fillRect(this.ai.x, this.ai.y, this.ai.width, this.ai.height);

    // Draw the Ball
    if (this._turnDelayIsOver()) {
      this.context.fillRect(
        this.ball.x,
        this.ball.y,
        this.ball.width,
        this.ball.height,
      );
    }

    // Draw the net (Line in the middle)
    this.context.beginPath();
    this.context.setLineDash([7, 15]);
    this.context.moveTo(this.canvas.width / 2, this.canvas.height - 140);
    this.context.lineTo(this.canvas.width / 2, 140);
    this.context.lineWidth = 10;
    this.context.strokeStyle = '#ffffff';
    this.context.stroke();

    // Set the default canvas font and align it to the center
    this.context.font = '100px Courier New';
    this.context.textAlign = 'center';

    // Draw the players score (left)
    this.context.fillText(
      this.player.score.toString(),
      this.canvas.width / 2 - 300,
      200,
    );

    // Draw the paddles score (right)
    this.context.fillText(
      this.ai.score.toString(),
      this.canvas.width / 2 + 300,
      200,
    );

    // Change the font size for the center score text
    this.context.font = '30px Courier New';

    // Draw the winning score (center)
    this.context.fillText(
      'Round ' + (this.round + 1),
      this.canvas.width / 2,
      35,
    );

    // Change the font size for the center score value
    this.context.font = '40px Courier';

    // Draw the current round number
    const curRound = ROUNDS[this.round]
      ? ROUNDS[this.round]
      : ROUNDS[this.round - 1];

    this.context.fillText(curRound.toString(), this.canvas.width / 2, 100);
  };

  loop = () => {
    this.update();
    this.draw();

    // If the game is not over, draw the next frame.
    if (!this.over) requestAnimationFrame(this.loop);
    else console.log('game over');
  };

  keydownfunction = (key: KeyboardEvent) => {
    const thisRunning = this.running;
    const thisLoop = this.loop;
    // let thisPlayer = {...this.player};
    console.log('player ' + this.player.score);
    console.log('ai ' + this.ai.score);

    console.log('keydownfunction and running = ' + this.running);

    // Handle the 'Press any key to begin' function and start the game.
    if (this.running === false) {
      this.running = true;
      window.requestAnimationFrame(thisLoop);
    }

    // Handle up arrow and w key events
    if (key.keyCode === 38 || key.keyCode === 87)
      this.player.move = DIRECTION.UP;

    // Handle down arrow and s key events
    if (key.keyCode === 40 || key.keyCode === 83)
      this.player.move = DIRECTION.DOWN;
  };

  keyupfunction = (key: KeyboardEvent) => {
    this.player.move = DIRECTION.IDLE;
  };

  listen = () => {
    document.addEventListener('keydown', this.keydownfunction);

    // Stop the player from moving when there are no keys being pressed.
    document.addEventListener('keyup', this.keyupfunction);
  };

  // Reset the ball location, the player turns and set a delay before the next round begins.
  _resetTurn = (victor: PlayerType, loser: PlayerType) => {
    this.ball = Ball.new.call(this, this.ball.speed);
    this.turn = loser;
    this.timer = new Date().getTime();

    victor.score++;
  };

  // Wait for a delay to have passed after each turn.
  _turnDelayIsOver = () => {
    return new Date().getTime() - this.timer >= 1000;
  };

  // Select a random color as the background of each level/round.
  _generateRoundColor = (): string => {
    const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    if (newColor === this.color) return this._generateRoundColor();
    return newColor;
  };
}

const Pong = new CGame();

Pong.initialize();
