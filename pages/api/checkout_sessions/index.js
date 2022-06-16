require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const booking = req.body.booking;
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'EUR',
              unit_amount: booking.price_unity * 100,
              product_data: {
                name: booking.name,
              },
            },
            quantity: booking.quantity,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_FRONT_URL}/booking/confirmation?success=true&bookingId=${booking.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_FRONT_URL}/booking/confirmation?canceled=true&bookingId=${booking.id}`,
      });

      res.json({ url: session.url });
      // res.redirect(303, session.url);
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
