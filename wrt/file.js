/*******************************************************************************
 * Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2012 Felix-Johannes Jendrusch, Fraunhofer FOKUS
 ******************************************************************************/

if (typeof webinos === "undefined") webinos = {};
if (typeof webinos.util === "undefined") webinos.util = {};

(function (exports) {
  exports.inherits = inherits;

  // webinos <3 inherits
  function inherits(c, p, proto) {
    proto = proto || {};
    var e = {};
    [c.prototype, proto].forEach(function (s) {
      Object.getOwnPropertyNames(s).forEach(function (k) {
        e[k] = Object.getOwnPropertyDescriptor(s, k);
      });
    });
    c.prototype = Object.create(p.prototype, e);
    c.super_ = p;
  }

  exports.CustomError = CustomError;

  inherits(CustomError, Error);
  function CustomError(name, message) {
    Error.call(this, message || name);

    this.name = name;
  }

  exports.EventTarget = EventTarget;

  function EventTarget() {}

  EventTarget.prototype.addEventListener = function (type, listener) {
    if (typeof this.events === "undefined") this.events = {};
    if (typeof this.events[type] === "undefined") this.events[type] = [];

    this.events[type].push(listener);
  };

  EventTarget.prototype.removeEventListener = function (type, listener) {
    if (typeof this.events === "undefined" ||
        typeof this.events[type] === "undefined") {
      return;
    }

    var position = this.events[type].indexOf(listener);
    if (position >= 0) {
      this.events[type].splice(position, 1);
    }
  };

  EventTarget.prototype.removeAllListeners = function (type) {
    if (arguments.length === 0) {
      this.events = {};
    } else if (typeof this.events !== "undefined" &&
               typeof this.events[type] !== "undefined") {
      this.events[type] = [];
    }
  };

  EventTarget.prototype.dispatchEvent = function (event) {
    if (typeof this.events === "undefined" ||
        typeof this.events[event.type] === "undefined") {
      return false;
    }

    var listeners = this.events[event.type].slice();
    if (!listeners.length) return false;

    for (var i = 0, length = listeners.length; i < length; i++) {
      listeners[i].call(this, event);
    }

    return true;
  };

  exports.Event = Event;

  function Event(type) {
    this.type = type;
    this.timeStamp = Date.now();
  }

  exports.ProgressEvent = ProgressEvent;

  inherits(ProgressEvent, Event);
  function ProgressEvent(type, eventInitDict) {
    Event.call(this, type);

    eventInitDict = eventInitDict || {};

    this.lengthComputable = eventInitDict.lengthComputable || false;
    this.loaded = eventInitDict.loaded || 0;
    this.total = eventInitDict.total || 0;
  }

  exports.callback = function (maybeCallback) {
    if (typeof maybeCallback !== "function") {
      return function () {};
    }
    return maybeCallback;
  };

  exports.async = function (callback) {
    if (typeof callback !== "function") {
      return callback;
    }
    return function () {
      var argsArray = arguments;
      window.setTimeout(function () {
        callback.apply(null, argsArray);
      }, 0);
    };
  };

  exports.ab2hex = function (buf) {
    var hex = "";
    var view = new Uint8Array(buf);
    for (var i = 0; i < view.length; i++) {
      var repr = view[i].toString(16);
      hex += (repr.length < 2 ? "0" : "") + repr;
    }
    return hex;
  };

  exports.hex2ab = function (hex) {
    var buf = new ArrayBuffer(hex.length / 2);
    var view = new Uint8Array(buf);
    for (var i = 0; i < view.length; i++) {
      view[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return buf;
  }
})(webinos.util);
/*******************************************************************************
 * Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2012 Felix-Johannes Jendrusch, Fraunhofer FOKUS
 ******************************************************************************/

if (typeof webinos === "undefined") webinos = {};
if (typeof webinos.path === "undefined") webinos.path = {};

// webinos <3 node.js
(function (exports) {
  var splitPathRe = /^(\/?)([\s\S]+\/(?!$)|\/)?((?:\.{1,2}$|[\s\S]+?)?(\.[^.\/]*)?)$/;

  function splitPath(path) {
    var result = splitPathRe.exec(path);
    return [result[1] || "", result[2] || "", result[3] || "", result[4] || ""];
  }

  function normalizeArray(parts, allowAboveRoot) {
    var up = 0;
    for (var i = parts.length - 1; i >= 0; i--) {
      var part = parts[i];
      if (part === ".") {
        parts.splice(i, 1);
      } else if (part === "..") {
        parts.splice(i, 1);
        up++;
      } else if (up) {
        parts.splice(i, 1);
        up--;
      }
    }

    if (allowAboveRoot) {
      for (; up--;) {
        parts.unshift("..");
      }
    }

    return parts;
  }

  exports.normalize = function (path) {
    var isAbsolute = path.charAt(0) === "/"
      , trailingSlash = path.substr(-1) === "/";

    path = normalizeArray(path.split("/").filter(function (part) {
      return !!part;
    }), !isAbsolute).join("/");

    if (!path && !isAbsolute) {
      path = ".";
    }
    if (path && trailingSlash) {
      path += "/";
    }

    return (isAbsolute ? "/" : "") + path;
  };

  exports.join = function () {
    var paths = Array.prototype.slice.call(arguments, 0);
    return exports.normalize(paths.filter(function (path) {
      return path && typeof path === "string";
    }).join("/"));
  };

  exports.resolve = function () {
    var resolvedPath = ""
      , resolvedAbsolute = false;

    for (var i = arguments.length - 1; i >= 0 && !resolvedAbsolute; i--) {
      // TODO Use some fallback (e.g., the current working directory ..not)?
      var path = arguments[i];

      if (!path || typeof path !== "string") {
        continue;
      }

      resolvedPath = path + "/" + resolvedPath;
      resolvedAbsolute = path.charAt(0) === "/";
    }

    resolvedPath = normalizeArray(
      resolvedPath.split("/").filter(function (part) {
        return !!part;
      }
    ), !resolvedAbsolute).join("/");

    return ((resolvedAbsolute ? "/" : "") + resolvedPath) || ".";
  };

  exports.relative = function (from, to) {
    from = exports.resolve(from).substr(1);
    to = exports.resolve(to).substr(1);

    function trim(arr) {
      var start = 0;
      for (; start < arr.length; start++) {
        if (arr[start] !== "") break;
      }

      var end = arr.length - 1;
      for (; end >= 0; end--) {
        if (arr[end] !== "") break;
      }

      if (start > end) return [];
      return arr.slice(start, end - start + 1);
    }

    var fromParts = trim(from.split("/"));
    var toParts = trim(to.split("/"));

    var length = Math.min(fromParts.length, toParts.length);
    var samePartsLength = length;
    for (var i = 0; i < length; i++) {
      if (fromParts[i] !== toParts[i]) {
        samePartsLength = i;
        break;
      }
    }

    var outputParts = [];
    for (var i = samePartsLength; i < fromParts.length; i++) {
      outputParts.push("..");
    }

    outputParts = outputParts.concat(toParts.slice(samePartsLength));

    return outputParts.join("/");
  };

  // webinos <3 webkit
  exports.isParentOf = function (parent, mayBeChild) {
    if (parent === "/" && mayBeChild !== "/") {
      return true;
    }

    if (parent.length > mayBeChild.length || mayBeChild.indexOf(parent) !== 0) {
      return false;
    }

    if (mayBeChild.charAt(parent.length) !== "/") {
      return false;
    }

    return true;
  };

  exports.dirname = function (path) {
    var result = splitPath(path)
      , root = result[0]
      , dir = result[1];

    if (!root && !dir) {
      return ".";
    }

    if (dir) {
      dir = dir.substr(0, dir.length - 1);
    }

    return root + dir;
  };

  exports.basename = function (path, ext) {
    var file = splitPath(path)[2];

    if (ext && file.substr(-1 * ext.length) === ext) {
      file = file.substr(0, file.length - ext.length);
    }

    return file;
  };

  exports.extname = function (path) {
    return splitPath(path)[3];
  };
})(webinos.path);
/*******************************************************************************
 * Code contributed to the webinos project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Copyright 2012 Felix-Johannes Jendrusch, Fraunhofer FOKUS
 ******************************************************************************/

// [WP-608] Support write/truncate abort

if (typeof webinos === "undefined") webinos = {};
if (typeof webinos.file === "undefined") webinos.file = {};

(function (exports) {
  exports.Service = Service;
  // This inherits is specified in file API so please don't use it in your own APIs
  webinos.util.inherits(Service, WebinosService);
  function Service(object, rpc) {
    WebinosService.call(this, object);

    this.rpc = rpc;
  }
  // Register to the service discovery
  _webinos.registerServiceConstructor("http://webinos.org/api/file", Service);  

  Service.prototype.requestFileSystem = function (type, size, successCallback, errorCallback) {
    var self = this;
    var requestFileSystem = self.rpc.createRPC(self, "requestFileSystem");
    self.rpc.executeRPC(requestFileSystem, function (filesystem) {
      successCallback(new FileSystem(self, filesystem.name));
    }, errorCallback);
  };

  Service.prototype.resolveLocalFileSystemURL = function (url, successCallback, errorCallback) {
    webinos.util.async(errorCallback)(new webinos.util.CustomError("NotSupportedError"));
  };

  function FileSystem(service, name) {
    this.service = service;

    this.name = name;
    this.root = new DirectoryEntry(this, "/");
  }

  FileSystem.prototype.toJSON = function () {
    var json = { name : this.name };
    return json;
  };

  function Entry(filesystem, fullPath) {
    this.name = webinos.path.basename(fullPath);
    this.fullPath = fullPath;
    this.filesystem = filesystem;

    this.service = filesystem.service;
    this.rpc = filesystem.service.rpc;
  }

  Entry.prototype.isFile = false;
  Entry.prototype.isDirectory = false;

  Entry.prototype.getMetadata = function (successCallback, errorCallback) {
    var getMetadata = this.rpc.createRPC(this.service, "getMetadata", { entry : this });
    this.rpc.executeRPC(getMetadata, function (metadata) {
      successCallback(new Metadata(metadata));
    }, errorCallback);
  };

  Entry.prototype.moveTo = function (parent, newName, successCallback, errorCallback) {
    var self = this;
    if (self.service === parent.service) {
      var moveTo = self.rpc.createRPC(self.service, "moveTo", { source : self, parent : parent, newName : newName });
      self.rpc.executeRPC(moveTo, function (entry) {
        if (self.isDirectory) {
          successCallback(new DirectoryEntry(self.filesystem, entry.fullPath));
        } else {
          successCallback(new FileEntry(self.filesystem, entry.fullPath));
        }
      }, errorCallback);
    } else {
      var getLink = self.rpc.createRPC(self.service, "getLink", { entry : self });
      self.rpc.executeRPC(getLink, function (link) {
        var download = parent.rpc.createRPC(parent.service, "download", { link : link, parent : parent, name : newName || self.name });
        parent.rpc.executeRPC(download, function (entry) {
          var remove = self.rpc.createRPC(self.service, (self.isDirectory ? "removeRecursively" : "remove"), { entry : self });
          self.rpc.executeRPC(remove, function () {
            if (self.isDirectory) {
              successCallback(new DirectoryEntry(parent.filesystem, entry.fullPath));
            } else {
              successCallback(new FileEntry(parent.filesystem, entry.fullPath));
            }
          }, errorCallback);
        }, errorCallback);
      }, errorCallback);
    }
  };

  Entry.prototype.copyTo = function (parent, newName, successCallback, errorCallback) {
    var self = this;
    if (self.service === parent.service) {
      var copyTo = self.rpc.createRPC(self.service, "copyTo", { source : self, parent : parent, newName : newName });
      self.rpc.executeRPC(copyTo, function (entry) {
        if (self.isDirectory) {
          successCallback(new DirectoryEntry(self.filesystem, entry.fullPath));
        } else {
          successCallback(new FileEntry(self.filesystem, entry.fullPath));
        }
      }, errorCallback);
    } else {
      var getLink = self.rpc.createRPC(self.service, "getLink", { entry : self });
      self.rpc.executeRPC(getLink, function (link) {
        var download = parent.rpc.createRPC(parent.service, "download", { link : link, parent : parent, name : newName || self.name });
        parent.rpc.executeRPC(download, function (entry) {
          if (self.isDirectory) {
            successCallback(new DirectoryEntry(parent.filesystem, entry.fullPath));
          } else {
            successCallback(new FileEntry(parent.filesystem, entry.fullPath));
          }
        }, errorCallback);
      }, errorCallback);
    }
  };

  Entry.prototype.toURL = function () {
    throw new webinos.util.CustomError("NotSupportedError");
  };

  Entry.prototype.remove = function (successCallback, errorCallback) {
    var remove = this.rpc.createRPC(this.service, "remove", { entry : this });
    this.rpc.executeRPC(remove, successCallback, errorCallback);
  };

  Entry.prototype.getParent = function (successCallback, errorCallback) {
    var self = this;
    var getParent = self.rpc.createRPC(self.service, "getParent", { entry : self });
    self.rpc.executeRPC(getParent, function (entry) {
      successCallback(new DirectoryEntry(self.filesystem, entry.fullPath));
    }, errorCallback);
  };

  Entry.prototype.toJSON = function () {
    var json =
      { name        : this.name
      , fullPath    : this.fullPath
      , filesystem  : this.filesystem
      , isFile      : this.isFile
      , isDirectory : this.isDirectory
      };
    return json;
  };

  function Metadata(metadata) {
    this.modificationTime = new Date(metadata.modificationTime);
    this.size = metadata.size;
  }

  webinos.util.inherits(DirectoryEntry, Entry);
  function DirectoryEntry(filesystem, fullPath) {
    Entry.call(this, filesystem, fullPath);
  }

  DirectoryEntry.prototype.isDirectory = true;

  DirectoryEntry.prototype.createReader = function () {
    return new DirectoryReader(this);
  };

  DirectoryEntry.prototype.getFile = function (path, options, successCallback, errorCallback) {
    var self = this;
    var getFile = self.rpc.createRPC(self.service, "getFile", { entry : self, path : path, options : options });
    self.rpc.executeRPC(getFile, function (entry) {
      successCallback(new FileEntry(self.filesystem, entry.fullPath));
    }, errorCallback);
  };

  DirectoryEntry.prototype.getDirectory = function (path, options, successCallback, errorCallback) {
    var self = this;
    var getDirectory = self.rpc.createRPC(self.service, "getDirectory", { entry : self, path : path, options : options });
    self.rpc.executeRPC(getDirectory, function (entry) {
      successCallback(new DirectoryEntry(self.filesystem, entry.fullPath));
    }, errorCallback);
  };

  DirectoryEntry.prototype.removeRecursively = function (successCallback, errorCallback) {
    var removeRecursively = this.rpc.createRPC(this.service, "removeRecursively", { entry : this });
    this.rpc.executeRPC(removeRecursively, successCallback, errorCallback);
  };

  function DirectoryReader(entry) {
    this.entry = entry;

    this.service = entry.filesystem.service;
    this.rpc = entry.filesystem.service.rpc;
  }

  DirectoryReader.prototype.readEntries = function (successCallback, errorCallback) {
    var self = this;

    function next() {
      if (!self.entries.length) return [];

      var chunk = self.entries.slice(0, 10);
      self.entries.splice(0, 10);
      return chunk;
    }

    if (typeof self.entries === "undefined") {
      var readEntries = self.rpc.createRPC(self.service, "readEntries", { entry : self.entry });
      self.rpc.executeRPC(readEntries, function (entries) {
        self.entries = entries.map(function (entry) {
          if (entry.isDirectory) {
            return new DirectoryEntry(self.entry.filesystem, entry.fullPath);
          } else {
            return new FileEntry(self.entry.filesystem, entry.fullPath);
          }
        });

        successCallback(next());
      }, errorCallback);
    } else webinos.util.async(successCallback)(next());
  };

  webinos.util.inherits(FileEntry, Entry);
  function FileEntry(filesystem, fullPath) {
    Entry.call(this, filesystem, fullPath);
  }

  FileEntry.prototype.isFile = true;

  FileEntry.prototype.getLink = function (successCallback, errorCallback) {
    var getLink = this.rpc.createRPC(this.service, "getLink", { entry : this });
    this.rpc.executeRPC(getLink, successCallback, errorCallback);
  };

  FileEntry.prototype.createWriter = function (successCallback, errorCallback) {
    var self = this;
    var getMetadata = self.rpc.createRPC(self.service, "getMetadata", { entry : self });
    self.rpc.executeRPC(getMetadata, function (metadata) {
      var writer = new FileWriter(self);
      writer.length = metadata.size;

      successCallback(writer);
    }, errorCallback);
  };

  FileEntry.prototype.file = function (successCallback, errorCallback) {
    var self = this;
    var getMetadata = self.rpc.createRPC(self.service, "getMetadata", { entry : self });
    self.rpc.executeRPC(getMetadata, function (metadata) {
      var blobParts = [];

      var remote;
      var port = self.rpc.createRPC(self.service, "read",
         { entry : self
         , options : { bufferSize : 16 * 1024, autopause : true }
         });
      port.ref = function (params, successCallback, errorCallback, ref) {
        remote = ref;
      };
      port.open = function () {};
      port.data = function (params) {
        blobParts.push(webinos.util.hex2ab(params.data));

        var resume = self.rpc.createRPC(remote, "resume", null);
        self.rpc.executeRPC(resume);
      };
      port.end = function () {};
      port.close = function () {
        try {
          var blob = new Blob(blobParts);
          blob.name = self.name;
          blob.lastModifiedDate = new Date(metadata.modificationTime);

          successCallback(blob);
        } finally {
          self.rpc.unregisterCallbackObject(port);
        }
      };
      port.error = function (params) {
        try {
          errorCallback(params.error);
        } finally {
          self.rpc.unregisterCallbackObject(port);
        }
      };

      self.rpc.registerCallbackObject(port);
      self.rpc.executeRPC(port);
    }, errorCallback);
  };

  webinos.util.inherits(FileWriter, webinos.util.EventTarget);
  function FileWriter(entry) {
    webinos.util.EventTarget.call(this);

    this.entry = entry;

    this.readyState = FileWriter.INIT;
    this.length = 0;
    this.position = 0;

    this.service = entry.filesystem.service;
    this.rpc = entry.filesystem.service.rpc;

    this.addEventListener("writestart", function (event) {
      webinos.util.callback(this.onwritestart)(event);
    });
    this.addEventListener("progress", function (event) {
      webinos.util.callback(this.onprogress)(event);
    });
    this.addEventListener("abort", function (event) {
      webinos.util.callback(this.onabort)(event);
    });
    this.addEventListener("write", function (event) {
      webinos.util.callback(this.onwrite)(event);
    });
    this.addEventListener("writeend", function (event) {
      webinos.util.callback(this.onwriteend)(event);
    });
    this.addEventListener("error", function (event) {
      webinos.util.callback(this.onerror)(event);
    });
  }

  FileWriter.INIT = 0;
  FileWriter.WRITING = 1;
  FileWriter.DONE = 2;

  function BlobIterator(blob) {
    this.blob = blob;
    this.position = 0;
  }

  BlobIterator.prototype.hasNext = function () {
    return this.position < this.blob.size;
  };

  BlobIterator.prototype.next = function () {
    if (!this.hasNext()) {
      throw new webinos.util.CustomError("InvalidStateError");
    }

    var end = Math.min(this.position + 16 * 1024, this.blob.size);
    var chunk;
    if (this.blob.slice) {
      chunk = this.blob.slice(this.position, end);
    } else if (this.blob.webkitSlice) {
      chunk = this.blob.webkitSlice(this.position, end);
    } else if (this.blob.mozSlice) {
      chunk = this.blob.mozSlice(this.position, end);
    }
    this.position = end;
    return chunk;
  };

  FileWriter.prototype.write = function (data) {
    var self = this;

    if (self.readyState === FileWriter.WRITING) {
      throw new webinos.util.CustomError("InvalidStateError");
    }

    self.readyState = FileWriter.WRITING;
    self.dispatchEvent(new webinos.util.ProgressEvent("writestart"));

    var reader = new FileReader();
    // reader.onloadstart = function (event) {};
    // reader.onprogress = function (event) {};
    // reader.onabort = function (event) {};
    reader.onload = function () {
      var write = self.rpc.createRPC(remote, "write", { data : webinos.util.ab2hex(reader.result) });
      self.rpc.executeRPC(write, function (bytesWritten) {
        self.position += bytesWritten;
        self.length = Math.max(self.position, self.length);

        self.dispatchEvent(new webinos.util.ProgressEvent("progress"));
      });
    };
    // reader.onloadend = function (event) {};
    reader.onerror = function () {
      var destroy = self.rpc.createRPC(remote, "destroy");
      self.rpc.executeRPC(destroy, function () {
        try {
          self.error = reader.error;
          self.readyState = FileWriter.DONE;
          self.dispatchEvent(new webinos.util.ProgressEvent("error"));
          self.dispatchEvent(new webinos.util.ProgressEvent("writeend"));
        } finally {
          self.rpc.unregisterCallbackObject(port);
        }
      });
    };

    var iterator = new BlobIterator(data);
    function iterate() {
      if (iterator.hasNext()) {
        reader.readAsArrayBuffer(iterator.next());
      } else {
        var end = self.rpc.createRPC(remote, "end");
        self.rpc.executeRPC(end, function () {
          try {
            self.readyState = FileWriter.DONE;
            self.dispatchEvent(new webinos.util.ProgressEvent("write"));
            self.dispatchEvent(new webinos.util.ProgressEvent("writeend"));
          } finally {
            self.rpc.unregisterCallbackObject(port);
          }
        });
      }
    }

    var remote;
    var port = self.rpc.createRPC(self.service, "write",
       { entry : self.entry
       , options : { start : self.position }
       });
    port.ref = function (params, successCallback, errorCallback, ref) {
      remote = ref;
    };
    port.open = function () {
      iterate();
    };
    port.drain = function () {
      iterate();
    };
    port.close = function () {};
    port.error = function (params) {
      try {
        self.error = params.error;
        self.readyState = FileWriter.DONE;
        self.dispatchEvent(new webinos.util.ProgressEvent("error"));
        self.dispatchEvent(new webinos.util.ProgressEvent("writeend"));
      } finally {
        reader.abort();

        self.rpc.unregisterCallbackObject(port);
      }
    };

    self.rpc.registerCallbackObject(port);
    self.rpc.executeRPC(port);
  };

  FileWriter.prototype.seek = function (offset) {
    if (this.readyState === FileWriter.WRITING) {
      throw new webinos.util.CustomError("InvalidStateError");
    }

    this.position = offset;

    if (this.position > this.length) {
      this.position = this.length;
    }

    if (this.position < 0) {
      this.position = this.position + this.length;
    }

    if (this.position < 0) {
      this.position = 0;
    }
  };

  FileWriter.prototype.truncate = function (size) {
    var self = this;

    if (self.readyState === FileWriter.WRITING) {
      throw new webinos.util.CustomError("InvalidStateError");
    }

    self.readyState = FileWriter.WRITING;
    self.dispatchEvent(new webinos.util.ProgressEvent("writestart"));

    var truncate = self.rpc.createRPC(self.service, "truncate", { entry : self.entry, size : size });
    self.rpc.executeRPC(truncate, function () {
      self.length = size;
      self.position = Math.min(self.position, size);

      self.readyState = FileWriter.DONE;
      self.dispatchEvent(new webinos.util.ProgressEvent("write"));
      self.dispatchEvent(new webinos.util.ProgressEvent("writeend"));
    }, function (error) {
      self.error = error;
      self.readyState = FileWriter.DONE;
      self.dispatchEvent(new webinos.util.ProgressEvent("error"));
      self.dispatchEvent(new webinos.util.ProgressEvent("writeend"));
    });
  };

  // FileWriter.prototype.abort = function () {
  //   if (this.readyState === FileWriter.DONE ||
  //       this.readyState === FileWriter.INIT) return;

  //   this.readyState = FileWriter.DONE;

  //   // If there are any tasks from the object's FileSaver task source in one of
  //   // the task queues, then remove those tasks.
  //   // Terminate the write algorithm being processed.

  //   this.error = new webinos.util.CustomError("AbortError");
  //   this.dispatchEvent(new webinos.util.ProgressEvent("abort"));
  //   this.dispatchEvent(new webinos.util.ProgressEvent("writeend"));
  // };
})(webinos.file);
