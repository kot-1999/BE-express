import { Router } from 'express';

const router = Router();

export default () => {
    router.get('/', (req, res) => {
        return res.json('test endpoint 123');
    });

    return router;
};
