/***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Deezer AudioScrobbler.
 *
 * The Initial Developer of the Original Code is Manuel Vonthron
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *  - Manuel Vonthron <manuel.vonthron@acadis.org>, 2009
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK *****/

var display = {
  /* available icons in /skin */
  icons: {'DEFAULT': 'das-default.png',
          'NOTCONNECTED': 'das-error.png', 
          'CONNECTED': 'das-connected.png',
          'SENDING': 'das-sending.png',
          '':''
         },

  msg: "",
  
  dump: function(msg){
    Components.classes["@mozilla.org/consoleservice;1"]
      .getService(Components.interfaces.nsIConsoleService)
        .logStringMessage("DAS: " + msg);
  },

  statusmsg: function(_msg){
    this.msg = _msg;
    if(prefs.showOnStatusBar)
      document.getElementById('das-statusmsg').value = to_utf8(this.msg);
  },
  statusmsghide: function(){ document.getElementById('das-statusmsg').value = ""; },
  statusmsgshow: function(){ document.getElementById('das-statusmsg').value = to_utf8(this.msg); },
  
  statusicon: function(icon){
    if(!icon in this.icons)
      return;
    document.getElementById('das-statusicon').src = 'chrome://das/skin/'+this.icons[icon];
  }
}


/**
 * XMLHttpRequest manager
 */
var _XHR = {
  get: function(url, callback){
    var xhr = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]  
                .createInstance(Components.interfaces.nsIXMLHttpRequest);
    xhr.open('GET', url);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('User-Agent', 'das@dev.acadis.org');
    xhr.send(data);
    xhr.onreadystatechange = callback;
  },
  
  post: function(url, data, callback){
    var xhr = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]  
                .createInstance(Components.interfaces.nsIXMLHttpRequest);
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('User-Agent', 'das@dev.acadis.org');
    xhr.send(data);
    xhr.onreadystatechange = callback;
  }
}

/**
 * MD5 hash shorcut from the example at http://developer.mozilla.org/
 * @see nsICryptoHash
 */
var hash_md5 = function(str){
  var converter =
    Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
      createInstance(Components.interfaces.nsIScriptableUnicodeConverter);

  // we use UTF-8 here, you can choose other encodings.
  converter.charset = "UTF-8";
  // result is an out parameter,
  // result.value will contain the array length
  var result = {};
  // data is an array of bytes
  var data = converter.convertToByteArray(str, result);
  var ch = Components.classes["@mozilla.org/security/hash;1"]
                     .createInstance(Components.interfaces.nsICryptoHash);
  ch.init(ch.MD5);
  ch.update(data, data.length);
  var hash = ch.finish(false);

  // return the two-digit hexadecimal code for a byte
  function toHexString(charCode){
    return ("0" + charCode.toString(16)).slice(-2);
  }

  // convert the binary hash data to a hex string.
  var s = [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");

  return s.substring(0, 32);
}

var get_unix_ts = function(){
  return new Date().getTime().toString().substring(0, 10);
}

var track = function(artist, album, title){
  this.artist = (artist || '');
  this.album = (album || '');
  this.title = (title || '');

  this.startTime = get_unix_ts();
  this.sent = false;
}

/**
 * Tip by Daniel Glazman
 */
var to_utf8 = function(str){
  var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
                    .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
  converter.charset = "utf-8" ;

  return converter.ConvertToUnicode(str);
}

var from_utf8 = function(str){
  var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
                    .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
  converter.charset = "utf-8" ;

  return converter.ConvertFromUnicode(str);
}


var about = function(){
  var extensionManager = Components.classes["@mozilla.org/extensions/manager;1"]
                          .getService(Components.interfaces.nsIExtensionManager);
  openDialog("chrome://mozapps/content/extensions/about.xul",
              "", "chrome,centerscreen,modal",
              "urn:mozilla:item:das@dev.acadis.org",
              extensionManager.datasource);
}
