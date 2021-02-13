Module.register("MMM-Bundesliga", {
  defaults: {
    header: "",
    initialLoadDelay: 0,
    updateInterval: 10 * 60 * 10000
  },

  apiURL: "https://www.openligadb.de/api/getmatchdata/bl1",

  getScripts() {
    return ["moment.js"];
  },

  getStyles() {
    return ["MMM-Bundesliga.css"];
  },

  start() {
    Log.info("Starting module: " + this.name);

    moment.locale(config.language);

    this.scheduleUpdate(this.config.initialLoadDelay);
  },

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.className = this.config.tableClass;

    return wrapper;
  },

  getHeader() {
    return this.config.header;
  },

  updateScores: function () {
    var self = this;
    var retry = true;

    var weatherRequest = new XMLHttpRequest();
    //weatherRequest.setRequestHeader("accept", "application/json");
    weatherRequest.open("GET", this.apiURL);

    weatherRequest.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          Log.info("response", JSON.parse(this.response));
          //self.processWeather(JSON.parse(this.response));
        } else if (this.status === 401) {
          self.updateDom(self.config.animationSpeed);

          Log.error(self.name + ": Incorrect API-Key.");
          retry = true;
        } else {
          Log.error(self.name + ": Could not load scores.");
        }

        if (retry) {
          self.scheduleUpdate(self.loaded ? -1 : self.config.retryDelay);
        }
      }
    };

    weatherRequest.send();
  },

  scheduleUpdate: function (delay) {
    var nextLoad = this.config.updateInterval;
    if (typeof delay !== "undefined" && delay >= 0) {
      nextLoad = delay;
    }

    var self = this;
    setTimeout(function () {
      self.updateScores();
    }, nextLoad);
  }
});
