type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "HEAD" | "CONNECT" | "TRACE";

type Priority = "1" | "2" | "3" | "4" | "5";
type Action =
	| {
			action: "view";
			label: string;
			clear: boolean;
			url: string;
	  }
	| {
			action: "http";
			label: string;
			clear: boolean;
			url: string;
			method: HttpMethod;
			headers: { [index: string]: string };
			body: string;
	  }
	| {
			action: "broadcast";
			label: string;
			clear: boolean;
			intent: string;
			extras: { [index: string]: string };
	  };
function isAction(action: Action): action is Action {
	if (action.action == "view") {
	} else if (action.action == "http") {
	} else if (action.action == "broadcast") {
	} else return false;
}

type NtyfjsOptions = {
	baseUrl: string;
	defaultTopic: string;
	defaultPriority?: Priority;
};
function isNtyfjsOptions(options: NtyfjsOptions): options is NtyfjsOptions {
	return typeof options.baseUrl === "string";
}
function isRequiredNtyfjsOptions(options: Required<NtyfjsOptions>): options is Required<NtyfjsOptions> {
	return typeof options.baseUrl === "string";
}
const DEFAULT_OPTIONS: Partial<NtyfjsOptions> = {
	baseUrl: "https://ntfy.sh/",
	defaultPriority: "3"
};

type NtfyData = {
	message: string;
	title: string;
	tags: string[];
	priority: Priority;
	actions: Action[];
	click: string;
	filename: string;
	attach: string;
	markdown: false;
	icon: string;
	delay: string;
	email: string;
	call: string;
};

export default function ntyfjs(options: NtyfjsOptions) {
	if (!isNtyfjsOptions(options)) throw new TypeError("Options object not correctly formed");
	this.options = mergeDefault(DEFAULT_OPTIONS, options);
	if (!isRequiredNtyfjsOptions(this.options)) throw new TypeError("Failed to merge all options");

	return {
		create: () => new NtfyjsBuilder(this.options)
	};
}

class NtfyjsBuilder {
	options: Required<NtyfjsOptions>;
	data: NtfyData;

	constructor(options: Required<NtyfjsOptions>) {
		this.options = options;
		this.data = {
			message: "",
			title: "",
			tags: [],
			priority: this.options.defaultPriority,
			actions: [],
			click: "",
			filename: "",
			attach: "",
			markdown: false,
			icon: "",
			delay: "",
			email: "",
			call: ""
		};
	}

	message(msg: string): NtfyjsBuilder {
		this.data.message = msg;
		return this;
	}

	title(title: string): NtfyjsBuilder {
		this.data.title = title;
		return this;
	}

	addTag(tags: string | string[]): NtfyjsBuilder {
		if (typeof tags == "string") this.data.tags.push(tags);
		else this.data.tags.push(...tags);
		return this;
	}

	priority(priority: string): NtfyjsBuilder {
		if (!["1", "2", "3", "4", "5"].includes(priority)) throw new Error("Invalid priority");
		return this;
	}

	addAction(action: Action | Action[]) {
		if (Array.isArray(action)) {
			action.forEach((a) => {
				if (!isAction(a)) throw new TypeError("Not a valid action object");
				else this.data.actions.push(a);
			});
		} else {
			if (!isAction(action)) throw new TypeError("Not a valid action object");
			this.data.actions.push(action);
		}
		return this;
	}

	click(url: string): NtfyjsBuilder {
		this.data.click = url;
		return this;
	}

	setData(data: Partial<NtfyData>): NtfyjsBuilder {
		this.data = data as NtfyData;
		return this;
	}

	sendTo(topic: string): Promise<Response> {
		const url = new URL(topic, this.options.baseUrl);
		return fetch(url, {
			method: "POST",
			body: JSON.stringify(this.data)
		});
	}
}

function mergeDefault(def: any, given: any) {
	if (!given) return def;
	for (const key in def) {
		if (!given.hasOwn(key) || given[key] === undefined) {
			given[key] = def[key];
		} else if (given[key] === Object(given[key])) {
			given[key] = mergeDefault(def[key], given[key]);
		}
	}
	return given;
}
