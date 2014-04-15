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
 * Copyright 2013 Sony Mobile Communications
 *
 ******************************************************************************/

(function () {

  function UbiToolboxModule(obj) {
    WebinosService.call(this,obj);
  };

  UbiToolboxModule.prototype = Object.create(WebinosService.prototype);
  UbiToolboxModule.prototype.constructor = UbiToolboxModule;

  // Register to the service discovery
  _webinos.registerServiceConstructor("http://ubiapps.com/api/ubiToolbox", UbiToolboxModule);

  UbiToolboxModule.prototype.bindService = function (bindCB, serviceId) {
    this.getAppStore = getAppStore;

    if (typeof bindCB.onBind === 'function') {
      bindCB.onBind(this);
    }
  };

  var getAppStore = function(storeURL, successCB, errorCB) {
    var rpc = webinos.rpcHandler.createRPC(this, "getAppStore", [storeURL]);
    webinos.rpcHandler.executeRPC(rpc,
      function (res) {
        if (typeof successCB !== 'undefined') {
          successCB(res);
        }
      },
      function (err) {
        if (typeof errorCB !== 'undefined') {
          errorCB(err);
        }
      }
    );
  };
}());
