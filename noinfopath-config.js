/**
 * Config
 */

  // "component":"textInput",
  //     "editable":true,
  //     "index":1,
  //     "label":"Hello",
  //     "description":"World",
  //     "placeholder":"Test",
  //     "options":[  

  //     ],
  //     "required":true,
  //     "validation":"[email]"
  //  }

(function(angular,undefined){
	"use strict";

	var endpointUri, PROD = "production", DEV = "development";

	function production($http, $rootScope, NOCONFIG){
		if(!endpointUri) throw {"error": 10000, "message": "noConfig requires that you call setEndPointUri during the angular.config phase."}

		this.current = {};
		
		function request(cb){
			$http.get(endpointUri).success(function(c){

				SELF.current = c;
				$rootScope.$broadcast(NOCONFIG.CONFIG_READY,c)
				if(cb) cb(c);
			})				
		}		
		this.request = request;		
	}

	function development($timeout, $rootScope, NOCONFIG){
 		var SELF = this,
 			config = {};

		this.current = function() {
			return config;
		};

		function request(serviceUrl, cb){
			var c = {
				database: {
					version: 3,
					upgrades: {
						"1" : {
							db: [
								{action: "drop"}
							],
							collections: { 
								"UserData" : [
									{action: "createStore", options: {autoIncrement: true}},
									{action: "createIndex", property: "LastName", options: {unique: false} }
								]
							}
						},
						"2" : {
							db: [],
							collections: { 
								"UserData" : [
									{action: "createIndex", property: "Phone", options: {unique: true} }
								]
							}
						},
						"3" : {
							db: [],
							collections: { 
								"UserData:" : [],
								"Locations" : [
									{action: "createStore", options: {keyPath: "Location_Code"}},
								],
								"Dept" : [
									{action: "createStore", options: {keyPath: "DepartmentId"}},
								],
								"DMMS" : [
									{action: "createStore", options: {autoIncrement: true}}
								]
							}
						}
					},
					sync: {
						datasources: [
							""
						]
					}
				},
				packages: {
					"package1": {
						name: "package1",
						title: "From Template File",
						models: {
							"UserData" : {
								listView: [
									{ field: "ID" },
									{ field: "FirstName", displayName: "First Name" },
									{ field: "LastName", displayName: "Last Name" },
									{ field: "Phone" }
								],
								formView: {}
							}			
						},
						views: {
							form1: {
								name: "userdata",
								title: "Form 1",
								templateUrl: "forms/form1.html"
								//or "template" which can take string that
								//contains html or a function that returns
								//html.
							},
							form2: {
								name: "form2",
								title: "Form 2",
								templateUrl: "forms/form2.html"
							}	
						}					
					}
				}
			};

			$timeout(function(){
				config = c;
				$rootScope.$broadcast(NOCONFIG.CONFIG_READY,c)
				if(cb) cb(c);
			},1)	 				
		}
		this.request = request;
	}
 
	var environments = {
		production: [
			'$rootScope', 
			'$http', 
			'noLogService',
			'NOCONFIG_CONSTANTS', 
			function($rootScope, $http, log, NOCONFIG){
  				return new production($http,$rootScope, NOCONFIG);
 			}
 		],
		development: [
 	 		'$rootScope', 
 	 		'$timeout', 
 	 		'noLogService', 
 	 		'NOCONFIG_CONSTANTS', 
 	 		function($rootScope, $timeout, log, NOCONFIG){
 	 			var svc = new development($timeout,$rootScope, NOCONFIG);
 				return svc;
 			}
 		]
	}, current = environments[DEV];


	angular.module('noinfopath.config',[])
		.constant('NOCONFIG_CONSTANTS',{
			CONFIG_READY: "NoInfoPath::configReady"
		})

		.provider('noConfigService', [function(){

			function _setEndPointUri(uri){
				endpointUri = uri;
			}
			this.setEndPointUri = _setEndPointUri;

			this.$get = current;
		}])

 	 	//.factory('noConfigService',current)
 		
})(angular);