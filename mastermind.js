// This is a JavaScript implementation of the board game Mastermind.

/* The CodeKeeper constructor creates an object that houses the generated code and the
 * logic to determine if the code has been broken. It also keeps track of how many
 * attempts to break the code have been made.
 *
 * It takes three inputs:
 *     holes: length of the code
 *     colors: an array containing the colors which the code can be comprised of
 *     guesses: the number of guesses allowed by the player
 */
function CodeKeeper(holes, colors, guesses) {
  // When the CodeKeeper constructor is called, the secret code is randomly generated.
  // Note, the secret code is a private property so it cannot be queried from the
  // JavaScript console.
  var secretCode = [];
  for (var i = 0; i < holes; i++) {
    secretCode[i] = colors[Math.floor(Math.random() * colors.length)];
  }

  // The number of guesses allowed is stored in a private property so it
  // cannot be modified from the JavaScript console.
  var guessesRemaining = guesses;

  // This line was uncommented to evaluate my test cases.
  // console.log(secretCode);

  /* The evaluateGuess public method provides an API to evaluate the code submitted
   * by the player. It returns an object containing the number of colors in the correct
   * positions and the number of colors that are contained in the secret code, but not
   * in the correct position.
   *
   * This function is where I required test cases to ensure it was working correct.
   * First I made sure the exact matches were counted correctly by setting the guess to
   * colors not present in the secret code and then set one color at a time correctly.
   *
   * Next I made sure colors resulting in an exact match were not being counted again in
   * a color only match. I did this by picking a color only present once in the secret
   * code and setting the exact match correctly in the guess and then a second time in
   * another position. The remaining colors in the guess were not present in the secret
   * code.
   *
   * Finally I made sure incorrect positioned colors were only matched once. Again I
   * set all the colors in the guess to values not present in the secret code. Then I
   * picked a color present only once in the secret code and set it twice in the guess,
   * but not in the incorrect positions.
   */
  this.evaluateGuess = function(guess) {
    // Decrement the number of guesses remaining.
    guessesRemaining--;

    // Create results object to hold evaluation results of the players guess.
    var results = { correctColorAndPosition: 0,
                    correctColorOnly: 0 };

    // Create arrays to hold colors that are not matches in both color and position
    // between the secret code and the guess.
    var unmatchedSecretCode = [];
    var unmatchedGuess = []

    // First determine how many matches in color and position between the guess and
    // the secret code.
    for (var i = 0; i < guess.length; i++) {
      // If a match is found, we increment the appropriate property of our results
      // object.
      if (guess[i] == secretCode[i]) {
        results.correctColorAndPosition++;
      // if it is not a match in color and position, save the colors from both the
      // guess and the secret code for later evaluation.
      } else {
        unmatchedSecretCode.push(secretCode[i]);
        unmatchedGuess.push(guess[i]);
      }
    }

    // The colors in the guess that were not an exact match are evaluated against
    // the colors in the secret code that did not have an exact match.
    for (var i = 0; i < unmatchedGuess.length; i++) {
      for (var j = 0; j < unmatchedSecretCode.length; j++) {
        // If a color in the list of unmatched colors from the guess is found in the
        // list of unmatched colors from the secret code, increment the appropriate
        // property of the results object. Also, remove the color from the list of
        // unmatched colors from the secret code so it does not get matched again.
        if (unmatchedGuess[i] == unmatchedSecretCode[j]) {
          results.correctColorOnly++;
          unmatchedSecretCode.splice(j, 1);
          // Because this color has been matched, there is not longer a need to evaluate
          // it against the rest of the unmatched secret code colors. Break out of the
          // loop and evaluate the next color in the list of unmatched colors from the
          // guess.
          break;
        }
      }
    }

    // return results object;
    return results;
  }

  // The public guessesRemaining method profides an API to retrieve the current number
  // of guesses remaining.
  this.guessesRemaining = function() {
    return guessesRemaining;
  }
}

/* I used the module pattern to create an object to house the logic for the user
 * interface. The only publicly available property of the object is the init method. It
 * is called after the web page has been loaded.
 */
var gameBoard = (function() {
  var gameBoard = {};

  // These variables that are used to determine the behavior of the game.
  var holes = 4;
  var colors = ['yellow', 'brown', 'red', 'purple', 'blue', 'green'];
  var guesses = 12;

  // The codeKeeper object is created and houses the game data.
  var codeKeeper = new CodeKeeper(holes, colors, guesses);

  // The getGuess function is used to retrieve the guess from HTML form
  function getGuess() {
    // Obtain a reference to the form containing the guess.
    var guessForm = document.forms.guessForm;

    // Create an array housing the values from the guess form.
    var guess = [ guessForm.firstColor.value,
                  guessForm.secondColor.value,
                  guessForm.thirdColor.value,
                  guessForm.fourthColor.value ];

    // Store the results of the guess and the number of guesses remaining.
    var results = codeKeeper.evaluateGuess(guess);
    var guessesRemaining = codeKeeper.guessesRemaining();

    // Update the webpage with the guess, the results of the guess, and
    // the number of guesses remaining.
    updateGameBoard(guess, results, guessesRemaining);

    // If the guess was correct, alert the player and disable the Submit Guess button.
    if (results.correctColorAndPosition == holes) {
      alert("Congratulations, you broke the code!");
      document.getElementById('submitButton').disabled = true;
    }

    // If the player ran out of guesses, alert the player and disable the Submit Guess
    // button.
    if (guessesRemaining <= 0 && results.correctColorAndPosition != holes) {
      alert("Sorry, you ran out of guesses.");
      document.getElementById('submitButton').disabled = true;
    }
  }

  // The updateGameBoard function updates the web page with the guess made, the results of
  // the evaluate of that guess and the number of guesses remaining.
  function updateGameBoard(guess, results, guessesRemaining) {
    // Get a reference to the div that simulate the Mastermind game board.
    var gameBoardDiv = document.getElementById('gameBoard');
    // Create a div to house the guess and the results of the guess and set class for
    // CSS attributes.
    var gameBoardRowDiv = document.createElement('div');
    gameBoardRowDiv.setAttribute('class', 'gameBoardRow');
    // Create a div to hold the guess and set class for CSS attributes
    var codeDiv = document.createElement('div');
    codeDiv.setAttribute('class', 'code');

    // For each color in the guess, add a div representing that color to the codeDiv
    // and set the class for CSS attributes.
    for (var i = 0; i < guess.length; i++) {
      var codePegDiv = document.createElement('div');
      codePegDiv.setAttribute('class', guess[i] + 'Peg');
      codeDiv.appendChild(codePegDiv);
    }

    gameBoardRowDiv.appendChild(codeDiv);

    // Create a div to house the results of the evaluation of the players guess and set
    // class for CSS attributes.
    var keyDiv = document.createElement('div');
    keyDiv.setAttribute('class', 'key');

    // For each color in the correct position add a div representing a black circle to the
    // keyDiv and set class for CSS attributes.
    for (var i = 0; i < results.correctColorAndPosition; i++) {
      var keyPegDiv = document.createElement('div');
      keyPegDiv.setAttribute('class', 'blackKey');
      keyDiv.appendChild(keyPegDiv);
    }

    // for each correct color in the wrong position, add a div representing a white circle
    // to the keyDiv and set class for CSS attributes.
    for (var i = 0; i < results.correctColorOnly; i++) {
      var keyPegDiv = document.createElement('div');
      keyPegDiv.setAttribute('class', 'whiteKey');
      keyDiv.appendChild(keyPegDiv);
    }

    gameBoardRowDiv.appendChild(keyDiv);
    gameBoardDiv.appendChild(gameBoardRowDiv);

    // Update span with new number of guesses remaining.
    var guessesRemainingSpan = document.getElementById('guessesRemaining');
    guessesRemainingSpan.innerText = guessesRemaining;
  }

  // Once the page has loaded, the public init method is called to update the number
  // of guesses and set the event handler for the submit button.
  gameBoard.init = function() {
    // Update span with number of guess the player will get.
    var guessesRemainingSpan = document.getElementById('guessesRemaining');
    guessesRemainingSpan.innerText = codeKeeper.guessesRemaining();

    // Set the getGuess function as the handler for the onclick event for the
    // submitButton
    var submitButton = document.getElementById('submitButton');
    submitButton.onclick = getGuess;
  };

  return gameBoard;
})();

// Create anonymous function to handle the window onload event.
window.onload = function() {
  // The gameBoard object is initialized.
  gameBoard.init();
};