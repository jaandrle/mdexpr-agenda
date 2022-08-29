/**
 * @typedef T_State
 * @type {"ontodo"|"onfile"|"oncli"}
 * */
/**
 * @typedef T_Listeners
 * @type {Record<T_State,(data: any)=> void>}
 * */
const no_listener= Symbol.for("no_listener");
/**
 * Main cli function for all `mdexpr-*` commands.
 * @param {T_Listeners} listeners Events listeners
 * */
export function mdexpr(listeners){
	lister("ontodo", "", listeners);
	const args= process.argv.slice(2);

	lister("oncli", args, listeners);
}

/**
 * Helper function calling given event handler in `listeners`.
 * @param {T_State} name
 * @param {T_Listeners} listeners
 * @param {any} data
 * */
function lister(name, data, listeners){
	if(!Reflect.has(listeners, name)) return no_listener;
	return listeners[name](data);
}
