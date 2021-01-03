import axios from 'axios';
const stripe= Stripe('pk_test_51I5RJpA2QBWwLr63K8MjCOImXz60mWvweIpDn0USEv0EAfma9EvmMMO6UstJszU6dP9l42Q7oWsTaRIvUuOCZwr60046vbWCdG');



export const bookTour = async tourId => {
    try {
      // 1) Get checkout session from API
      const session = await axios(
        `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
      );
      console.log(session);
  
      // 2) Create checkout form + chanre credit card
      await stripe.redirectToCheckout({
        sessionId: session.data.session.id
      });
    } catch (err) {
      console.log(err);
      showAlert('error', err);
    }
  };