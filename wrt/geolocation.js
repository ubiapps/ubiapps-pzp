/*******************************************************************************
*  Code contributed to the webinos project
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*  
*     http://www.apache.org/licenses/LICENSE-2.0
*  
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* 
* Copyright 2011 Alexander Futasz, Fraunhofer FOKUS
******************************************************************************/
(function() {

/**
 * Webinos Geolocation service constructor (client side).
 * @constructor
 * @param obj Object containing displayName, api, etc.
 */
WebinosGeolocation = function (obj) {
	WebinosService.call(this, obj);
};
// Inherit all functions from WebinosService
WebinosGeolocation.prototype = Object.create(WebinosService.prototype);
// The following allows the 'instanceof' to work properly
WebinosGeolocation.prototype.constructor = WebinosGeolocation;
// Register to the service discovery
_webinos.registerServiceConstructor("http://webinos.org/api/w3c/geolocation", WebinosGeolocation);
// If you want to enable the old URI, uncomment the following line
//_webinos.registerServiceConstructor("http://www.w3.org/ns/api-perms/geolocation", WebinosGeolocation);

/**
 * To bind the service.
 * @param bindCB BindCallback object.
 */
WebinosGeolocation.prototype.bindService = function (bindCB, serviceId) {
	// actually there should be an auth check here or whatever, but we just always bind
	this.getCurrentPosition = getCurrentPosition;
	this.watchPosition = watchPosition;
	this.clearWatch = clearWatch;
	
	if (typeof bindCB.onBind === 'function') {
		bindCB.onBind(this);
	};
}

/**
 * Retrieve the current position.
 * @param positionCB Success callback.
 * @param positionErrorCB Error callback.
 * @param positionOptions Optional options.
 */
function getCurrentPosition(positionCB, positionErrorCB, positionOptions) { 
	var rpc = webinos.rpcHandler.createRPC(this, "getCurrentPosition", positionOptions); // RPC service name, function, position options
	webinos.rpcHandler.executeRPC(rpc, function (position) {
		positionCB(position);
	},
	function (error) {
		positionErrorCB(error);
	});
};

var watchIdTable = {};

/**
 * Register a listener for position updates.
 * @param positionCB Callback for position updates.
 * @param positionErrorCB Error callback.
 * @param positionOptions Optional options.
 * @returns Registered listener id.
 */
function watchPosition(positionCB, positionErrorCB, positionOptions) {
	var rpc = webinos.rpcHandler.createRPC(this, "watchPosition", [positionOptions]);

	rpc.onEvent = function (position) {
		positionCB(position);
	};

	rpc.onError = function (err) {
		positionErrorCB(err);
	};

	webinos.rpcHandler.registerCallbackObject(rpc);
	webinos.rpcHandler.executeRPC(rpc);

	var watchId = parseInt(rpc.id, 16);
	watchIdTable[watchId] = rpc.id;

	return watchId;
};

/**
 * Clear a listener.
 * @param watchId The id as returned by watchPosition to clear.
 */
function clearWatch(watchId) {
	var _watchId = watchIdTable[watchId];
	if (!_watchId) return;

	var rpc = webinos.rpcHandler.createRPC(this, "clearWatch", [_watchId]);
	webinos.rpcHandler.executeRPC(rpc);

	delete watchIdTable[watchId];
	webinos.rpcHandler.unregisterCallbackObject({api:_watchId});
};

})();
