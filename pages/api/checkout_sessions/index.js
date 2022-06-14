require('dotenv').config();
// const express = require('express');
// const app = express();
// const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// app.use(
//   cors({
//     origin: ['*'],
//   })
// );
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log(req.headers);
      console.log(process.env.NEXT_PUBLIC_FRONT_URL);
      // const { id } = req.query;
      // const keys = ['quantity', 'name', 'price_unity'];
      const booking = req.body.booking;
      // const booking = await axios
      //   .get(
      //     `${process.env.NEXT_PUBLIC_API_URL}/items/booking?${keys
      //       .map((key) => `fields[]=${key}`)
      //       .join('&')}`
      //   )
      //   .then((res) => res.data)
      //   .catch((err) => console.log(err));

      // Create Checkout Sessions from body params.
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
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
