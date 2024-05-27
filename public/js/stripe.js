import axios from 'axios';

// Ensure Stripe.js is available globally
const stripe = Stripe(
     'pk_test_51PKEPnSJgqGJ0YLOEzzFRwhMrEmLzjFMahGgK7ptQKHWDUvwpWauJJU6irHVug5mlUALxxnr8Y9rWz241hYeyF7700VF8TDGuG',
);

export const bookTour = async (tourId) => {
     try {
          // 1. Get Checkout session from endpoint API
          const session = await axios(
               `/api/v1/bookings/bookingsSessions/${tourId}`,
          );

          // 2. Create checkout form + charge card
          await stripe.redirectToCheckout({
               sessionId: session.data.session.id,
          });
     } catch (err) {
          console.log(err);
     }
};
