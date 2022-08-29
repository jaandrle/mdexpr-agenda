import { program } from "commander";
/**
 * @typedef T_State
 * @type {"onfiles"|"oncli"}
 * */
/**
 * Main cli function for all `mdexpr-*` commands.
 * @param {Record<"name"|"version"|"description", "string">} pkg
 * @param {T_Listeners} listeners Events listeners
 * */
export function mdexpr(pkg, listeners){
	const event= listenerPrepare(listeners);
	
	program.name(pkg.name)
		.version(pkg.version, "-v, --version")
		.description(pkg.description);
	program.command("files <file(s)>", { isDefault: true })
		.summary("[default] process markdown file(s).")
		.description("Process expressions in markdown file(s).")
		.option("--json", "output as json")
		.action(function(arg, options){
			if(options.json) return console.log("here");
			
			event("onfiles", arg);
		});
	
	program.parse();
}

/**
 * Helper function calling given event handler in `listeners`.
 * @param {T_Listeners} listeners
 * */
function listenerPrepare(listeners){
	/**
	* Helper function calling given event handler in `listeners`.
	* @param {T_State} name
	* @param {any} data
	* */
	return function(name, data){
		if(Reflect.has(listeners, name))
			return listeners[name](data);

		console.log("Not implemented yet");
		process.exit(1);
	};
}
