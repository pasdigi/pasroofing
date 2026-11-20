export interface RoofingPlan {
  id: string;
  slug: string;
  name: string;
  price: number;
  billingType: string;
  isDeposit: boolean;
  badge: string;
  description: string;
  features: string[];
}

export const siteConfig = {
  company: {
    name: "Apex Shield Roofing Co.",
    tagline: "Licensed, Bonded & Insured Texas Roofing Specialists",
    phone: "(512) 555-0194",
    email: "estimates@apexshieldroofing.com",
    license: "TX-RCAT #88412",
    whopAccountId: import.meta.env.VITE_WHOP_ACCOUNT_ID || "biz_N99ULBvp0AJmlc",
    yearsInBusiness: "15+ Years",
    rating: "4.9",
    reviewCount: "340+",
  },
  serviceArea: {
    region: "Greater Austin & Central Texas",
    cities: ["Austin", "Round Rock", "Cedar Park", "Georgetown", "Pflugerville", "Lakeway", "San Marcos", "Kyle"],
    zipCodes: "78701-78759, 78664, 78613, 78626",
  },
  financing: {
    headline: "Flexible Monthly Financing Available at Checkout",
    subheadline: "Split your roof replacement or major repair into manageable payments. Klarna, Afterpay, and Splitit appear automatically inside our Whop checkout for approved merchants.",
    providers: ["Klarna", "Afterpay", "Splitit", "Apple Pay", "Google Pay"],
  },
  plans: {
    inspection: {
      id: import.meta.env.VITE_PLAN_INSPECTION || "plan_mEYFnBJnesMI7",
      slug: "inspection",
      name: "21-Point Roof & Drone Inspection",
      price: 149,
      billingType: "One-time",
      isDeposit: false,
      badge: "Most Popular First Step",
      description: "Full shingle, flashing, decking, and thermal drone inspection with a same-day photo report and itemized quote.",
      features: ["HD drone & attic moisture check", "Insurance-ready storm damage report", "100% credited toward any full replacement"],
    },
    deposit: {
      id: import.meta.env.VITE_PLAN_DEPOSIT || "plan_jjnwtZnzJ2UZK",
      slug: "deposit",
      name: "Project Scheduling Deposit",
      price: 500,
      billingType: "Deposit (Card on File)",
      isDeposit: true,
      badge: "Locks Your Crew Date",
      description: "Reserve your crew and material order. Your card is securely saved via Whop Setup Intent so the final balance can be invoiced upon completion.",
      features: ["Locks material pricing & install date", "Secure card-on-file via Whop Setup Intent", "Final balance invoiced only after walkthrough"],
    },
    flatRate: {
      id: import.meta.env.VITE_PLAN_FLATRATE || "plan_Dte4q1pdtIXyd",
      slug: "flat-rate-repair",
      name: "Flat-Rate Emergency Leak Repair & Tune-Up",
      price: 299,
      billingType: "Flat-Rate Service",
      isDeposit: false,
      badge: "Same-Week Service",
      description: "Upfront flat-rate fix for pipe boot leaks, lifted shingles, exposed nail heads, and ridge vent resealing.",
      features: ["Up to 15 replacement shingles included", "Pipe boot & flashing waterproof reseal", "2-year workmanship leak warranty"],
    },
  } satisfies Record<string, RoofingPlan>,
  servicesOverview: [
    { id: "repair", title: "Roof Repair", summary: "Fast hail, wind, and leak repairs with exact-match shingles and flashing restoration.", startingPrice: "$299 Flat-Rate", planKey: "flatRate" as const },
    { id: "replacement", title: "Full Roof Replacement", summary: "Architectural shingle, standing-seam metal, and Class 4 impact-resistant systems backed by a 25-year warranty.", startingPrice: "$500 Deposit to Start", planKey: "deposit" as const },
    { id: "inspection", title: "Certified Roof Inspection", summary: "21-point physical and drone inspection for homeowners, real estate closings, and storm claims.", startingPrice: "$149 One-Time", planKey: "inspection" as const },
  ],
  reviews: [
    { name: "Marcus D.", location: "Round Rock, TX", service: "Full Roof Replacement", text: "Booked the $149 inspection, put down the $500 deposit online with Apple Pay, and paid the final invoice right after cleanup." },
    { name: "Sarah K.", location: "Austin, TX", service: "Emergency Leak Repair", text: "Transparent $299 flat-rate repair. They sealed two cracked pipe boots the next morning before the rain hit." },
    { name: "David & Elena R.", location: "Cedar Park, TX", service: "Storm Replacement", text: "Used Klarna right at checkout to split the balance. Best contractor experience we have had in 10 years." },
  ],
};




