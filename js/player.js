var audioPlayer = {
  audioData: {
    currentSong: -1,
    songs: []
  },

  // UI
  load: function() {
    this.data = data.songs;
    data.songs.forEach(function(val, i) {
      $("#playlist").append(
        "<li class='list-group-item'>" + val.singer + " - " + val.songName
      );
    })
  },
  changeCurrentSongEffect: function(options) {
    if (options.play) {
      $("#playlist .list-group-item")
        .removeClass("list-group-item-success").find("span").remove();
      $("#playlist .list-group-item")
        .eq(this.audioData.currentSong)
        .addClass("list-group-item-success")
        .removeClass("list-group-item-danger")
        .append("<span class='glyphicon glyphicon-headphones'>");
    }
    if (options.end) {
      $("#playlist .list-group-item")
      .eq(this.audioData.currentSong)
      .removeClass("list-group-item-success glyphicon-headphones")
      .addClass("list-group-item-danger");
    }
  },
  playSong: function(audio) {
    this.changeCurrentSongEffect({
      play: 1
    });
    audio.onended = function() {
      audioPlayer.changeCurrentSongEffect({
        end: 1
      });
      audioPlayer.changeStatusCode("Finished listening to", true);
    }
    this.changeStatusCode("Playing", true, audio);
  },
  changeStatusCode: function(statusMessage, addSongName, scope) {
    if (addSongName) {
      statusMessage += " " + $("#playlist .list-group-item").eq(this.audioData.currentSong).text();
    }
    this.speak(statusMessage, scope);
    $(".status")
    .fadeOut("slow")
    .html(statusMessage)
    .fadeIn("slow");
  },
  changeLastCommand: function(cmd) {
    $(".l-command").fadeOut("slow")
    .text(cmd)
    .fadeIn("slow");
  },
  toggleSpinner: function(show) {
    (show || false) ? $("#spinner").fadeIn(900) : $("#spinner").fadeOut(1200);
  },

  // Audio Player
  play: function() {
    var currentSong = this.audioData.currentSong;
    if (currentSong === -1) {
      this.audioData.currentSong = ++currentSong;
      this.audioData.songs[this.audioData.currentSong] = new Audio(
        this.data[0].fileName);
      this.playSong(this.audioData.songs[currentSong]);

    } else {
      this.playSong(this.audioData.songs[currentSong]);
    }
  },
  pauseSong: function(audio, stopPlayback) {
    if (audio.paused) {
      return;
    }
    audio.pause();
    if (stopPlayback) {
      this.changeStatusCode("Stopped", true);
      audio.currentTime = 0;
      return;
    }
    this.changeStatusCode("Paused", true);
  },
  stop: function(stopPlayback) {
    this.pauseSong(this.audioData.songs[this.audioData.currentSong], stopPlayback || false);
    if (stopPlayback) {
      this.audioData.songs[this.audioData.currentSong].currentTime = 0;
    }
  },
  prev: function() {
    var currentSong = this.audioData.currentSong;
    if (typeof this.audioData.songs[currentSong - 1] !== 'undefined') {
      this.pauseSong(this.audioData.songs[currentSong]);
      this.audioData.currentSong = --currentSong;
      this.playSong(this.audioData.songs[currentSong]);

    } else if (currentSong > 0) {
      this.pauseSong(this.audioData.songs[currentSong]);
      this.audioData.currentSong = currentSong = --currentSong;
      this.audioData.songs[this.audioData.currentSong] = new Audio(
        this.data[currentSong].fileName);
      this.playSong(this.audioData.songs[currentSong]);
    } else {
      this.changeStatusCode("There are no previous songs.");
    }
  },
  next: function() {
    var currentSong = this.audioData.currentSong;
    if (currentSong > -1) {
      this.pauseSong(this.audioData.songs[currentSong]);
    }
    if (typeof this.data[currentSong + 1] !== 'undefined') {
      currentSong = ++this.audioData.currentSong;
      this.audioData.songs[this.audioData.currentSong] = new Audio(this.data[currentSong].fileName);
      this.playSong(this.audioData.songs[currentSong]);
    } else {
      this.changeStatusCode("You have reached the final song.");
    }
  },
  searchSpecificSong: function(keyword) {
    try {
      this.data.forEach(function(val, i) {
        if (val.songName.trim().toLowerCase().indexOf(keyword) !== -1 ||
            val.singer.trim().toLowerCase().indexOf(keyword) !== -1) {
          if (typeof this.audioData.songs[i] !== 'undefined') {
            //if the song is already cached
            if (this.audioData.currentSong > -1) {
              this.pauseSong(this.audioData.songs[this.audioData.currentSong]);
            }
            this.audioData.currentSong = i;
            audioPlayer.playSong(audioPlayer.audioData.songs[i]);
            throw LoopBreakException;
          } else {
            //add the song and play it
            if (this.audioData.currentSong > -1) {
              this.pauseSong(this.audioData.songs[this.audioData.currentSong]);
            }
            this.audioData.currentSong = i;
            this.audioData.songs[i] = new Audio(this.data[i].fileName);
            this.playSong(this.audioData.songs[i]);
            throw LoopBreakException;
          }
        }
      }, audioPlayer);
    } catch (e) {
      return e;
    }
  },

  // Speech API
  speak: function(text, scope) {
    var message = new SpeechSynthesisUtterance(text.replace("-", " "));
    message.rate = 1;
    window.speechSynthesis.speak(message);
    if (scope) {
      message.onend = function() {
        scope.play();
      }
    }
  },
  processCommands: function(cmd) {
    this.changeLastCommand(cmd);
    var playSpecific = cmd.match(/play\s*(.+)$/);
    if (playSpecific) {
      this.searchSpecificSong(playSpecific[1]);
      return;
    }
    switch (cmd) {
      case "play":
        this.play();
        break;
      case 'pause':
        this.stop();
        break;
      case "stop":
        this.stop(true);
        break;
      case "next":
        this.next();
        break;
      case "previous":
        this.prev();
        break;
      default:
        this.speak("Your command was invalid!", false);
    }
  },
}
