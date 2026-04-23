import { Router } from 'express';
const router = Router();
router.get('/', (req, res) => {
  res.send('Surya E-Commerce homepage');
});
export default router;