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

            if (text.Contains("password") || text.Contains("login") || text.Contains("account"))
                category = "Authentication";
            else if (text.Contains("internet") || text.Contains("network") || text.Contains("wifi"))
                category = "Network";
            else if (text.Contains("payment") || text.Contains("invoice") || text.Contains("billing"))
                category = "Payment";
            else if (text.Contains("slow") || text.Contains("performance") || text.Contains("lag"))
                category = "Performance";
            else if (text.Contains("feature") || text.Contains("request"))
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

            if (text.Contains("urgent") || text.Contains("critical") || text.Contains("down") || text.Contains("cannot work"))
                priority = "Critical";
            else if (text.Contains("important") || text.Contains("blocked") || text.Contains("error"))
                priority = "High";
            else if (text.Contains("minor") || text.Contains("small issue") || text.Contains("question"))
                priority = "Low";

            return Ok(new
            {
                priority,
                reason = $"The ticket priority was detected as {priority} based on urgency keywords."
            });
        }

        [HttpPost("summarize-ticket")]
        public IActionResult SummarizeTicket([FromBody] TicketAiRequest request)
        {
            var summary =
                $"The user reported: \"{request.Title}\". " +
                $"Main issue: {request.Description}";

            return Ok(new
            {
                summary
            });
        }

        [HttpPost("troubleshooting-suggestions")]
        public IActionResult TroubleshootingSuggestions([FromBody] TicketAiRequest request)
        {
            var text = $"{request.Title} {request.Description}".ToLower();

            List<string> suggestions = new();

            if (text.Contains("password") || text.Contains("login"))
            {
                suggestions.Add("Ask the user to confirm their username or email.");
                suggestions.Add("Check whether the account is locked.");
                suggestions.Add("Try resetting the password.");
            }
            else if (text.Contains("internet") || text.Contains("wifi") || text.Contains("network"))
            {
                suggestions.Add("Ask the user to restart their router or reconnect to Wi-Fi.");
                suggestions.Add("Check if other users are also affected.");
                suggestions.Add("Verify network settings and connectivity.");
            }
            else if (text.Contains("slow") || text.Contains("performance"))
            {
                suggestions.Add("Ask when the slowdown started.");
                suggestions.Add("Check server or application performance logs.");
                suggestions.Add("Clear cache and test again.");
            }
            else
            {
                suggestions.Add("Ask the user for screenshots or more details.");
                suggestions.Add("Check recent changes related to the reported issue.");
                suggestions.Add("Assign the ticket to the correct support agent.");
            }

            return Ok(new
            {
                suggestions
            });
        }

        [HttpPost("chatbot")]
        public IActionResult Chatbot([FromBody] ChatbotRequest request)
        {
            var message = request.Message.ToLower();

            string reply;

            if (message.Contains("create ticket"))
                reply = "To create a ticket, go to Create Ticket, enter the title, description, category, and priority, then submit.";
            else if (message.Contains("status"))
                reply = "Ticket statuses include Open, Assigned, In Progress, Resolved, and Closed.";
            else if (message.Contains("priority"))
                reply = "Priorities are usually Low, Medium, High, and Critical depending on urgency and impact.";
            else if (message.Contains("attachment"))
                reply = "You can upload screenshots or documents as attachments when creating or viewing a ticket.";
            else
                reply = "I can help with ticket creation, ticket statuses, priorities, attachments, and troubleshooting steps.";

            return Ok(new
            {
                reply
            });
        }
    }
}