import { DecisionCase } from "../types";

export const SAMPLE_CASES: Array<DecisionCase & { label: string }> = [
  {
    label: "Blinkit & Zepto Shift",
    decision: "Shifting 70% of our organic packaged FMCG brand inventory from our D2C Shopify store to Quick Commerce dark stores (Blinkit, Zepto, Swiggy Instamart) across NCR and Bengaluru",
    objective: "Accelerate to ₹25 Cr annualized run-rate by capturing 10-minute impulse grocery orders, absorbing 24-28% platform commissions.",
    stakeholders: "Direct Shopify subscribers, regional Kirana stockists, dark-store fulfillment warehouse team, 3PL logistics partners.",
    stakes: "Working capital cycle compressed to 14 days; gross margin drops from 58% on web to 34% on quick commerce.",
  },
  {
    label: "Tier-2 Kirana Credit",
    decision: "Rolling out ₹50,000 zero-interest 14-day revolving credit lines to 120,000 Tier-2/Tier-3 Kirana store merchants in UP, Rajasthan, and MP",
    objective: "Capture merchant transaction lock-in before JioFinancial or PhonePe merchant lending monopolizes the regional retail distribution belt.",
    stakeholders: "Rural Kirana proprietors, NBFC co-lending partners, ground field sales force, collections recovery agents.",
    stakes: "₹60 Cr debt capital exposure; projected NPA default ceiling threshold is 4.5%.",
  },
  {
    label: "Sunset INR Pricing",
    decision: "Terminating discounted ₹3,999/mo domestic self-serve SMB tier to mandate a minimum $6,000/yr ($500/mo) global contract size",
    objective: "Stop burning customer success bandwidth on low-ARPU, high-churn Indian SMB accounts to focus 100% on US/EU mid-market enterprises.",
    stakeholders: "650 existing Indian startup customers, customer support team in Bengaluru, US outbound SDR team.",
    stakes: "Immediate loss of ₹3.2 Cr ARR in domestic revenue; 9 months runway to close 15 US pilot contracts.",
  },
];

