export type CacheEntry<T = any> = {
	payload: T;
	expires: number;
	timeout?: NodeJS.Timer;
}

export class Cache {
	private cache: { [key: string]: CacheEntry<string> } = {};

	constructor(readonly ttl = 300000) {}

	get<T>(key: string): CacheEntry<T> {
		if (this.isset(key)) {
			const { payload, expires } = this.cache[key];
			return { payload: JSON.parse(payload) as T, expires };
		}

		return undefined;
	}

	set<T>(key: string, obj: T, ttl?: number): void {
		this.unset(key);

		if (ttl === undefined)
			ttl = this.ttl;

		this.cache[key] = {
			payload: JSON.stringify(obj),
			expires: Date.now() + ttl,
			timeout: setTimeout(() => delete this.cache[key], ttl)
		};
	}

	isset(key: string): boolean {
		return this.cache[key] !== undefined;
	}

	unset(key: string): void {
		if (this.isset(key)) {
			const { timeout } = this.cache[key];
			clearTimeout(timeout);
			delete this.cache[key];
		}
	}
}
