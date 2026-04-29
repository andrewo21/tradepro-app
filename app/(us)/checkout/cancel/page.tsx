export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-xl p-10 border border-gray-200 max-w-lg text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">
          Checkout Canceled
        </h1>

        <p className="text-gray-700 text-lg mb-6">
          Your purchase was not completed. You can try again anytime.
        </p>

        <a
          href="/pricing"
          className="inline-block mt-4 px-6 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition"
        >
          Return to Pricing
        </a>
      </div>
    </div>
  );
}
