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


var scrobbler = function(user, passwd){
  this.init(user, passwd);
}

scrobbler.prototype = {
  user: null,
  passwd: null,

  link: null,
  connected: false,
  url: null,
  session: null,

  init: function(user, passwd){
    this.user = user;
    this.passwd = passwd;
    this.link = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                  .createInstance();
  },

  connect: function(){

    //Audioscrobbler protocol version
    p = '1.2.1';
    //current timestamp
    t = get_unix_ts();
    //client id
    c = 'das';
    //client version
    v = '1.0';
    //the token based on user passwd needed to authenticate
    auth = hash_md5( hash_md5(this.passwd) + t);

    requestURI = 'http://post.audioscrobbler.com/'
                    + '?hs=true'
                    + '&p=' + p
                    + '&c=' + c
                    + '&v=' + v
                    + '&u=' + this.user
                    + '&t=' + t
                    + '&a=' + auth;
    this.link.open('GET', requestURI);

    var result = null;

    this.link.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200){
        var result = this.responseText.split('\n');
        if(result[0] != 'OK'){
          display.dump(result[0]);
          lastfm.connected = false;
          display.statusicon('NOTCONNECTED');
        }
        if(result[0] != 'OK')
          this.reconnect();
        else{
          lastfm.session = result[1];
          lastfm.url = result[3];
          // result[2] contains the 'now-playing' url, not interesting for us right now
          lastfm.connected = true;
          display.dump('connected');
          display.statusicon('CONNECTED');
        }
      }
    };


    this.link.send(null);
  },

  disconnect: function(){
    display.statusicon('NOTCONNECTED');
    this.session = null;
    this.url = null;
    this.connected = false;
  },
  
  reconnect: function(user, passwd){
    display.dump('Reloading lastfm connection');
    this.disconnect();
    this.init(user, passwd);
    this.connect();
  },
  
  reconnect: function(){
    this.reconnect(this.user, this.passwd);
  },

  push: function(song){
    if(!(this.connected))
      return;
    display.statusicon('SENDING');
      
    //session Id
    s = this.session;
    // artist
    a = encodeURIComponent(to_utf8(song.artist)); //+encodeURIComponent(' éà')+encodeURIComponent(Utf8.encode(' éà'))+encodeURIComponent(Utf8.decode(' éà'))+Utf8.decode(' éà');
    //track title
    t = encodeURIComponent(to_utf8(song.title));
    //start time
    i = get_unix_ts();
    //source (should distinguish between E and P but...)
    o = 'E';
    //album
    b = encodeURIComponent(song.album);
    //optionals then empty:
    //a[], t[], i[], o[], r[], l[], b[], n[], and m[]
    argv = 's='+s
            +'&a[0]='+a
            +'&t[0]='+t
            +'&i[0]='+i
            +'&o[0]='+o
            +'&b[0]='+b
            +'&r=&l=&n=&m=';
    requestURI = this.url+'?'+argv;
    //display.dump(requestURI);

    this.link.open('POST', (requestURI), true);
    this.link.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200){
          display.dump(t+': '+this.responseText);
          display.statusicon('CONNECTED');
      }
    };
    this.link.send(null);
  }
}
