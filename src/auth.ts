import { Router, Request } from 'express';
import { JwtAuthenticator } from './jwt';

const jwt = new JwtAuthenticator({
	id: 'SFMC',
	ttl: 86400,
	find: (id: string) => new Promise((resolve, reject) =>
		resolve({ id, secret: process.env.JWT_SECRET }))
});

const auth = Router().use(jwt.router, (req: Request, resp, next) => {
	if (req.method === 'OPTIONS')
		return next();

	if (req.jwt === undefined)
		return resp.sendStatus(401);

	next();
});

export default auth;
