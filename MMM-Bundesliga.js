Module.register("MMM-Bundesliga", {
	defaults: {
		header: ""
	},

	getScripts() {
		return ["moment.js"];
	},

	getStyles() {
		return ["MMM-Bundesliga.css"];
	},

	start() {
		Log.info("Starting module: " + this.name);

		moment.locale(config.language);
	},

	getDom() {
		const wrapper = document.createElement("div");
		wrapper.className = this.config.tableClass;

		return wrapper;
	},

	getHeader() {
		return this.config.header;
	}
});
