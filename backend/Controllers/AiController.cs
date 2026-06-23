using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AiController : ControllerBase
    {
        public class TicketAiRequest
        {
            public string Title { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
        }

        public class ChatbotRequest
        {
            public string Message { get; set; } = string.Empty;
        }

        [HttpPost("categorize-ticket")]
        public IActionResult CategorizeTicket([FromBody] TicketAiRequest request)
        {
            var text = $"{request.Title} {request.Description}".ToLower();
            string category = "General";

            if (ContainsAny(text, "password", "login", "account", "locked", "access", "sign in", "signin"))
                category = "Authentication";
            else if (ContainsAny(text, "internet", "network", "wifi", "wi-fi", "connection", "vpn", "router"))
                category = "Network";
            else if (ContainsAny(text, "email", "outlook", "mail", "inbox", "smtp"))
                category = "Email";
            else if (ContainsAny(text, "printer", "keyboard", "mouse", "screen", "monitor", "laptop", "hardware"))
                category = "Hardware";
            else if (ContainsAny(text, "app", "software", "program", "install", "update", "crash", "bug"))
                category = "Software";
            else if (ContainsAny(text, "payment", "invoice", "billing", "receipt"))
                category = "Payment";
            else if (ContainsAny(text, "slow", "performance", "lag", "freezing", "loading"))
                category = "Performance";
            else if (ContainsAny(text, "feature", "request", "add option", "improvement"))
                category = "Feature Request";

            return Ok(new
            {
                category,
                reason = $"The ticket was categorized as {category} based on its title and description."
            });
        }

        [HttpPost("detect-priority")]
        public IActionResult DetectPriority([FromBody] TicketAiRequest request)
        {
            var text = $"{request.Title} {request.Description}".ToLower();
            string priority = "Medium";

            if (ContainsAny(text, "urgent", "critical", "system down", "server down", "cannot work", "blocked completely", "production down"))
                priority = "Critical";
            else if (ContainsAny(text, "important", "blocked", "error", "crash", "failed", "cannot login", "cannot access"))
                priority = "High";
            else if (ContainsAny(text, "minor", "small issue", "question", "whenever possible", "not urgent"))
                priority = "Low";

            return Ok(new
            {
                priority,
                reason = $"The ticket priority was detected as {priority} based on urgency and impact keywords."
            });
        }

        [HttpPost("summarize-ticket")]
        public IActionResult SummarizeTicket([FromBody] TicketAiRequest request)
        {
            var category = DetectCategoryText(request.Title, request.Description);
            var priority = DetectPriorityText(request.Title, request.Description);

            var summary =
                $"This ticket appears to be a {category} issue with {priority} priority. " +
                $"The user reported: \"{request.Title}\". " +
                $"Details provided: {request.Description}";

            return Ok(new { summary });
        }

        [HttpPost("troubleshooting-suggestions")]
        public IActionResult TroubleshootingSuggestions([FromBody] TicketAiRequest request)
        {
            var text = $"{request.Title} {request.Description}".ToLower();
            List<string> suggestions = new();

            if (ContainsAny(text, "password", "login", "account", "locked", "sign in", "signin", "access"))
            {
                suggestions.Add("Confirm the user's username or email address.");
                suggestions.Add("Check whether the account is locked or disabled.");
                suggestions.Add("Try a password reset and ask the user to test login again.");
                suggestions.Add("Verify role permissions if the user can log in but cannot access a page.");
            }
            else if (ContainsAny(text, "internet", "wifi", "wi-fi", "network", "connection", "vpn", "router"))
            {
                suggestions.Add("Ask whether other users are affected or only this device.");
                suggestions.Add("Have the user reconnect to Wi-Fi or VPN and test again.");
                suggestions.Add("Check network status, IP configuration, and connectivity.");
                suggestions.Add("Escalate to network support if multiple users are affected.");
            }
            else if (ContainsAny(text, "email", "outlook", "mail", "inbox", "send", "receive", "smtp"))
            {
                suggestions.Add("Check if the user can access email from webmail.");
                suggestions.Add("Verify mailbox storage and account status.");
                suggestions.Add("Ask for any bounce-back or error message.");
                suggestions.Add("Restart the email client and resync the mailbox.");
            }
            else if (ContainsAny(text, "printer", "print", "scanner", "keyboard", "mouse", "screen", "monitor", "laptop", "hardware"))
            {
                suggestions.Add("Ask the user to confirm the device model and connection type.");
                suggestions.Add("Check cables, power, and whether the device appears in system settings.");
                suggestions.Add("Restart the device and test with another computer if possible.");
                suggestions.Add("Update or reinstall the device driver if needed.");
            }
            else if (ContainsAny(text, "software", "app", "program", "install", "update", "crash", "bug", "not opening"))
            {
                suggestions.Add("Ask when the issue started and whether there was a recent update.");
                suggestions.Add("Restart the application and test again.");
                suggestions.Add("Check application logs or error messages.");
                suggestions.Add("Reinstall or update the software if the issue continues.");
            }
            else if (ContainsAny(text, "slow", "performance", "lag", "freezing", "loading", "timeout"))
            {
                suggestions.Add("Ask when the slowdown started and how often it happens.");
                suggestions.Add("Check CPU, memory, network, and server performance.");
                suggestions.Add("Clear browser cache or restart the affected application.");
                suggestions.Add("Compare performance with another device or user account.");
            }
            else if (ContainsAny(text, "payment", "invoice", "billing", "receipt", "transaction"))
            {
                suggestions.Add("Verify the invoice or transaction ID.");
                suggestions.Add("Check whether the payment was completed or pending.");
                suggestions.Add("Ask the user for a screenshot of the billing error.");
                suggestions.Add("Escalate to the finance or billing team if needed.");
            }
            else if (ContainsAny(text, "attachment", "upload", "file", "document", "pdf", "image", "screenshot"))
            {
                suggestions.Add("Check the file type and file size.");
                suggestions.Add("Ask the user to try uploading a smaller file.");
                suggestions.Add("Verify that the ticket attachment endpoint is working.");
                suggestions.Add("Check whether the file was saved correctly on the server.");
            }
            else
            {
                suggestions.Add("Ask the user for screenshots, error messages, or more details.");
                suggestions.Add("Confirm when the issue started and whether it happens every time.");
                suggestions.Add("Check recent changes related to the affected system.");
                suggestions.Add("Assign the ticket to the most relevant support agent.");
            }

            return Ok(new { suggestions });
        }

        [HttpPost("chatbot")]
        public IActionResult Chatbot([FromBody] ChatbotRequest request)
        {
            var message = request.Message.ToLower().Trim();

            string reply;

            if (string.IsNullOrWhiteSpace(message))
            {
                reply = "You can ask me about creating tickets, priorities, statuses, attachments, login issues, network issues, reports, or troubleshooting steps.";
            }
            else if (ContainsAny(message, "hello", "hi", "hey", "good morning", "good afternoon", "good evening"))
            {
                reply = "Hi! How can I help you today?";
            }
            else if (ContainsAny(message, "create", "new ticket", "submit", "open ticket", "report issue"))
            {
                reply = "To create a ticket, go to Create Ticket, enter a clear title, describe the issue, choose or accept the AI-suggested category and priority, attach files if needed, then submit.";
            }
            else if (ContainsAny(message, "attachment", "attachments", "upload", "file", "files", "screenshot", "document", "pdf"))
            {
                reply = "Attachments let users upload screenshots, PDFs, or documents to support a ticket. You can attach files while creating a ticket or from the ticket details page.";
            }
            else if (ContainsAny(message, "priority", "priorities", "critical", "high", "medium", "low"))
            {
                reply = "Ticket priorities are Low, Medium, High, and Critical. Critical is used when the issue blocks work or affects many users.";
            }
            else if (ContainsAny(message, "status", "statuses", "open", "assigned", "progress", "resolved", "closed"))
            {
                reply = "Ticket statuses are Open, Assigned, In Progress, Resolved, and Closed. They show where the ticket is in the support workflow.";
            }
            else if (ContainsAny(message, "login", "password", "account", "access", "sign in", "signin"))
            {
                reply = "For login or account access issues, first confirm the username or email, check whether the account is active, then try a password reset.";
            }
            else if (ContainsAny(message, "network", "wifi", "wi-fi", "internet", "connection", "vpn", "router"))
            {
                reply = "For network issues, check whether one user or multiple users are affected, test Wi-Fi or VPN, and verify the connection before escalating.";
            }
            else if (ContainsAny(message, "summary", "summarize"))
            {
                reply = "The AI summary feature reads the ticket title and description, then generates a short explanation of the main issue.";
            }
            else if (ContainsAny(message, "troubleshooting", "suggestions", "fix", "solve", "steps"))
            {
                reply = "Troubleshooting suggestions give support agents possible next steps based on the ticket description, such as checking account access, network settings, software errors, or attachments.";
            }
            else if (ContainsAny(message, "reports", "analytics", "export", "excel", "pdf"))
            {
                reply = "The Reports page shows ticket analytics, charts, KPI cards, and lets you export ticket reports as Excel or PDF files.";
            }
            else
            {
                reply = "I can help with creating tickets, attachments, statuses, priorities, login issues, network issues, reports, AI summaries, and troubleshooting suggestions. Try asking: 'How do I create a ticket?'";
            }

            return Ok(new { reply });
        }

        private static string DetectCategoryText(string title, string description)
        {
            var text = $"{title} {description}".ToLower();

            if (ContainsAny(text, "password", "login", "account", "locked", "access"))
                return "Authentication";
            if (ContainsAny(text, "internet", "network", "wifi", "wi-fi", "connection", "vpn"))
                return "Network";
            if (ContainsAny(text, "email", "outlook", "mail", "inbox"))
                return "Email";
            if (ContainsAny(text, "printer", "keyboard", "mouse", "screen", "monitor", "laptop", "hardware"))
                return "Hardware";
            if (ContainsAny(text, "software", "app", "program", "install", "update", "crash", "bug"))
                return "Software";
            if (ContainsAny(text, "payment", "invoice", "billing"))
                return "Payment";
            if (ContainsAny(text, "slow", "performance", "lag", "freezing"))
                return "Performance";

            return "General";
        }

        private static string DetectPriorityText(string title, string description)
        {
            var text = $"{title} {description}".ToLower();

            if (ContainsAny(text, "urgent", "critical", "down", "cannot work", "production down"))
                return "Critical";
            if (ContainsAny(text, "important", "blocked", "error", "crash", "failed"))
                return "High";
            if (ContainsAny(text, "minor", "small issue", "question", "not urgent"))
                return "Low";

            return "Medium";
        }

        private static bool ContainsAny(string text, params string[] keywords)
        {
            return keywords.Any(keyword => text.Contains(keyword));
        }
    }
}
