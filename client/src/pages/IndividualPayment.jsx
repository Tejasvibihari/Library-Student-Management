
import SideBar from '../components/Sidebar'
import Breadcrumbs from '../components/Breadcrumbs'
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
// import YourPaymentComponent from './YourPaymentComponent'; // This is your payment component


const stripePromise = loadStripe('pk_test_51O6UlBSDEHgQOqxIWLAdUy36073N1Y5TwalsRza6sVcgBoYnqQdkIfMioC1L0hy4V0t5x54iLjdQamwdFwoiJS2g00fCQAVYtB');

export default function IndividualPayment() {
    return (
        <div>
            <SideBar>
                <Breadcrumbs title="hello">
                </Breadcrumbs>
                <Elements stripe={stripePromise}>
                    {/* <YourPaymentComponent /> */}
                    Hello
                </Elements>
            </SideBar>
        </div>
    )
}
