import { RequestHandler, Request } from 'express';
import { Jwt, JwtPayload, Secret, sign, decode, verify } from 'jsonwebtoken';

declare module 'express' {
	interface Request {
		jwt: Jwt;
	}
}

export type JwtAuthorizerConfig = {
	issuer: string;
	secret: Secret;
}

export class JwtAuthenticator {
	authenticate: RequestHandler = (req, resp, next) => {
		const header = req.header('Authorization');
		if (header === undefined) next();

		const [scheme, token] = header.split(' ', 2);
		if (scheme != 'JWT') return next();

		this.verify(token)
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
	}

	private ttl = 3600;

	constructor(private config: JwtAuthorizerConfig) {}

	decode(token: string): Jwt {
		return decode(token, { complete: true });
	}

	verify(token: string): Promise<Jwt> {
		return new Promise<Jwt>((resolve, reject) => {
			verify(token, this.config.secret, { complete: true },
				(err, jwt) => err ? reject(err) : resolve(jwt));
		});
	}

	sign(audience: string | string[]): Promise<string>;
	sign(audience: string | string[], subject: string): Promise<string>;
	sign(audience: string | string[], subject: string, claims: JwtPayload): Promise<string>;
	sign(audience: string | string[], claims: JwtPayload): Promise<string>;

	sign(
		audience: string | string[],
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
			claims = {};

		delete claims.iss;
		delete claims.sub;
		delete claims.aud;
		delete claims.exp;
		delete claims.nbf;
		delete claims.iat;

		const options = {
			issuer: this.config.issuer,
			subject,
			audience,
			expiresIn: this.ttl,
			notBefore: 0
		};

		return new Promise<string>((resolve, reject) => {
			sign(claims, this.config.secret, options,
				(err, jwt) => err ? reject(err) : resolve(jwt));
		});
	}
}
