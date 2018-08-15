angular.module('userControllers', ['userServices'])

// Controller: regCtrl is used for users to register an account
.controller('regCtrl', function($http, $location, $timeout, User, $scope, $routeParams) {

    var app = this;
    var param1 = $routeParams.param1;
    app.isAdmin = false;
    if(param1 == 'admin'){
        app.isAdmin = true;
    }else{
        app.isAdmin = false;
    }

    // Custom function that registers the user in the database      
    this.regUser = function(regData, valid) {
        app.disabled = true; // Disable the form when user submits to prevent multiple requests to server
        app.errorMsg = false; // Clear errorMsg each time user submits
        
        // If form is valid and passwords match, attempt to create user         
        if (valid) {
            app.regData.name = app.regData.firstName + " " + app.regData.lastName; // Combine first and last name before submitting to database
            if(param1 == 'admin'){
                app.regData.isAdmin = true;
                app.isAdmin = false;
            }else{
                app.regData.isAdmin = false;
            }

            // Runs custom function that registers the user in the database 
            User.create(app.regData).then(function(data) {
                // Check if user was saved to database successfully
                if (data.data.success) {
    
                    $scope.alert = 'alert alert-success'; // Set class for message
                    app.successMsg = data.data.message + '...Redirecting'; // If successful, grab message from JSON object and redirect to login page
                    // Redirect after 2000 milliseconds (2 seconds)
                    $timeout(function() {
                        $location.path('/login');
                    }, 2000);
                } else {
    
                    app.disabled = false; // If error occurs, remove disable lock from form
                    $scope.alert = 'alert alert-danger'; // Set class for message
                    app.errorMsg = data.data.message; // If not successful, grab message from JSON object
                }
            });
        } else {
            app.disabled = false; // If error occurs, remove disable lock from form
            $scope.alert = 'alert alert-danger'; // Set class for message
            app.errorMsg = 'Please ensure form is filled our properly'; // Display error if valid returns false
        }
    };
  
  
    //  Custom function that checks if username is available for user to use    
    this.checkUsername = function(regData) {
        app.checkingUsername = true; // Start bootstrap loading icon
        app.usernameMsg = false; // Clear usernameMsg each time user activates ngBlur
        app.usernameInvalid = false; // Clear usernameInvalid each time user activates ngBlur

        // Runs custom function that checks if username is available for user to use
        User.checkUsername(app.regData).then(function(data) {
            // Check if username is available for the user
            if (data.data.success) {
                app.checkingUsername = false; // Stop bootstrap loading icon
                app.usernameMsg = data.data.message; // If successful, grab message from JSON object
            } else {
                app.checkingUsername = false; // Stop bootstrap loading icon
                app.usernameInvalid = true; // User variable to let user know that the chosen username is taken already
                app.usernameMsg = data.data.message; // If not successful, grab message from JSON object
            }
        });
    };

})

// Custom directive to check matching passwords 
.directive('match', function() {
    return {
        restrict: 'A', // Restrict to HTML Attribute
        controller: function($scope) {
            $scope.confirmed = false; // Set matching password to false by default

            // Custom function that checks both inputs against each other               
            $scope.doConfirm = function(values) {
                // Run as a loop to continue check for each value each time key is pressed
                values.forEach(function(ele) {
                    // Check if inputs match and set variable in $scope
                    if ($scope.confirm == ele) {
                        $scope.confirmed = true; // If inputs match
                    } else {
                        $scope.confirmed = false; // If inputs do not match
                    }
                });
            };
        },

        link: function(scope, element, attrs) {

            // Grab the attribute and observe it            
            attrs.$observe('match', function() {
                scope.matches = JSON.parse(attrs.match); // Parse to JSON
                scope.doConfirm(scope.matches); // Run custom function that checks both inputs against each other   
            });

            // Grab confirm ng-model and watch it           
            scope.$watch('confirm', function() {
                scope.matches = JSON.parse(attrs.match); // Parse to JSON
                scope.doConfirm(scope.matches); // Run custom function that checks both inputs against each other   
            });
        }
    };
})

