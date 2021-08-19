import { Router, Request } from 'express';
import { Jwt, JwtPayload, Secret, sign, decode, verify } from 'jsonwebtoken';

declare module 'express' {
	interface Request {
		jwt: Jwt;
	}
}

export type JwtClient = {
	id: string;
	secret: Secret;
}

export type JwtProvider = {
	readonly id: string;
	readonly ttl: number;

	find(clientId: string): Promise<JwtClient>;
}

export class JwtAuthenticator {
	static decode(token: string): Jwt {
		return decode(token, { complete: true });
	}

	static verify(token: string, secret: Secret): Promise<Jwt> {
		return new Promise<Jwt>((resolve, reject) => {
			verify(token, secret, { complete: true },
				(err, jwt) => err ? reject(err) : resolve(jwt));
		});
	}

	readonly router: Router;

	constructor(private provider: JwtProvider) {
		this.router = Router().use((req, resp, next) => {
			if (req.method === 'OPTIONS') return next();

			const header = req.header('Authorization');
			if (header === undefined) return next();

			const [scheme, token] = header.split(' ', 2);
			if (scheme != 'JWT') return next();

			const jwt = JwtAuthenticator.decode(token);

			const clientId = (typeof jwt.payload.aud == 'string')
				? jwt.payload.aud : jwt.payload.aud[0];

			this.provider.find(clientId)
			.then(client => JwtAuthenticator.verify(token, client.secret))
			.then(jwt => {
				(req as Request).jwt = jwt;
				next();
			})
			.catch(err => {
				resp.status(401).json({
					error: 'invalid_token',
					error_description: err.message
				});
			});
		});
	}

	sign(audience: string): Promise<string>;
	sign(audience: string, subject: string): Promise<string>;
	sign(audience: string, subject: string, claims: JwtPayload): Promise<string>;
	sign(audience: string, claims: JwtPayload): Promise<string>;

	async sign(
		audience: string,
		subjectOrClaims?: string | JwtPayload,
		claims?: JwtPayload
	): Promise<string> {
		let subject: string;
		if (subjectOrClaims === undefined) {
			subject = 'Anonymous';
		} else if (typeof subjectOrClaims === 'string') {
			subject = subjectOrClaims;
		} else {
			subject = 'Anonymous';
			claims = subjectOrClaims;
		}

		if (claims === undefined)
			claims = {} as JwtPayload;

		const client = await this.provider.find(audience);

		delete claims.iss;
		delete claims.sub;
		delete claims.aud;
		delete claims.exp;
		delete claims.nbf;
		delete claims.iat;

		const options = {
			issuer: this.provider.id,
			subject,
			audience,
			expiresIn: this.provider.ttl,
			notBefore: 0
		};

		return new Promise<string>((resolve, reject) => {
			sign(claims, client.secret, options,
				(err, jwt) => err ? reject(err) : resolve(jwt));
		});
	}
}
