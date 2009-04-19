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
 * and other provisions required bupdy the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK *****/

var settings = function(){
  this.load();
}

settings.prototype = {
  prefsWatcher: null,
  prefService: null,
  prefs: null,
 
  lastfmUser: null,
  lastfmPasswd: null,
  listenDeezer: null,
  sendLastfm: null,
  showOnStatusBar: null,
  
  load: function(){
    /* initialization of user properties */
    var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                          .getService(Components.interfaces.nsIPrefService);
    this.prefs = prefService.getBranch("extensions.das.");
    
    this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
		this.prefs.addObserver("", this, false);


    this.lastfmUser = this.prefs.getCharPref("lastfmUser");
    this.lastfmPasswd = this.prefs.getCharPref("lastfmPasswd");
    this.listenDeezer = this.prefs.getBoolPref("listenDeezer");
    this.sendLastfm = this.prefs.getBoolPref("sendLastfm");
    this.showOnStatusBar = this.prefs.getBoolPref("showOnStatusBar");
    
    display.dump('settings loaded');
  },
  
  unload: function(){
    this.prefs.removeObserver("extension.das.", this);
  },
  
  observe: function(link, event, data){
    if(event != "nsPref:changed") 
      return;
      
    switch(data){
      case "lastfmUser":
        this.lastfmUser = this.prefs.getCharPref("lastfmUser");
        lastfm.reconnect(this.lastfmUser, this.lastfmPasswd);
        break;
      case "lastfmPasswd":
        this.lastfmPasswd = this.prefs.getCharPref("lastfmPasswd");
        lastfm.reconnect(this.lastfmUser, this.lastfmPasswd);
        break;
      case "listenDeezer":
        this.listenDeezer = this.prefs.getBoolPref("listenDeezer");
        if(!this.listenDeezer)
          display.statusmsg('DAS');
        break;
      case "sendLastfm":
        this.sendLastfm = this.prefs.getBoolPref("sendLastfm");
        if(this.sendLastfm)
          lastfm.connect();
        else
          lastfm.disconnect();
        break;
      case "showOnStatusBar":
        this.showOnStatusBar = this.prefs.getBoolPref("showOnStatusBar");
        if(this.showOnStatusBar)
          display.statusmsgshow();
        else
          display.statusmsghide();
        break;
    }
  },

  commit: function(key, value, type){
    display.dump('changing pref '+key+': '+value);
    switch(type){
      case "Bool":
        this.prefs.setBoolPref(key, value);
        break;
      default:
        this.prefs.setCharPref(key, value);
        break;
    }
  },
  
  applyxul: function(){
    eltlist = {"listenDeezer":"", "sendLastfm":"", "showOnStatusBar":""};
    for(elt in eltlist){
      document.getElementById(elt).setAttribute("checked", this[elt]);
    }
  }
}

var showprefswindow = function(){
  var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                          .getService(Components.interfaces.nsIPromptService);
  username = {value: prefs.lastfmUser};
  passwd = {value: prefs.lastfmPasswd};
  check = {value:false};
  action = prompts.promptUsernameAndPassword(window, 'DAS preferences', 'Last.FM Account', username, passwd, null, check);

  return {'user': username.value, 'passwd':passwd.value, 'action': action};
}

var updateprefs = function(argv){
  if(argv['action'] != true)
    return;
  
  if(argv['user'] != prefs.lastfmUser)
    prefs.commit("lastfmUser", argv['user'], "Char");
    
  if(argv['passwd'] != prefs.lastfmPasswd)
    prefs.commit("lastfmPasswd", argv['passwd'], "Char");
}

 
var tooglepref = function(target){
  if(!prefs)
    return;
  
  prefs[target] = !prefs[target];
  prefs.commit(target, prefs[target], "Bool");
  prefs.applyxul();
}
