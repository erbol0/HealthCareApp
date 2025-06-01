export const PLANS = [
  {
    name: "Free",
    info: "Free forever",
    price: 0,
    features: [
      {
        text: "Basic health tracking",
      },
      {
        text: "Personalized health profile",
      },
      {
        text: "Medication recommendations",
        tooltip: "Up to 50 recommendations per month",
      },
      {
        text: "AI-powered symptom suggestions",
        tooltip: "Get upto 10 suggestions per month",
      },
    ],
    btn: {
      text: "Start now",
      href: "/dashboard",
    },
  },
  {
    name: "Pro",
    info: "Get the best of AkylMed",
    price: 9,
    features: [
      {
        text: "Advanced health tracking",
      },
      {
        text: "Personalized health profile",
      },
      {
        text: "Priority support",
      },
      {
        text: "Medication recommendations",
        tooltip: "Get unlimited recommendations",
      },
      {
        text: "AI-powered symptom suggestions",
        tooltip: "Get unlimited suggestions",
      },
    ],
    btn: {
      text: "Dashboard",
      href: "/dashboard",
    },
  },
];
