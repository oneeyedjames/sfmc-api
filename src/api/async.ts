export type AsyncCallback = {
	(err: any, res?: any): void;
}

export type AsyncFunction = {
	(cb: AsyncCallback): void;
}

export type AsyncObject = {
	get: AsyncFunction;
	post?: AsyncFunction;
	patch?: AsyncFunction;
	delete?: AsyncFunction;
}

export function asyncToPromise(fn: AsyncFunction) {
	return new Promise<any>((resolve, reject) => {
		fn((err: any, res?: any) => err ? reject(err) : resolve(res));
	});
}
