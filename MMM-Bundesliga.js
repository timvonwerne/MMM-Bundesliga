Module.register("MMM-Bundesliga", {
  defaults: {
    header: "",
    initialLoadDelay: 0,
    updateInterval: 10 * 60 * 10000
  },

  apiURL: "https://www.openligadb.de/api/getmatchdata/bl1",

  scores: [],

  getScripts() {
    return ["moment.js"];
  },

  getStyles() {
    return ["MMM-Bundesliga.css"];
  },

  start() {
    Log.info("Starting module: " + this.name);

    moment.locale(config.language);

    this.loaded = false;
    this.scheduleUpdate(this.config.initialLoadDelay);
  },

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.className = this.config.tableClass;

    if (!this.loaded) {
      wrapper.innerHTML = this.translate("LOADING");
      wrapper.className = "dimmed light small";
      return wrapper;
    }

    const matchesElement = document.createElement("div");
    matchesElement.className = "matches bright small";

    this.matches.forEach((m) => {
      const singleMatch = document.createElement("div");
      singleMatch.className = "match";

      const homeTeam = document.createElement("div");
      const homeTeamLogo = document.createElement("img");
      const homeTeamName = document.createElement("span");

      homeTeam.className = "home-team";
      homeTeamLogo.className = "home-team-logo";
      homeTeamName.className = "home-team-name";

      homeTeamLogo.src = m.Team1.TeamIconUrl;
      homeTeamName.textContent = m.Team1.ShortName;

      homeTeam.appendChild(homeTeamLogo);
      homeTeam.appendChild(homeTeamName);

      const awayTeam = document.createElement("div");
      const awayTeamLogo = document.createElement("img");
      const awayTeamName = document.createElement("span");

      awayTeam.className = "away-team";
      awayTeamLogo.className = "away-team-logo";
      awayTeamName.className = "away-team-name";

      awayTeamLogo.src = m.Team2.TeamIconUrl;
      awayTeamName.textContent = m.Team2.ShortName;

      awayTeam.appendChild(awayTeamName);
      awayTeam.appendChild(awayTeamLogo);

      singleMatch.appendChild(homeTeam);

      if (m.MatchResults.length > 0) {
        const score = document.createElement("div");
        const homeTeamScore = document.createElement("span");
        const awayTeamScore = document.createElement("span");

        score.className = "score";
        homeTeamScore.className = "home-team-score";
        awayTeamScore.className = "away-team-score";

        homeTeamScore.textContent = m.MatchResults["0"].PointsTeam1;
        awayTeamScore.textContent = m.MatchResults[0].PointsTeam1;

        score.appendChild(homeTeamScore);
        score.appendChild(awayTeamScore);
        singleMatch.appendChild(score);
      }

      singleMatch.appendChild(awayTeam);

      matchesElement.appendChild(singleMatch);
    });

    wrapper.appendChild(matchesElement);

    return wrapper;
  },

  getHeader() {
    return this.config.header;
  },

  updateScores: function () {
    var self = this;
    var retry = true;

    var scoreRequest = new XMLHttpRequest();
    scoreRequest.open("GET", this.apiURL);

    scoreRequest.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          //Log.info("response", JSON.parse(this.response));
          self.processScores(JSON.parse(this.response));
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

    scoreRequest.send();
  },

  processScores: function (scores) {
    if (!scores) {
      return;
    }

    Log.info("scores", scores);

    this.matches = scores;

    this.show(this.config.animationSpeed, { lockString: this.identifier });
    this.loaded = true;
    this.updateDom(this.config.animationSpeed);
    this.sendNotification("MMM-BUNDESLIGA_DATA", { data: scores });
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
