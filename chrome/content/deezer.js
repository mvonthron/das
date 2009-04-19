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

var grabber = function(){
  this.init();
}
grabber.prototype = {
  deezerURL: 'http://www.deezer.com/',
  deezerGateway: 'http://www.deezer.com/services/remoting/gateway.php',
  link: null,
  
  init: function(){
    this.link = Components.classes["@mozilla.org/network/io-service;1"]
                  .getService(Components.interfaces.nsIIOService)
                    .newURI(this.deezerGateway, null, null);
    display.dump('initializing DAS grabber');
  },
  
  /** 
   * Informations extractor inspirated by DeezerMSN from Bandikaz
   */
  observe: function(link, event, c){
    if(!prefs.listenDeezer)
      return;
    try {
      link.QueryInterface(Components.interfaces.nsIHttpChannel);
      if(link.URI.asciiSpec.indexOf('http://www.deezer.com/services/remoting/gateway.php') != 0) 
        return;
      link.notificationCallbacks.getInterface(Components.interfaces.nsIWebProgress);
      // fenêtre initiatrice de la requête = page de deezer (contenant le swf, donc)
      var win = link.notificationCallbacks.DOMWindow; 
      // on vérifie qu'on est bien sur le site Deezer 
      // sinon n'importe quel site peut modifier le pseudo en générant une "fausse" requête sur deezer
      if(win.location.hostname != 'www.deezer.com') return; 
      link.QueryInterface(Components.interfaces.nsIUploadChannel);
      link.uploadStream.QueryInterface(Components.interfaces.nsISeekableStream);
      link.uploadStream.seek(0,0);
      var stream = Components.classes["@mozilla.org/scriptableinputstream;1"]
                    .createInstance(Components.interfaces.nsIScriptableInputStream);
      stream.init(link.uploadStream);
      // output contiendra le contenu des données POST
      var output = '';
      var size = stream.available();
      for (var i=0; i<size; i++) {
        output+=stream.read(1);
      }

      stream.close();
      link.uploadStream.close();
            
      var tab = (/^[\x00-\xff]*interfaces\.dzGetTrackKey[\x00-\xff]*(?:\u0020[a-f0-9]{32}|[0-9]+_[a-zA-Z0-9]+\.mp3)\x02[\u0000-\uffff](.*?)(?:\x06)?\x02[\u0000-\uffff]([0-9]+?)(?:\x06)?\x02[\u0000-\uffff](.*?)(?:\x06)?\x02[\u0000-\uffff](.*?)(?:\x06)?\x02[\x00-\xff]*$/).exec(output);
      // on élimine les requêtes qui ne renseignent pas sur le titre en cours de lecture
      if(tab == null)
        return;
      var song = new track(tab[4], tab[3], tab[1]);
      
      display.dump('artist: '+song.artist+', '
                +'album: '+song.album+', '
                +'title: '+song.title);

      display.statusmsg(song.artist+' - '+song.title);

      lastfm.push(song);
    } catch(e) {
      display.dump('exception: '+e);
    }
  },
  
  load: function(){
    Components.classes["@mozilla.org/observer-service;1"]
      .getService(Components.interfaces.nsIObserverService)
        .addObserver(this, "http-on-examine-response", false);
  },
  
  unload: function(){
    Components.classes["@mozilla.org/observer-service;1"]
      .getService(Components.interfaces.nsIObserverService)
        .removeObserver(this, "http-on-examine-response");
  }
  
};

