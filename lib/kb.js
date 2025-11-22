export const kbArticles = [
  {
    id: "kb_001",
    title: "How to Configure Automations",
    content:
      "To configure automations in Hiver, go to the Admin Panel > Automations. Click on 'Create New Automation'. You can set triggers based on subject, sender, or body content. Actions include auto-assigning, tagging, or changing status. Ensure you save your changes for the automation to take effect immediately.",
    tags: ["automation", "setup", "configuration"],
  },
  {
    id: "kb_002",
    title: "Troubleshooting CSAT Visibility",
    content:
      "If CSAT scores are not appearing in your dashboard, first check if the CSAT feature is enabled in Settings > Feedback. If enabled, verify that the date range filter in the Analytics dashboard includes the dates where surveys were sent. Note that CSAT data may take up to 1 hour to sync after a customer responds.",
    tags: ["csat", "analytics", "troubleshooting"],
  },
  {
    id: "kb_003",
    title: "Managing Shared Mailboxes",
    content:
      "Shared mailboxes allow multiple users to access the same email account. To add a user, go to Settings > Shared Mailboxes > Users. If you encounter permission errors, ensure the user has been granted 'Full Access' or 'Delegate' permissions in the Google Workspace admin console as well.",
    tags: ["mailbox", "permissions", "access"],
  },
  {
    id: "kb_004",
    title: "Setting up SLAs",
    content:
      "Service Level Agreements (SLAs) help track response and resolution times. Navigate to Admin > SLAs. You can define different policies for different customer tiers (e.g., VIP vs Standard). SLAs can be configured to trigger alerts if a conversation remains unreplied for a specific duration.",
    tags: ["sla", "setup", "timings"],
  },
  {
    id: "kb_005",
    title: "Understanding Billing and Invoices",
    content:
      "Hiver billing is based on the number of active seats. You can view your current plan and invoices under Settings > Billing. If you see a discrepancy in user count, check the 'Inactive Users' list to ensure removed users are not still consuming a license.",
    tags: ["billing", "finance", "account"],
  },
  {
    id: "kb_006",
    title: "Mail Merge Guide",
    content:
      "Mail merge allows sending personalized emails to multiple recipients. Upload your CSV file with columns matching your variables (e.g., {{First Name}}). If the merge fails, check that your CSV is UTF-8 encoded and contains no empty rows. The daily sending limit depends on your Google Workspace plan.",
    tags: ["mail merge", "email", "feature"],
  },
]

