import Stripe from 'stripe';
import config from './env';

const stripe = new Stripe(config.stripeSecretKey, {
  typescript: true,
});

export default stripe;
