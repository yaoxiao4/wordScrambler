// This function uses the Fisher-Yates Shuffle to shuffle a string (taken from stack overflow)
String.prototype.shuffle = function () {
    var a = this.split(""),
        n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}

var API_KEY = "06a9e98bf7dd05aeda00901c0b30257f232606837362687fe";

scrambleApp.controller('scrambleController', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {
	$scope.word = [];
	$scope.score = 0;
	$scope.wordsCompleted = 0;
	// find high score in cache
	$scope.highScore = localStorage.getItem("highScore") || 0;

	/**
	 * Gets the word from the api and constructs approperiate variables (hardcoded for now)
	 */
	$scope.getNewWord = function() {
		$http({
		  method: 'GET',
		  url: '//api.wordnik.com:80/v4/words.json/randomWord?hasDictionaryDef=true&minCorpusCount=100000&minDictionaryCount=1&maxDictionaryCount=-1&minLength=4&maxLength=5&api_key=' + API_KEY
		}).then(function successCallback(response) {
		    $scope.word = response.data.word.toLowerCase().split('');
			$scope.scrambledWord = response.data.word.toLowerCase().shuffle().split('');
			$scope.wordCopy = $scope.word.slice();

			mapWordTracker();

			// show if hidden
			if (document.querySelector('.letter-wrapper')) {
				document.querySelector('.letter-wrapper').classList.remove('hidden');
			}
		  }, function errorCallback(response) {
		  	$scope.error = response;
		  });
	}

	/**
	 * This function creates a list of objects that tracks if the letter has been typed
	 */
	function mapWordTracker() {
		$scope.wordTypedTracker = [];
		for (var i = 0; i < $scope.word.length; i++) {
			$scope.wordTypedTracker.push({
				letter: $scope.scrambledWord[i],
				typed: false
			});
		}
	}

	/**
	 * This function adds scores for the user and increases the multiplier
	 */
	$scope.addScore = function() {
		$scope.wordsCompleted ++;
		$scope.score += 5*$scope.wordsCompleted;

		// give more time
		$scope.gameClock += 10;

		$scope.highScore = Math.max($scope.score, $scope.highScore);
		localStorage.setItem("highScore", $scope.highScore);
	};

	/**
	 * This function checks to see the user got the word correct and does the approperiate action
	 * @param array currentlyTyped An array that contains all the letters that have been typed
	 * @param Function callback Callback function to exeucute what we wanted after the check
	 */
	$scope.checkWinCondition = function(currentlyTyped, callback) {
		if (currentlyTyped.toString() == $scope.word.toString()) {
			document.querySelector('.win').classList.add('active');
			document.querySelector('.letter-wrapper').classList.add('hidden')

			// Give the user some time to see the message
			$timeout(function() {
				$scope.scrambledWord = [];
				document.querySelector('.win').classList.remove('active');
				// Add score and get a new word for the user
				$scope.getNewWord();
				$scope.addScore();
				callback(true);
			}, 2000);
		} else {
			$scope.loss = true;
			document.querySelector('.loss').classList.add('active');

			// Give the user some time to see the message
			$timeout(function() {
				document.querySelector('.loss').classList.remove('active');
				// Create a new word copy
				$scope.wordCopy = $scope.scrambledWord.slice();
				$scope.gameClock = Math.max($scope.gameClock - 5, 0);
				$scope.$digest();
				callback(false);
			}, 2000);
		}
	};

	// gameclock
	$scope.gameClock = 25;

	// this is the countdown for the game time
	function startTimer() {
	    setInterval(function () {
	        $scope.gameClock --;

	        // reset timer
	        if ($scope.gameClock <= 0) {
	        	$scope.gameClock = 25;
	        	$scope.score = 0;
	        	$scope.wordsCompleted = 0;
	        }

	        $scope.$digest();
	    }, 1000);
	}

	// Initialize
	$scope.getNewWord();
	startTimer();
}])

