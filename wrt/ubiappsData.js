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

  DataModule = function (obj) {
    WebinosService.call(this,obj);
  };

  DataModule.prototype = Object.create(WebinosService.prototype);
  DataModule.prototype.constructor = DataModule;

  // Register to the service discovery
  _webinos.registerServiceConstructor("http://ubiapps.com/api/ubiappsData", DataModule);

  DataModule.prototype.bindService = function (bindCB, serviceId) {
    this.getSchema = getSchema;
    this.getRows = getRows;
    this.getRowCount = getRowCount;

    if (typeof bindCB.onBind === 'function') {
      bindCB.onBind(this);
    }
  };

  function getSchema(success, fail) {
    var rpc = webinos.rpcHandler.createRPC(this, "getSchema");
    webinos.rpcHandler.executeRPC(rpc, function (result) {
      if (typeof success !== 'undefined') {
        success(result);
      }
    }, function (err) {
      if (typeof fail !== 'undefined') {
        fail(err);
      }
    });
  }

  function getRows(success, fail) {
    var rpc = webinos.rpcHandler.createRPC(this, "getRows");
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

  function getRowCount(success, fail) {
    var rpc = webinos.rpcHandler.createRPC(this, "getRowCount");
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
