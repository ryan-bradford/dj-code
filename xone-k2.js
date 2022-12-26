'use strict';

var midi;
var engine;

var Mixxx = /** @class */ (function () {
    function Mixxx() {
        this.loopType = LoopType.NORMAL;
        this.rateTempShiftTimers = new Map();
    }
    Mixxx.prototype.togglePlay = function (deck) {
        var channel = this.buildChannelString(deck);
        engine.setValue(channel, 'play', !engine.getValue(channel, 'play'));
    };
    Mixxx.prototype.subscribeToPlayStatus = function (deck, callback) {
        var channel = this.buildChannelString(deck);
        var conn = engine.makeConnection(channel, "play", callback);
        conn.trigger();
        return conn;
    };
    Mixxx.prototype.touchCue = function (deck, buttonStatus) {
        var channel = this.buildChannelString(deck);
        engine.setValue(channel, 'cue_default', buttonStatus);
    };
    Mixxx.prototype.subscribeToCueStatus = function (deck, callback) {
        var channel = this.buildChannelString(deck);
        var conn = engine.makeConnection(channel, "cue_indicator", callback);
        conn.trigger();
        return conn;
    };
    Mixxx.prototype.toggleBeatloop = function (deck, size, isDownPress) {
        var channel = this.buildChannelString(deck);
        if (this.loopType === LoopType.SLIP) {
            engine.setValue(channel, "slip_enabled", true);
            if (isDownPress) {
                engine.setValue(channel, 'beatloop_' + size + '_activate', isDownPress);
            }
            else {
                if (engine.getValue(channel, 'beatloop_' + size + '_enabled')) {
                    engine.setValue(channel, 'beatloop_' + size + '_toggle', 1);
                }
                engine.setValue(channel, "slip_enabled", false);
            }
        }
        else {
            if (isDownPress) {
                if (engine.getValue(channel, 'beatloop_' + size + '_enabled')) {
                    engine.setValue(channel, 'beatloop_' + size + '_toggle', 1);
                }
                else {
                    engine.setValue(channel, 'beatloop_' + size + '_activate', isDownPress);
                }
            }
        }
    };
    Mixxx.prototype.getLoopType = function () {
        return this.loopType;
    };
    Mixxx.prototype.toggleLoopType = function () {
        if (this.loopType === LoopType.NORMAL) {
            this.loopType = LoopType.SLIP;
        }
        else {
            this.loopType = LoopType.NORMAL;
        }
    };
    Mixxx.prototype.subscribeToBeatloopStatus = function (deck, size, callback) {
        var channel = this.buildChannelString(deck);
        var conn = engine.makeConnection(channel, 'beatloop_' + size + '_enabled', callback);
        conn.trigger();
        return conn;
    };
    Mixxx.prototype.toggleHotcue = function (deck, hotcueId, status) {
        var channel = this.buildChannelString(deck);
        engine.setValue(channel, "hotcue_" + hotcueId + "_activate", status);
    };
    Mixxx.prototype.subscribeToHotcueColor = function (deck, hotcueId, callback) {
        var channel = this.buildChannelString(deck);
        var conn = engine.makeConnection(channel, 'hotcue_' + hotcueId + '_color', callback);
        conn.trigger();
        return conn;
    };
    Mixxx.prototype.getHotcueColor = function (deck, hotcueId) {
        var channel = this.buildChannelString(deck);
        return engine.getParameter(channel, 'hotcue_' + hotcueId + '_color');
    };
    Mixxx.prototype.getHotcueEnabled = function (deck, hotcueId) {
        var channel = this.buildChannelString(deck);
        return engine.getParameter(channel, 'hotcue_' + hotcueId + '_enabled');
    };
    Mixxx.prototype.subscribeToHotcueEnabled = function (deck, hotcueId, callback) {
        var channel = this.buildChannelString(deck);
        var conn = engine.makeConnection(channel, 'hotcue_' + hotcueId + '_enabled', callback);
        conn.trigger();
        return conn;
    };
    Mixxx.prototype.setFaderLevel = function (deck, level) {
        engine.setParameter(this.buildChannelString(deck), "volume", level);
    };
    Mixxx.prototype.setXEqLevel = function (deck, level, eq) {
        var variable = "[EqualizerRack1_" + this.buildChannelString(deck) + "_Effect1]";
        engine.setParameter(variable, "parameter" + eq, level);
    };
    Mixxx.prototype.isSyncEnabledOnDeck = function (deck) {
        return engine.getParameter(this.buildChannelString(deck), "sync_mode") === 1 ||
            engine.getParameter(this.buildChannelString(deck), "sync_mode") === 2;
    };
    Mixxx.prototype.getDeckCurrentBpm = function (deck) {
        return engine.getParameter(this.buildChannelString(deck), "visual_bpm");
    };
    Mixxx.prototype.getDeckOriginalBpm = function (deck) {
        return engine.getParameter(this.buildChannelString(deck), "file_bpm");
    };
    Mixxx.prototype.setDeckToDefaultBpm = function (deck) {
        engine.setParameter(this.buildChannelString(deck), "rate_set_default", 1);
    };
    Mixxx.prototype.enableSyncOnDeck = function (deck) {
        engine.setParameter(this.buildChannelString(deck), "sync_enabled", 1);
    };
    Mixxx.prototype.subscribeToSyncMode = function (deck, callback) {
        var channel = this.buildChannelString(deck);
        var conn = engine.makeConnection(channel, 'sync_mode', callback);
        conn.trigger();
        return conn;
    };
    Mixxx.prototype.changeDeckRateSmall = function (deck, direction) {
        engine.setParameter(this.buildChannelString(deck), "bpm_" + direction + "_small", 1);
    };
    Mixxx.prototype.tempBeatShiftDirection = function (deck, direction) {
        var _this = this;
        engine.stopTimer(this.rateTempShiftTimers.get(deck));
        engine.setParameter(this.buildChannelString(deck), "rate_temp_" + direction, 1);
        this.rateTempShiftTimers.set(deck, engine.beginTimer(500, function () {
            engine.setParameter(_this.buildChannelString(deck), "rate_temp_up", 0);
            engine.setParameter(_this.buildChannelString(deck), "rate_temp_down", 0);
        }));
    };
    Mixxx.prototype.toggleKeyLock = function (deck) {
        engine.setParameter(this.buildChannelString(deck), "keylock", !engine.getParameter(this.buildChannelString(deck), "keylock"));
    };
    Mixxx.prototype.subscribeToKeylock = function (deck, callback) {
        var channel = this.buildChannelString(deck);
        var conn = engine.makeConnection(channel, 'keylock', callback);
        conn.trigger();
        return conn;
    };
    Mixxx.prototype.openFolder = function () {
        engine.setValue(Mixxx.LIBRARY_CHANNEL, "MoveRight", 1);
    };
    Mixxx.prototype.closeFolder = function () {
        engine.setValue(Mixxx.LIBRARY_CHANNEL, "MoveLeft", 1);
        engine.setValue(Mixxx.LIBRARY_CHANNEL, "MoveLeft", 1);
    };
    Mixxx.prototype.navigateLibraryDirection = function (direction) {
        engine.setValue(Mixxx.LIBRARY_CHANNEL, "MoveVertical", direction);
    };
    Mixxx.prototype.moveFocusDirection = function (direction) {
        engine.setValue(Mixxx.LIBRARY_CHANNEL, "MoveFocus", direction);
    };
    Mixxx.prototype.loadTrack = function (deck) {
        engine.setParameter(this.buildChannelString(deck), "LoadSelectedTrack", 1);
    };
    Mixxx.prototype.toggleHeadphoneCueEnabled = function (deck) {
        engine.setParameter(this.buildChannelString(deck), "pfl", !engine.getParameter(this.buildChannelString(deck), "pfl"));
    };
    Mixxx.prototype.subscribeToHeadphoneCueEnabled = function (deck, callback) {
        return engine.makeConnection(this.buildChannelString(deck), "pfl", callback);
    };
    Mixxx.prototype.isDeckPlaying = function (deck) {
        return engine.getParameter(this.buildChannelString(deck), "play");
    };
    Mixxx.prototype.beatjump = function (deck, size, direction) {
        engine.setParameter(this.buildChannelString(deck), "beatjump_" + size + "_" + direction, 1);
    };
    Mixxx.prototype.changeMasterVolume = function (direction) {
        return engine.setParameter(Mixxx.MASTER_CHANNEL, "gain_" + direction + "_small", 1);
    };
    Mixxx.prototype.changeHeadphoneVolume = function (direction) {
        return engine.setParameter(Mixxx.MASTER_CHANNEL, "headGain_" + direction + "_small", 1);
    };
    Mixxx.prototype.buildChannelString = function (deck) {
        return "[Channel" + deck + "]";
    };
    Mixxx.LIBRARY_CHANNEL = "[Library]";
    Mixxx.MASTER_CHANNEL = "[Master]";
    return Mixxx;
}());
var LoopStatus;
(function (LoopStatus) {
    LoopStatus[LoopStatus["ENABLED"] = 1] = "ENABLED";
    LoopStatus[LoopStatus["DISABLED"] = 0] = "DISABLED";
})(LoopStatus || (LoopStatus = {}));
var PlayStatus;
(function (PlayStatus) {
    PlayStatus[PlayStatus["PAUSED"] = 0] = "PAUSED";
    PlayStatus[PlayStatus["PLAYING"] = 1] = "PLAYING";
})(PlayStatus || (PlayStatus = {}));
var CueStatus;
(function (CueStatus) {
    CueStatus[CueStatus["UNSET"] = 0] = "UNSET";
    CueStatus[CueStatus["SET"] = 1] = "SET";
})(CueStatus || (CueStatus = {}));
var LoopType;
(function (LoopType) {
    LoopType[LoopType["SLIP"] = 0] = "SLIP";
    LoopType[LoopType["NORMAL"] = 1] = "NORMAL";
})(LoopType || (LoopType = {}));

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var fails$u = function (exec) {
  try {
    return !!exec();
  } catch (error) {
    return true;
  }
};

var fails$t = fails$u;

var functionBindNative = !fails$t(function () {
  // eslint-disable-next-line es/no-function-prototype-bind -- safe
  var test = (function () { /* empty */ }).bind();
  // eslint-disable-next-line no-prototype-builtins -- safe
  return typeof test != 'function' || test.hasOwnProperty('prototype');
});

var NATIVE_BIND$3 = functionBindNative;

var FunctionPrototype$2 = Function.prototype;
var bind$9 = FunctionPrototype$2.bind;
var call$a = FunctionPrototype$2.call;
var uncurryThis$w = NATIVE_BIND$3 && bind$9.bind(call$a, call$a);

var functionUncurryThis = NATIVE_BIND$3 ? function (fn) {
  return fn && uncurryThis$w(fn);
} : function (fn) {
  return fn && function () {
    return call$a.apply(fn, arguments);
  };
};

var uncurryThis$v = functionUncurryThis;

var toString$a = uncurryThis$v({}.toString);
var stringSlice$3 = uncurryThis$v(''.slice);

var classofRaw$1 = function (it) {
  return stringSlice$3(toString$a(it), 8, -1);
};

var uncurryThis$u = functionUncurryThis;
var fails$s = fails$u;
var classof$9 = classofRaw$1;

var $Object$4 = Object;
var split = uncurryThis$u(''.split);

// fallback for non-array-like ES3 and non-enumerable old V8 strings
var indexedObject = fails$s(function () {
  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
  // eslint-disable-next-line no-prototype-builtins -- safe
  return !$Object$4('z').propertyIsEnumerable(0);
}) ? function (it) {
  return classof$9(it) == 'String' ? split(it, '') : $Object$4(it);
} : $Object$4;

// we can't use just `it == null` since of `document.all` special case
// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
var isNullOrUndefined$5 = function (it) {
  return it === null || it === undefined;
};

var isNullOrUndefined$4 = isNullOrUndefined$5;

var $TypeError$d = TypeError;

// `RequireObjectCoercible` abstract operation
// https://tc39.es/ecma262/#sec-requireobjectcoercible
var requireObjectCoercible$5 = function (it) {
  if (isNullOrUndefined$4(it)) throw $TypeError$d("Can't call method on " + it);
  return it;
};

// toObject with fallback for non-array-like ES3 strings
var IndexedObject$6 = indexedObject;
var requireObjectCoercible$4 = requireObjectCoercible$5;

var toIndexedObject$d = function (it) {
  return IndexedObject$6(requireObjectCoercible$4(it));
};

var check = function (it) {
  return it && it.Math == Math && it;
};

// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global$j =
  // eslint-disable-next-line es/no-global-this -- safe
  check(typeof globalThis == 'object' && globalThis) ||
  check(typeof window == 'object' && window) ||
  // eslint-disable-next-line no-restricted-globals -- safe
  check(typeof self == 'object' && self) ||
  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
  // eslint-disable-next-line no-new-func -- fallback
  (function () { return this; })() || Function('return this')();

var shared$3 = {exports: {}};

var isPure = false;

var global$i = global$j;

// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty$7 = Object.defineProperty;

var defineGlobalProperty$3 = function (key, value) {
  try {
    defineProperty$7(global$i, key, { value: value, configurable: true, writable: true });
  } catch (error) {
    global$i[key] = value;
  } return value;
};

var global$h = global$j;
var defineGlobalProperty$2 = defineGlobalProperty$3;

var SHARED = '__core-js_shared__';
var store$3 = global$h[SHARED] || defineGlobalProperty$2(SHARED, {});

var sharedStore = store$3;

var store$2 = sharedStore;

(shared$3.exports = function (key, value) {
  return store$2[key] || (store$2[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: '3.25.3',
  mode: 'global',
  copyright: '© 2014-2022 Denis Pushkarev (zloirock.ru)',
  license: 'https://github.com/zloirock/core-js/blob/v3.25.3/LICENSE',
  source: 'https://github.com/zloirock/core-js'
});

var requireObjectCoercible$3 = requireObjectCoercible$5;

var $Object$3 = Object;

// `ToObject` abstract operation
// https://tc39.es/ecma262/#sec-toobject
var toObject$i = function (argument) {
  return $Object$3(requireObjectCoercible$3(argument));
};

var uncurryThis$t = functionUncurryThis;
var toObject$h = toObject$i;

var hasOwnProperty = uncurryThis$t({}.hasOwnProperty);

// `HasOwnProperty` abstract operation
// https://tc39.es/ecma262/#sec-hasownproperty
// eslint-disable-next-line es/no-object-hasown -- safe
var hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
  return hasOwnProperty(toObject$h(it), key);
};

var uncurryThis$s = functionUncurryThis;

var id$1 = 0;
var postfix = Math.random();
var toString$9 = uncurryThis$s(1.0.toString);

var uid$3 = function (key) {
  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString$9(++id$1 + postfix, 36);
};

var documentAll$2 = typeof document == 'object' && document.all;

// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
var IS_HTMLDDA = typeof documentAll$2 == 'undefined' && documentAll$2 !== undefined;

var documentAll_1 = {
  all: documentAll$2,
  IS_HTMLDDA: IS_HTMLDDA
};

var $documentAll$1 = documentAll_1;

var documentAll$1 = $documentAll$1.all;

// `IsCallable` abstract operation
// https://tc39.es/ecma262/#sec-iscallable
var isCallable$i = $documentAll$1.IS_HTMLDDA ? function (argument) {
  return typeof argument == 'function' || argument === documentAll$1;
} : function (argument) {
  return typeof argument == 'function';
};

var global$g = global$j;
var isCallable$h = isCallable$i;

var aFunction = function (argument) {
  return isCallable$h(argument) ? argument : undefined;
};

var getBuiltIn$7 = function (namespace, method) {
  return arguments.length < 2 ? aFunction(global$g[namespace]) : global$g[namespace] && global$g[namespace][method];
};

var getBuiltIn$6 = getBuiltIn$7;

var engineUserAgent = getBuiltIn$6('navigator', 'userAgent') || '';

var global$f = global$j;
var userAgent$2 = engineUserAgent;

var process = global$f.process;
var Deno = global$f.Deno;
var versions = process && process.versions || Deno && Deno.version;
var v8 = versions && versions.v8;
var match, version;

if (v8) {
  match = v8.split('.');
  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
  // but their correct versions are not interesting for us
  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
}

// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
// so check `userAgent` even if `.v8` exists, but 0
if (!version && userAgent$2) {
  match = userAgent$2.match(/Edge\/(\d+)/);
  if (!match || match[1] >= 74) {
    match = userAgent$2.match(/Chrome\/(\d+)/);
    if (match) version = +match[1];
  }
}

var engineV8Version = version;

/* eslint-disable es/no-symbol -- required for testing */

var V8_VERSION$2 = engineV8Version;
var fails$r = fails$u;

// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
var symbolConstructorDetection = !!Object.getOwnPropertySymbols && !fails$r(function () {
  var symbol = Symbol();
  // Chrome 38 Symbol has incorrect toString conversion
  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
  return !String(symbol) || !(Object(symbol) instanceof Symbol) ||
    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
    !Symbol.sham && V8_VERSION$2 && V8_VERSION$2 < 41;
});

/* eslint-disable es/no-symbol -- required for testing */

var NATIVE_SYMBOL$1 = symbolConstructorDetection;

var useSymbolAsUid = NATIVE_SYMBOL$1
  && !Symbol.sham
  && typeof Symbol.iterator == 'symbol';

var global$e = global$j;
var shared$2 = shared$3.exports;
var hasOwn$a = hasOwnProperty_1;
var uid$2 = uid$3;
var NATIVE_SYMBOL = symbolConstructorDetection;
var USE_SYMBOL_AS_UID$1 = useSymbolAsUid;

var WellKnownSymbolsStore = shared$2('wks');
var Symbol$3 = global$e.Symbol;
var symbolFor = Symbol$3 && Symbol$3['for'];
var createWellKnownSymbol = USE_SYMBOL_AS_UID$1 ? Symbol$3 : Symbol$3 && Symbol$3.withoutSetter || uid$2;

var wellKnownSymbol$g = function (name) {
  if (!hasOwn$a(WellKnownSymbolsStore, name) || !(NATIVE_SYMBOL || typeof WellKnownSymbolsStore[name] == 'string')) {
    var description = 'Symbol.' + name;
    if (NATIVE_SYMBOL && hasOwn$a(Symbol$3, name)) {
      WellKnownSymbolsStore[name] = Symbol$3[name];
    } else if (USE_SYMBOL_AS_UID$1 && symbolFor) {
      WellKnownSymbolsStore[name] = symbolFor(description);
    } else {
      WellKnownSymbolsStore[name] = createWellKnownSymbol(description);
    }
  } return WellKnownSymbolsStore[name];
};

var isCallable$g = isCallable$i;
var $documentAll = documentAll_1;

var documentAll = $documentAll.all;

var isObject$e = $documentAll.IS_HTMLDDA ? function (it) {
  return typeof it == 'object' ? it !== null : isCallable$g(it) || it === documentAll;
} : function (it) {
  return typeof it == 'object' ? it !== null : isCallable$g(it);
};

var isObject$d = isObject$e;

var $String$5 = String;
var $TypeError$c = TypeError;

// `Assert: Type(argument) is Object`
var anObject$9 = function (argument) {
  if (isObject$d(argument)) return argument;
  throw $TypeError$c($String$5(argument) + ' is not an object');
};

var objectDefineProperties = {};

var fails$q = fails$u;

// Detect IE8's incomplete defineProperty implementation
var descriptors = !fails$q(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
});

var DESCRIPTORS$c = descriptors;
var fails$p = fails$u;

// V8 ~ Chrome 36-
// https://bugs.chromium.org/p/v8/issues/detail?id=3334
var v8PrototypeDefineBug = DESCRIPTORS$c && fails$p(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
    value: 42,
    writable: false
  }).prototype != 42;
});

var objectDefineProperty = {};

var global$d = global$j;
var isObject$c = isObject$e;

var document$1 = global$d.document;
// typeof document.createElement is 'object' in old IE
var EXISTS$1 = isObject$c(document$1) && isObject$c(document$1.createElement);

var documentCreateElement$2 = function (it) {
  return EXISTS$1 ? document$1.createElement(it) : {};
};

var DESCRIPTORS$b = descriptors;
var fails$o = fails$u;
var createElement = documentCreateElement$2;

// Thanks to IE8 for its funny defineProperty
var ie8DomDefine = !DESCRIPTORS$b && !fails$o(function () {
  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
  return Object.defineProperty(createElement('div'), 'a', {
    get: function () { return 7; }
  }).a != 7;
});

var NATIVE_BIND$2 = functionBindNative;

var call$9 = Function.prototype.call;

var functionCall = NATIVE_BIND$2 ? call$9.bind(call$9) : function () {
  return call$9.apply(call$9, arguments);
};

var uncurryThis$r = functionUncurryThis;

var objectIsPrototypeOf = uncurryThis$r({}.isPrototypeOf);

var getBuiltIn$5 = getBuiltIn$7;
var isCallable$f = isCallable$i;
var isPrototypeOf$3 = objectIsPrototypeOf;
var USE_SYMBOL_AS_UID = useSymbolAsUid;

var $Object$2 = Object;

var isSymbol$3 = USE_SYMBOL_AS_UID ? function (it) {
  return typeof it == 'symbol';
} : function (it) {
  var $Symbol = getBuiltIn$5('Symbol');
  return isCallable$f($Symbol) && isPrototypeOf$3($Symbol.prototype, $Object$2(it));
};

var $String$4 = String;

var tryToString$4 = function (argument) {
  try {
    return $String$4(argument);
  } catch (error) {
    return 'Object';
  }
};

var isCallable$e = isCallable$i;
var tryToString$3 = tryToString$4;

var $TypeError$b = TypeError;

// `Assert: IsCallable(argument) is true`
var aCallable$7 = function (argument) {
  if (isCallable$e(argument)) return argument;
  throw $TypeError$b(tryToString$3(argument) + ' is not a function');
};

var aCallable$6 = aCallable$7;
var isNullOrUndefined$3 = isNullOrUndefined$5;

// `GetMethod` abstract operation
// https://tc39.es/ecma262/#sec-getmethod
var getMethod$3 = function (V, P) {
  var func = V[P];
  return isNullOrUndefined$3(func) ? undefined : aCallable$6(func);
};

var call$8 = functionCall;
var isCallable$d = isCallable$i;
var isObject$b = isObject$e;

var $TypeError$a = TypeError;

// `OrdinaryToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-ordinarytoprimitive
var ordinaryToPrimitive$1 = function (input, pref) {
  var fn, val;
  if (pref === 'string' && isCallable$d(fn = input.toString) && !isObject$b(val = call$8(fn, input))) return val;
  if (isCallable$d(fn = input.valueOf) && !isObject$b(val = call$8(fn, input))) return val;
  if (pref !== 'string' && isCallable$d(fn = input.toString) && !isObject$b(val = call$8(fn, input))) return val;
  throw $TypeError$a("Can't convert object to primitive value");
};

var call$7 = functionCall;
var isObject$a = isObject$e;
var isSymbol$2 = isSymbol$3;
var getMethod$2 = getMethod$3;
var ordinaryToPrimitive = ordinaryToPrimitive$1;
var wellKnownSymbol$f = wellKnownSymbol$g;

var $TypeError$9 = TypeError;
var TO_PRIMITIVE = wellKnownSymbol$f('toPrimitive');

// `ToPrimitive` abstract operation
// https://tc39.es/ecma262/#sec-toprimitive
var toPrimitive$2 = function (input, pref) {
  if (!isObject$a(input) || isSymbol$2(input)) return input;
  var exoticToPrim = getMethod$2(input, TO_PRIMITIVE);
  var result;
  if (exoticToPrim) {
    if (pref === undefined) pref = 'default';
    result = call$7(exoticToPrim, input, pref);
    if (!isObject$a(result) || isSymbol$2(result)) return result;
    throw $TypeError$9("Can't convert object to primitive value");
  }
  if (pref === undefined) pref = 'number';
  return ordinaryToPrimitive(input, pref);
};

var toPrimitive$1 = toPrimitive$2;
var isSymbol$1 = isSymbol$3;

// `ToPropertyKey` abstract operation
// https://tc39.es/ecma262/#sec-topropertykey
var toPropertyKey$4 = function (argument) {
  var key = toPrimitive$1(argument, 'string');
  return isSymbol$1(key) ? key : key + '';
};

var DESCRIPTORS$a = descriptors;
var IE8_DOM_DEFINE$1 = ie8DomDefine;
var V8_PROTOTYPE_DEFINE_BUG$1 = v8PrototypeDefineBug;
var anObject$8 = anObject$9;
var toPropertyKey$3 = toPropertyKey$4;

var $TypeError$8 = TypeError;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var $defineProperty = Object.defineProperty;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;
var ENUMERABLE = 'enumerable';
var CONFIGURABLE$1 = 'configurable';
var WRITABLE = 'writable';

// `Object.defineProperty` method
// https://tc39.es/ecma262/#sec-object.defineproperty
objectDefineProperty.f = DESCRIPTORS$a ? V8_PROTOTYPE_DEFINE_BUG$1 ? function defineProperty(O, P, Attributes) {
  anObject$8(O);
  P = toPropertyKey$3(P);
  anObject$8(Attributes);
  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
    var current = $getOwnPropertyDescriptor$1(O, P);
    if (current && current[WRITABLE]) {
      O[P] = Attributes.value;
      Attributes = {
        configurable: CONFIGURABLE$1 in Attributes ? Attributes[CONFIGURABLE$1] : current[CONFIGURABLE$1],
        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
        writable: false
      };
    }
  } return $defineProperty(O, P, Attributes);
} : $defineProperty : function defineProperty(O, P, Attributes) {
  anObject$8(O);
  P = toPropertyKey$3(P);
  anObject$8(Attributes);
  if (IE8_DOM_DEFINE$1) try {
    return $defineProperty(O, P, Attributes);
  } catch (error) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw $TypeError$8('Accessors not supported');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var ceil = Math.ceil;
var floor$5 = Math.floor;

// `Math.trunc` method
// https://tc39.es/ecma262/#sec-math.trunc
// eslint-disable-next-line es/no-math-trunc -- safe
var mathTrunc = Math.trunc || function trunc(x) {
  var n = +x;
  return (n > 0 ? floor$5 : ceil)(n);
};

var trunc$1 = mathTrunc;

// `ToIntegerOrInfinity` abstract operation
// https://tc39.es/ecma262/#sec-tointegerorinfinity
var toIntegerOrInfinity$c = function (argument) {
  var number = +argument;
  // eslint-disable-next-line no-self-compare -- NaN check
  return number !== number || number === 0 ? 0 : trunc$1(number);
};

var toIntegerOrInfinity$b = toIntegerOrInfinity$c;

var max$4 = Math.max;
var min$5 = Math.min;

// Helper for a popular repeating case of the spec:
// Let integer be ? ToInteger(index).
// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
var toAbsoluteIndex$7 = function (index, length) {
  var integer = toIntegerOrInfinity$b(index);
  return integer < 0 ? max$4(integer + length, 0) : min$5(integer, length);
};

var toIntegerOrInfinity$a = toIntegerOrInfinity$c;

var min$4 = Math.min;

// `ToLength` abstract operation
// https://tc39.es/ecma262/#sec-tolength
var toLength$1 = function (argument) {
  return argument > 0 ? min$4(toIntegerOrInfinity$a(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
};

var toLength = toLength$1;

// `LengthOfArrayLike` abstract operation
// https://tc39.es/ecma262/#sec-lengthofarraylike
var lengthOfArrayLike$q = function (obj) {
  return toLength(obj.length);
};

var toIndexedObject$c = toIndexedObject$d;
var toAbsoluteIndex$6 = toAbsoluteIndex$7;
var lengthOfArrayLike$p = lengthOfArrayLike$q;

// `Array.prototype.{ indexOf, includes }` methods implementation
var createMethod$5 = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = toIndexedObject$c($this);
    var length = lengthOfArrayLike$p(O);
    var index = toAbsoluteIndex$6(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare -- NaN check
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare -- NaN check
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) {
      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

var arrayIncludes = {
  // `Array.prototype.includes` method
  // https://tc39.es/ecma262/#sec-array.prototype.includes
  includes: createMethod$5(true),
  // `Array.prototype.indexOf` method
  // https://tc39.es/ecma262/#sec-array.prototype.indexof
  indexOf: createMethod$5(false)
};

var hiddenKeys$5 = {};

var uncurryThis$q = functionUncurryThis;
var hasOwn$9 = hasOwnProperty_1;
var toIndexedObject$b = toIndexedObject$d;
var indexOf = arrayIncludes.indexOf;
var hiddenKeys$4 = hiddenKeys$5;

var push$4 = uncurryThis$q([].push);

var objectKeysInternal = function (object, names) {
  var O = toIndexedObject$b(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) !hasOwn$9(hiddenKeys$4, key) && hasOwn$9(O, key) && push$4(result, key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (hasOwn$9(O, key = names[i++])) {
    ~indexOf(result, key) || push$4(result, key);
  }
  return result;
};

// IE8- don't enum bug keys
var enumBugKeys$3 = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];

var internalObjectKeys$1 = objectKeysInternal;
var enumBugKeys$2 = enumBugKeys$3;

// `Object.keys` method
// https://tc39.es/ecma262/#sec-object.keys
// eslint-disable-next-line es/no-object-keys -- safe
var objectKeys$1 = Object.keys || function keys(O) {
  return internalObjectKeys$1(O, enumBugKeys$2);
};

var DESCRIPTORS$9 = descriptors;
var V8_PROTOTYPE_DEFINE_BUG = v8PrototypeDefineBug;
var definePropertyModule$5 = objectDefineProperty;
var anObject$7 = anObject$9;
var toIndexedObject$a = toIndexedObject$d;
var objectKeys = objectKeys$1;

// `Object.defineProperties` method
// https://tc39.es/ecma262/#sec-object.defineproperties
// eslint-disable-next-line es/no-object-defineproperties -- safe
objectDefineProperties.f = DESCRIPTORS$9 && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
  anObject$7(O);
  var props = toIndexedObject$a(Properties);
  var keys = objectKeys(Properties);
  var length = keys.length;
  var index = 0;
  var key;
  while (length > index) definePropertyModule$5.f(O, key = keys[index++], props[key]);
  return O;
};

var getBuiltIn$4 = getBuiltIn$7;

var html$1 = getBuiltIn$4('document', 'documentElement');

var shared$1 = shared$3.exports;
var uid$1 = uid$3;

var keys$1 = shared$1('keys');

var sharedKey$3 = function (key) {
  return keys$1[key] || (keys$1[key] = uid$1(key));
};

/* global ActiveXObject -- old IE, WSH */

var anObject$6 = anObject$9;
var definePropertiesModule = objectDefineProperties;
var enumBugKeys$1 = enumBugKeys$3;
var hiddenKeys$3 = hiddenKeys$5;
var html = html$1;
var documentCreateElement$1 = documentCreateElement$2;
var sharedKey$2 = sharedKey$3;

var GT = '>';
var LT = '<';
var PROTOTYPE = 'prototype';
var SCRIPT = 'script';
var IE_PROTO$1 = sharedKey$2('IE_PROTO');

var EmptyConstructor = function () { /* empty */ };

var scriptTag = function (content) {
  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
};

// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
var NullProtoObjectViaActiveX = function (activeXDocument) {
  activeXDocument.write(scriptTag(''));
  activeXDocument.close();
  var temp = activeXDocument.parentWindow.Object;
  activeXDocument = null; // avoid memory leak
  return temp;
};

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var NullProtoObjectViaIFrame = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = documentCreateElement$1('iframe');
  var JS = 'java' + SCRIPT + ':';
  var iframeDocument;
  iframe.style.display = 'none';
  html.appendChild(iframe);
  // https://github.com/zloirock/core-js/issues/475
  iframe.src = String(JS);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(scriptTag('document.F=Object'));
  iframeDocument.close();
  return iframeDocument.F;
};

// Check for document.domain and active x support
// No need to use active x approach when document.domain is not set
// see https://github.com/es-shims/es5-shim/issues/150
// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
// avoid IE GC bug
var activeXDocument;
var NullProtoObject = function () {
  try {
    activeXDocument = new ActiveXObject('htmlfile');
  } catch (error) { /* ignore */ }
  NullProtoObject = typeof document != 'undefined'
    ? document.domain && activeXDocument
      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
      : NullProtoObjectViaIFrame()
    : NullProtoObjectViaActiveX(activeXDocument); // WSH
  var length = enumBugKeys$1.length;
  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys$1[length]];
  return NullProtoObject();
};

hiddenKeys$3[IE_PROTO$1] = true;

// `Object.create` method
// https://tc39.es/ecma262/#sec-object.create
// eslint-disable-next-line es/no-object-create -- safe
var objectCreate$1 = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    EmptyConstructor[PROTOTYPE] = anObject$6(O);
    result = new EmptyConstructor();
    EmptyConstructor[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO$1] = O;
  } else result = NullProtoObject();
  return Properties === undefined ? result : definePropertiesModule.f(result, Properties);
};

var wellKnownSymbol$e = wellKnownSymbol$g;
var create$2 = objectCreate$1;
var defineProperty$6 = objectDefineProperty.f;

var UNSCOPABLES = wellKnownSymbol$e('unscopables');
var ArrayPrototype$1 = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype$1[UNSCOPABLES] == undefined) {
  defineProperty$6(ArrayPrototype$1, UNSCOPABLES, {
    configurable: true,
    value: create$2(null)
  });
}

// add a key to Array.prototype[@@unscopables]
var addToUnscopables$i = function (key) {
  ArrayPrototype$1[UNSCOPABLES][key] = true;
};

var iterators = {};

var global$c = global$j;
var isCallable$c = isCallable$i;

var WeakMap$1 = global$c.WeakMap;

var weakMapBasicDetection = isCallable$c(WeakMap$1) && /native code/.test(String(WeakMap$1));

var createPropertyDescriptor$4 = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var DESCRIPTORS$8 = descriptors;
var definePropertyModule$4 = objectDefineProperty;
var createPropertyDescriptor$3 = createPropertyDescriptor$4;

var createNonEnumerableProperty$4 = DESCRIPTORS$8 ? function (object, key, value) {
  return definePropertyModule$4.f(object, key, createPropertyDescriptor$3(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var NATIVE_WEAK_MAP = weakMapBasicDetection;
var global$b = global$j;
var uncurryThis$p = functionUncurryThis;
var isObject$9 = isObject$e;
var createNonEnumerableProperty$3 = createNonEnumerableProperty$4;
var hasOwn$8 = hasOwnProperty_1;
var shared = sharedStore;
var sharedKey$1 = sharedKey$3;
var hiddenKeys$2 = hiddenKeys$5;

var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
var TypeError$2 = global$b.TypeError;
var WeakMap = global$b.WeakMap;
var set, get, has;

var enforce = function (it) {
  return has(it) ? get(it) : set(it, {});
};

var getterFor = function (TYPE) {
  return function (it) {
    var state;
    if (!isObject$9(it) || (state = get(it)).type !== TYPE) {
      throw TypeError$2('Incompatible receiver, ' + TYPE + ' required');
    } return state;
  };
};

if (NATIVE_WEAK_MAP || shared.state) {
  var store$1 = shared.state || (shared.state = new WeakMap());
  var wmget = uncurryThis$p(store$1.get);
  var wmhas = uncurryThis$p(store$1.has);
  var wmset = uncurryThis$p(store$1.set);
  set = function (it, metadata) {
    if (wmhas(store$1, it)) throw TypeError$2(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    wmset(store$1, it, metadata);
    return metadata;
  };
  get = function (it) {
    return wmget(store$1, it) || {};
  };
  has = function (it) {
    return wmhas(store$1, it);
  };
} else {
  var STATE = sharedKey$1('state');
  hiddenKeys$2[STATE] = true;
  set = function (it, metadata) {
    if (hasOwn$8(it, STATE)) throw TypeError$2(OBJECT_ALREADY_INITIALIZED);
    metadata.facade = it;
    createNonEnumerableProperty$3(it, STATE, metadata);
    return metadata;
  };
  get = function (it) {
    return hasOwn$8(it, STATE) ? it[STATE] : {};
  };
  has = function (it) {
    return hasOwn$8(it, STATE);
  };
}

var internalState = {
  set: set,
  get: get,
  has: has,
  enforce: enforce,
  getterFor: getterFor
};

var objectGetOwnPropertyDescriptor = {};

var objectPropertyIsEnumerable = {};

var $propertyIsEnumerable = {}.propertyIsEnumerable;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor$3 = Object.getOwnPropertyDescriptor;

// Nashorn ~ JDK8 bug
var NASHORN_BUG = getOwnPropertyDescriptor$3 && !$propertyIsEnumerable.call({ 1: 2 }, 1);

// `Object.prototype.propertyIsEnumerable` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
  var descriptor = getOwnPropertyDescriptor$3(this, V);
  return !!descriptor && descriptor.enumerable;
} : $propertyIsEnumerable;

var DESCRIPTORS$7 = descriptors;
var call$6 = functionCall;
var propertyIsEnumerableModule = objectPropertyIsEnumerable;
var createPropertyDescriptor$2 = createPropertyDescriptor$4;
var toIndexedObject$9 = toIndexedObject$d;
var toPropertyKey$2 = toPropertyKey$4;
var hasOwn$7 = hasOwnProperty_1;
var IE8_DOM_DEFINE = ie8DomDefine;

// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// `Object.getOwnPropertyDescriptor` method
// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
objectGetOwnPropertyDescriptor.f = DESCRIPTORS$7 ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
  O = toIndexedObject$9(O);
  P = toPropertyKey$2(P);
  if (IE8_DOM_DEFINE) try {
    return $getOwnPropertyDescriptor(O, P);
  } catch (error) { /* empty */ }
  if (hasOwn$7(O, P)) return createPropertyDescriptor$2(!call$6(propertyIsEnumerableModule.f, O, P), O[P]);
};

var makeBuiltIn$2 = {exports: {}};

var DESCRIPTORS$6 = descriptors;
var hasOwn$6 = hasOwnProperty_1;

var FunctionPrototype$1 = Function.prototype;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getDescriptor = DESCRIPTORS$6 && Object.getOwnPropertyDescriptor;

var EXISTS = hasOwn$6(FunctionPrototype$1, 'name');
// additional protection from minified / mangled / dropped function names
var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
var CONFIGURABLE = EXISTS && (!DESCRIPTORS$6 || (DESCRIPTORS$6 && getDescriptor(FunctionPrototype$1, 'name').configurable));

var functionName = {
  EXISTS: EXISTS,
  PROPER: PROPER,
  CONFIGURABLE: CONFIGURABLE
};

var uncurryThis$o = functionUncurryThis;
var isCallable$b = isCallable$i;
var store = sharedStore;

var functionToString = uncurryThis$o(Function.toString);

// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
if (!isCallable$b(store.inspectSource)) {
  store.inspectSource = function (it) {
    return functionToString(it);
  };
}

var inspectSource$2 = store.inspectSource;

var fails$n = fails$u;
var isCallable$a = isCallable$i;
var hasOwn$5 = hasOwnProperty_1;
var DESCRIPTORS$5 = descriptors;
var CONFIGURABLE_FUNCTION_NAME$1 = functionName.CONFIGURABLE;
var inspectSource$1 = inspectSource$2;
var InternalStateModule$3 = internalState;

var enforceInternalState = InternalStateModule$3.enforce;
var getInternalState$2 = InternalStateModule$3.get;
// eslint-disable-next-line es/no-object-defineproperty -- safe
var defineProperty$5 = Object.defineProperty;

var CONFIGURABLE_LENGTH = DESCRIPTORS$5 && !fails$n(function () {
  return defineProperty$5(function () { /* empty */ }, 'length', { value: 8 }).length !== 8;
});

var TEMPLATE = String(String).split('String');

var makeBuiltIn$1 = makeBuiltIn$2.exports = function (value, name, options) {
  if (String(name).slice(0, 7) === 'Symbol(') {
    name = '[' + String(name).replace(/^Symbol\(([^)]*)\)/, '$1') + ']';
  }
  if (options && options.getter) name = 'get ' + name;
  if (options && options.setter) name = 'set ' + name;
  if (!hasOwn$5(value, 'name') || (CONFIGURABLE_FUNCTION_NAME$1 && value.name !== name)) {
    if (DESCRIPTORS$5) defineProperty$5(value, 'name', { value: name, configurable: true });
    else value.name = name;
  }
  if (CONFIGURABLE_LENGTH && options && hasOwn$5(options, 'arity') && value.length !== options.arity) {
    defineProperty$5(value, 'length', { value: options.arity });
  }
  try {
    if (options && hasOwn$5(options, 'constructor') && options.constructor) {
      if (DESCRIPTORS$5) defineProperty$5(value, 'prototype', { writable: false });
    // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
    } else if (value.prototype) value.prototype = undefined;
  } catch (error) { /* empty */ }
  var state = enforceInternalState(value);
  if (!hasOwn$5(state, 'source')) {
    state.source = TEMPLATE.join(typeof name == 'string' ? name : '');
  } return value;
};

// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
// eslint-disable-next-line no-extend-native -- required
Function.prototype.toString = makeBuiltIn$1(function toString() {
  return isCallable$a(this) && getInternalState$2(this).source || inspectSource$1(this);
}, 'toString');

var isCallable$9 = isCallable$i;
var definePropertyModule$3 = objectDefineProperty;
var makeBuiltIn = makeBuiltIn$2.exports;
var defineGlobalProperty$1 = defineGlobalProperty$3;

var defineBuiltIn$7 = function (O, key, value, options) {
  if (!options) options = {};
  var simple = options.enumerable;
  var name = options.name !== undefined ? options.name : key;
  if (isCallable$9(value)) makeBuiltIn(value, name, options);
  if (options.global) {
    if (simple) O[key] = value;
    else defineGlobalProperty$1(key, value);
  } else {
    try {
      if (!options.unsafe) delete O[key];
      else if (O[key]) simple = true;
    } catch (error) { /* empty */ }
    if (simple) O[key] = value;
    else definePropertyModule$3.f(O, key, {
      value: value,
      enumerable: false,
      configurable: !options.nonConfigurable,
      writable: !options.nonWritable
    });
  } return O;
};

var objectGetOwnPropertyNames = {};

var internalObjectKeys = objectKeysInternal;
var enumBugKeys = enumBugKeys$3;

var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');

// `Object.getOwnPropertyNames` method
// https://tc39.es/ecma262/#sec-object.getownpropertynames
// eslint-disable-next-line es/no-object-getownpropertynames -- safe
objectGetOwnPropertyNames.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return internalObjectKeys(O, hiddenKeys$1);
};

var objectGetOwnPropertySymbols = {};

// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;

var getBuiltIn$3 = getBuiltIn$7;
var uncurryThis$n = functionUncurryThis;
var getOwnPropertyNamesModule$1 = objectGetOwnPropertyNames;
var getOwnPropertySymbolsModule = objectGetOwnPropertySymbols;
var anObject$5 = anObject$9;

var concat = uncurryThis$n([].concat);

// all object keys, includes non-enumerable and symbols
var ownKeys$1 = getBuiltIn$3('Reflect', 'ownKeys') || function ownKeys(it) {
  var keys = getOwnPropertyNamesModule$1.f(anObject$5(it));
  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
  return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
};

var hasOwn$4 = hasOwnProperty_1;
var ownKeys = ownKeys$1;
var getOwnPropertyDescriptorModule = objectGetOwnPropertyDescriptor;
var definePropertyModule$2 = objectDefineProperty;

var copyConstructorProperties$1 = function (target, source, exceptions) {
  var keys = ownKeys(source);
  var defineProperty = definePropertyModule$2.f;
  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (!hasOwn$4(target, key) && !(exceptions && hasOwn$4(exceptions, key))) {
      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
    }
  }
};

var fails$m = fails$u;
var isCallable$8 = isCallable$i;

var replacement = /#|\.prototype\./;

var isForced$3 = function (feature, detection) {
  var value = data[normalize(feature)];
  return value == POLYFILL ? true
    : value == NATIVE ? false
    : isCallable$8(detection) ? fails$m(detection)
    : !!detection;
};

var normalize = isForced$3.normalize = function (string) {
  return String(string).replace(replacement, '.').toLowerCase();
};

var data = isForced$3.data = {};
var NATIVE = isForced$3.NATIVE = 'N';
var POLYFILL = isForced$3.POLYFILL = 'P';

var isForced_1 = isForced$3;

var global$a = global$j;
var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
var createNonEnumerableProperty$2 = createNonEnumerableProperty$4;
var defineBuiltIn$6 = defineBuiltIn$7;
var defineGlobalProperty = defineGlobalProperty$3;
var copyConstructorProperties = copyConstructorProperties$1;
var isForced$2 = isForced_1;

/*
  options.target         - name of the target object
  options.global         - target is the global object
  options.stat           - export as static methods of target
  options.proto          - export as prototype methods of target
  options.real           - real prototype method for the `pure` version
  options.forced         - export even if the native feature is available
  options.bind           - bind methods to the target, required for the `pure` version
  options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
  options.unsafe         - use the simple assignment of property instead of delete + defineProperty
  options.sham           - add a flag to not completely full polyfills
  options.enumerable     - export as enumerable property
  options.dontCallGetSet - prevent calling a getter on target
  options.name           - the .name of the function if it does not match the key
*/
var _export = function (options, source) {
  var TARGET = options.target;
  var GLOBAL = options.global;
  var STATIC = options.stat;
  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
  if (GLOBAL) {
    target = global$a;
  } else if (STATIC) {
    target = global$a[TARGET] || defineGlobalProperty(TARGET, {});
  } else {
    target = (global$a[TARGET] || {}).prototype;
  }
  if (target) for (key in source) {
    sourceProperty = source[key];
    if (options.dontCallGetSet) {
      descriptor = getOwnPropertyDescriptor$2(target, key);
      targetProperty = descriptor && descriptor.value;
    } else targetProperty = target[key];
    FORCED = isForced$2(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
    // contained in target
    if (!FORCED && targetProperty !== undefined) {
      if (typeof sourceProperty == typeof targetProperty) continue;
      copyConstructorProperties(sourceProperty, targetProperty);
    }
    // add a flag to not completely full polyfills
    if (options.sham || (targetProperty && targetProperty.sham)) {
      createNonEnumerableProperty$2(sourceProperty, 'sham', true);
    }
    defineBuiltIn$6(target, key, sourceProperty, options);
  }
};

var fails$l = fails$u;

var correctPrototypeGetter = !fails$l(function () {
  function F() { /* empty */ }
  F.prototype.constructor = null;
  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
  return Object.getPrototypeOf(new F()) !== F.prototype;
});

var hasOwn$3 = hasOwnProperty_1;
var isCallable$7 = isCallable$i;
var toObject$g = toObject$i;
var sharedKey = sharedKey$3;
var CORRECT_PROTOTYPE_GETTER = correctPrototypeGetter;

var IE_PROTO = sharedKey('IE_PROTO');
var $Object$1 = Object;
var ObjectPrototype = $Object$1.prototype;

// `Object.getPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.getprototypeof
// eslint-disable-next-line es/no-object-getprototypeof -- safe
var objectGetPrototypeOf = CORRECT_PROTOTYPE_GETTER ? $Object$1.getPrototypeOf : function (O) {
  var object = toObject$g(O);
  if (hasOwn$3(object, IE_PROTO)) return object[IE_PROTO];
  var constructor = object.constructor;
  if (isCallable$7(constructor) && object instanceof constructor) {
    return constructor.prototype;
  } return object instanceof $Object$1 ? ObjectPrototype : null;
};

var fails$k = fails$u;
var isCallable$6 = isCallable$i;
var isObject$8 = isObject$e;
var getPrototypeOf$1 = objectGetPrototypeOf;
var defineBuiltIn$5 = defineBuiltIn$7;
var wellKnownSymbol$d = wellKnownSymbol$g;

var ITERATOR$7 = wellKnownSymbol$d('iterator');
var BUGGY_SAFARI_ITERATORS$1 = false;

// `%IteratorPrototype%` object
// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
var IteratorPrototype$2, PrototypeOfArrayIteratorPrototype, arrayIterator;

/* eslint-disable es/no-array-prototype-keys -- safe */
if ([].keys) {
  arrayIterator = [].keys();
  // Safari 8 has buggy iterators w/o `next`
  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS$1 = true;
  else {
    PrototypeOfArrayIteratorPrototype = getPrototypeOf$1(getPrototypeOf$1(arrayIterator));
    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype$2 = PrototypeOfArrayIteratorPrototype;
  }
}

var NEW_ITERATOR_PROTOTYPE = !isObject$8(IteratorPrototype$2) || fails$k(function () {
  var test = {};
  // FF44- legacy iterators case
  return IteratorPrototype$2[ITERATOR$7].call(test) !== test;
});

if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype$2 = {};

// `%IteratorPrototype%[@@iterator]()` method
// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
if (!isCallable$6(IteratorPrototype$2[ITERATOR$7])) {
  defineBuiltIn$5(IteratorPrototype$2, ITERATOR$7, function () {
    return this;
  });
}

var iteratorsCore = {
  IteratorPrototype: IteratorPrototype$2,
  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS$1
};

var defineProperty$4 = objectDefineProperty.f;
var hasOwn$2 = hasOwnProperty_1;
var wellKnownSymbol$c = wellKnownSymbol$g;

var TO_STRING_TAG$3 = wellKnownSymbol$c('toStringTag');

var setToStringTag$4 = function (target, TAG, STATIC) {
  if (target && !STATIC) target = target.prototype;
  if (target && !hasOwn$2(target, TO_STRING_TAG$3)) {
    defineProperty$4(target, TO_STRING_TAG$3, { configurable: true, value: TAG });
  }
};

var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;
var create$1 = objectCreate$1;
var createPropertyDescriptor$1 = createPropertyDescriptor$4;
var setToStringTag$3 = setToStringTag$4;
var Iterators$4 = iterators;

var returnThis$1 = function () { return this; };

var iteratorCreateConstructor = function (IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
  var TO_STRING_TAG = NAME + ' Iterator';
  IteratorConstructor.prototype = create$1(IteratorPrototype$1, { next: createPropertyDescriptor$1(+!ENUMERABLE_NEXT, next) });
  setToStringTag$3(IteratorConstructor, TO_STRING_TAG, false);
  Iterators$4[TO_STRING_TAG] = returnThis$1;
  return IteratorConstructor;
};

var isCallable$5 = isCallable$i;

var $String$3 = String;
var $TypeError$7 = TypeError;

var aPossiblePrototype$1 = function (argument) {
  if (typeof argument == 'object' || isCallable$5(argument)) return argument;
  throw $TypeError$7("Can't set " + $String$3(argument) + ' as a prototype');
};

/* eslint-disable no-proto -- safe */

var uncurryThis$m = functionUncurryThis;
var anObject$4 = anObject$9;
var aPossiblePrototype = aPossiblePrototype$1;

// `Object.setPrototypeOf` method
// https://tc39.es/ecma262/#sec-object.setprototypeof
// Works with __proto__ only. Old v8 can't work with null proto objects.
// eslint-disable-next-line es/no-object-setprototypeof -- safe
var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
  var CORRECT_SETTER = false;
  var test = {};
  var setter;
  try {
    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
    setter = uncurryThis$m(Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set);
    setter(test, []);
    CORRECT_SETTER = test instanceof Array;
  } catch (error) { /* empty */ }
  return function setPrototypeOf(O, proto) {
    anObject$4(O);
    aPossiblePrototype(proto);
    if (CORRECT_SETTER) setter(O, proto);
    else O.__proto__ = proto;
    return O;
  };
}() : undefined);

var $$15 = _export;
var call$5 = functionCall;
var FunctionName = functionName;
var isCallable$4 = isCallable$i;
var createIteratorConstructor = iteratorCreateConstructor;
var getPrototypeOf = objectGetPrototypeOf;
var setPrototypeOf$1 = objectSetPrototypeOf;
var setToStringTag$2 = setToStringTag$4;
var createNonEnumerableProperty$1 = createNonEnumerableProperty$4;
var defineBuiltIn$4 = defineBuiltIn$7;
var wellKnownSymbol$b = wellKnownSymbol$g;
var Iterators$3 = iterators;
var IteratorsCore = iteratorsCore;

var PROPER_FUNCTION_NAME = FunctionName.PROPER;
var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
var IteratorPrototype = IteratorsCore.IteratorPrototype;
var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
var ITERATOR$6 = wellKnownSymbol$b('iterator');
var KEYS = 'keys';
var VALUES = 'values';
var ENTRIES = 'entries';

var returnThis = function () { return this; };

var iteratorDefine = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
  createIteratorConstructor(IteratorConstructor, NAME, next);

  var getIterationMethod = function (KIND) {
    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
    if (!BUGGY_SAFARI_ITERATORS && KIND in IterablePrototype) return IterablePrototype[KIND];
    switch (KIND) {
      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
    } return function () { return new IteratorConstructor(this); };
  };

  var TO_STRING_TAG = NAME + ' Iterator';
  var INCORRECT_VALUES_NAME = false;
  var IterablePrototype = Iterable.prototype;
  var nativeIterator = IterablePrototype[ITERATOR$6]
    || IterablePrototype['@@iterator']
    || DEFAULT && IterablePrototype[DEFAULT];
  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
  var CurrentIteratorPrototype, methods, KEY;

  // fix native
  if (anyNativeIterator) {
    CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
    if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
      if (getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
        if (setPrototypeOf$1) {
          setPrototypeOf$1(CurrentIteratorPrototype, IteratorPrototype);
        } else if (!isCallable$4(CurrentIteratorPrototype[ITERATOR$6])) {
          defineBuiltIn$4(CurrentIteratorPrototype, ITERATOR$6, returnThis);
        }
      }
      // Set @@toStringTag to native iterators
      setToStringTag$2(CurrentIteratorPrototype, TO_STRING_TAG, true);
    }
  }

  // fix Array.prototype.{ values, @@iterator }.name in V8 / FF
  if (PROPER_FUNCTION_NAME && DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
    if (CONFIGURABLE_FUNCTION_NAME) {
      createNonEnumerableProperty$1(IterablePrototype, 'name', VALUES);
    } else {
      INCORRECT_VALUES_NAME = true;
      defaultIterator = function values() { return call$5(nativeIterator, this); };
    }
  }

  // export additional methods
  if (DEFAULT) {
    methods = {
      values: getIterationMethod(VALUES),
      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
      entries: getIterationMethod(ENTRIES)
    };
    if (FORCED) for (KEY in methods) {
      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
        defineBuiltIn$4(IterablePrototype, KEY, methods[KEY]);
      }
    } else $$15({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
  }

  // define iterator
  if (IterablePrototype[ITERATOR$6] !== defaultIterator) {
    defineBuiltIn$4(IterablePrototype, ITERATOR$6, defaultIterator, { name: DEFAULT });
  }
  Iterators$3[NAME] = defaultIterator;

  return methods;
};

// `CreateIterResultObject` abstract operation
// https://tc39.es/ecma262/#sec-createiterresultobject
var createIterResultObject$3 = function (value, done) {
  return { value: value, done: done };
};

var toIndexedObject$8 = toIndexedObject$d;
var addToUnscopables$h = addToUnscopables$i;
var Iterators$2 = iterators;
var InternalStateModule$2 = internalState;
var defineProperty$3 = objectDefineProperty.f;
var defineIterator$2 = iteratorDefine;
var createIterResultObject$2 = createIterResultObject$3;
var DESCRIPTORS$4 = descriptors;

var ARRAY_ITERATOR = 'Array Iterator';
var setInternalState$2 = InternalStateModule$2.set;
var getInternalState$1 = InternalStateModule$2.getterFor(ARRAY_ITERATOR);

// `Array.prototype.entries` method
// https://tc39.es/ecma262/#sec-array.prototype.entries
// `Array.prototype.keys` method
// https://tc39.es/ecma262/#sec-array.prototype.keys
// `Array.prototype.values` method
// https://tc39.es/ecma262/#sec-array.prototype.values
// `Array.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-array.prototype-@@iterator
// `CreateArrayIterator` internal method
// https://tc39.es/ecma262/#sec-createarrayiterator
var es_array_iterator = defineIterator$2(Array, 'Array', function (iterated, kind) {
  setInternalState$2(this, {
    type: ARRAY_ITERATOR,
    target: toIndexedObject$8(iterated), // target
    index: 0,                          // next index
    kind: kind                         // kind
  });
// `%ArrayIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
}, function () {
  var state = getInternalState$1(this);
  var target = state.target;
  var kind = state.kind;
  var index = state.index++;
  if (!target || index >= target.length) {
    state.target = undefined;
    return createIterResultObject$2(undefined, true);
  }
  if (kind == 'keys') return createIterResultObject$2(index, false);
  if (kind == 'values') return createIterResultObject$2(target[index], false);
  return createIterResultObject$2([index, target[index]], false);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values%
// https://tc39.es/ecma262/#sec-createunmappedargumentsobject
// https://tc39.es/ecma262/#sec-createmappedargumentsobject
var values = Iterators$2.Arguments = Iterators$2.Array;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$h('keys');
addToUnscopables$h('values');
addToUnscopables$h('entries');

// V8 ~ Chrome 45- bug
if (DESCRIPTORS$4 && values.name !== 'values') try {
  defineProperty$3(values, 'name', { value: 'values' });
} catch (error) { /* empty */ }

var internalMetadata = {exports: {}};

var objectGetOwnPropertyNamesExternal = {};

var toPropertyKey$1 = toPropertyKey$4;
var definePropertyModule$1 = objectDefineProperty;
var createPropertyDescriptor = createPropertyDescriptor$4;

var createProperty$6 = function (object, key, value) {
  var propertyKey = toPropertyKey$1(key);
  if (propertyKey in object) definePropertyModule$1.f(object, propertyKey, createPropertyDescriptor(0, value));
  else object[propertyKey] = value;
};

var toAbsoluteIndex$5 = toAbsoluteIndex$7;
var lengthOfArrayLike$o = lengthOfArrayLike$q;
var createProperty$5 = createProperty$6;

var $Array$9 = Array;
var max$3 = Math.max;

var arraySliceSimple = function (O, start, end) {
  var length = lengthOfArrayLike$o(O);
  var k = toAbsoluteIndex$5(start, length);
  var fin = toAbsoluteIndex$5(end === undefined ? length : end, length);
  var result = $Array$9(max$3(fin - k, 0));
  for (var n = 0; k < fin; k++, n++) createProperty$5(result, n, O[k]);
  result.length = n;
  return result;
};

/* eslint-disable es/no-object-getownpropertynames -- safe */

var classof$8 = classofRaw$1;
var toIndexedObject$7 = toIndexedObject$d;
var $getOwnPropertyNames = objectGetOwnPropertyNames.f;
var arraySlice$3 = arraySliceSimple;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function (it) {
  try {
    return $getOwnPropertyNames(it);
  } catch (error) {
    return arraySlice$3(windowNames);
  }
};

// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
objectGetOwnPropertyNamesExternal.f = function getOwnPropertyNames(it) {
  return windowNames && classof$8(it) == 'Window'
    ? getWindowNames(it)
    : $getOwnPropertyNames(toIndexedObject$7(it));
};

// FF26- bug: ArrayBuffers are non-extensible, but Object.isExtensible does not report it
var fails$j = fails$u;

var arrayBufferNonExtensible = fails$j(function () {
  if (typeof ArrayBuffer == 'function') {
    var buffer = new ArrayBuffer(8);
    // eslint-disable-next-line es/no-object-isextensible, es/no-object-defineproperty -- safe
    if (Object.isExtensible(buffer)) Object.defineProperty(buffer, 'a', { value: 8 });
  }
});

var fails$i = fails$u;
var isObject$7 = isObject$e;
var classof$7 = classofRaw$1;
var ARRAY_BUFFER_NON_EXTENSIBLE = arrayBufferNonExtensible;

// eslint-disable-next-line es/no-object-isextensible -- safe
var $isExtensible = Object.isExtensible;
var FAILS_ON_PRIMITIVES = fails$i(function () { $isExtensible(1); });

// `Object.isExtensible` method
// https://tc39.es/ecma262/#sec-object.isextensible
var objectIsExtensible = (FAILS_ON_PRIMITIVES || ARRAY_BUFFER_NON_EXTENSIBLE) ? function isExtensible(it) {
  if (!isObject$7(it)) return false;
  if (ARRAY_BUFFER_NON_EXTENSIBLE && classof$7(it) == 'ArrayBuffer') return false;
  return $isExtensible ? $isExtensible(it) : true;
} : $isExtensible;

var fails$h = fails$u;

var freezing = !fails$h(function () {
  // eslint-disable-next-line es/no-object-isextensible, es/no-object-preventextensions -- required for testing
  return Object.isExtensible(Object.preventExtensions({}));
});

var $$14 = _export;
var uncurryThis$l = functionUncurryThis;
var hiddenKeys = hiddenKeys$5;
var isObject$6 = isObject$e;
var hasOwn$1 = hasOwnProperty_1;
var defineProperty$2 = objectDefineProperty.f;
var getOwnPropertyNamesModule = objectGetOwnPropertyNames;
var getOwnPropertyNamesExternalModule = objectGetOwnPropertyNamesExternal;
var isExtensible = objectIsExtensible;
var uid = uid$3;
var FREEZING = freezing;

var REQUIRED = false;
var METADATA = uid('meta');
var id = 0;

var setMetadata = function (it) {
  defineProperty$2(it, METADATA, { value: {
    objectID: 'O' + id++, // object ID
    weakData: {}          // weak collections IDs
  } });
};

var fastKey$1 = function (it, create) {
  // return a primitive with prefix
  if (!isObject$6(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!hasOwn$1(it, METADATA)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMetadata(it);
  // return object ID
  } return it[METADATA].objectID;
};

var getWeakData = function (it, create) {
  if (!hasOwn$1(it, METADATA)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMetadata(it);
  // return the store of weak collections IDs
  } return it[METADATA].weakData;
};

// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZING && REQUIRED && isExtensible(it) && !hasOwn$1(it, METADATA)) setMetadata(it);
  return it;
};

var enable = function () {
  meta.enable = function () { /* empty */ };
  REQUIRED = true;
  var getOwnPropertyNames = getOwnPropertyNamesModule.f;
  var splice = uncurryThis$l([].splice);
  var test = {};
  test[METADATA] = 1;

  // prevent exposing of metadata key
  if (getOwnPropertyNames(test).length) {
    getOwnPropertyNamesModule.f = function (it) {
      var result = getOwnPropertyNames(it);
      for (var i = 0, length = result.length; i < length; i++) {
        if (result[i] === METADATA) {
          splice(result, i, 1);
          break;
        }
      } return result;
    };

    $$14({ target: 'Object', stat: true, forced: true }, {
      getOwnPropertyNames: getOwnPropertyNamesExternalModule.f
    });
  }
};

var meta = internalMetadata.exports = {
  enable: enable,
  fastKey: fastKey$1,
  getWeakData: getWeakData,
  onFreeze: onFreeze
};

hiddenKeys[METADATA] = true;

var uncurryThis$k = functionUncurryThis;
var aCallable$5 = aCallable$7;
var NATIVE_BIND$1 = functionBindNative;

var bind$8 = uncurryThis$k(uncurryThis$k.bind);

// optional / simple context binding
var functionBindContext = function (fn, that) {
  aCallable$5(fn);
  return that === undefined ? fn : NATIVE_BIND$1 ? bind$8(fn, that) : function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

var wellKnownSymbol$a = wellKnownSymbol$g;
var Iterators$1 = iterators;

var ITERATOR$5 = wellKnownSymbol$a('iterator');
var ArrayPrototype = Array.prototype;

// check on default Array iterator
var isArrayIteratorMethod$2 = function (it) {
  return it !== undefined && (Iterators$1.Array === it || ArrayPrototype[ITERATOR$5] === it);
};

var wellKnownSymbol$9 = wellKnownSymbol$g;

var TO_STRING_TAG$2 = wellKnownSymbol$9('toStringTag');
var test$2 = {};

test$2[TO_STRING_TAG$2] = 'z';

var toStringTagSupport = String(test$2) === '[object z]';

var TO_STRING_TAG_SUPPORT$2 = toStringTagSupport;
var isCallable$3 = isCallable$i;
var classofRaw = classofRaw$1;
var wellKnownSymbol$8 = wellKnownSymbol$g;

var TO_STRING_TAG$1 = wellKnownSymbol$8('toStringTag');
var $Object = Object;

// ES3 wrong here
var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (error) { /* empty */ }
};

// getting tag from ES6+ `Object.prototype.toString`
var classof$6 = TO_STRING_TAG_SUPPORT$2 ? classofRaw : function (it) {
  var O, tag, result;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (tag = tryGet(O = $Object(it), TO_STRING_TAG$1)) == 'string' ? tag
    // builtinTag case
    : CORRECT_ARGUMENTS ? classofRaw(O)
    // ES3 arguments fallback
    : (result = classofRaw(O)) == 'Object' && isCallable$3(O.callee) ? 'Arguments' : result;
};

var classof$5 = classof$6;
var getMethod$1 = getMethod$3;
var isNullOrUndefined$2 = isNullOrUndefined$5;
var Iterators = iterators;
var wellKnownSymbol$7 = wellKnownSymbol$g;

var ITERATOR$4 = wellKnownSymbol$7('iterator');

var getIteratorMethod$3 = function (it) {
  if (!isNullOrUndefined$2(it)) return getMethod$1(it, ITERATOR$4)
    || getMethod$1(it, '@@iterator')
    || Iterators[classof$5(it)];
};

var call$4 = functionCall;
var aCallable$4 = aCallable$7;
var anObject$3 = anObject$9;
var tryToString$2 = tryToString$4;
var getIteratorMethod$2 = getIteratorMethod$3;

var $TypeError$6 = TypeError;

var getIterator$2 = function (argument, usingIterator) {
  var iteratorMethod = arguments.length < 2 ? getIteratorMethod$2(argument) : usingIterator;
  if (aCallable$4(iteratorMethod)) return anObject$3(call$4(iteratorMethod, argument));
  throw $TypeError$6(tryToString$2(argument) + ' is not iterable');
};

var call$3 = functionCall;
var anObject$2 = anObject$9;
var getMethod = getMethod$3;

var iteratorClose$2 = function (iterator, kind, value) {
  var innerResult, innerError;
  anObject$2(iterator);
  try {
    innerResult = getMethod(iterator, 'return');
    if (!innerResult) {
      if (kind === 'throw') throw value;
      return value;
    }
    innerResult = call$3(innerResult, iterator);
  } catch (error) {
    innerError = true;
    innerResult = error;
  }
  if (kind === 'throw') throw value;
  if (innerError) throw innerResult;
  anObject$2(innerResult);
  return value;
};

var bind$7 = functionBindContext;
var call$2 = functionCall;
var anObject$1 = anObject$9;
var tryToString$1 = tryToString$4;
var isArrayIteratorMethod$1 = isArrayIteratorMethod$2;
var lengthOfArrayLike$n = lengthOfArrayLike$q;
var isPrototypeOf$2 = objectIsPrototypeOf;
var getIterator$1 = getIterator$2;
var getIteratorMethod$1 = getIteratorMethod$3;
var iteratorClose$1 = iteratorClose$2;

var $TypeError$5 = TypeError;

var Result = function (stopped, result) {
  this.stopped = stopped;
  this.result = result;
};

var ResultPrototype = Result.prototype;

var iterate$2 = function (iterable, unboundFunction, options) {
  var that = options && options.that;
  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
  var IS_RECORD = !!(options && options.IS_RECORD);
  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
  var INTERRUPTED = !!(options && options.INTERRUPTED);
  var fn = bind$7(unboundFunction, that);
  var iterator, iterFn, index, length, result, next, step;

  var stop = function (condition) {
    if (iterator) iteratorClose$1(iterator, 'normal', condition);
    return new Result(true, condition);
  };

  var callFn = function (value) {
    if (AS_ENTRIES) {
      anObject$1(value);
      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
    } return INTERRUPTED ? fn(value, stop) : fn(value);
  };

  if (IS_RECORD) {
    iterator = iterable.iterator;
  } else if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod$1(iterable);
    if (!iterFn) throw $TypeError$5(tryToString$1(iterable) + ' is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod$1(iterFn)) {
      for (index = 0, length = lengthOfArrayLike$n(iterable); length > index; index++) {
        result = callFn(iterable[index]);
        if (result && isPrototypeOf$2(ResultPrototype, result)) return result;
      } return new Result(false);
    }
    iterator = getIterator$1(iterable, iterFn);
  }

  next = IS_RECORD ? iterable.next : iterator.next;
  while (!(step = call$2(next, iterator)).done) {
    try {
      result = callFn(step.value);
    } catch (error) {
      iteratorClose$1(iterator, 'throw', error);
    }
    if (typeof result == 'object' && result && isPrototypeOf$2(ResultPrototype, result)) return result;
  } return new Result(false);
};

var isPrototypeOf$1 = objectIsPrototypeOf;

var $TypeError$4 = TypeError;

var anInstance$2 = function (it, Prototype) {
  if (isPrototypeOf$1(Prototype, it)) return it;
  throw $TypeError$4('Incorrect invocation');
};

var wellKnownSymbol$6 = wellKnownSymbol$g;

var ITERATOR$3 = wellKnownSymbol$6('iterator');
var SAFE_CLOSING = false;

try {
  var called = 0;
  var iteratorWithReturn = {
    next: function () {
      return { done: !!called++ };
    },
    'return': function () {
      SAFE_CLOSING = true;
    }
  };
  iteratorWithReturn[ITERATOR$3] = function () {
    return this;
  };
  // eslint-disable-next-line es/no-array-from, no-throw-literal -- required for testing
  Array.from(iteratorWithReturn, function () { throw 2; });
} catch (error) { /* empty */ }

var checkCorrectnessOfIteration$2 = function (exec, SKIP_CLOSING) {
  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
  var ITERATION_SUPPORT = false;
  try {
    var object = {};
    object[ITERATOR$3] = function () {
      return {
        next: function () {
          return { done: ITERATION_SUPPORT = true };
        }
      };
    };
    exec(object);
  } catch (error) { /* empty */ }
  return ITERATION_SUPPORT;
};

var isCallable$2 = isCallable$i;
var isObject$5 = isObject$e;
var setPrototypeOf = objectSetPrototypeOf;

// makes subclassing work correct for wrapped built-ins
var inheritIfRequired$2 = function ($this, dummy, Wrapper) {
  var NewTarget, NewTargetPrototype;
  if (
    // it can work only with native `setPrototypeOf`
    setPrototypeOf &&
    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
    isCallable$2(NewTarget = dummy.constructor) &&
    NewTarget !== Wrapper &&
    isObject$5(NewTargetPrototype = NewTarget.prototype) &&
    NewTargetPrototype !== Wrapper.prototype
  ) setPrototypeOf($this, NewTargetPrototype);
  return $this;
};

var $$13 = _export;
var global$9 = global$j;
var uncurryThis$j = functionUncurryThis;
var isForced$1 = isForced_1;
var defineBuiltIn$3 = defineBuiltIn$7;
var InternalMetadataModule = internalMetadata.exports;
var iterate$1 = iterate$2;
var anInstance$1 = anInstance$2;
var isCallable$1 = isCallable$i;
var isNullOrUndefined$1 = isNullOrUndefined$5;
var isObject$4 = isObject$e;
var fails$g = fails$u;
var checkCorrectnessOfIteration$1 = checkCorrectnessOfIteration$2;
var setToStringTag$1 = setToStringTag$4;
var inheritIfRequired$1 = inheritIfRequired$2;

var collection$1 = function (CONSTRUCTOR_NAME, wrapper, common) {
  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
  var ADDER = IS_MAP ? 'set' : 'add';
  var NativeConstructor = global$9[CONSTRUCTOR_NAME];
  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
  var Constructor = NativeConstructor;
  var exported = {};

  var fixMethod = function (KEY) {
    var uncurriedNativeMethod = uncurryThis$j(NativePrototype[KEY]);
    defineBuiltIn$3(NativePrototype, KEY,
      KEY == 'add' ? function add(value) {
        uncurriedNativeMethod(this, value === 0 ? 0 : value);
        return this;
      } : KEY == 'delete' ? function (key) {
        return IS_WEAK && !isObject$4(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
      } : KEY == 'get' ? function get(key) {
        return IS_WEAK && !isObject$4(key) ? undefined : uncurriedNativeMethod(this, key === 0 ? 0 : key);
      } : KEY == 'has' ? function has(key) {
        return IS_WEAK && !isObject$4(key) ? false : uncurriedNativeMethod(this, key === 0 ? 0 : key);
      } : function set(key, value) {
        uncurriedNativeMethod(this, key === 0 ? 0 : key, value);
        return this;
      }
    );
  };

  var REPLACE = isForced$1(
    CONSTRUCTOR_NAME,
    !isCallable$1(NativeConstructor) || !(IS_WEAK || NativePrototype.forEach && !fails$g(function () {
      new NativeConstructor().entries().next();
    }))
  );

  if (REPLACE) {
    // create collection constructor
    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
    InternalMetadataModule.enable();
  } else if (isForced$1(CONSTRUCTOR_NAME, true)) {
    var instance = new Constructor();
    // early implementations not supports chaining
    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
    // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
    var THROWS_ON_PRIMITIVES = fails$g(function () { instance.has(1); });
    // most early implementations doesn't supports iterables, most modern - not close it correctly
    // eslint-disable-next-line no-new -- required for testing
    var ACCEPT_ITERABLES = checkCorrectnessOfIteration$1(function (iterable) { new NativeConstructor(iterable); });
    // for early implementations -0 and +0 not the same
    var BUGGY_ZERO = !IS_WEAK && fails$g(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new NativeConstructor();
      var index = 5;
      while (index--) $instance[ADDER](index, index);
      return !$instance.has(-0);
    });

    if (!ACCEPT_ITERABLES) {
      Constructor = wrapper(function (dummy, iterable) {
        anInstance$1(dummy, NativePrototype);
        var that = inheritIfRequired$1(new NativeConstructor(), dummy, Constructor);
        if (!isNullOrUndefined$1(iterable)) iterate$1(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
        return that;
      });
      Constructor.prototype = NativePrototype;
      NativePrototype.constructor = Constructor;
    }

    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }

    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);

    // weak collections should not contains .clear method
    if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
  }

  exported[CONSTRUCTOR_NAME] = Constructor;
  $$13({ global: true, constructor: true, forced: Constructor != NativeConstructor }, exported);

  setToStringTag$1(Constructor, CONSTRUCTOR_NAME);

  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

  return Constructor;
};

var defineBuiltIn$2 = defineBuiltIn$7;

var defineBuiltIns$1 = function (target, src, options) {
  for (var key in src) defineBuiltIn$2(target, key, src[key], options);
  return target;
};

var getBuiltIn$2 = getBuiltIn$7;
var definePropertyModule = objectDefineProperty;
var wellKnownSymbol$5 = wellKnownSymbol$g;
var DESCRIPTORS$3 = descriptors;

var SPECIES$3 = wellKnownSymbol$5('species');

var setSpecies$2 = function (CONSTRUCTOR_NAME) {
  var Constructor = getBuiltIn$2(CONSTRUCTOR_NAME);
  var defineProperty = definePropertyModule.f;

  if (DESCRIPTORS$3 && Constructor && !Constructor[SPECIES$3]) {
    defineProperty(Constructor, SPECIES$3, {
      configurable: true,
      get: function () { return this; }
    });
  }
};

var defineProperty$1 = objectDefineProperty.f;
var create = objectCreate$1;
var defineBuiltIns = defineBuiltIns$1;
var bind$6 = functionBindContext;
var anInstance = anInstance$2;
var isNullOrUndefined = isNullOrUndefined$5;
var iterate = iterate$2;
var defineIterator$1 = iteratorDefine;
var createIterResultObject$1 = createIterResultObject$3;
var setSpecies$1 = setSpecies$2;
var DESCRIPTORS$2 = descriptors;
var fastKey = internalMetadata.exports.fastKey;
var InternalStateModule$1 = internalState;

var setInternalState$1 = InternalStateModule$1.set;
var internalStateGetterFor = InternalStateModule$1.getterFor;

var collectionStrong$1 = {
  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
    var Constructor = wrapper(function (that, iterable) {
      anInstance(that, Prototype);
      setInternalState$1(that, {
        type: CONSTRUCTOR_NAME,
        index: create(null),
        first: undefined,
        last: undefined,
        size: 0
      });
      if (!DESCRIPTORS$2) that.size = 0;
      if (!isNullOrUndefined(iterable)) iterate(iterable, that[ADDER], { that: that, AS_ENTRIES: IS_MAP });
    });

    var Prototype = Constructor.prototype;

    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

    var define = function (that, key, value) {
      var state = getInternalState(that);
      var entry = getEntry(that, key);
      var previous, index;
      // change existing entry
      if (entry) {
        entry.value = value;
      // create new entry
      } else {
        state.last = entry = {
          index: index = fastKey(key, true),
          key: key,
          value: value,
          previous: previous = state.last,
          next: undefined,
          removed: false
        };
        if (!state.first) state.first = entry;
        if (previous) previous.next = entry;
        if (DESCRIPTORS$2) state.size++;
        else that.size++;
        // add to index
        if (index !== 'F') state.index[index] = entry;
      } return that;
    };

    var getEntry = function (that, key) {
      var state = getInternalState(that);
      // fast case
      var index = fastKey(key);
      var entry;
      if (index !== 'F') return state.index[index];
      // frozen object case
      for (entry = state.first; entry; entry = entry.next) {
        if (entry.key == key) return entry;
      }
    };

    defineBuiltIns(Prototype, {
      // `{ Map, Set }.prototype.clear()` methods
      // https://tc39.es/ecma262/#sec-map.prototype.clear
      // https://tc39.es/ecma262/#sec-set.prototype.clear
      clear: function clear() {
        var that = this;
        var state = getInternalState(that);
        var data = state.index;
        var entry = state.first;
        while (entry) {
          entry.removed = true;
          if (entry.previous) entry.previous = entry.previous.next = undefined;
          delete data[entry.index];
          entry = entry.next;
        }
        state.first = state.last = undefined;
        if (DESCRIPTORS$2) state.size = 0;
        else that.size = 0;
      },
      // `{ Map, Set }.prototype.delete(key)` methods
      // https://tc39.es/ecma262/#sec-map.prototype.delete
      // https://tc39.es/ecma262/#sec-set.prototype.delete
      'delete': function (key) {
        var that = this;
        var state = getInternalState(that);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.next;
          var prev = entry.previous;
          delete state.index[entry.index];
          entry.removed = true;
          if (prev) prev.next = next;
          if (next) next.previous = prev;
          if (state.first == entry) state.first = next;
          if (state.last == entry) state.last = prev;
          if (DESCRIPTORS$2) state.size--;
          else that.size--;
        } return !!entry;
      },
      // `{ Map, Set }.prototype.forEach(callbackfn, thisArg = undefined)` methods
      // https://tc39.es/ecma262/#sec-map.prototype.foreach
      // https://tc39.es/ecma262/#sec-set.prototype.foreach
      forEach: function forEach(callbackfn /* , that = undefined */) {
        var state = getInternalState(this);
        var boundFunction = bind$6(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
        var entry;
        while (entry = entry ? entry.next : state.first) {
          boundFunction(entry.value, entry.key, this);
          // revert to the last existing entry
          while (entry && entry.removed) entry = entry.previous;
        }
      },
      // `{ Map, Set}.prototype.has(key)` methods
      // https://tc39.es/ecma262/#sec-map.prototype.has
      // https://tc39.es/ecma262/#sec-set.prototype.has
      has: function has(key) {
        return !!getEntry(this, key);
      }
    });

    defineBuiltIns(Prototype, IS_MAP ? {
      // `Map.prototype.get(key)` method
      // https://tc39.es/ecma262/#sec-map.prototype.get
      get: function get(key) {
        var entry = getEntry(this, key);
        return entry && entry.value;
      },
      // `Map.prototype.set(key, value)` method
      // https://tc39.es/ecma262/#sec-map.prototype.set
      set: function set(key, value) {
        return define(this, key === 0 ? 0 : key, value);
      }
    } : {
      // `Set.prototype.add(value)` method
      // https://tc39.es/ecma262/#sec-set.prototype.add
      add: function add(value) {
        return define(this, value = value === 0 ? 0 : value, value);
      }
    });
    if (DESCRIPTORS$2) defineProperty$1(Prototype, 'size', {
      get: function () {
        return getInternalState(this).size;
      }
    });
    return Constructor;
  },
  setStrong: function (Constructor, CONSTRUCTOR_NAME, IS_MAP) {
    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
    var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
    var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME);
    // `{ Map, Set }.prototype.{ keys, values, entries, @@iterator }()` methods
    // https://tc39.es/ecma262/#sec-map.prototype.entries
    // https://tc39.es/ecma262/#sec-map.prototype.keys
    // https://tc39.es/ecma262/#sec-map.prototype.values
    // https://tc39.es/ecma262/#sec-map.prototype-@@iterator
    // https://tc39.es/ecma262/#sec-set.prototype.entries
    // https://tc39.es/ecma262/#sec-set.prototype.keys
    // https://tc39.es/ecma262/#sec-set.prototype.values
    // https://tc39.es/ecma262/#sec-set.prototype-@@iterator
    defineIterator$1(Constructor, CONSTRUCTOR_NAME, function (iterated, kind) {
      setInternalState$1(this, {
        type: ITERATOR_NAME,
        target: iterated,
        state: getInternalCollectionState(iterated),
        kind: kind,
        last: undefined
      });
    }, function () {
      var state = getInternalIteratorState(this);
      var kind = state.kind;
      var entry = state.last;
      // revert to the last existing entry
      while (entry && entry.removed) entry = entry.previous;
      // get next entry
      if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
        // or finish the iteration
        state.target = undefined;
        return createIterResultObject$1(undefined, true);
      }
      // return step by kind
      if (kind == 'keys') return createIterResultObject$1(entry.key, false);
      if (kind == 'values') return createIterResultObject$1(entry.value, false);
      return createIterResultObject$1([entry.key, entry.value], false);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // `{ Map, Set }.prototype[@@species]` accessors
    // https://tc39.es/ecma262/#sec-get-map-@@species
    // https://tc39.es/ecma262/#sec-get-set-@@species
    setSpecies$1(CONSTRUCTOR_NAME);
  }
};

var collection = collection$1;
var collectionStrong = collectionStrong$1;

// `Map` constructor
// https://tc39.es/ecma262/#sec-map-objects
collection('Map', function (init) {
  return function Map() { return init(this, arguments.length ? arguments[0] : undefined); };
}, collectionStrong);

var TO_STRING_TAG_SUPPORT$1 = toStringTagSupport;
var classof$4 = classof$6;

// `Object.prototype.toString` method implementation
// https://tc39.es/ecma262/#sec-object.prototype.tostring
var objectToString = TO_STRING_TAG_SUPPORT$1 ? {}.toString : function toString() {
  return '[object ' + classof$4(this) + ']';
};

var TO_STRING_TAG_SUPPORT = toStringTagSupport;
var defineBuiltIn$1 = defineBuiltIn$7;
var toString$8 = objectToString;

// `Object.prototype.toString` method
// https://tc39.es/ecma262/#sec-object.prototype.tostring
if (!TO_STRING_TAG_SUPPORT) {
  defineBuiltIn$1(Object.prototype, 'toString', toString$8, { unsafe: true });
}

var classof$3 = classof$6;

var $String$2 = String;

var toString$7 = function (argument) {
  if (classof$3(argument) === 'Symbol') throw TypeError('Cannot convert a Symbol value to a string');
  return $String$2(argument);
};

var uncurryThis$i = functionUncurryThis;
var toIntegerOrInfinity$9 = toIntegerOrInfinity$c;
var toString$6 = toString$7;
var requireObjectCoercible$2 = requireObjectCoercible$5;

var charAt$2 = uncurryThis$i(''.charAt);
var charCodeAt$1 = uncurryThis$i(''.charCodeAt);
var stringSlice$2 = uncurryThis$i(''.slice);

var createMethod$4 = function (CONVERT_TO_STRING) {
  return function ($this, pos) {
    var S = toString$6(requireObjectCoercible$2($this));
    var position = toIntegerOrInfinity$9(pos);
    var size = S.length;
    var first, second;
    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
    first = charCodeAt$1(S, position);
    return first < 0xD800 || first > 0xDBFF || position + 1 === size
      || (second = charCodeAt$1(S, position + 1)) < 0xDC00 || second > 0xDFFF
        ? CONVERT_TO_STRING
          ? charAt$2(S, position)
          : first
        : CONVERT_TO_STRING
          ? stringSlice$2(S, position, position + 2)
          : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
  };
};

var stringMultibyte = {
  // `String.prototype.codePointAt` method
  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
  codeAt: createMethod$4(false),
  // `String.prototype.at` method
  // https://github.com/mathiasbynens/String.prototype.at
  charAt: createMethod$4(true)
};

var charAt$1 = stringMultibyte.charAt;
var toString$5 = toString$7;
var InternalStateModule = internalState;
var defineIterator = iteratorDefine;
var createIterResultObject = createIterResultObject$3;

var STRING_ITERATOR = 'String Iterator';
var setInternalState = InternalStateModule.set;
var getInternalState = InternalStateModule.getterFor(STRING_ITERATOR);

// `String.prototype[@@iterator]` method
// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
defineIterator(String, 'String', function (iterated) {
  setInternalState(this, {
    type: STRING_ITERATOR,
    string: toString$5(iterated),
    index: 0
  });
// `%StringIteratorPrototype%.next` method
// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
}, function next() {
  var state = getInternalState(this);
  var string = state.string;
  var index = state.index;
  var point;
  if (index >= string.length) return createIterResultObject(undefined, true);
  point = charAt$1(string, index);
  state.index += point.length;
  return createIterResultObject(point, false);
});

var global$8 = global$j;

var path$4 = global$8;

var path$3 = path$4;

path$3.Map;

// iterable DOM collections
// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
var domIterables = {
  CSSRuleList: 0,
  CSSStyleDeclaration: 0,
  CSSValueList: 0,
  ClientRectList: 0,
  DOMRectList: 0,
  DOMStringList: 0,
  DOMTokenList: 1,
  DataTransferItemList: 0,
  FileList: 0,
  HTMLAllCollection: 0,
  HTMLCollection: 0,
  HTMLFormElement: 0,
  HTMLSelectElement: 0,
  MediaList: 0,
  MimeTypeArray: 0,
  NamedNodeMap: 0,
  NodeList: 1,
  PaintRequestList: 0,
  Plugin: 0,
  PluginArray: 0,
  SVGLengthList: 0,
  SVGNumberList: 0,
  SVGPathSegList: 0,
  SVGPointList: 0,
  SVGStringList: 0,
  SVGTransformList: 0,
  SourceBufferList: 0,
  StyleSheetList: 0,
  TextTrackCueList: 0,
  TextTrackList: 0,
  TouchList: 0
};

// in old WebKit versions, `element.classList` is not an instance of global `DOMTokenList`
var documentCreateElement = documentCreateElement$2;

var classList = documentCreateElement('span').classList;
var DOMTokenListPrototype$1 = classList && classList.constructor && classList.constructor.prototype;

var domTokenListPrototype = DOMTokenListPrototype$1 === Object.prototype ? undefined : DOMTokenListPrototype$1;

var global$7 = global$j;
var DOMIterables = domIterables;
var DOMTokenListPrototype = domTokenListPrototype;
var ArrayIteratorMethods = es_array_iterator;
var createNonEnumerableProperty = createNonEnumerableProperty$4;
var wellKnownSymbol$4 = wellKnownSymbol$g;

var ITERATOR$2 = wellKnownSymbol$4('iterator');
var TO_STRING_TAG = wellKnownSymbol$4('toStringTag');
var ArrayValues = ArrayIteratorMethods.values;

var handlePrototype = function (CollectionPrototype, COLLECTION_NAME) {
  if (CollectionPrototype) {
    // some Chrome versions have non-configurable methods on DOMTokenList
    if (CollectionPrototype[ITERATOR$2] !== ArrayValues) try {
      createNonEnumerableProperty(CollectionPrototype, ITERATOR$2, ArrayValues);
    } catch (error) {
      CollectionPrototype[ITERATOR$2] = ArrayValues;
    }
    if (!CollectionPrototype[TO_STRING_TAG]) {
      createNonEnumerableProperty(CollectionPrototype, TO_STRING_TAG, COLLECTION_NAME);
    }
    if (DOMIterables[COLLECTION_NAME]) for (var METHOD_NAME in ArrayIteratorMethods) {
      // some Chrome versions have non-configurable methods on DOMTokenList
      if (CollectionPrototype[METHOD_NAME] !== ArrayIteratorMethods[METHOD_NAME]) try {
        createNonEnumerableProperty(CollectionPrototype, METHOD_NAME, ArrayIteratorMethods[METHOD_NAME]);
      } catch (error) {
        CollectionPrototype[METHOD_NAME] = ArrayIteratorMethods[METHOD_NAME];
      }
    }
  }
};

for (var COLLECTION_NAME in DOMIterables) {
  handlePrototype(global$7[COLLECTION_NAME] && global$7[COLLECTION_NAME].prototype, COLLECTION_NAME);
}

handlePrototype(DOMTokenListPrototype, 'DOMTokenList');

var log$7 = Math.log;

// `Math.log1p` method implementation
// https://tc39.es/ecma262/#sec-math.log1p
// eslint-disable-next-line es/no-math-log1p -- safe
var mathLog1p = Math.log1p || function log1p(x) {
  var n = +x;
  return n > -1e-8 && n < 1e-8 ? n - n * n / 2 : log$7(1 + n);
};

var $$12 = _export;
var log1p$1 = mathLog1p;

// eslint-disable-next-line es/no-math-acosh -- required for testing
var $acosh = Math.acosh;
var log$6 = Math.log;
var sqrt$2 = Math.sqrt;
var LN2$1 = Math.LN2;

var FORCED$a = !$acosh
  // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
  || Math.floor($acosh(Number.MAX_VALUE)) != 710
  // Tor Browser bug: Math.acosh(Infinity) -> NaN
  || $acosh(Infinity) != Infinity;

// `Math.acosh` method
// https://tc39.es/ecma262/#sec-math.acosh
$$12({ target: 'Math', stat: true, forced: FORCED$a }, {
  acosh: function acosh(x) {
    var n = +x;
    return n < 1 ? NaN : n > 94906265.62425156
      ? log$6(n) + LN2$1
      : log1p$1(n - 1 + sqrt$2(n - 1) * sqrt$2(n + 1));
  }
});

var $$11 = _export;

// eslint-disable-next-line es/no-math-asinh -- required for testing
var $asinh = Math.asinh;
var log$5 = Math.log;
var sqrt$1 = Math.sqrt;

function asinh(x) {
  var n = +x;
  return !isFinite(n) || n == 0 ? n : n < 0 ? -asinh(-n) : log$5(n + sqrt$1(n * n + 1));
}

// `Math.asinh` method
// https://tc39.es/ecma262/#sec-math.asinh
// Tor Browser bug: Math.asinh(0) -> -0
$$11({ target: 'Math', stat: true, forced: !($asinh && 1 / $asinh(0) > 0) }, {
  asinh: asinh
});

var $$10 = _export;

// eslint-disable-next-line es/no-math-atanh -- required for testing
var $atanh = Math.atanh;
var log$4 = Math.log;

// `Math.atanh` method
// https://tc39.es/ecma262/#sec-math.atanh
// Tor Browser bug: Math.atanh(-0) -> 0
$$10({ target: 'Math', stat: true, forced: !($atanh && 1 / $atanh(-0) < 0) }, {
  atanh: function atanh(x) {
    var n = +x;
    return n == 0 ? n : log$4((1 + n) / (1 - n)) / 2;
  }
});

// `Math.sign` method implementation
// https://tc39.es/ecma262/#sec-math.sign
// eslint-disable-next-line es/no-math-sign -- safe
var mathSign = Math.sign || function sign(x) {
  var n = +x;
  // eslint-disable-next-line no-self-compare -- NaN check
  return n == 0 || n != n ? n : n < 0 ? -1 : 1;
};

var $$$ = _export;
var sign$2 = mathSign;

var abs$6 = Math.abs;
var pow$3 = Math.pow;

// `Math.cbrt` method
// https://tc39.es/ecma262/#sec-math.cbrt
$$$({ target: 'Math', stat: true }, {
  cbrt: function cbrt(x) {
    var n = +x;
    return sign$2(n) * pow$3(abs$6(n), 1 / 3);
  }
});

var $$_ = _export;

var floor$4 = Math.floor;
var log$3 = Math.log;
var LOG2E = Math.LOG2E;

// `Math.clz32` method
// https://tc39.es/ecma262/#sec-math.clz32
$$_({ target: 'Math', stat: true }, {
  clz32: function clz32(x) {
    var n = x >>> 0;
    return n ? 31 - floor$4(log$3(n + 0.5) * LOG2E) : 32;
  }
});

// eslint-disable-next-line es/no-math-expm1 -- safe
var $expm1 = Math.expm1;
var exp$2 = Math.exp;

// `Math.expm1` method implementation
// https://tc39.es/ecma262/#sec-math.expm1
var mathExpm1 = (!$expm1
  // Old FF bug
  || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168
  // Tor Browser bug
  || $expm1(-2e-17) != -2e-17
) ? function expm1(x) {
  var n = +x;
  return n == 0 ? n : n > -1e-6 && n < 1e-6 ? n + n * n / 2 : exp$2(n) - 1;
} : $expm1;

var $$Z = _export;
var expm1$3 = mathExpm1;

// eslint-disable-next-line es/no-math-cosh -- required for testing
var $cosh = Math.cosh;
var abs$5 = Math.abs;
var E$1 = Math.E;

// `Math.cosh` method
// https://tc39.es/ecma262/#sec-math.cosh
$$Z({ target: 'Math', stat: true, forced: !$cosh || $cosh(710) === Infinity }, {
  cosh: function cosh(x) {
    var t = expm1$3(abs$5(x) - 1) + 1;
    return (t + 1 / (t * E$1 * E$1)) * (E$1 / 2);
  }
});

var $$Y = _export;
var expm1$2 = mathExpm1;

// `Math.expm1` method
// https://tc39.es/ecma262/#sec-math.expm1
// eslint-disable-next-line es/no-math-expm1 -- required for testing
$$Y({ target: 'Math', stat: true, forced: expm1$2 != Math.expm1 }, { expm1: expm1$2 });

var sign$1 = mathSign;

var abs$4 = Math.abs;
var pow$2 = Math.pow;
var EPSILON = pow$2(2, -52);
var EPSILON32 = pow$2(2, -23);
var MAX32 = pow$2(2, 127) * (2 - EPSILON32);
var MIN32 = pow$2(2, -126);

var roundTiesToEven = function (n) {
  return n + 1 / EPSILON - 1 / EPSILON;
};

// `Math.fround` method implementation
// https://tc39.es/ecma262/#sec-math.fround
// eslint-disable-next-line es/no-math-fround -- safe
var mathFround = Math.fround || function fround(x) {
  var n = +x;
  var $abs = abs$4(n);
  var $sign = sign$1(n);
  var a, result;
  if ($abs < MIN32) return $sign * roundTiesToEven($abs / MIN32 / EPSILON32) * MIN32 * EPSILON32;
  a = (1 + EPSILON32 / EPSILON) * $abs;
  result = a - (a - $abs);
  // eslint-disable-next-line no-self-compare -- NaN check
  if (result > MAX32 || result != result) return $sign * Infinity;
  return $sign * result;
};

var $$X = _export;
var fround = mathFround;

// `Math.fround` method
// https://tc39.es/ecma262/#sec-math.fround
$$X({ target: 'Math', stat: true }, { fround: fround });

var $$W = _export;

// eslint-disable-next-line es/no-math-hypot -- required for testing
var $hypot = Math.hypot;
var abs$3 = Math.abs;
var sqrt = Math.sqrt;

// Chrome 77 bug
// https://bugs.chromium.org/p/v8/issues/detail?id=9546
var BUGGY = !!$hypot && $hypot(Infinity, NaN) !== Infinity;

// `Math.hypot` method
// https://tc39.es/ecma262/#sec-math.hypot
$$W({ target: 'Math', stat: true, arity: 2, forced: BUGGY }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  hypot: function hypot(value1, value2) {
    var sum = 0;
    var i = 0;
    var aLen = arguments.length;
    var larg = 0;
    var arg, div;
    while (i < aLen) {
      arg = abs$3(arguments[i++]);
      if (larg < arg) {
        div = larg / arg;
        sum = sum * div * div + 1;
        larg = arg;
      } else if (arg > 0) {
        div = arg / larg;
        sum += div * div;
      } else sum += arg;
    }
    return larg === Infinity ? Infinity : larg * sqrt(sum);
  }
});

var $$V = _export;
var fails$f = fails$u;

// eslint-disable-next-line es/no-math-imul -- required for testing
var $imul = Math.imul;

var FORCED$9 = fails$f(function () {
  return $imul(0xFFFFFFFF, 5) != -5 || $imul.length != 2;
});

// `Math.imul` method
// https://tc39.es/ecma262/#sec-math.imul
// some WebKit versions fails with big numbers, some has wrong arity
$$V({ target: 'Math', stat: true, forced: FORCED$9 }, {
  imul: function imul(x, y) {
    var UINT16 = 0xFFFF;
    var xn = +x;
    var yn = +y;
    var xl = UINT16 & xn;
    var yl = UINT16 & yn;
    return 0 | xl * yl + ((UINT16 & xn >>> 16) * yl + xl * (UINT16 & yn >>> 16) << 16 >>> 0);
  }
});

var log$2 = Math.log;
var LOG10E = Math.LOG10E;

// eslint-disable-next-line es/no-math-log10 -- safe
var mathLog10 = Math.log10 || function log10(x) {
  return log$2(x) * LOG10E;
};

var $$U = _export;
var log10$1 = mathLog10;

// `Math.log10` method
// https://tc39.es/ecma262/#sec-math.log10
$$U({ target: 'Math', stat: true }, {
  log10: log10$1
});

var $$T = _export;
var log1p = mathLog1p;

// `Math.log1p` method
// https://tc39.es/ecma262/#sec-math.log1p
$$T({ target: 'Math', stat: true }, { log1p: log1p });

var $$S = _export;

var log$1 = Math.log;
var LN2 = Math.LN2;

// `Math.log2` method
// https://tc39.es/ecma262/#sec-math.log2
$$S({ target: 'Math', stat: true }, {
  log2: function log2(x) {
    return log$1(x) / LN2;
  }
});

var $$R = _export;
var sign = mathSign;

// `Math.sign` method
// https://tc39.es/ecma262/#sec-math.sign
$$R({ target: 'Math', stat: true }, {
  sign: sign
});

var $$Q = _export;
var fails$e = fails$u;
var expm1$1 = mathExpm1;

var abs$2 = Math.abs;
var exp$1 = Math.exp;
var E = Math.E;

var FORCED$8 = fails$e(function () {
  // eslint-disable-next-line es/no-math-sinh -- required for testing
  return Math.sinh(-2e-17) != -2e-17;
});

// `Math.sinh` method
// https://tc39.es/ecma262/#sec-math.sinh
// V8 near Chromium 38 has a problem with very small numbers
$$Q({ target: 'Math', stat: true, forced: FORCED$8 }, {
  sinh: function sinh(x) {
    var n = +x;
    return abs$2(n) < 1 ? (expm1$1(n) - expm1$1(-n)) / 2 : (exp$1(n - 1) - exp$1(-n - 1)) * (E / 2);
  }
});

var $$P = _export;
var expm1 = mathExpm1;

var exp = Math.exp;

// `Math.tanh` method
// https://tc39.es/ecma262/#sec-math.tanh
$$P({ target: 'Math', stat: true }, {
  tanh: function tanh(x) {
    var n = +x;
    var a = expm1(n);
    var b = expm1(-n);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(n) + exp(-n));
  }
});

var setToStringTag = setToStringTag$4;

// Math[@@toStringTag] property
// https://tc39.es/ecma262/#sec-math-@@tostringtag
setToStringTag(Math, 'Math', true);

var $$O = _export;
var trunc = mathTrunc;

// `Math.trunc` method
// https://tc39.es/ecma262/#sec-math.trunc
$$O({ target: 'Math', stat: true }, {
  trunc: trunc
});

var path$2 = path$4;

path$2.Math;

var uncurryThis$h = functionUncurryThis;

// `thisNumberValue` abstract operation
// https://tc39.es/ecma262/#sec-thisnumbervalue
var thisNumberValue$4 = uncurryThis$h(1.0.valueOf);

// a string of all valid unicode whitespaces
var whitespaces$3 = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002' +
  '\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

var uncurryThis$g = functionUncurryThis;
var requireObjectCoercible$1 = requireObjectCoercible$5;
var toString$4 = toString$7;
var whitespaces$2 = whitespaces$3;

var replace = uncurryThis$g(''.replace);
var whitespace = '[' + whitespaces$2 + ']';
var ltrim = RegExp('^' + whitespace + whitespace + '*');
var rtrim = RegExp(whitespace + whitespace + '*$');

// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
var createMethod$3 = function (TYPE) {
  return function ($this) {
    var string = toString$4(requireObjectCoercible$1($this));
    if (TYPE & 1) string = replace(string, ltrim, '');
    if (TYPE & 2) string = replace(string, rtrim, '');
    return string;
  };
};

var stringTrim = {
  // `String.prototype.{ trimLeft, trimStart }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimstart
  start: createMethod$3(1),
  // `String.prototype.{ trimRight, trimEnd }` methods
  // https://tc39.es/ecma262/#sec-string.prototype.trimend
  end: createMethod$3(2),
  // `String.prototype.trim` method
  // https://tc39.es/ecma262/#sec-string.prototype.trim
  trim: createMethod$3(3)
};

var DESCRIPTORS$1 = descriptors;
var global$6 = global$j;
var uncurryThis$f = functionUncurryThis;
var isForced = isForced_1;
var defineBuiltIn = defineBuiltIn$7;
var hasOwn = hasOwnProperty_1;
var inheritIfRequired = inheritIfRequired$2;
var isPrototypeOf = objectIsPrototypeOf;
var isSymbol = isSymbol$3;
var toPrimitive = toPrimitive$2;
var fails$d = fails$u;
var getOwnPropertyNames = objectGetOwnPropertyNames.f;
var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
var defineProperty = objectDefineProperty.f;
var thisNumberValue$3 = thisNumberValue$4;
var trim$2 = stringTrim.trim;

var NUMBER = 'Number';
var NativeNumber = global$6[NUMBER];
var NumberPrototype = NativeNumber.prototype;
var TypeError$1 = global$6.TypeError;
var arraySlice$2 = uncurryThis$f(''.slice);
var charCodeAt = uncurryThis$f(''.charCodeAt);

// `ToNumeric` abstract operation
// https://tc39.es/ecma262/#sec-tonumeric
var toNumeric = function (value) {
  var primValue = toPrimitive(value, 'number');
  return typeof primValue == 'bigint' ? primValue : toNumber(primValue);
};

// `ToNumber` abstract operation
// https://tc39.es/ecma262/#sec-tonumber
var toNumber = function (argument) {
  var it = toPrimitive(argument, 'number');
  var first, third, radix, maxCode, digits, length, index, code;
  if (isSymbol(it)) throw TypeError$1('Cannot convert a Symbol value to a number');
  if (typeof it == 'string' && it.length > 2) {
    it = trim$2(it);
    first = charCodeAt(it, 0);
    if (first === 43 || first === 45) {
      third = charCodeAt(it, 2);
      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
    } else if (first === 48) {
      switch (charCodeAt(it, 1)) {
        case 66: case 98: radix = 2; maxCode = 49; break; // fast equal of /^0b[01]+$/i
        case 79: case 111: radix = 8; maxCode = 55; break; // fast equal of /^0o[0-7]+$/i
        default: return +it;
      }
      digits = arraySlice$2(it, 2);
      length = digits.length;
      for (index = 0; index < length; index++) {
        code = charCodeAt(digits, index);
        // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols
        if (code < 48 || code > maxCode) return NaN;
      } return parseInt(digits, radix);
    }
  } return +it;
};

// `Number` constructor
// https://tc39.es/ecma262/#sec-number-constructor
if (isForced(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'))) {
  var NumberWrapper = function Number(value) {
    var n = arguments.length < 1 ? 0 : NativeNumber(toNumeric(value));
    var dummy = this;
    // check on 1..constructor(foo) case
    return isPrototypeOf(NumberPrototype, dummy) && fails$d(function () { thisNumberValue$3(dummy); })
      ? inheritIfRequired(Object(n), dummy, NumberWrapper) : n;
  };
  for (var keys = DESCRIPTORS$1 ? getOwnPropertyNames(NativeNumber) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES2015 (in case, if modules with ES2015 Number statics required before):
    'EPSILON,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,isFinite,isInteger,isNaN,isSafeInteger,parseFloat,parseInt,' +
    // ESNext
    'fromString,range'
  ).split(','), j = 0, key; keys.length > j; j++) {
    if (hasOwn(NativeNumber, key = keys[j]) && !hasOwn(NumberWrapper, key)) {
      defineProperty(NumberWrapper, key, getOwnPropertyDescriptor$1(NativeNumber, key));
    }
  }
  NumberWrapper.prototype = NumberPrototype;
  NumberPrototype.constructor = NumberWrapper;
  defineBuiltIn(global$6, NUMBER, NumberWrapper, { constructor: true });
}

var $$N = _export;

// `Number.EPSILON` constant
// https://tc39.es/ecma262/#sec-number.epsilon
$$N({ target: 'Number', stat: true, nonConfigurable: true, nonWritable: true }, {
  EPSILON: Math.pow(2, -52)
});

var global$5 = global$j;

var globalIsFinite = global$5.isFinite;

// `Number.isFinite` method
// https://tc39.es/ecma262/#sec-number.isfinite
// eslint-disable-next-line es/no-number-isfinite -- safe
var numberIsFinite$1 = Number.isFinite || function isFinite(it) {
  return typeof it == 'number' && globalIsFinite(it);
};

var $$M = _export;
var numberIsFinite = numberIsFinite$1;

// `Number.isFinite` method
// https://tc39.es/ecma262/#sec-number.isfinite
$$M({ target: 'Number', stat: true }, { isFinite: numberIsFinite });

var isObject$3 = isObject$e;

var floor$3 = Math.floor;

// `IsIntegralNumber` abstract operation
// https://tc39.es/ecma262/#sec-isintegralnumber
// eslint-disable-next-line es/no-number-isinteger -- safe
var isIntegralNumber$2 = Number.isInteger || function isInteger(it) {
  return !isObject$3(it) && isFinite(it) && floor$3(it) === it;
};

var $$L = _export;
var isIntegralNumber$1 = isIntegralNumber$2;

// `Number.isInteger` method
// https://tc39.es/ecma262/#sec-number.isinteger
$$L({ target: 'Number', stat: true }, {
  isInteger: isIntegralNumber$1
});

var $$K = _export;

// `Number.isNaN` method
// https://tc39.es/ecma262/#sec-number.isnan
$$K({ target: 'Number', stat: true }, {
  isNaN: function isNaN(number) {
    // eslint-disable-next-line no-self-compare -- NaN check
    return number != number;
  }
});

var $$J = _export;
var isIntegralNumber = isIntegralNumber$2;

var abs$1 = Math.abs;

// `Number.isSafeInteger` method
// https://tc39.es/ecma262/#sec-number.issafeinteger
$$J({ target: 'Number', stat: true }, {
  isSafeInteger: function isSafeInteger(number) {
    return isIntegralNumber(number) && abs$1(number) <= 0x1FFFFFFFFFFFFF;
  }
});

var $$I = _export;

// `Number.MAX_SAFE_INTEGER` constant
// https://tc39.es/ecma262/#sec-number.max_safe_integer
$$I({ target: 'Number', stat: true, nonConfigurable: true, nonWritable: true }, {
  MAX_SAFE_INTEGER: 0x1FFFFFFFFFFFFF
});

var $$H = _export;

// `Number.MIN_SAFE_INTEGER` constant
// https://tc39.es/ecma262/#sec-number.min_safe_integer
$$H({ target: 'Number', stat: true, nonConfigurable: true, nonWritable: true }, {
  MIN_SAFE_INTEGER: -0x1FFFFFFFFFFFFF
});

var global$4 = global$j;
var fails$c = fails$u;
var uncurryThis$e = functionUncurryThis;
var toString$3 = toString$7;
var trim$1 = stringTrim.trim;
var whitespaces$1 = whitespaces$3;

var charAt = uncurryThis$e(''.charAt);
var $parseFloat = global$4.parseFloat;
var Symbol$2 = global$4.Symbol;
var ITERATOR$1 = Symbol$2 && Symbol$2.iterator;
var FORCED$7 = 1 / $parseFloat(whitespaces$1 + '-0') !== -Infinity
  // MS Edge 18- broken with boxed symbols
  || (ITERATOR$1 && !fails$c(function () { $parseFloat(Object(ITERATOR$1)); }));

// `parseFloat` method
// https://tc39.es/ecma262/#sec-parsefloat-string
var numberParseFloat = FORCED$7 ? function parseFloat(string) {
  var trimmedString = trim$1(toString$3(string));
  var result = $parseFloat(trimmedString);
  return result === 0 && charAt(trimmedString, 0) == '-' ? -0 : result;
} : $parseFloat;

var $$G = _export;
var parseFloat = numberParseFloat;

// `Number.parseFloat` method
// https://tc39.es/ecma262/#sec-number.parseFloat
// eslint-disable-next-line es/no-number-parsefloat -- required for testing
$$G({ target: 'Number', stat: true, forced: Number.parseFloat != parseFloat }, {
  parseFloat: parseFloat
});

var global$3 = global$j;
var fails$b = fails$u;
var uncurryThis$d = functionUncurryThis;
var toString$2 = toString$7;
var trim = stringTrim.trim;
var whitespaces = whitespaces$3;

var $parseInt = global$3.parseInt;
var Symbol$1 = global$3.Symbol;
var ITERATOR = Symbol$1 && Symbol$1.iterator;
var hex = /^[+-]?0x/i;
var exec$1 = uncurryThis$d(hex.exec);
var FORCED$6 = $parseInt(whitespaces + '08') !== 8 || $parseInt(whitespaces + '0x16') !== 22
  // MS Edge 18- broken with boxed symbols
  || (ITERATOR && !fails$b(function () { $parseInt(Object(ITERATOR)); }));

// `parseInt` method
// https://tc39.es/ecma262/#sec-parseint-string-radix
var numberParseInt = FORCED$6 ? function parseInt(string, radix) {
  var S = trim(toString$2(string));
  return $parseInt(S, (radix >>> 0) || (exec$1(hex, S) ? 16 : 10));
} : $parseInt;

var $$F = _export;
var parseInt$1 = numberParseInt;

// `Number.parseInt` method
// https://tc39.es/ecma262/#sec-number.parseint
// eslint-disable-next-line es/no-number-parseint -- required for testing
$$F({ target: 'Number', stat: true, forced: Number.parseInt != parseInt$1 }, {
  parseInt: parseInt$1
});

var toIntegerOrInfinity$8 = toIntegerOrInfinity$c;
var toString$1 = toString$7;
var requireObjectCoercible = requireObjectCoercible$5;

var $RangeError$3 = RangeError;

// `String.prototype.repeat` method implementation
// https://tc39.es/ecma262/#sec-string.prototype.repeat
var stringRepeat = function repeat(count) {
  var str = toString$1(requireObjectCoercible(this));
  var result = '';
  var n = toIntegerOrInfinity$8(count);
  if (n < 0 || n == Infinity) throw $RangeError$3('Wrong number of repetitions');
  for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;
  return result;
};

var $$E = _export;
var uncurryThis$c = functionUncurryThis;
var toIntegerOrInfinity$7 = toIntegerOrInfinity$c;
var thisNumberValue$2 = thisNumberValue$4;
var $repeat$1 = stringRepeat;
var log10 = mathLog10;
var fails$a = fails$u;

var $RangeError$2 = RangeError;
var $String$1 = String;
var $isFinite = isFinite;
var abs = Math.abs;
var floor$2 = Math.floor;
var pow$1 = Math.pow;
var round = Math.round;
var nativeToExponential = uncurryThis$c(1.0.toExponential);
var repeat$1 = uncurryThis$c($repeat$1);
var stringSlice$1 = uncurryThis$c(''.slice);

// Edge 17-
var ROUNDS_PROPERLY = nativeToExponential(-6.9e-11, 4) === '-6.9000e-11'
  // IE11- && Edge 14-
  && nativeToExponential(1.255, 2) === '1.25e+0'
  // FF86-, V8 ~ Chrome 49-50
  && nativeToExponential(12345, 3) === '1.235e+4'
  // FF86-, V8 ~ Chrome 49-50
  && nativeToExponential(25, 0) === '3e+1';

// IE8-
var THROWS_ON_INFINITY_FRACTION = fails$a(function () {
  nativeToExponential(1, Infinity);
}) && fails$a(function () {
  nativeToExponential(1, -Infinity);
});

// Safari <11 && FF <50
var PROPER_NON_FINITE_THIS_CHECK = !fails$a(function () {
  nativeToExponential(Infinity, Infinity);
}) && !fails$a(function () {
  nativeToExponential(NaN, Infinity);
});

var FORCED$5 = !ROUNDS_PROPERLY || !THROWS_ON_INFINITY_FRACTION || !PROPER_NON_FINITE_THIS_CHECK;

// `Number.prototype.toExponential` method
// https://tc39.es/ecma262/#sec-number.prototype.toexponential
$$E({ target: 'Number', proto: true, forced: FORCED$5 }, {
  toExponential: function toExponential(fractionDigits) {
    var x = thisNumberValue$2(this);
    if (fractionDigits === undefined) return nativeToExponential(x);
    var f = toIntegerOrInfinity$7(fractionDigits);
    if (!$isFinite(x)) return String(x);
    // TODO: ES2018 increased the maximum number of fraction digits to 100, need to improve the implementation
    if (f < 0 || f > 20) throw $RangeError$2('Incorrect fraction digits');
    if (ROUNDS_PROPERLY) return nativeToExponential(x, f);
    var s = '';
    var m = '';
    var e = 0;
    var c = '';
    var d = '';
    if (x < 0) {
      s = '-';
      x = -x;
    }
    if (x === 0) {
      e = 0;
      m = repeat$1('0', f + 1);
    } else {
      // this block is based on https://gist.github.com/SheetJSDev/1100ad56b9f856c95299ed0e068eea08
      // TODO: improve accuracy with big fraction digits
      var l = log10(x);
      e = floor$2(l);
      var n = 0;
      var w = pow$1(10, e - f);
      n = round(x / w);
      if (2 * x >= (2 * n + 1) * w) {
        n += 1;
      }
      if (n >= pow$1(10, f + 1)) {
        n /= 10;
        e += 1;
      }
      m = $String$1(n);
    }
    if (f !== 0) {
      m = stringSlice$1(m, 0, 1) + '.' + stringSlice$1(m, 1);
    }
    if (e === 0) {
      c = '+';
      d = '0';
    } else {
      c = e > 0 ? '+' : '-';
      d = $String$1(abs(e));
    }
    m += 'e' + c + d;
    return s + m;
  }
});

var $$D = _export;
var uncurryThis$b = functionUncurryThis;
var toIntegerOrInfinity$6 = toIntegerOrInfinity$c;
var thisNumberValue$1 = thisNumberValue$4;
var $repeat = stringRepeat;
var fails$9 = fails$u;

var $RangeError$1 = RangeError;
var $String = String;
var floor$1 = Math.floor;
var repeat = uncurryThis$b($repeat);
var stringSlice = uncurryThis$b(''.slice);
var nativeToFixed = uncurryThis$b(1.0.toFixed);

var pow = function (x, n, acc) {
  return n === 0 ? acc : n % 2 === 1 ? pow(x, n - 1, acc * x) : pow(x * x, n / 2, acc);
};

var log = function (x) {
  var n = 0;
  var x2 = x;
  while (x2 >= 4096) {
    n += 12;
    x2 /= 4096;
  }
  while (x2 >= 2) {
    n += 1;
    x2 /= 2;
  } return n;
};

var multiply = function (data, n, c) {
  var index = -1;
  var c2 = c;
  while (++index < 6) {
    c2 += n * data[index];
    data[index] = c2 % 1e7;
    c2 = floor$1(c2 / 1e7);
  }
};

var divide = function (data, n) {
  var index = 6;
  var c = 0;
  while (--index >= 0) {
    c += data[index];
    data[index] = floor$1(c / n);
    c = (c % n) * 1e7;
  }
};

var dataToString = function (data) {
  var index = 6;
  var s = '';
  while (--index >= 0) {
    if (s !== '' || index === 0 || data[index] !== 0) {
      var t = $String(data[index]);
      s = s === '' ? t : s + repeat('0', 7 - t.length) + t;
    }
  } return s;
};

var FORCED$4 = fails$9(function () {
  return nativeToFixed(0.00008, 3) !== '0.000' ||
    nativeToFixed(0.9, 0) !== '1' ||
    nativeToFixed(1.255, 2) !== '1.25' ||
    nativeToFixed(1000000000000000128.0, 0) !== '1000000000000000128';
}) || !fails$9(function () {
  // V8 ~ Android 4.3-
  nativeToFixed({});
});

// `Number.prototype.toFixed` method
// https://tc39.es/ecma262/#sec-number.prototype.tofixed
$$D({ target: 'Number', proto: true, forced: FORCED$4 }, {
  toFixed: function toFixed(fractionDigits) {
    var number = thisNumberValue$1(this);
    var fractDigits = toIntegerOrInfinity$6(fractionDigits);
    var data = [0, 0, 0, 0, 0, 0];
    var sign = '';
    var result = '0';
    var e, z, j, k;

    // TODO: ES2018 increased the maximum number of fraction digits to 100, need to improve the implementation
    if (fractDigits < 0 || fractDigits > 20) throw $RangeError$1('Incorrect fraction digits');
    // eslint-disable-next-line no-self-compare -- NaN check
    if (number != number) return 'NaN';
    if (number <= -1e21 || number >= 1e21) return $String(number);
    if (number < 0) {
      sign = '-';
      number = -number;
    }
    if (number > 1e-21) {
      e = log(number * pow(2, 69, 1)) - 69;
      z = e < 0 ? number * pow(2, -e, 1) : number / pow(2, e, 1);
      z *= 0x10000000000000;
      e = 52 - e;
      if (e > 0) {
        multiply(data, 0, z);
        j = fractDigits;
        while (j >= 7) {
          multiply(data, 1e7, 0);
          j -= 7;
        }
        multiply(data, pow(10, j, 1), 0);
        j = e - 1;
        while (j >= 23) {
          divide(data, 1 << 23);
          j -= 23;
        }
        divide(data, 1 << j);
        multiply(data, 1, 1);
        divide(data, 2);
        result = dataToString(data);
      } else {
        multiply(data, 0, z);
        multiply(data, 1 << -e, 0);
        result = dataToString(data) + repeat('0', fractDigits);
      }
    }
    if (fractDigits > 0) {
      k = result.length;
      result = sign + (k <= fractDigits
        ? '0.' + repeat('0', fractDigits - k) + result
        : stringSlice(result, 0, k - fractDigits) + '.' + stringSlice(result, k - fractDigits));
    } else {
      result = sign + result;
    } return result;
  }
});

var $$C = _export;
var uncurryThis$a = functionUncurryThis;
var fails$8 = fails$u;
var thisNumberValue = thisNumberValue$4;

var nativeToPrecision = uncurryThis$a(1.0.toPrecision);

var FORCED$3 = fails$8(function () {
  // IE7-
  return nativeToPrecision(1, undefined) !== '1';
}) || !fails$8(function () {
  // V8 ~ Android 4.3-
  nativeToPrecision({});
});

// `Number.prototype.toPrecision` method
// https://tc39.es/ecma262/#sec-number.prototype.toprecision
$$C({ target: 'Number', proto: true, forced: FORCED$3 }, {
  toPrecision: function toPrecision(precision) {
    return precision === undefined
      ? nativeToPrecision(thisNumberValue(this))
      : nativeToPrecision(thisNumberValue(this), precision);
  }
});

var path$1 = path$4;

path$1.Number;

var anObject = anObject$9;
var iteratorClose = iteratorClose$2;

// call something on iterator step with safe closing on error
var callWithSafeIterationClosing$1 = function (iterator, fn, value, ENTRIES) {
  try {
    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
  } catch (error) {
    iteratorClose(iterator, 'throw', error);
  }
};

var uncurryThis$9 = functionUncurryThis;
var fails$7 = fails$u;
var isCallable = isCallable$i;
var classof$2 = classof$6;
var getBuiltIn$1 = getBuiltIn$7;
var inspectSource = inspectSource$2;

var noop = function () { /* empty */ };
var empty = [];
var construct = getBuiltIn$1('Reflect', 'construct');
var constructorRegExp = /^\s*(?:class|function)\b/;
var exec = uncurryThis$9(constructorRegExp.exec);
var INCORRECT_TO_STRING = !constructorRegExp.exec(noop);

var isConstructorModern = function isConstructor(argument) {
  if (!isCallable(argument)) return false;
  try {
    construct(noop, empty, argument);
    return true;
  } catch (error) {
    return false;
  }
};

var isConstructorLegacy = function isConstructor(argument) {
  if (!isCallable(argument)) return false;
  switch (classof$2(argument)) {
    case 'AsyncFunction':
    case 'GeneratorFunction':
    case 'AsyncGeneratorFunction': return false;
  }
  try {
    // we can't check .prototype since constructors produced by .bind haven't it
    // `Function#toString` throws on some built-it function in some legacy engines
    // (for example, `DOMQuad` and similar in FF41-)
    return INCORRECT_TO_STRING || !!exec(constructorRegExp, inspectSource(argument));
  } catch (error) {
    return true;
  }
};

isConstructorLegacy.sham = true;

// `IsConstructor` abstract operation
// https://tc39.es/ecma262/#sec-isconstructor
var isConstructor$4 = !construct || fails$7(function () {
  var called;
  return isConstructorModern(isConstructorModern.call)
    || !isConstructorModern(Object)
    || !isConstructorModern(function () { called = true; })
    || called;
}) ? isConstructorLegacy : isConstructorModern;

var bind$5 = functionBindContext;
var call$1 = functionCall;
var toObject$f = toObject$i;
var callWithSafeIterationClosing = callWithSafeIterationClosing$1;
var isArrayIteratorMethod = isArrayIteratorMethod$2;
var isConstructor$3 = isConstructor$4;
var lengthOfArrayLike$m = lengthOfArrayLike$q;
var createProperty$4 = createProperty$6;
var getIterator = getIterator$2;
var getIteratorMethod = getIteratorMethod$3;

var $Array$8 = Array;

// `Array.from` method implementation
// https://tc39.es/ecma262/#sec-array.from
var arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
  var O = toObject$f(arrayLike);
  var IS_CONSTRUCTOR = isConstructor$3(this);
  var argumentsLength = arguments.length;
  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
  var mapping = mapfn !== undefined;
  if (mapping) mapfn = bind$5(mapfn, argumentsLength > 2 ? arguments[2] : undefined);
  var iteratorMethod = getIteratorMethod(O);
  var index = 0;
  var length, result, step, iterator, next, value;
  // if the target is not iterable or it's an array with the default iterator - use a simple case
  if (iteratorMethod && !(this === $Array$8 && isArrayIteratorMethod(iteratorMethod))) {
    iterator = getIterator(O, iteratorMethod);
    next = iterator.next;
    result = IS_CONSTRUCTOR ? new this() : [];
    for (;!(step = call$1(next, iterator)).done; index++) {
      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
      createProperty$4(result, index, value);
    }
  } else {
    length = lengthOfArrayLike$m(O);
    result = IS_CONSTRUCTOR ? new this(length) : $Array$8(length);
    for (;length > index; index++) {
      value = mapping ? mapfn(O[index], index) : O[index];
      createProperty$4(result, index, value);
    }
  }
  result.length = index;
  return result;
};

var $$B = _export;
var from = arrayFrom;
var checkCorrectnessOfIteration = checkCorrectnessOfIteration$2;

var INCORRECT_ITERATION = !checkCorrectnessOfIteration(function (iterable) {
  // eslint-disable-next-line es/no-array-from -- required for testing
  Array.from(iterable);
});

// `Array.from` method
// https://tc39.es/ecma262/#sec-array.from
$$B({ target: 'Array', stat: true, forced: INCORRECT_ITERATION }, {
  from: from
});

var classof$1 = classofRaw$1;

// `IsArray` abstract operation
// https://tc39.es/ecma262/#sec-isarray
// eslint-disable-next-line es/no-array-isarray -- safe
var isArray$7 = Array.isArray || function isArray(argument) {
  return classof$1(argument) == 'Array';
};

var $$A = _export;
var isArray$6 = isArray$7;

// `Array.isArray` method
// https://tc39.es/ecma262/#sec-array.isarray
$$A({ target: 'Array', stat: true }, {
  isArray: isArray$6
});

var $$z = _export;
var fails$6 = fails$u;
var isConstructor$2 = isConstructor$4;
var createProperty$3 = createProperty$6;

var $Array$7 = Array;

var ISNT_GENERIC = fails$6(function () {
  function F() { /* empty */ }
  // eslint-disable-next-line es/no-array-of -- safe
  return !($Array$7.of.call(F) instanceof F);
});

// `Array.of` method
// https://tc39.es/ecma262/#sec-array.of
// WebKit Array.of isn't generic
$$z({ target: 'Array', stat: true, forced: ISNT_GENERIC }, {
  of: function of(/* ...args */) {
    var index = 0;
    var argumentsLength = arguments.length;
    var result = new (isConstructor$2(this) ? this : $Array$7)(argumentsLength);
    while (argumentsLength > index) createProperty$3(result, index, arguments[index++]);
    result.length = argumentsLength;
    return result;
  }
});

var $$y = _export;
var toObject$e = toObject$i;
var lengthOfArrayLike$l = lengthOfArrayLike$q;
var toIntegerOrInfinity$5 = toIntegerOrInfinity$c;
var addToUnscopables$g = addToUnscopables$i;

// `Array.prototype.at` method
// https://github.com/tc39/proposal-relative-indexing-method
$$y({ target: 'Array', proto: true }, {
  at: function at(index) {
    var O = toObject$e(this);
    var len = lengthOfArrayLike$l(O);
    var relativeIndex = toIntegerOrInfinity$5(index);
    var k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
    return (k < 0 || k >= len) ? undefined : O[k];
  }
});

addToUnscopables$g('at');

var $TypeError$3 = TypeError;
var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF; // 2 ** 53 - 1 == 9007199254740991

var doesNotExceedSafeInteger$6 = function (it) {
  if (it > MAX_SAFE_INTEGER) throw $TypeError$3('Maximum allowed index exceeded');
  return it;
};

var isArray$5 = isArray$7;
var isConstructor$1 = isConstructor$4;
var isObject$2 = isObject$e;
var wellKnownSymbol$3 = wellKnownSymbol$g;

var SPECIES$2 = wellKnownSymbol$3('species');
var $Array$6 = Array;

// a part of `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
var arraySpeciesConstructor$1 = function (originalArray) {
  var C;
  if (isArray$5(originalArray)) {
    C = originalArray.constructor;
    // cross-realm fallback
    if (isConstructor$1(C) && (C === $Array$6 || isArray$5(C.prototype))) C = undefined;
    else if (isObject$2(C)) {
      C = C[SPECIES$2];
      if (C === null) C = undefined;
    }
  } return C === undefined ? $Array$6 : C;
};

var arraySpeciesConstructor = arraySpeciesConstructor$1;

// `ArraySpeciesCreate` abstract operation
// https://tc39.es/ecma262/#sec-arrayspeciescreate
var arraySpeciesCreate$5 = function (originalArray, length) {
  return new (arraySpeciesConstructor(originalArray))(length === 0 ? 0 : length);
};

var fails$5 = fails$u;
var wellKnownSymbol$2 = wellKnownSymbol$g;
var V8_VERSION$1 = engineV8Version;

var SPECIES$1 = wellKnownSymbol$2('species');

var arrayMethodHasSpeciesSupport$5 = function (METHOD_NAME) {
  // We can't use this feature detection in V8 since it causes
  // deoptimization and serious performance degradation
  // https://github.com/zloirock/core-js/issues/677
  return V8_VERSION$1 >= 51 || !fails$5(function () {
    var array = [];
    var constructor = array.constructor = {};
    constructor[SPECIES$1] = function () {
      return { foo: 1 };
    };
    return array[METHOD_NAME](Boolean).foo !== 1;
  });
};

var $$x = _export;
var fails$4 = fails$u;
var isArray$4 = isArray$7;
var isObject$1 = isObject$e;
var toObject$d = toObject$i;
var lengthOfArrayLike$k = lengthOfArrayLike$q;
var doesNotExceedSafeInteger$5 = doesNotExceedSafeInteger$6;
var createProperty$2 = createProperty$6;
var arraySpeciesCreate$4 = arraySpeciesCreate$5;
var arrayMethodHasSpeciesSupport$4 = arrayMethodHasSpeciesSupport$5;
var wellKnownSymbol$1 = wellKnownSymbol$g;
var V8_VERSION = engineV8Version;

var IS_CONCAT_SPREADABLE = wellKnownSymbol$1('isConcatSpreadable');

// We can't use this feature detection in V8 since it causes
// deoptimization and serious performance degradation
// https://github.com/zloirock/core-js/issues/679
var IS_CONCAT_SPREADABLE_SUPPORT = V8_VERSION >= 51 || !fails$4(function () {
  var array = [];
  array[IS_CONCAT_SPREADABLE] = false;
  return array.concat()[0] !== array;
});

var SPECIES_SUPPORT = arrayMethodHasSpeciesSupport$4('concat');

var isConcatSpreadable = function (O) {
  if (!isObject$1(O)) return false;
  var spreadable = O[IS_CONCAT_SPREADABLE];
  return spreadable !== undefined ? !!spreadable : isArray$4(O);
};

var FORCED$2 = !IS_CONCAT_SPREADABLE_SUPPORT || !SPECIES_SUPPORT;

// `Array.prototype.concat` method
// https://tc39.es/ecma262/#sec-array.prototype.concat
// with adding support of @@isConcatSpreadable and @@species
$$x({ target: 'Array', proto: true, arity: 1, forced: FORCED$2 }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  concat: function concat(arg) {
    var O = toObject$d(this);
    var A = arraySpeciesCreate$4(O, 0);
    var n = 0;
    var i, k, length, len, E;
    for (i = -1, length = arguments.length; i < length; i++) {
      E = i === -1 ? O : arguments[i];
      if (isConcatSpreadable(E)) {
        len = lengthOfArrayLike$k(E);
        doesNotExceedSafeInteger$5(n + len);
        for (k = 0; k < len; k++, n++) if (k in E) createProperty$2(A, n, E[k]);
      } else {
        doesNotExceedSafeInteger$5(n + 1);
        createProperty$2(A, n++, E);
      }
    }
    A.length = n;
    return A;
  }
});

var tryToString = tryToString$4;

var $TypeError$2 = TypeError;

var deletePropertyOrThrow$4 = function (O, P) {
  if (!delete O[P]) throw $TypeError$2('Cannot delete property ' + tryToString(P) + ' of ' + tryToString(O));
};

var toObject$c = toObject$i;
var toAbsoluteIndex$4 = toAbsoluteIndex$7;
var lengthOfArrayLike$j = lengthOfArrayLike$q;
var deletePropertyOrThrow$3 = deletePropertyOrThrow$4;

var min$3 = Math.min;

// `Array.prototype.copyWithin` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.copywithin
// eslint-disable-next-line es/no-array-prototype-copywithin -- safe
var arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
  var O = toObject$c(this);
  var len = lengthOfArrayLike$j(O);
  var to = toAbsoluteIndex$4(target, len);
  var from = toAbsoluteIndex$4(start, len);
  var end = arguments.length > 2 ? arguments[2] : undefined;
  var count = min$3((end === undefined ? len : toAbsoluteIndex$4(end, len)) - from, len - to);
  var inc = 1;
  if (from < to && to < from + count) {
    inc = -1;
    from += count - 1;
    to += count - 1;
  }
  while (count-- > 0) {
    if (from in O) O[to] = O[from];
    else deletePropertyOrThrow$3(O, to);
    to += inc;
    from += inc;
  } return O;
};

var $$w = _export;
var copyWithin = arrayCopyWithin;
var addToUnscopables$f = addToUnscopables$i;

// `Array.prototype.copyWithin` method
// https://tc39.es/ecma262/#sec-array.prototype.copywithin
$$w({ target: 'Array', proto: true }, {
  copyWithin: copyWithin
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$f('copyWithin');

var bind$4 = functionBindContext;
var uncurryThis$8 = functionUncurryThis;
var IndexedObject$5 = indexedObject;
var toObject$b = toObject$i;
var lengthOfArrayLike$i = lengthOfArrayLike$q;
var arraySpeciesCreate$3 = arraySpeciesCreate$5;

var push$3 = uncurryThis$8([].push);

// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterReject }` methods implementation
var createMethod$2 = function (TYPE) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var IS_FILTER_REJECT = TYPE == 7;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  return function ($this, callbackfn, that, specificCreate) {
    var O = toObject$b($this);
    var self = IndexedObject$5(O);
    var boundFunction = bind$4(callbackfn, that);
    var length = lengthOfArrayLike$i(self);
    var index = 0;
    var create = specificCreate || arraySpeciesCreate$3;
    var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_REJECT ? create($this, 0) : undefined;
    var value, result;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (TYPE) {
        if (IS_MAP) target[index] = result; // map
        else if (result) switch (TYPE) {
          case 3: return true;              // some
          case 5: return value;             // find
          case 6: return index;             // findIndex
          case 2: push$3(target, value);      // filter
        } else switch (TYPE) {
          case 4: return false;             // every
          case 7: push$3(target, value);      // filterReject
        }
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
  };
};

var arrayIteration = {
  // `Array.prototype.forEach` method
  // https://tc39.es/ecma262/#sec-array.prototype.foreach
  forEach: createMethod$2(0),
  // `Array.prototype.map` method
  // https://tc39.es/ecma262/#sec-array.prototype.map
  map: createMethod$2(1),
  // `Array.prototype.filter` method
  // https://tc39.es/ecma262/#sec-array.prototype.filter
  filter: createMethod$2(2),
  // `Array.prototype.some` method
  // https://tc39.es/ecma262/#sec-array.prototype.some
  some: createMethod$2(3),
  // `Array.prototype.every` method
  // https://tc39.es/ecma262/#sec-array.prototype.every
  every: createMethod$2(4),
  // `Array.prototype.find` method
  // https://tc39.es/ecma262/#sec-array.prototype.find
  find: createMethod$2(5),
  // `Array.prototype.findIndex` method
  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
  findIndex: createMethod$2(6),
  // `Array.prototype.filterReject` method
  // https://github.com/tc39/proposal-array-filtering
  filterReject: createMethod$2(7)
};

var fails$3 = fails$u;

var arrayMethodIsStrict$b = function (METHOD_NAME, argument) {
  var method = [][METHOD_NAME];
  return !!method && fails$3(function () {
    // eslint-disable-next-line no-useless-call -- required for testing
    method.call(null, argument || function () { return 1; }, 1);
  });
};

var $$v = _export;
var $every = arrayIteration.every;
var arrayMethodIsStrict$a = arrayMethodIsStrict$b;

var STRICT_METHOD$8 = arrayMethodIsStrict$a('every');

// `Array.prototype.every` method
// https://tc39.es/ecma262/#sec-array.prototype.every
$$v({ target: 'Array', proto: true, forced: !STRICT_METHOD$8 }, {
  every: function every(callbackfn /* , thisArg */) {
    return $every(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var toObject$a = toObject$i;
var toAbsoluteIndex$3 = toAbsoluteIndex$7;
var lengthOfArrayLike$h = lengthOfArrayLike$q;

// `Array.prototype.fill` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.fill
var arrayFill = function fill(value /* , start = 0, end = @length */) {
  var O = toObject$a(this);
  var length = lengthOfArrayLike$h(O);
  var argumentsLength = arguments.length;
  var index = toAbsoluteIndex$3(argumentsLength > 1 ? arguments[1] : undefined, length);
  var end = argumentsLength > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : toAbsoluteIndex$3(end, length);
  while (endPos > index) O[index++] = value;
  return O;
};

var $$u = _export;
var fill = arrayFill;
var addToUnscopables$e = addToUnscopables$i;

// `Array.prototype.fill` method
// https://tc39.es/ecma262/#sec-array.prototype.fill
$$u({ target: 'Array', proto: true }, {
  fill: fill
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$e('fill');

var $$t = _export;
var $filter = arrayIteration.filter;
var arrayMethodHasSpeciesSupport$3 = arrayMethodHasSpeciesSupport$5;

var HAS_SPECIES_SUPPORT$3 = arrayMethodHasSpeciesSupport$3('filter');

// `Array.prototype.filter` method
// https://tc39.es/ecma262/#sec-array.prototype.filter
// with adding support of @@species
$$t({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$3 }, {
  filter: function filter(callbackfn /* , thisArg */) {
    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$s = _export;
var $find = arrayIteration.find;
var addToUnscopables$d = addToUnscopables$i;

var FIND = 'find';
var SKIPS_HOLES$1 = true;

// Shouldn't skip holes
if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES$1 = false; });

// `Array.prototype.find` method
// https://tc39.es/ecma262/#sec-array.prototype.find
$$s({ target: 'Array', proto: true, forced: SKIPS_HOLES$1 }, {
  find: function find(callbackfn /* , that = undefined */) {
    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$d(FIND);

var $$r = _export;
var $findIndex = arrayIteration.findIndex;
var addToUnscopables$c = addToUnscopables$i;

var FIND_INDEX = 'findIndex';
var SKIPS_HOLES = true;

// Shouldn't skip holes
if (FIND_INDEX in []) Array(1)[FIND_INDEX](function () { SKIPS_HOLES = false; });

// `Array.prototype.findIndex` method
// https://tc39.es/ecma262/#sec-array.prototype.findindex
$$r({ target: 'Array', proto: true, forced: SKIPS_HOLES }, {
  findIndex: function findIndex(callbackfn /* , that = undefined */) {
    return $findIndex(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$c(FIND_INDEX);

var bind$3 = functionBindContext;
var IndexedObject$4 = indexedObject;
var toObject$9 = toObject$i;
var lengthOfArrayLike$g = lengthOfArrayLike$q;

// `Array.prototype.{ findLast, findLastIndex }` methods implementation
var createMethod$1 = function (TYPE) {
  var IS_FIND_LAST_INDEX = TYPE == 1;
  return function ($this, callbackfn, that) {
    var O = toObject$9($this);
    var self = IndexedObject$4(O);
    var boundFunction = bind$3(callbackfn, that);
    var index = lengthOfArrayLike$g(self);
    var value, result;
    while (index-- > 0) {
      value = self[index];
      result = boundFunction(value, index, O);
      if (result) switch (TYPE) {
        case 0: return value; // findLast
        case 1: return index; // findLastIndex
      }
    }
    return IS_FIND_LAST_INDEX ? -1 : undefined;
  };
};

var arrayIterationFromLast = {
  // `Array.prototype.findLast` method
  // https://github.com/tc39/proposal-array-find-from-last
  findLast: createMethod$1(0),
  // `Array.prototype.findLastIndex` method
  // https://github.com/tc39/proposal-array-find-from-last
  findLastIndex: createMethod$1(1)
};

var $$q = _export;
var $findLast = arrayIterationFromLast.findLast;
var addToUnscopables$b = addToUnscopables$i;

// `Array.prototype.findLast` method
// https://github.com/tc39/proposal-array-find-from-last
$$q({ target: 'Array', proto: true }, {
  findLast: function findLast(callbackfn /* , that = undefined */) {
    return $findLast(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

addToUnscopables$b('findLast');

var $$p = _export;
var $findLastIndex = arrayIterationFromLast.findLastIndex;
var addToUnscopables$a = addToUnscopables$i;

// `Array.prototype.findLastIndex` method
// https://github.com/tc39/proposal-array-find-from-last
$$p({ target: 'Array', proto: true }, {
  findLastIndex: function findLastIndex(callbackfn /* , that = undefined */) {
    return $findLastIndex(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

addToUnscopables$a('findLastIndex');

var isArray$3 = isArray$7;
var lengthOfArrayLike$f = lengthOfArrayLike$q;
var doesNotExceedSafeInteger$4 = doesNotExceedSafeInteger$6;
var bind$2 = functionBindContext;

// `FlattenIntoArray` abstract operation
// https://tc39.github.io/proposal-flatMap/#sec-FlattenIntoArray
var flattenIntoArray$2 = function (target, original, source, sourceLen, start, depth, mapper, thisArg) {
  var targetIndex = start;
  var sourceIndex = 0;
  var mapFn = mapper ? bind$2(mapper, thisArg) : false;
  var element, elementLen;

  while (sourceIndex < sourceLen) {
    if (sourceIndex in source) {
      element = mapFn ? mapFn(source[sourceIndex], sourceIndex, original) : source[sourceIndex];

      if (depth > 0 && isArray$3(element)) {
        elementLen = lengthOfArrayLike$f(element);
        targetIndex = flattenIntoArray$2(target, original, element, elementLen, targetIndex, depth - 1) - 1;
      } else {
        doesNotExceedSafeInteger$4(targetIndex + 1);
        target[targetIndex] = element;
      }

      targetIndex++;
    }
    sourceIndex++;
  }
  return targetIndex;
};

var flattenIntoArray_1 = flattenIntoArray$2;

var $$o = _export;
var flattenIntoArray$1 = flattenIntoArray_1;
var toObject$8 = toObject$i;
var lengthOfArrayLike$e = lengthOfArrayLike$q;
var toIntegerOrInfinity$4 = toIntegerOrInfinity$c;
var arraySpeciesCreate$2 = arraySpeciesCreate$5;

// `Array.prototype.flat` method
// https://tc39.es/ecma262/#sec-array.prototype.flat
$$o({ target: 'Array', proto: true }, {
  flat: function flat(/* depthArg = 1 */) {
    var depthArg = arguments.length ? arguments[0] : undefined;
    var O = toObject$8(this);
    var sourceLen = lengthOfArrayLike$e(O);
    var A = arraySpeciesCreate$2(O, 0);
    A.length = flattenIntoArray$1(A, O, O, sourceLen, 0, depthArg === undefined ? 1 : toIntegerOrInfinity$4(depthArg));
    return A;
  }
});

var $$n = _export;
var flattenIntoArray = flattenIntoArray_1;
var aCallable$3 = aCallable$7;
var toObject$7 = toObject$i;
var lengthOfArrayLike$d = lengthOfArrayLike$q;
var arraySpeciesCreate$1 = arraySpeciesCreate$5;

// `Array.prototype.flatMap` method
// https://tc39.es/ecma262/#sec-array.prototype.flatmap
$$n({ target: 'Array', proto: true }, {
  flatMap: function flatMap(callbackfn /* , thisArg */) {
    var O = toObject$7(this);
    var sourceLen = lengthOfArrayLike$d(O);
    var A;
    aCallable$3(callbackfn);
    A = arraySpeciesCreate$1(O, 0);
    A.length = flattenIntoArray(A, O, O, sourceLen, 0, 1, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return A;
  }
});

var $forEach = arrayIteration.forEach;
var arrayMethodIsStrict$9 = arrayMethodIsStrict$b;

var STRICT_METHOD$7 = arrayMethodIsStrict$9('forEach');

// `Array.prototype.forEach` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.foreach
var arrayForEach = !STRICT_METHOD$7 ? function forEach(callbackfn /* , thisArg */) {
  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
// eslint-disable-next-line es/no-array-prototype-foreach -- safe
} : [].forEach;

var $$m = _export;
var forEach = arrayForEach;

// `Array.prototype.forEach` method
// https://tc39.es/ecma262/#sec-array.prototype.foreach
// eslint-disable-next-line es/no-array-prototype-foreach -- safe
$$m({ target: 'Array', proto: true, forced: [].forEach != forEach }, {
  forEach: forEach
});

var $$l = _export;
var $includes = arrayIncludes.includes;
var fails$2 = fails$u;
var addToUnscopables$9 = addToUnscopables$i;

// FF99+ bug
var BROKEN_ON_SPARSE = fails$2(function () {
  return !Array(1).includes();
});

// `Array.prototype.includes` method
// https://tc39.es/ecma262/#sec-array.prototype.includes
$$l({ target: 'Array', proto: true, forced: BROKEN_ON_SPARSE }, {
  includes: function includes(el /* , fromIndex = 0 */) {
    return $includes(this, el, arguments.length > 1 ? arguments[1] : undefined);
  }
});

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$9('includes');

/* eslint-disable es/no-array-prototype-indexof -- required for testing */
var $$k = _export;
var uncurryThis$7 = functionUncurryThis;
var $indexOf = arrayIncludes.indexOf;
var arrayMethodIsStrict$8 = arrayMethodIsStrict$b;

var nativeIndexOf = uncurryThis$7([].indexOf);

var NEGATIVE_ZERO$1 = !!nativeIndexOf && 1 / nativeIndexOf([1], 1, -0) < 0;
var STRICT_METHOD$6 = arrayMethodIsStrict$8('indexOf');

// `Array.prototype.indexOf` method
// https://tc39.es/ecma262/#sec-array.prototype.indexof
$$k({ target: 'Array', proto: true, forced: NEGATIVE_ZERO$1 || !STRICT_METHOD$6 }, {
  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
    var fromIndex = arguments.length > 1 ? arguments[1] : undefined;
    return NEGATIVE_ZERO$1
      // convert -0 to +0
      ? nativeIndexOf(this, searchElement, fromIndex) || 0
      : $indexOf(this, searchElement, fromIndex);
  }
});

var $$j = _export;
var uncurryThis$6 = functionUncurryThis;
var IndexedObject$3 = indexedObject;
var toIndexedObject$6 = toIndexedObject$d;
var arrayMethodIsStrict$7 = arrayMethodIsStrict$b;

var nativeJoin = uncurryThis$6([].join);

var ES3_STRINGS = IndexedObject$3 != Object;
var STRICT_METHOD$5 = arrayMethodIsStrict$7('join', ',');

// `Array.prototype.join` method
// https://tc39.es/ecma262/#sec-array.prototype.join
$$j({ target: 'Array', proto: true, forced: ES3_STRINGS || !STRICT_METHOD$5 }, {
  join: function join(separator) {
    return nativeJoin(toIndexedObject$6(this), separator === undefined ? ',' : separator);
  }
});

var NATIVE_BIND = functionBindNative;

var FunctionPrototype = Function.prototype;
var apply$1 = FunctionPrototype.apply;
var call = FunctionPrototype.call;

// eslint-disable-next-line es/no-reflect -- safe
var functionApply = typeof Reflect == 'object' && Reflect.apply || (NATIVE_BIND ? call.bind(apply$1) : function () {
  return call.apply(apply$1, arguments);
});

/* eslint-disable es/no-array-prototype-lastindexof -- safe */
var apply = functionApply;
var toIndexedObject$5 = toIndexedObject$d;
var toIntegerOrInfinity$3 = toIntegerOrInfinity$c;
var lengthOfArrayLike$c = lengthOfArrayLike$q;
var arrayMethodIsStrict$6 = arrayMethodIsStrict$b;

var min$2 = Math.min;
var $lastIndexOf = [].lastIndexOf;
var NEGATIVE_ZERO = !!$lastIndexOf && 1 / [1].lastIndexOf(1, -0) < 0;
var STRICT_METHOD$4 = arrayMethodIsStrict$6('lastIndexOf');
var FORCED$1 = NEGATIVE_ZERO || !STRICT_METHOD$4;

// `Array.prototype.lastIndexOf` method implementation
// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
var arrayLastIndexOf = FORCED$1 ? function lastIndexOf(searchElement /* , fromIndex = @[*-1] */) {
  // convert -0 to +0
  if (NEGATIVE_ZERO) return apply($lastIndexOf, this, arguments) || 0;
  var O = toIndexedObject$5(this);
  var length = lengthOfArrayLike$c(O);
  var index = length - 1;
  if (arguments.length > 1) index = min$2(index, toIntegerOrInfinity$3(arguments[1]));
  if (index < 0) index = length + index;
  for (;index >= 0; index--) if (index in O && O[index] === searchElement) return index || 0;
  return -1;
} : $lastIndexOf;

var $$i = _export;
var lastIndexOf = arrayLastIndexOf;

// `Array.prototype.lastIndexOf` method
// https://tc39.es/ecma262/#sec-array.prototype.lastindexof
// eslint-disable-next-line es/no-array-prototype-lastindexof -- required for testing
$$i({ target: 'Array', proto: true, forced: lastIndexOf !== [].lastIndexOf }, {
  lastIndexOf: lastIndexOf
});

var $$h = _export;
var $map = arrayIteration.map;
var arrayMethodHasSpeciesSupport$2 = arrayMethodHasSpeciesSupport$5;

var HAS_SPECIES_SUPPORT$2 = arrayMethodHasSpeciesSupport$2('map');

// `Array.prototype.map` method
// https://tc39.es/ecma262/#sec-array.prototype.map
// with adding support of @@species
$$h({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$2 }, {
  map: function map(callbackfn /* , thisArg */) {
    return $map(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var DESCRIPTORS = descriptors;
var isArray$2 = isArray$7;

var $TypeError$1 = TypeError;
// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

// Safari < 13 does not throw an error in this case
var SILENT_ON_NON_WRITABLE_LENGTH_SET = DESCRIPTORS && !function () {
  // makes no sense without proper strict mode support
  if (this !== undefined) return true;
  try {
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    Object.defineProperty([], 'length', { writable: false }).length = 1;
  } catch (error) {
    return error instanceof TypeError;
  }
}();

var arraySetLength = SILENT_ON_NON_WRITABLE_LENGTH_SET ? function (O, length) {
  if (isArray$2(O) && !getOwnPropertyDescriptor(O, 'length').writable) {
    throw $TypeError$1('Cannot set read only .length');
  } return O.length = length;
} : function (O, length) {
  return O.length = length;
};

var $$g = _export;
var toObject$6 = toObject$i;
var lengthOfArrayLike$b = lengthOfArrayLike$q;
var setArrayLength$2 = arraySetLength;
var doesNotExceedSafeInteger$3 = doesNotExceedSafeInteger$6;
var fails$1 = fails$u;

var INCORRECT_TO_LENGTH = fails$1(function () {
  return [].push.call({ length: 0x100000000 }, 1) !== 4294967297;
});

// V8 and Safari <= 15.4, FF < 23 throws InternalError
// https://bugs.chromium.org/p/v8/issues/detail?id=12681
var SILENT_ON_NON_WRITABLE_LENGTH$1 = !function () {
  try {
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    Object.defineProperty([], 'length', { writable: false }).push();
  } catch (error) {
    return error instanceof TypeError;
  }
}();

// `Array.prototype.push` method
// https://tc39.es/ecma262/#sec-array.prototype.push
$$g({ target: 'Array', proto: true, arity: 1, forced: INCORRECT_TO_LENGTH || SILENT_ON_NON_WRITABLE_LENGTH$1 }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  push: function push(item) {
    var O = toObject$6(this);
    var len = lengthOfArrayLike$b(O);
    var argCount = arguments.length;
    doesNotExceedSafeInteger$3(len + argCount);
    for (var i = 0; i < argCount; i++) {
      O[len] = arguments[i];
      len++;
    }
    setArrayLength$2(O, len);
    return len;
  }
});

var aCallable$2 = aCallable$7;
var toObject$5 = toObject$i;
var IndexedObject$2 = indexedObject;
var lengthOfArrayLike$a = lengthOfArrayLike$q;

var $TypeError = TypeError;

// `Array.prototype.{ reduce, reduceRight }` methods implementation
var createMethod = function (IS_RIGHT) {
  return function (that, callbackfn, argumentsLength, memo) {
    aCallable$2(callbackfn);
    var O = toObject$5(that);
    var self = IndexedObject$2(O);
    var length = lengthOfArrayLike$a(O);
    var index = IS_RIGHT ? length - 1 : 0;
    var i = IS_RIGHT ? -1 : 1;
    if (argumentsLength < 2) while (true) {
      if (index in self) {
        memo = self[index];
        index += i;
        break;
      }
      index += i;
      if (IS_RIGHT ? index < 0 : length <= index) {
        throw $TypeError('Reduce of empty array with no initial value');
      }
    }
    for (;IS_RIGHT ? index >= 0 : length > index; index += i) if (index in self) {
      memo = callbackfn(memo, self[index], index, O);
    }
    return memo;
  };
};

var arrayReduce = {
  // `Array.prototype.reduce` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduce
  left: createMethod(false),
  // `Array.prototype.reduceRight` method
  // https://tc39.es/ecma262/#sec-array.prototype.reduceright
  right: createMethod(true)
};

var classof = classofRaw$1;
var global$2 = global$j;

var engineIsNode = classof(global$2.process) == 'process';

var $$f = _export;
var $reduce = arrayReduce.left;
var arrayMethodIsStrict$5 = arrayMethodIsStrict$b;
var CHROME_VERSION$1 = engineV8Version;
var IS_NODE$1 = engineIsNode;

var STRICT_METHOD$3 = arrayMethodIsStrict$5('reduce');
// Chrome 80-82 has a critical bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
var CHROME_BUG$1 = !IS_NODE$1 && CHROME_VERSION$1 > 79 && CHROME_VERSION$1 < 83;

// `Array.prototype.reduce` method
// https://tc39.es/ecma262/#sec-array.prototype.reduce
$$f({ target: 'Array', proto: true, forced: !STRICT_METHOD$3 || CHROME_BUG$1 }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var length = arguments.length;
    return $reduce(this, callbackfn, length, length > 1 ? arguments[1] : undefined);
  }
});

var $$e = _export;
var $reduceRight = arrayReduce.right;
var arrayMethodIsStrict$4 = arrayMethodIsStrict$b;
var CHROME_VERSION = engineV8Version;
var IS_NODE = engineIsNode;

var STRICT_METHOD$2 = arrayMethodIsStrict$4('reduceRight');
// Chrome 80-82 has a critical bug
// https://bugs.chromium.org/p/chromium/issues/detail?id=1049982
var CHROME_BUG = !IS_NODE && CHROME_VERSION > 79 && CHROME_VERSION < 83;

// `Array.prototype.reduceRight` method
// https://tc39.es/ecma262/#sec-array.prototype.reduceright
$$e({ target: 'Array', proto: true, forced: !STRICT_METHOD$2 || CHROME_BUG }, {
  reduceRight: function reduceRight(callbackfn /* , initialValue */) {
    return $reduceRight(this, callbackfn, arguments.length, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var $$d = _export;
var uncurryThis$5 = functionUncurryThis;
var isArray$1 = isArray$7;

var nativeReverse = uncurryThis$5([].reverse);
var test$1 = [1, 2];

// `Array.prototype.reverse` method
// https://tc39.es/ecma262/#sec-array.prototype.reverse
// fix for Safari 12.0 bug
// https://bugs.webkit.org/show_bug.cgi?id=188794
$$d({ target: 'Array', proto: true, forced: String(test$1) === String(test$1.reverse()) }, {
  reverse: function reverse() {
    // eslint-disable-next-line no-self-assign -- dirty hack
    if (isArray$1(this)) this.length = this.length;
    return nativeReverse(this);
  }
});

var uncurryThis$4 = functionUncurryThis;

var arraySlice$1 = uncurryThis$4([].slice);

var $$c = _export;
var isArray = isArray$7;
var isConstructor = isConstructor$4;
var isObject = isObject$e;
var toAbsoluteIndex$2 = toAbsoluteIndex$7;
var lengthOfArrayLike$9 = lengthOfArrayLike$q;
var toIndexedObject$4 = toIndexedObject$d;
var createProperty$1 = createProperty$6;
var wellKnownSymbol = wellKnownSymbol$g;
var arrayMethodHasSpeciesSupport$1 = arrayMethodHasSpeciesSupport$5;
var nativeSlice = arraySlice$1;

var HAS_SPECIES_SUPPORT$1 = arrayMethodHasSpeciesSupport$1('slice');

var SPECIES = wellKnownSymbol('species');
var $Array$5 = Array;
var max$2 = Math.max;

// `Array.prototype.slice` method
// https://tc39.es/ecma262/#sec-array.prototype.slice
// fallback for not array-like ES3 strings and DOM objects
$$c({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT$1 }, {
  slice: function slice(start, end) {
    var O = toIndexedObject$4(this);
    var length = lengthOfArrayLike$9(O);
    var k = toAbsoluteIndex$2(start, length);
    var fin = toAbsoluteIndex$2(end === undefined ? length : end, length);
    // inline `ArraySpeciesCreate` for usage native `Array#slice` where it's possible
    var Constructor, result, n;
    if (isArray(O)) {
      Constructor = O.constructor;
      // cross-realm fallback
      if (isConstructor(Constructor) && (Constructor === $Array$5 || isArray(Constructor.prototype))) {
        Constructor = undefined;
      } else if (isObject(Constructor)) {
        Constructor = Constructor[SPECIES];
        if (Constructor === null) Constructor = undefined;
      }
      if (Constructor === $Array$5 || Constructor === undefined) {
        return nativeSlice(O, k, fin);
      }
    }
    result = new (Constructor === undefined ? $Array$5 : Constructor)(max$2(fin - k, 0));
    for (n = 0; k < fin; k++, n++) if (k in O) createProperty$1(result, n, O[k]);
    result.length = n;
    return result;
  }
});

var $$b = _export;
var $some = arrayIteration.some;
var arrayMethodIsStrict$3 = arrayMethodIsStrict$b;

var STRICT_METHOD$1 = arrayMethodIsStrict$3('some');

// `Array.prototype.some` method
// https://tc39.es/ecma262/#sec-array.prototype.some
$$b({ target: 'Array', proto: true, forced: !STRICT_METHOD$1 }, {
  some: function some(callbackfn /* , thisArg */) {
    return $some(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

var arraySlice = arraySliceSimple;

var floor = Math.floor;

var mergeSort = function (array, comparefn) {
  var length = array.length;
  var middle = floor(length / 2);
  return length < 8 ? insertionSort(array, comparefn) : merge(
    array,
    mergeSort(arraySlice(array, 0, middle), comparefn),
    mergeSort(arraySlice(array, middle), comparefn),
    comparefn
  );
};

var insertionSort = function (array, comparefn) {
  var length = array.length;
  var i = 1;
  var element, j;

  while (i < length) {
    j = i;
    element = array[i];
    while (j && comparefn(array[j - 1], element) > 0) {
      array[j] = array[--j];
    }
    if (j !== i++) array[j] = element;
  } return array;
};

var merge = function (array, left, right, comparefn) {
  var llength = left.length;
  var rlength = right.length;
  var lindex = 0;
  var rindex = 0;

  while (lindex < llength || rindex < rlength) {
    array[lindex + rindex] = (lindex < llength && rindex < rlength)
      ? comparefn(left[lindex], right[rindex]) <= 0 ? left[lindex++] : right[rindex++]
      : lindex < llength ? left[lindex++] : right[rindex++];
  } return array;
};

var arraySort = mergeSort;

var userAgent$1 = engineUserAgent;

var firefox = userAgent$1.match(/firefox\/(\d+)/i);

var engineFfVersion = !!firefox && +firefox[1];

var UA = engineUserAgent;

var engineIsIeOrEdge = /MSIE|Trident/.test(UA);

var userAgent = engineUserAgent;

var webkit = userAgent.match(/AppleWebKit\/(\d+)\./);

var engineWebkitVersion = !!webkit && +webkit[1];

var $$a = _export;
var uncurryThis$3 = functionUncurryThis;
var aCallable$1 = aCallable$7;
var toObject$4 = toObject$i;
var lengthOfArrayLike$8 = lengthOfArrayLike$q;
var deletePropertyOrThrow$2 = deletePropertyOrThrow$4;
var toString = toString$7;
var fails = fails$u;
var internalSort = arraySort;
var arrayMethodIsStrict$2 = arrayMethodIsStrict$b;
var FF = engineFfVersion;
var IE_OR_EDGE = engineIsIeOrEdge;
var V8 = engineV8Version;
var WEBKIT = engineWebkitVersion;

var test = [];
var nativeSort = uncurryThis$3(test.sort);
var push$2 = uncurryThis$3(test.push);

// IE8-
var FAILS_ON_UNDEFINED = fails(function () {
  test.sort(undefined);
});
// V8 bug
var FAILS_ON_NULL = fails(function () {
  test.sort(null);
});
// Old WebKit
var STRICT_METHOD = arrayMethodIsStrict$2('sort');

var STABLE_SORT = !fails(function () {
  // feature detection can be too slow, so check engines versions
  if (V8) return V8 < 70;
  if (FF && FF > 3) return;
  if (IE_OR_EDGE) return true;
  if (WEBKIT) return WEBKIT < 603;

  var result = '';
  var code, chr, value, index;

  // generate an array with more 512 elements (Chakra and old V8 fails only in this case)
  for (code = 65; code < 76; code++) {
    chr = String.fromCharCode(code);

    switch (code) {
      case 66: case 69: case 70: case 72: value = 3; break;
      case 68: case 71: value = 4; break;
      default: value = 2;
    }

    for (index = 0; index < 47; index++) {
      test.push({ k: chr + index, v: value });
    }
  }

  test.sort(function (a, b) { return b.v - a.v; });

  for (index = 0; index < test.length; index++) {
    chr = test[index].k.charAt(0);
    if (result.charAt(result.length - 1) !== chr) result += chr;
  }

  return result !== 'DGBEFHACIJK';
});

var FORCED = FAILS_ON_UNDEFINED || !FAILS_ON_NULL || !STRICT_METHOD || !STABLE_SORT;

var getSortCompare = function (comparefn) {
  return function (x, y) {
    if (y === undefined) return -1;
    if (x === undefined) return 1;
    if (comparefn !== undefined) return +comparefn(x, y) || 0;
    return toString(x) > toString(y) ? 1 : -1;
  };
};

// `Array.prototype.sort` method
// https://tc39.es/ecma262/#sec-array.prototype.sort
$$a({ target: 'Array', proto: true, forced: FORCED }, {
  sort: function sort(comparefn) {
    if (comparefn !== undefined) aCallable$1(comparefn);

    var array = toObject$4(this);

    if (STABLE_SORT) return comparefn === undefined ? nativeSort(array) : nativeSort(array, comparefn);

    var items = [];
    var arrayLength = lengthOfArrayLike$8(array);
    var itemsLength, index;

    for (index = 0; index < arrayLength; index++) {
      if (index in array) push$2(items, array[index]);
    }

    internalSort(items, getSortCompare(comparefn));

    itemsLength = lengthOfArrayLike$8(items);
    index = 0;

    while (index < itemsLength) array[index] = items[index++];
    while (index < arrayLength) deletePropertyOrThrow$2(array, index++);

    return array;
  }
});

var setSpecies = setSpecies$2;

// `Array[@@species]` getter
// https://tc39.es/ecma262/#sec-get-array-@@species
setSpecies('Array');

var $$9 = _export;
var toObject$3 = toObject$i;
var toAbsoluteIndex$1 = toAbsoluteIndex$7;
var toIntegerOrInfinity$2 = toIntegerOrInfinity$c;
var lengthOfArrayLike$7 = lengthOfArrayLike$q;
var setArrayLength$1 = arraySetLength;
var doesNotExceedSafeInteger$2 = doesNotExceedSafeInteger$6;
var arraySpeciesCreate = arraySpeciesCreate$5;
var createProperty = createProperty$6;
var deletePropertyOrThrow$1 = deletePropertyOrThrow$4;
var arrayMethodHasSpeciesSupport = arrayMethodHasSpeciesSupport$5;

var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('splice');

var max$1 = Math.max;
var min$1 = Math.min;

// `Array.prototype.splice` method
// https://tc39.es/ecma262/#sec-array.prototype.splice
// with adding support of @@species
$$9({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT }, {
  splice: function splice(start, deleteCount /* , ...items */) {
    var O = toObject$3(this);
    var len = lengthOfArrayLike$7(O);
    var actualStart = toAbsoluteIndex$1(start, len);
    var argumentsLength = arguments.length;
    var insertCount, actualDeleteCount, A, k, from, to;
    if (argumentsLength === 0) {
      insertCount = actualDeleteCount = 0;
    } else if (argumentsLength === 1) {
      insertCount = 0;
      actualDeleteCount = len - actualStart;
    } else {
      insertCount = argumentsLength - 2;
      actualDeleteCount = min$1(max$1(toIntegerOrInfinity$2(deleteCount), 0), len - actualStart);
    }
    doesNotExceedSafeInteger$2(len + insertCount - actualDeleteCount);
    A = arraySpeciesCreate(O, actualDeleteCount);
    for (k = 0; k < actualDeleteCount; k++) {
      from = actualStart + k;
      if (from in O) createProperty(A, k, O[from]);
    }
    A.length = actualDeleteCount;
    if (insertCount < actualDeleteCount) {
      for (k = actualStart; k < len - actualDeleteCount; k++) {
        from = k + actualDeleteCount;
        to = k + insertCount;
        if (from in O) O[to] = O[from];
        else deletePropertyOrThrow$1(O, to);
      }
      for (k = len; k > len - actualDeleteCount + insertCount; k--) deletePropertyOrThrow$1(O, k - 1);
    } else if (insertCount > actualDeleteCount) {
      for (k = len - actualDeleteCount; k > actualStart; k--) {
        from = k + actualDeleteCount - 1;
        to = k + insertCount - 1;
        if (from in O) O[to] = O[from];
        else deletePropertyOrThrow$1(O, to);
      }
    }
    for (k = 0; k < insertCount; k++) {
      O[k + actualStart] = arguments[k + 2];
    }
    setArrayLength$1(O, len - actualDeleteCount + insertCount);
    return A;
  }
});

// this method was added to unscopables after implementation
// in popular engines, so it's moved to a separate module
var addToUnscopables$8 = addToUnscopables$i;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$8('flat');

// this method was added to unscopables after implementation
// in popular engines, so it's moved to a separate module
var addToUnscopables$7 = addToUnscopables$i;

// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
addToUnscopables$7('flatMap');

var $$8 = _export;
var toObject$2 = toObject$i;
var lengthOfArrayLike$6 = lengthOfArrayLike$q;
var setArrayLength = arraySetLength;
var deletePropertyOrThrow = deletePropertyOrThrow$4;
var doesNotExceedSafeInteger$1 = doesNotExceedSafeInteger$6;

// IE8-
var INCORRECT_RESULT = [].unshift(0) !== 1;

// V8 ~ Chrome < 71 and Safari <= 15.4, FF < 23 throws InternalError
var SILENT_ON_NON_WRITABLE_LENGTH = !function () {
  try {
    // eslint-disable-next-line es/no-object-defineproperty -- safe
    Object.defineProperty([], 'length', { writable: false }).unshift();
  } catch (error) {
    return error instanceof TypeError;
  }
}();

// `Array.prototype.unshift` method
// https://tc39.es/ecma262/#sec-array.prototype.unshift
$$8({ target: 'Array', proto: true, arity: 1, forced: INCORRECT_RESULT || SILENT_ON_NON_WRITABLE_LENGTH }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  unshift: function unshift(item) {
    var O = toObject$2(this);
    var len = lengthOfArrayLike$6(O);
    var argCount = arguments.length;
    if (argCount) {
      doesNotExceedSafeInteger$1(len + argCount);
      var k = len;
      while (k--) {
        var to = k + argCount;
        if (k in O) O[to] = O[k];
        else deletePropertyOrThrow(O, to);
      }
      for (var j = 0; j < argCount; j++) {
        O[j] = arguments[j];
      }
    } return setArrayLength(O, len + argCount);
  }
});

var path = path$4;

path.Array;

var lengthOfArrayLike$5 = lengthOfArrayLike$q;

var arrayFromConstructorAndList$2 = function (Constructor, list) {
  var index = 0;
  var length = lengthOfArrayLike$5(list);
  var result = new Constructor(length);
  while (length > index) result[index] = list[index++];
  return result;
};

var bind$1 = functionBindContext;
var uncurryThis$2 = functionUncurryThis;
var IndexedObject$1 = indexedObject;
var toObject$1 = toObject$i;
var toPropertyKey = toPropertyKey$4;
var lengthOfArrayLike$4 = lengthOfArrayLike$q;
var objectCreate = objectCreate$1;
var arrayFromConstructorAndList$1 = arrayFromConstructorAndList$2;

var $Array$4 = Array;
var push$1 = uncurryThis$2([].push);

var arrayGroup = function ($this, callbackfn, that, specificConstructor) {
  var O = toObject$1($this);
  var self = IndexedObject$1(O);
  var boundFunction = bind$1(callbackfn, that);
  var target = objectCreate(null);
  var length = lengthOfArrayLike$4(self);
  var index = 0;
  var Constructor, key, value;
  for (;length > index; index++) {
    value = self[index];
    key = toPropertyKey(boundFunction(value, index, O));
    // in some IE10 builds, `hasOwnProperty` returns incorrect result on integer keys
    // but since it's a `null` prototype object, we can safely use `in`
    if (key in target) push$1(target[key], value);
    else target[key] = [value];
  }
  // TODO: Remove this block from `core-js@4`
  if (specificConstructor) {
    Constructor = specificConstructor(O);
    if (Constructor !== $Array$4) {
      for (key in target) target[key] = arrayFromConstructorAndList$1(Constructor, target[key]);
    }
  } return target;
};

var $$7 = _export;
var $group$1 = arrayGroup;
var addToUnscopables$6 = addToUnscopables$i;

// `Array.prototype.group` method
// https://github.com/tc39/proposal-array-grouping
$$7({ target: 'Array', proto: true }, {
  group: function group(callbackfn /* , thisArg */) {
    var thisArg = arguments.length > 1 ? arguments[1] : undefined;
    return $group$1(this, callbackfn, thisArg);
  }
});

addToUnscopables$6('group');

// TODO: Remove from `core-js@4`
var $$6 = _export;
var $group = arrayGroup;
var arrayMethodIsStrict$1 = arrayMethodIsStrict$b;
var addToUnscopables$5 = addToUnscopables$i;

// `Array.prototype.groupBy` method
// https://github.com/tc39/proposal-array-grouping
// https://bugs.webkit.org/show_bug.cgi?id=236541
$$6({ target: 'Array', proto: true, forced: !arrayMethodIsStrict$1('groupBy') }, {
  groupBy: function groupBy(callbackfn /* , thisArg */) {
    var thisArg = arguments.length > 1 ? arguments[1] : undefined;
    return $group(this, callbackfn, thisArg);
  }
});

addToUnscopables$5('groupBy');

var getBuiltIn = getBuiltIn$7;
var bind = functionBindContext;
var uncurryThis$1 = functionUncurryThis;
var IndexedObject = indexedObject;
var toObject = toObject$i;
var lengthOfArrayLike$3 = lengthOfArrayLike$q;

var Map$1 = getBuiltIn('Map');
var MapPrototype = Map$1.prototype;
var mapGet = uncurryThis$1(MapPrototype.get);
var mapHas = uncurryThis$1(MapPrototype.has);
var mapSet = uncurryThis$1(MapPrototype.set);
var push = uncurryThis$1([].push);

// `Array.prototype.groupToMap` method
// https://github.com/tc39/proposal-array-grouping
var arrayGroupToMap = function groupToMap(callbackfn /* , thisArg */) {
  var O = toObject(this);
  var self = IndexedObject(O);
  var boundFunction = bind(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  var map = new Map$1();
  var length = lengthOfArrayLike$3(self);
  var index = 0;
  var key, value;
  for (;length > index; index++) {
    value = self[index];
    key = boundFunction(value, index, O);
    if (mapHas(map, key)) push(mapGet(map, key), value);
    else mapSet(map, key, [value]);
  } return map;
};

// TODO: Remove from `core-js@4`
var $$5 = _export;
var arrayMethodIsStrict = arrayMethodIsStrict$b;
var addToUnscopables$4 = addToUnscopables$i;
var $groupToMap$1 = arrayGroupToMap;

// `Array.prototype.groupByToMap` method
// https://github.com/tc39/proposal-array-grouping
// https://bugs.webkit.org/show_bug.cgi?id=236541
$$5({ target: 'Array', proto: true, name: 'groupToMap', forced: !arrayMethodIsStrict('groupByToMap') }, {
  groupByToMap: $groupToMap$1
});

addToUnscopables$4('groupByToMap');

var $$4 = _export;
var addToUnscopables$3 = addToUnscopables$i;
var $groupToMap = arrayGroupToMap;
var IS_PURE = isPure;

// `Array.prototype.groupToMap` method
// https://github.com/tc39/proposal-array-grouping
$$4({ target: 'Array', proto: true, forced: IS_PURE }, {
  groupToMap: $groupToMap
});

addToUnscopables$3('groupToMap');

var lengthOfArrayLike$2 = lengthOfArrayLike$q;

// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.toReversed
// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.toReversed
var arrayToReversed$1 = function (O, C) {
  var len = lengthOfArrayLike$2(O);
  var A = new C(len);
  var k = 0;
  for (; k < len; k++) A[k] = O[len - k - 1];
  return A;
};

var $$3 = _export;
var arrayToReversed = arrayToReversed$1;
var toIndexedObject$3 = toIndexedObject$d;
var addToUnscopables$2 = addToUnscopables$i;

var $Array$3 = Array;

// `Array.prototype.toReversed` method
// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.toReversed
$$3({ target: 'Array', proto: true }, {
  toReversed: function toReversed() {
    return arrayToReversed(toIndexedObject$3(this), $Array$3);
  }
});

addToUnscopables$2('toReversed');

var global$1 = global$j;

var entryVirtual = function (CONSTRUCTOR) {
  return global$1[CONSTRUCTOR].prototype;
};

var $$2 = _export;
var uncurryThis = functionUncurryThis;
var aCallable = aCallable$7;
var toIndexedObject$2 = toIndexedObject$d;
var arrayFromConstructorAndList = arrayFromConstructorAndList$2;
var getVirtual = entryVirtual;
var addToUnscopables$1 = addToUnscopables$i;

var $Array$2 = Array;
var sort = uncurryThis(getVirtual('Array').sort);

// `Array.prototype.toSorted` method
// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.toSorted
$$2({ target: 'Array', proto: true }, {
  toSorted: function toSorted(compareFn) {
    if (compareFn !== undefined) aCallable(compareFn);
    var O = toIndexedObject$2(this);
    var A = arrayFromConstructorAndList($Array$2, O);
    return sort(A, compareFn);
  }
});

addToUnscopables$1('toSorted');

var $$1 = _export;
var addToUnscopables = addToUnscopables$i;
var doesNotExceedSafeInteger = doesNotExceedSafeInteger$6;
var lengthOfArrayLike$1 = lengthOfArrayLike$q;
var toAbsoluteIndex = toAbsoluteIndex$7;
var toIndexedObject$1 = toIndexedObject$d;
var toIntegerOrInfinity$1 = toIntegerOrInfinity$c;

var $Array$1 = Array;
var max = Math.max;
var min = Math.min;

// `Array.prototype.toSpliced` method
// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.toSpliced
$$1({ target: 'Array', proto: true }, {
  toSpliced: function toSpliced(start, deleteCount /* , ...items */) {
    var O = toIndexedObject$1(this);
    var len = lengthOfArrayLike$1(O);
    var actualStart = toAbsoluteIndex(start, len);
    var argumentsLength = arguments.length;
    var k = 0;
    var insertCount, actualDeleteCount, newLen, A;
    if (argumentsLength === 0) {
      insertCount = actualDeleteCount = 0;
    } else if (argumentsLength === 1) {
      insertCount = 0;
      actualDeleteCount = len - actualStart;
    } else {
      insertCount = argumentsLength - 2;
      actualDeleteCount = min(max(toIntegerOrInfinity$1(deleteCount), 0), len - actualStart);
    }
    newLen = doesNotExceedSafeInteger(len + insertCount - actualDeleteCount);
    A = $Array$1(newLen);

    for (; k < actualStart; k++) A[k] = O[k];
    for (; k < actualStart + insertCount; k++) A[k] = arguments[k - actualStart + 2];
    for (; k < newLen; k++) A[k] = O[k + actualDeleteCount - insertCount];

    return A;
  }
});

addToUnscopables('toSpliced');

var lengthOfArrayLike = lengthOfArrayLike$q;
var toIntegerOrInfinity = toIntegerOrInfinity$c;

var $RangeError = RangeError;

// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.with
// https://tc39.es/proposal-change-array-by-copy/#sec-%typedarray%.prototype.with
var arrayWith$1 = function (O, C, index, value) {
  var len = lengthOfArrayLike(O);
  var relativeIndex = toIntegerOrInfinity(index);
  var actualIndex = relativeIndex < 0 ? len + relativeIndex : relativeIndex;
  if (actualIndex >= len || actualIndex < 0) throw $RangeError('Incorrect index');
  var A = new C(len);
  var k = 0;
  for (; k < len; k++) A[k] = k === actualIndex ? value : O[k];
  return A;
};

var $ = _export;
var arrayWith = arrayWith$1;
var toIndexedObject = toIndexedObject$d;

var $Array = Array;

// `Array.prototype.with` method
// https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.with
$({ target: 'Array', proto: true }, {
  'with': function (index, value) {
    return arrayWith(toIndexedObject(this), $Array, index, value);
  }
});

var BLACK = 0x000000;
var ORANGE = 0xFFA500;
var DARK_GREEN = 0x023020;
var RED = 0xff0000;

var XoneK2 = /** @class */ (function () {
    function XoneK2() {
        var _a;
        this.midiWatchers = new Map();
        this.subscriptionToMidiId = new Map();
        this.colors = new ColorMapper((_a = {},
            _a[BLACK] = -1,
            _a[RED] = 0,
            _a[ORANGE] = 36,
            _a[DARK_GREEN] = 72,
            _a));
    }
    XoneK2.prototype.init = function () {
        this.clearButtons();
        this.resetSubscriptions();
    };
    XoneK2.prototype.shutdown = function () {
        this.clearButtons();
        this.resetSubscriptions();
    };
    XoneK2.prototype.clearButtons = function () {
        for (var x = 0; x < 4; x++) {
            for (var y = 0; y < 4; y++) {
                this.changeBottomButtonLightColor(x, y, BLACK);
                this.changeTopButtonLightColor(x, y, BLACK);
            }
        }
        this.changeExitSetupButtonColor(BLACK);
        this.changeLayerButtonColor(BLACK);
    };
    XoneK2.prototype.resetSubscriptions = function () {
        this.midiWatchers = new Map();
        this.subscriptionToMidiId = new Map();
        for (var i = 0; i < 100; i++) {
            var midiObject = this.getMidiControl(i);
            if (midiObject) {
                this.midiWatchers.set(midiObject.toString(), new Map());
            }
        }
    };
    XoneK2.prototype.midiControlChanged = function (midiNumber, event) {
        var control = this.getMidiControl(midiNumber);
        this.midiWatchers.get(control.toString()).forEach(function (callback) {
            if (callback) {
                callback(event);
            }
        });
    };
    XoneK2.prototype.watchMidiControl = function (control, callback) {
        var subscriptionId = Math.random();
        this.midiWatchers.get(control.toString()).set(subscriptionId, callback);
        this.subscriptionToMidiId.set(subscriptionId, control.toString());
        return subscriptionId;
    };
    XoneK2.prototype.stopWatchingMidiControl = function (subscriptionId) {
        this.midiWatchers.get(this.subscriptionToMidiId.get(subscriptionId))
            .set(subscriptionId, undefined);
    };
    XoneK2.prototype.changeTopButtonLightColor = function (x, y, color) {
        this.changeButtonColor(y * 4 + x + 40, color);
    };
    XoneK2.prototype.changeBottomButtonLightColor = function (x, y, color) {
        this.changeButtonColor(y * 4 + x + 24, color);
    };
    XoneK2.prototype.changeLayerButtonColor = function (color) {
        if (color == RED) {
            midi.sendShortMsg(0x9B, 12, 0x0F);
        }
        else if (color == ORANGE) {
            midi.sendShortMsg(0x9B, 16, 0x0F);
        }
        else if (color == DARK_GREEN) {
            midi.sendShortMsg(0x9B, 20, 0x0F);
        }
        else if (color == BLACK) {
            midi.sendShortMsg(0x8B, 12, 0x0F);
        }
    };
    XoneK2.prototype.changeExitSetupButtonColor = function (color) {
        if (color == RED) {
            midi.sendShortMsg(0x9B, 15, 0x0F);
        }
        else if (color == ORANGE) {
            midi.sendShortMsg(0x9B, 19, 0x0F);
        }
        else if (color == DARK_GREEN) {
            midi.sendShortMsg(0x9B, 23, 0x0F);
        }
        else if (color == BLACK) {
            midi.sendShortMsg(0x8B, 15, 0x0F);
        }
    };
    XoneK2.prototype.changeButtonColor = function (midiNumber, color) {
        if (color == BLACK) {
            midi.sendShortMsg(0x8B, midiNumber, 0x0F);
        }
        else {
            midi.sendShortMsg(0x9B, midiNumber + this.colors.getValueForNearestColor(color), 0x0F);
        }
    };
    XoneK2.prototype.getMidiControl = function (midiNumber) {
        var midiInfo;
        if (midiNumber == 21 || midiNumber == 20) {
            midiInfo = new ControlInfo(ControlType.ENCODER_BOTTOM_TURN, midiNumber - 20, 0);
            // Bottom Encoders
        }
        else if (midiNumber >= 24 && midiNumber <= 39) {
            midiInfo = new ControlInfo(ControlType.BUTTON_BOTTOM, (midiNumber - 24) % 4, Math.floor((midiNumber - 24) / 4));
            // Bottom Button
        }
        else if (midiNumber == 65) {
            midiInfo = new ControlInfo(ControlType.SETUP_BUTTON, 0, 0);
        }
        else if (midiNumber == 62) {
            midiInfo = new ControlInfo(ControlType.LAYER_BUTTON, 0, 0);
            // Very bottom button DUPE
        }
        else if (midiNumber >= 16 && midiNumber <= 19) {
            midiInfo = new ControlInfo(ControlType.FADER, midiNumber - 16, 0);
            // Faders
        }
        else if (midiNumber >= 40 && midiNumber <= 51) {
            midiInfo = new ControlInfo(ControlType.BUTTON_TOP, (midiNumber - 40) % 4, Math.floor((midiNumber - 40) / 4));
            // Top buttoms
        }
        else if (midiNumber >= 4 && midiNumber <= 15) {
            midiInfo = new ControlInfo(ControlType.KNOB, (midiNumber - 4) % 4, 2 - Math.floor((midiNumber - 4) / 4));
            // Knobs
        }
        else if (midiNumber >= 0 && midiNumber <= 3) {
            midiInfo = new ControlInfo(ControlType.ENCODER_TOP_TURN, midiNumber, 0);
            // Top encoders
        }
        else if (midiNumber == 63 || midiNumber == 64) {
            midiInfo = new ControlInfo(ControlType.ENCODER_BOTTOM_PRESS, midiNumber - 63, 0);
        }
        else if (midiNumber >= 52 && midiNumber <= 55) {
            midiInfo = new ControlInfo(ControlType.ENCODER_TOP_PRESS, midiNumber - 52, 0);
        }
        return midiInfo;
    };
    return XoneK2;
}());
var ControlInfo = /** @class */ (function () {
    function ControlInfo(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
    }
    ControlInfo.prototype.toString = function () {
        return this.type + " " + this.x + " " + this.y;
    };
    return ControlInfo;
}());
var ControlType;
(function (ControlType) {
    ControlType[ControlType["BUTTON_TOP"] = 0] = "BUTTON_TOP";
    ControlType[ControlType["BUTTON_BOTTOM"] = 1] = "BUTTON_BOTTOM";
    ControlType[ControlType["KNOB"] = 2] = "KNOB";
    ControlType[ControlType["LAYER_BUTTON"] = 3] = "LAYER_BUTTON";
    ControlType[ControlType["SETUP_BUTTON"] = 4] = "SETUP_BUTTON";
    ControlType[ControlType["ENCODER_TOP_TURN"] = 5] = "ENCODER_TOP_TURN";
    ControlType[ControlType["ENCODER_BOTTOM_TURN"] = 6] = "ENCODER_BOTTOM_TURN";
    ControlType[ControlType["ENCODER_TOP_PRESS"] = 7] = "ENCODER_TOP_PRESS";
    ControlType[ControlType["ENCODER_BOTTOM_PRESS"] = 8] = "ENCODER_BOTTOM_PRESS";
    ControlType[ControlType["FADER"] = 9] = "FADER";
})(ControlType || (ControlType = {}));
var ButtonStatus;
(function (ButtonStatus) {
    ButtonStatus[ButtonStatus["UNPRESSED"] = 0] = "UNPRESSED";
    ButtonStatus[ButtonStatus["PRESSED"] = 127] = "PRESSED";
})(ButtonStatus || (ButtonStatus = {}));
var EncoderTurn;
(function (EncoderTurn) {
    EncoderTurn[EncoderTurn["CLOCKWISE"] = 1] = "CLOCKWISE";
    EncoderTurn[EncoderTurn["COUNTER_CLOCKWISE"] = 127] = "COUNTER_CLOCKWISE";
})(EncoderTurn || (EncoderTurn = {}));
var EncoderPress;
(function (EncoderPress) {
    EncoderPress[EncoderPress["PRESS_DOWN"] = 127] = "PRESS_DOWN";
    EncoderPress[EncoderPress["RELEASE"] = 0] = "RELEASE";
})(EncoderPress || (EncoderPress = {}));

var XoneK2Mapping = /** @class */ (function () {
    function XoneK2Mapping(xonek2, mixxx) {
        this.xonek2 = xonek2;
        this.mixxx = mixxx;
        this.mixxxSubscriptions = new Array();
        this.midiSubscriptions = new Array();
        this.bpmSliderTimerCount = 0;
    }
    XoneK2Mapping.prototype.initMapping = function () {
        for (var i = 1; i <= 4; i++) {
            this.configureDeckMapping(i);
        }
        this.configureForTrackSelector();
    };
    XoneK2Mapping.prototype.stopMapping = function () {
        if (this.bpmSliderTimer) {
            engine.stopTimer(this.bpmSliderTimer);
        }
    };
    XoneK2Mapping.prototype.configureDeckMapping = function (deck) {
        this.configureFaderMapping(deck);
        this.configureXEqMapping(deck, 1);
        this.configureXEqMapping(deck, 2);
        this.configureXEqMapping(deck, 3);
        this.configureForSyncMapping(deck);
        this.xonek2.changeTopButtonLightColor(this.getXFromDeck(deck), 1, DARK_GREEN);
        this.configureForTempTempoChange(deck);
        this.configureForKeylock(deck);
        this.configureForHeadphoneCueMapping(deck);
    };
    XoneK2Mapping.prototype.configureFaderMapping = function (deck) {
        var _this = this;
        var control = new ControlInfo(ControlType.FADER, this.getXFromDeck(deck), 0);
        var xoneK2Subscription = this.xonek2.watchMidiControl(control, function (event) {
            _this.mixxx.setFaderLevel(deck, event / 127);
        });
        this.midiSubscriptions.push(xoneK2Subscription);
    };
    XoneK2Mapping.prototype.configureXEqMapping = function (deck, eq) {
        var _this = this;
        var control = new ControlInfo(ControlType.KNOB, this.getXFromDeck(deck), eq - 1);
        var xoneK2Subscription = this.xonek2.watchMidiControl(control, function (event) {
            _this.mixxx.setXEqLevel(deck, event / 127, eq);
        });
        this.midiSubscriptions.push(xoneK2Subscription);
    };
    XoneK2Mapping.prototype.configureForSyncMapping = function (deck) {
        var _this = this;
        var control = new ControlInfo(ControlType.BUTTON_TOP, this.getXFromDeck(deck), 1);
        var xoneK2Subscription = this.xonek2.watchMidiControl(control, function (event) {
            if (event == 127) {
                if (_this.mixxx.isSyncEnabledOnDeck(deck)) {
                    _this.shiftTrackBpm(deck);
                }
                else {
                    _this.mixxx.enableSyncOnDeck(deck);
                }
            }
        });
        var mixxxSubscriptions = this.mixxx.subscribeToSyncMode(deck, function (mode) {
            if (mode === 0) {
                _this.xonek2.changeTopButtonLightColor(_this.getXFromDeck(deck), 1, DARK_GREEN);
            }
            else if (mode === 1) {
                _this.xonek2.changeTopButtonLightColor(_this.getXFromDeck(deck), 1, RED);
            }
            else if (mode === 2) {
                _this.xonek2.changeTopButtonLightColor(_this.getXFromDeck(deck), 1, ORANGE);
            }
        });
        this.midiSubscriptions.push(xoneK2Subscription);
        this.mixxxSubscriptions.push(mixxxSubscriptions);
    };
    XoneK2Mapping.prototype.shiftTrackBpm = function (deck) {
        var _this = this;
        var currentBpm = this.mixxx.getDeckCurrentBpm(deck);
        var originalBpm = this.mixxx.getDeckOriginalBpm(deck);
        var percentDiff = (originalBpm - currentBpm) / currentBpm;
        if (!this.checkForBpmShiftCompletion(deck)) {
            var direction;
            if (percentDiff < 0) {
                direction = "down";
            }
            else {
                direction = "up";
            }
            var desiredTimeInBars = 32 / Math.pow(2, this.bpmSliderTimerCount);
            var desiredTime = desiredTimeInBars / originalBpm * 60;
            var neededIntervals = Math.abs(Math.round(currentBpm - originalBpm) / 0.1);
            if (this.bpmSliderTimer) {
                engine.stopTimer(this.bpmSliderTimer);
            }
            this.bpmSliderTimer = engine.beginTimer(desiredTime / neededIntervals * 1000, function () {
                if (_this.checkForBpmShiftCompletion(deck)) {
                    return;
                }
                _this.mixxx.changeDeckRateSmall(deck, direction);
            });
            this.bpmSliderTimerCount++;
        }
    };
    XoneK2Mapping.prototype.checkForBpmShiftCompletion = function (deck) {
        var currentBpm = this.mixxx.getDeckCurrentBpm(deck);
        var originalBpm = this.mixxx.getDeckOriginalBpm(deck);
        var percentDiff = (originalBpm - currentBpm) / currentBpm;
        var absolutePercentDiff = Math.abs(percentDiff);
        if (absolutePercentDiff < 0.01) {
            this.mixxx.setDeckToDefaultBpm(deck);
            if (this.bpmSliderTimer) {
                engine.stopTimer(this.bpmSliderTimer);
            }
            this.bpmSliderTimer = undefined;
            this.bpmSliderTimerCount = 0;
            return true;
        }
        return false;
    };
    XoneK2Mapping.prototype.configureForKeylock = function (deck) {
        var _this = this;
        var button = new ControlInfo(ControlType.BUTTON_TOP, this.getXFromDeck(deck), 2);
        var xonek2Subscription = this.xonek2.watchMidiControl(button, function (value) {
            if (value === 127) {
                _this.mixxx.toggleKeyLock(deck);
            }
        });
        var mixxxSubscriptions = this.mixxx.subscribeToKeylock(deck, function (isEnabled) {
            if (isEnabled) {
                _this.xonek2.changeTopButtonLightColor(_this.getXFromDeck(deck), 2, RED);
            }
            else {
                _this.xonek2.changeTopButtonLightColor(_this.getXFromDeck(deck), 2, DARK_GREEN);
            }
        });
        this.midiSubscriptions.push(xonek2Subscription);
        this.mixxxSubscriptions.push(mixxxSubscriptions);
    };
    XoneK2Mapping.prototype.configureForTempTempoChange = function (deck) {
        var _this = this;
        var encoderTurn = new ControlInfo(ControlType.ENCODER_TOP_TURN, this.getXFromDeck(deck), 0);
        var xonek2Subscription = this.xonek2.watchMidiControl(encoderTurn, function (value) {
            var speedDirection;
            var jumpDirection;
            if (value === EncoderTurn.CLOCKWISE) {
                speedDirection = "up";
                jumpDirection = "forward";
            }
            else if (value === EncoderTurn.COUNTER_CLOCKWISE) {
                speedDirection = "down";
                jumpDirection = "backward";
            }
            if (_this.mixxx.isDeckPlaying(deck)) {
                _this.mixxx.tempBeatShiftDirection(deck, speedDirection);
            }
            else {
                _this.mixxx.beatjump(deck, 1, jumpDirection);
            }
        });
        this.midiSubscriptions.push(xonek2Subscription);
    };
    XoneK2Mapping.prototype.configureForTrackSelector = function () {
        var _this = this;
        var encoderLeftTurn = new ControlInfo(ControlType.ENCODER_BOTTOM_TURN, 0, 0);
        var encoderLeftPress = new ControlInfo(ControlType.ENCODER_BOTTOM_PRESS, 0, 0);
        var encoderRightTurn = new ControlInfo(ControlType.ENCODER_BOTTOM_TURN, 1, 0);
        var encoderRightPress = new ControlInfo(ControlType.ENCODER_BOTTOM_PRESS, 1, 0);
        var rightDoublePressTimer = undefined;
        this.midiSubscriptions.push(this.xonek2.watchMidiControl(encoderLeftPress, function (event) {
        }));
        this.midiSubscriptions.push(this.xonek2.watchMidiControl(encoderLeftTurn, function (event) {
            if (event === EncoderTurn.CLOCKWISE) {
                _this.mixxx.moveFocusDirection(1);
            }
            else {
                _this.mixxx.moveFocusDirection(-1);
            }
        }));
        this.midiSubscriptions.push(this.xonek2.watchMidiControl(encoderRightPress, function (event) {
            if (event === EncoderPress.PRESS_DOWN) {
                if (rightDoublePressTimer) {
                    engine.stopTimer(rightDoublePressTimer);
                    rightDoublePressTimer = undefined;
                    _this.mixxx.closeFolder();
                    return;
                }
                rightDoublePressTimer = engine.beginTimer(500, function () {
                    rightDoublePressTimer = undefined;
                    _this.mixxx.openFolder();
                }, 1);
            }
        }));
        this.midiSubscriptions.push(this.xonek2.watchMidiControl(encoderRightTurn, function (event) {
            if (event === EncoderTurn.CLOCKWISE) {
                _this.mixxx.navigateLibraryDirection(1);
            }
            else {
                _this.mixxx.navigateLibraryDirection(-1);
            }
        }));
        var _loop_1 = function (deck) {
            this_1.xonek2.changeBottomButtonLightColor(this_1.getXFromDeck(deck), 0, DARK_GREEN);
            buttonControl = new ControlInfo(ControlType.BUTTON_BOTTOM, this_1.getXFromDeck(deck), 0);
            this_1.midiSubscriptions.push(this_1.xonek2.watchMidiControl(buttonControl, function (event) {
                if (event === ButtonStatus.PRESSED) {
                    _this.mixxx.loadTrack(deck);
                    _this.xonek2.changeBottomButtonLightColor(_this.getXFromDeck(deck), 0, RED);
                    engine.beginTimer(1000, function () {
                        _this.xonek2.changeBottomButtonLightColor(_this.getXFromDeck(deck), 0, DARK_GREEN);
                    }, 1);
                }
            }));
        };
        var this_1 = this, buttonControl;
        for (var deck = 1; deck <= 4; deck++) {
            _loop_1(deck);
        }
    };
    XoneK2Mapping.prototype.configureForHeadphoneCueMapping = function (deck) {
        var _this = this;
        var button = new ControlInfo(ControlType.BUTTON_TOP, this.getXFromDeck(deck), 0);
        var xonek2Subscription = this.xonek2.watchMidiControl(button, function (value) {
            if (value === 127) {
                _this.mixxx.toggleHeadphoneCueEnabled(deck);
            }
        });
        this.xonek2.changeTopButtonLightColor(this.getXFromDeck(deck), 0, DARK_GREEN);
        var mixxxSubscriptions = this.mixxx.subscribeToHeadphoneCueEnabled(deck, function (isEnabled) {
            if (isEnabled) {
                _this.xonek2.changeTopButtonLightColor(_this.getXFromDeck(deck), 0, RED);
            }
            else {
                _this.xonek2.changeTopButtonLightColor(_this.getXFromDeck(deck), 0, DARK_GREEN);
            }
        });
        this.midiSubscriptions.push(xonek2Subscription);
        this.mixxxSubscriptions.push(mixxxSubscriptions);
    };
    XoneK2Mapping.prototype.getXFromDeck = function (deck) {
        if (deck == 1) {
            return 1;
        }
        else if (deck == 2) {
            return 2;
        }
        else if (deck == 3) {
            return 0;
        }
        else if (deck == 4) {
            return 3;
        }
    };
    return XoneK2Mapping;
}());

// eslint-disable-next-line no-var
var mixxx = new Mixxx();
var xonek2 = new XoneK2();
var mapping = new XoneK2Mapping(xonek2, mixxx);
var MyXoneK2 = {
    init: function (id, debugging) {
        xonek2.init();
        mapping.initMapping();
    },
    shutdown: function () {
        xonek2.shutdown();
        mapping.stopMapping();
    },
    midiSignal: function (channel, control, value, status, group) {
        var realControl = Number.parseInt(control);
        if (Number.parseInt(control) == 15 || Number.parseInt(control) == 12
            || Number.parseInt(control) == 13 || Number.parseInt(control) == 14) {
            if (Number.parseInt(status) == 155 || Number.parseInt(status) == 139) {
                realControl += 50;
            }
        }
        xonek2.midiControlChanged(realControl, value);
    }
};
if (module$1) {
    module$1.exports = MyXoneK2;
}
var module$1 = {};
/** Processes:
1. Button pressed -> do something in Mixxx
2. Mixxx changes output -> change a LED

----

Functions:
1. Play/pause
2. Queue button (blinking light when set)
5. Deck swapping
3. Slip loops
4. Toggle decks
6. Hot-cues + colors
13. Stop auto-unloop on normal mode

7. Rewind button
8. Beatjump??
9. Mute button with fade??
10. Slide BPM to track with pace
11. Toggle slip
12: Toggle loop colors based on slip

Xone K2;
4. Sync features

---
Broad Functionality:
1. Easy config A/B testing



**/
