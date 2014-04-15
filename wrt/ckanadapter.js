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
  CKANAdapterModule = function (obj) {
    WebinosService.call(this,obj);
  };

  CKANAdapterModule.prototype = Object.create(WebinosService.prototype);
  CKANAdapterModule.prototype.constructor = CKANAdapterModule;

  // Register to the service discovery
  _webinos.registerServiceConstructor("http://ubiapps.com/api/ckanadapter", CKANAdapterModule);

  CKANAdapterModule.prototype.bindService = function (bindCB) {
    this.getFormat = getFormat;
    this.canBrowse = canBrowse;
    this.getSchema = getSchema;
    this.getRows = getRows;
    this.getRowCount = getRowCount;
    this.getDownloadUrl = getDownloadUrl;

    if (typeof bindCB.onBind === 'function') {
      bindCB.onBind(this);
    }
  };

  var doRPC = function(method,params,successCB,errorCB) {
    var rpc = webinos.rpcHandler.createRPC(this, method, params);
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

  function getFormat(success, fail) {
    doRPC.call(this,"getFormat",[],success,fail);
  }

  function canBrowse(success, fail) {
    doRPC.call(this,"canBrowse",[],success,fail);
  }

  function getSchema(success, fail) {
    doRPC.call(this,"getSchema",[],success,fail);
  }

  function getRows(options, success, fail) {
    doRPC.call(this,"getRows", [options],success,fail);
  }

  function getRowCount(options, success, fail) {
    doRPC.call(this,"getRowCount",[options],success,fail);
  }

  function getDownloadUrl(success, fail) {
    doRPC.call(this,"getDownloadUrl",[],success,fail);
  }

}());