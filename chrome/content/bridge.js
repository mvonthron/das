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

if(!org) var org;

var org.acadis.das = {
  /* nsIPrefsService */
  prefs: null,
  /* GUI (replaces display.*) */
  gui: null,

  /* list of all available grabbers */
  available_grabbers: [
	  {id: 'deezer', name:'Deezer.com', url:'www.deezer.com', grabber: deezer},
  ],

  /* current listened location */
  currentURI: null,
  currenttab: null,

  init: function(){
	  this.prefs = new das_preferences();
	  
	  /* uri changes notifications */
	  gBrowser.addProgressListener(URIListener,
  Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);

  },

  destroy: function(){
  },

  onURIChange: function(newURI){
  }
};

var prefs = new settings();
var deezerGrabber = new grabber();
var lastfm = new scrobbler(prefs.lastfmUser, prefs.lastfmPasswd);

var URIListener = {
	
  QueryInterface: function(aIID) {
   if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
       aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
       aIID.equals(Components.interfaces.nsISupports))
     return this;
   throw Components.results.NS_NOINTERFACE;
  },

  onLocationChange: function(aProgress, aRequest, aURI)
  {
    display.dump(aURI);
  },

  onStateChange: function(a, b, c, d) {},
  onProgressChange: function(a, b, c, d, e, f) {},
  onStatusChange: function(a, b, c, d) {},
  onSecurityChange: function(a, b, c) {}
};


window.addEventListener("load", function(){ deezerGrabber.load() }, false);
window.addEventListener("load", function(){ lastfm.connect() }, false);
window.addEventListener("load", function(){ prefs.applyxul() }, false);
