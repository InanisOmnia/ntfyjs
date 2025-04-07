type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "HEAD" | "CONNECT" | "TRACE";

type Priority = 1 | 2 | 3 | 4 | 5;
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
			clear?: boolean;
			url: string;
			method?: HttpMethod;
			headers?: { [index: string]: string };
			body?: string;
	  }
	| {
			action: "broadcast";
			label: string;
			clear?: boolean;
			intent?: string;
			extras?: { [index: string]: string };
	  };

function isAction(action: Action): action is Action {
	if (action.action == "view") {
		// !
		return true;
	} else if (action.action == "http") {
		// !
		return true;
	} else if (action.action == "broadcast") {
		// !
		return true;
	} else return false;
}

type NtfyjsAuthType = "username" | "token" | "query";

type NtfyjsAuth_Username = {
	authType: "username";
	username: string;
	password: string;
};

type NtfyjsAuth_Token = {
	authType: "token";
	token: string;
};

type NtfyjsAuth_Query = {
	authType: "query";
	username: string;
	password: string;
};

type NtfyjsAuth = NtfyjsAuth_Username | NtfyjsAuth_Token | NtfyjsAuth_Query;

type NtyfjsOptions = {
	baseUrl: string;
	defaultTopic: string;
	defaultPriority?: Priority;
	auth: NtfyjsAuth;
};
function isNtyfjsOptions(options: NtyfjsOptions): options is NtyfjsOptions {
	return typeof options.baseUrl === "string";
}
function isRequiredNtyfjsOptions(options: Required<NtyfjsOptions>): options is Required<NtyfjsOptions> {
	return typeof options.baseUrl === "string";
}
const DEFAULT_OPTIONS: Partial<NtyfjsOptions> = {
	baseUrl: "https://ntfy.sh/",
	defaultPriority: 3
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

export type NtfyjsFileUpload = {
	hasUploadedFile: boolean;
	filename?: string;
	content?: Buffer;
};

export default function ntyfjs(options: NtyfjsOptions) {
	if (!isNtyfjsOptions(options)) throw new TypeError("Options object not correctly formed");
	const mergedOptions = mergeDefault(DEFAULT_OPTIONS, options) as Required<NtyfjsOptions>;
	if (!isRequiredNtyfjsOptions(mergedOptions)) throw new TypeError("Failed to merge all options");

	return {
		create: () => new NtfyjsBuilder(mergedOptions)
	};
}

class NtfyjsBuilder {
	options: Required<NtyfjsOptions>;
	data: NtfyData;
	disableCache: boolean;

	fileUpload: NtfyjsFileUpload;

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
		this.disableCache = false;
		this.fileUpload = { hasUploadedFile: false };
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

	/**
	 *
	 * @param url URL of the icon `Only JPEG and PNG images are supported at this time`
	 */
	icon(url: string): NtfyjsBuilder {
		// TODO: parsing??
		this.data.icon = url;
		return this;
	}

	priority(priority: number): NtfyjsBuilder {
		if (![1, 2, 3, 4, 5].includes(priority)) throw new Error("Invalid priority");
		return this;
	}

	call(phoneNumber: string): NtfyjsBuilder {
		// TODO: Parsing??
		this.data.call = phoneNumber;
		return this;
	}

	/**
	 *
	 * @param time timestampt or duration for delayed delivery
	 */
	delay(time: string): NtfyjsBuilder {
		// TODO: parse string
		this.data.delay = time;
		return this;
	}

	addAction(action: Action | Action[]): NtfyjsBuilder {
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
		// TODO: Parsing??
		this.data.click = url;
		return this;
	}

	uploadFile(filename: string, content: Buffer): NtfyjsBuilder {
		if (this.fileUpload.hasUploadedFile) throw new Error("Cannot upload more than one file to a notification");

		this.fileUpload.filename = filename;
		this.fileUpload.content = content;

		this.fileUpload.hasUploadedFile = true;
		return this;
	}

	linkFile(filename: string): NtfyjsBuilder {
		return this;
	}

	noCache(): NtfyjsBuilder {
		this.disableCache = true;
		return this;
	}

	setData(data: Partial<NtfyData>): NtfyjsBuilder {
		this.data = data as NtfyData;
		return this;
	}

	/**
	 * Send the data made from the builder
	 * @param topic optional topic to send to, otherwise default topic is used
	 * @returns nodejs Fetch `Response`
	 */
	async send(topic: string = this.options.defaultTopic): Promise<Response> {
		const url = new URL(this.options.baseUrl);
		const body = JSON.stringify({ ...this.data, topic }, JSON_replacer);

		const fetchData: any = { method: "POST", body, headers: {} };

		if (this.disableCache) fetchData.headers.Cache = "no";

		if (this.options.auth) {
			let authHeader;

			if (this.options.auth.authType == "username" || this.options.auth.authType == "query") {
				authHeader = `Basic ${Buffer.from(
					`${this.options.auth.username}:${this.options.auth.password}`
				).toString("base64")}`;
			}

			fetchData.headers.Authorization = authHeader;
		}

		// if (this.fileUpload.hasUploadedFile) {
		// 	const res = await fetch(new URL(topic, url), {
		// 		method: "PUT",
		// 		body: this.fileUpload.content,
		// 		headers: { Filename: this.fileUpload.filename, Authorization: fetchData.headers.Authorization }
		// 	});
		// 	console.log(res);
		// }

		// TODO: Move data from body JSON to headers to free up the body for file uploads
		return fetch(url, fetchData);
	}
}

const JSON_replacer = (_key: any, value: any) => {
	if (value == null) return undefined;
	if (typeof value == "string" && value.length < 1) return undefined;
	if (Array.isArray(value) && value.length < 1) return undefined;
	return value;
};

function mergeDefault(def: any, given: any) {
	if (!given) return def;
	for (const key in def) {
		// ! given.hasOwn(key)
		if (!given.hasOwnProperty(key) || given[key] === undefined) {
			given[key] = def[key];
		} else if (given[key] === Object(given[key])) {
			given[key] = mergeDefault(def[key], given[key]);
		}
	}
	return given;
}
