import axios from 'axios';
import { showAlert } from './alert';


export const bookTour = async tourId => {
    const stripe = Stripe('pk_test_51LAxNnSCoiKScyv3Mz1taXlgRtKYhhTQXhR601HarhTftUqS3nIzHB2IshtgAVrga2Yinq2Sr8f0FzFTmpkdtTTQ00nXH77VsT')

   try{
    const session = await axios(
        `/app/v1/booking/checkout-session/${tourId}`
    )

    await stripe.redirectToCheckout({
        sessionId: session.data.session.id
    })
   }
   catch(err)
   {
    showAlert('error',err);
   }
} 