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

  RMModule = function (obj) {
    WebinosService.call(this, obj);
  };

  // Inherit all functions from WebinosService
  RMModule.prototype = Object.create(WebinosService.prototype);
  RMModule.prototype.constructor = RMModule;

  // Register to the service discovery
  _webinos.registerServiceConstructor("http://ubiapps.com/api/remotemanagement", RMModule);

  RMModule.prototype.bindService = function (bindCB, serviceId) {
    this.startApp = startApp;
    this.stopApp = stopApp;
    this.getInstalledApps = getInstalledApps;
    this.installApp = installApp;
    this.removeApp = removeApp;
    this.wipe = wipe;
    this.addDataService = addDataService;

    if (typeof bindCB.onBind === 'function') {
      bindCB.onBind(this);
    }
  };

  function installApp(appURL, success, fail) {
    var rpc = webinos.rpcHandler.createRPC(this, "installApp", [appURL]);
    webinos.rpcHandler.executeRPC(rpc,
      function (res) {
        if (typeof success !== 'undefined') {
          success(res);
        }
      },
      function (err) {
        if (typeof fail !== 'undefined') {
          fail(err);
        }
      }
    );
  }

  function startApp(installId, success, fail) {
    var rpc = webinos.rpcHandler.createRPC(this, "startApp", [installId]);
    webinos.rpcHandler.executeRPC(rpc, function (res) {
      if (typeof success !== 'undefined') {
        success(res);
      }
    }, function (err) {
      if (typeof fail !== 'undefined') {
        fail(err);
      }
    });
  }

  function stopApp(installId, success, fail) {
    var rpc = webinos.rpcHandler.createRPC(this, "stopApp", [installId]);
    webinos.rpcHandler.executeRPC(rpc, function (res) {
      if (typeof success !== 'undefined') {
        success(res);
      }
    }, function (err) {
      if (typeof fail !== 'undefined') {
        fail(err);
      }
    });
  }

  function getInstalledApps(success, fail) {
    var rpc = webinos.rpcHandler.createRPC(this, "getInstalledApps");
    webinos.rpcHandler.executeRPC(rpc, function (lst) {
      if (typeof success !== 'undefined') {
        success(lst);
      }
    }, function (err) {
      if (typeof fail !== 'undefined') {
        fail(err);
      }
    });
  }

  function removeApp(installId, success, fail) {
    var rpc = webinos.rpcHandler.createRPC(this, "removeApp", [installId]);
    webinos.rpcHandler.executeRPC(rpc, function (res) {
      if (typeof success !== 'undefined') {
        success(res);
      }
    }, function (err) {
      if (typeof fail !== 'undefined') {
        fail(err);
      }
    });
  }

  function wipe(success, fail) {
    var rpc = webinos.rpcHandler.createRPC(this, "wipe");
    webinos.rpcHandler.executeRPC(rpc, function (result) {
      if (typeof success === 'function') {
        success(result);
      }
    }, function (err) {
      if (typeof fail === 'function') {
        fail(err);
      }
    });
  }

  function addDataService(datasetName, success, fail) {
    var rpc = webinos.rpcHandler.createRPC(this, "addDataService", [ datasetName ]);
    webinos.rpcHandler.executeRPC(rpc, function (result) {
      if (typeof success === 'function') {
        success(result);
      }
    }, function (err) {
      if (typeof fail === 'function') {
        fail(err);
      }
    });
  }

}());
