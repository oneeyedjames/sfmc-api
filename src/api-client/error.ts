import { Response } from 'express';

export function handleError(resp: Response) {
	return (err: any) => {
		console.error(err);
		resp.status(500).json(err);
	}
}
