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
	const event= listenerPrepare(listeners);
	event("ontodo", "", listeners);
	const args= process.argv.slice(2);

	event("oncli", args, listeners);
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
		if(!Reflect.has(listeners, name)) return no_listener;
		return listeners[name](data);
	};
}
