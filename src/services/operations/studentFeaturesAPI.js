import { toast } from "react-hot-toast";
import { studentEndpoints } from "../apis";
import { apiConnector } from "../apiconnector";
import rzpLogo from "../../assets/Logo/rzp_logo.png";
import { setPaymentLoading } from "../../slices/courseSlice";
import { resetCart } from "../../slices/cartSlice";

const {
  COURSE_PAYMENT_API,
  COURSE_VERIFY_API,
  SEND_PAYMENT_SUCCESS_EMAIL_API,
} = studentEndpoints;

// Load Razorpay script
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
}

// ================= BUY COURSE =================
export async function buyCourse(
  token,
  courses,
  userDetails,
  navigate,
  dispatch
) {
  const toastId = toast.loading("Loading...");

  try {
    // Load Razorpay SDK
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      toast.error("Razorpay SDK failed to load");
      return;
    }

    // Create Order
    const orderResponse = await apiConnector(
      "POST",
      COURSE_PAYMENT_API,
      { courses },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    console.log("ORDER RESPONSE:", orderResponse.data.data);

    if (!orderResponse.data.success) {
      throw new Error(orderResponse.data.message);
    }

    // Razorpay Options
    const options = {
      key: orderResponse.data.razorpayKey || process.env.REACT_APP_RAZORPAY_KEY,
      currency: "INR",
      amount: orderResponse.data.data.amount, // number, not string
      order_id: orderResponse.data.data.id,
      name: "Codeverse",
      description: "Thank You for Purchasing the Course",
      image: rzpLogo,

      prefill: {
        name: `${userDetails.firstName} ${userDetails.lastName || ""}`.trim(),
        email: userDetails.email,
        contact: userDetails.additionalDetails?.contactNumber || "9999999999",
      },

      config: {
        display: {
          blocks: {
            banks: {
              name: "Pay using UPI, Card or Net Banking",
              instruments: [
                {
                  method: "upi",
                },
                {
                  method: "card",
                },
                {
                  method: "netbanking",
                },
              ],
            },
          },
          sequence: ["block.banks"],
          preferences: {
            show_default_blocks: true,
          },
        },
      },

      handler: function (response) {
        // Send success email
        sendPaymentSuccessEmail(
          response,
          orderResponse.data.data.amount,
          token
        );

        // Verify payment
        verifyPayment(
          { ...response, courses },
          token,
          navigate,
          dispatch
        );
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();

    paymentObject.on("payment.failed", function (response) {
      toast.error("Oops, payment failed");
      console.log(response.error);
    });
  } catch (error) {
    console.log("PAYMENT API ERROR:", error);
    toast.error("Could not make Payment");
  }

  toast.dismiss(toastId);
}

// ================= SUCCESS EMAIL =================
async function sendPaymentSuccessEmail(response, amount, token) {
  try {
    await apiConnector(
      "POST",
      SEND_PAYMENT_SUCCESS_EMAIL_API,
      {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        amount,
      },
      {
        Authorization: `Bearer ${token}`,
      }
    );
  } catch (error) {
    console.log("PAYMENT SUCCESS EMAIL ERROR:", error);
  }
}

// ================= VERIFY PAYMENT =================
async function verifyPayment(bodyData, token, navigate, dispatch) {
  const toastId = toast.loading("Verifying Payment...");
  dispatch(setPaymentLoading(true));

  try {
    const response = await apiConnector(
      "POST",
      COURSE_VERIFY_API,
      bodyData,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    toast.success("Payment Successful, you are added to the course");
    navigate("/dashboard/enrolled-courses");
    dispatch(resetCart());
  } catch (error) {
    console.log("PAYMENT VERIFY ERROR:", error);
    toast.error("Could not verify Payment");
  }

  toast.dismiss(toastId);
  dispatch(setPaymentLoading(false));
}
