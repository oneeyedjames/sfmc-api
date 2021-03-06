export type AsyncCallback<T = any> = { (err: any, res?: T): void; }
export type AsyncFunction<T = any> = { (cb: AsyncCallback<T>): void; }

export type AsyncObject<T = any> = {
	get: AsyncFunction<T>;
	post?: AsyncFunction<T>;
	patch?: AsyncFunction<T>;
	delete?: AsyncFunction<T>;
}

export function asyncToPromise<T = any>(fn: AsyncFunction<T>) {
	return (...args: any[]) => new Promise<T>((resolve, reject) => {
		fn.apply(null, [...args, (err: any, res?: T) =>
			err ? reject(err) : resolve(res)]);
	});
}
