/** 管道式顺序执行事件, 当前事件的返回值会作为下一个事件的参数传入 */
export const reduceAsyncFunction = async <T = any, K = any, E = any>(
	tasks: Iterable<T> | Array<any>,
	reduceParams: K,
	extraParams?: E
) => {
	const allHandlers = Array.isArray(tasks) ? tasks : Array.from(tasks);

	while (allHandlers.length) {
		const handler = allHandlers.shift();

		if (handler) {
			try {
				reduceParams = await handler(reduceParams, extraParams);
			} catch (e: any) {
				// 如果执行串行Action的时候, 发生了错误, 需要停止接下来未执行的action
				console.error('run async function error:  ', e?.message);
				break;
			}
		}
	}

	return reduceParams;
};
