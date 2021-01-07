import axios from 'axios';



export const bookTour = async tourId => {
    try {
      const stripe= Stripe('pk_test_51I5RJpA2QBWwLr63K8MjCOImXz60mWvweIpDn0USEv0EAfma9EvmMMO6UstJszU6dP9l42Q7oWsTaRIvUuOCZwr60046vbWCdG');

      // 1) Get checkout session from API
      const session = await axios(
        `/api/v1/bookings/checkout-session/${tourId}`
      );
  
      // 2) Create checkout form + chanre credit card
      await stripe.redirectToCheckout({
        sessionId: session.data.session.id
      });
    } catch (err) {
      console.log(err);
      showAlert('error', err);
    }
  };