const ntfyjs = require("../dist").default;

const fs = require("fs");
const ntfy = ntfyjs({
	baseUrl: "https://ntfy.stageandscreentech.co.uk",
	defaultTopic: "test",
	auth: {
		authType: "username",
		username: "iris",
		password: "notifyTheWorld"
	}
});

authHeader = `Basic ${Buffer.from(`iris:notifyTheWorld`).toString("base64")}`;

// fetch(new URL("ntfy_testing", "https://ntfy.sh"), {
// 	method: "PUT",
// 	body: fs.readFileSync("./flower.jpg"),
// 	headers: { Filename: "flower.jpg"}
// }).then((res) => console.log(res));

fetch(new URL("https://ntfy.sh"), {
	method: "POST",
	body: JSON.stringify({topic: "ntfy_testing", title: "Have some flowers", message: "I hope you like them!", filename: "flower.jpg"}),
}).then((res) => console.log(res));

// ntfy.create()
// 	.title("Test")
// 	.message("Hello, I am testing a notification")
// .addTag(["+1", "warning", "tada"])
// .priority(5)
// .addAction([
// 	{ action: "view", url: "https://google.com", label: "Open Google", clear: true },
// 	{
// 		action: "http",
// 		label: "send message",
// 		url: "https://ntfy.sh",
// 		method: "POST",
// 		body: JSON.stringify({
// 			topic: "ntfyjs_testing",
// 			title: "I triggered this",
// 			message: "WITH A NOTIFICATION!"
// 		})
// 	}
// ])
// .uploadFile("flower.jpg", );
// .send();
