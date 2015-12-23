scrambleApp.directive('scrambleBody', function() {
  return {
	restrict: 'E',
	scope: {
	  getNewWord: '&',
	  wordCopy: '=',
	  wordTypedTracker: '=',
	  checkWinCondition: '&'
	},
	templateUrl: 'js/main/scrambleBody/scrambleBody.html',
	controller: function($scope, $timeout) {
		$scope.currentlyTyped = [];

		// Register key press
		document.onkeypress = function (e) {
			e = e || window.event;
			var typed = String.fromCharCode(e.keyCode).toLowerCase();

			// Space bar resets and finds a new word.
			if (typed == ' ') {
				$scope.getNewWord();
				$scope.currentlyTyped = [];
			} else {
				// See if the word exists in the unfinished words;
				var wordIndex = $scope.wordCopy.indexOf(typed);
				if (wordIndex != -1) {
					markAsTyped($scope.wordCopy[wordIndex]);
					$scope.currentlyTyped.push($scope.wordCopy[wordIndex]);

					// Remove from the list of letters.
					$scope.wordCopy.splice(wordIndex, 1);
					$scope.$digest();
				}
			}
		};
 

		/**
		 * This function will iterate through the letters and mark the approperiate one as typed
		 * @param string letter A single character to be checked against the words
		 */
		function markAsTyped(letter) {
			for (var i = 0; i < $scope.wordTypedTracker.length; i++) {
				if ($scope.wordTypedTracker[i].letter == letter && !$scope.wordTypedTracker[i].typed) {
					$scope.wordTypedTracker[i].typed = true;
					break;
				}
			}
		}

		// watch the currently typed
		$scope.$watch('currentlyTyped', function(newValue, oldValue) {
			// when it hits 4, we want to check if its correct 
			if ($scope.wordTypedTracker && $scope.currentlyTyped.length == $scope.wordTypedTracker.length) {
				$scope.checkWinCondition({currentlyTyped: $scope.currentlyTyped, callback: function(didWin) {
					$scope.currentlyTyped = [];
					// Reset the typed tracker only if its a loss
					if (!didWin) {
						for (var i = 0; i < $scope.wordTypedTracker.length; i++) {
							$scope.wordTypedTracker[i].typed = false;
							$scope.$digest();
						}
					}
				}});
			}
		}, true);
	},
  };
});