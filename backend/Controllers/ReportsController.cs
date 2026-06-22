using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var totalTickets = await _context.Tickets.CountAsync();

            var openTickets = await _context.Tickets.CountAsync(t => t.Status == "Open");
            var assignedTickets = await _context.Tickets.CountAsync(t => t.Status == "Assigned");
            var inProgressTickets = await _context.Tickets.CountAsync(t => t.Status == "In Progress");
            var resolvedTickets = await _context.Tickets.CountAsync(t => t.Status == "Resolved");
            var closedTickets = await _context.Tickets.CountAsync(t => t.Status == "Closed");

            return Ok(new
            {
                totalTickets,
                openTickets,
                assignedTickets,
                inProgressTickets,
                resolvedTickets,
                closedTickets
            });
        }

        [HttpGet("tickets-by-priority")]
        public async Task<IActionResult> GetTicketsByPriority()
        {
            var data = await _context.Tickets
                .GroupBy(t => t.Priority)
                .Select(g => new
                {
                    name = string.IsNullOrWhiteSpace(g.Key) ? "Unspecified" : g.Key,
                    value = g.Count()
                })
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("tickets-by-category")]
        public async Task<IActionResult> GetTicketsByCategory()
        {
            var data = await _context.Tickets
                .GroupBy(t => t.Category)
                .Select(g => new
                {
                    name = string.IsNullOrWhiteSpace(g.Key) ? "Unspecified" : g.Key,
                    value = g.Count()
                })
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("tickets-by-status")]
        public async Task<IActionResult> GetTicketsByStatus()
        {
            var data = await _context.Tickets
                .GroupBy(t => t.Status)
                .Select(g => new
                {
                    name = string.IsNullOrWhiteSpace(g.Key) ? "Unspecified" : g.Key,
                    count = g.Count()
                })
                .ToListAsync();

            return Ok(data);
        }

        [HttpGet("monthly-trend")]
        public async Task<IActionResult> GetMonthlyTrend()
        {
            var rawData = await _context.Tickets
                .GroupBy(t => new
                {
                    t.CreatedAt.Year,
                    t.CreatedAt.Month
                })
                .Select(g => new
                {
                    year = g.Key.Year,
                    monthNumber = g.Key.Month,
                    tickets = g.Count(),
                    resolved = g.Count(t => t.Status == "Resolved" || t.Status == "Closed")
                })
                .OrderBy(x => x.year)
                .ThenBy(x => x.monthNumber)
                .ToListAsync();

            var data = rawData.Select(x => new
            {
                month = new DateTime(x.year, x.monthNumber, 1).ToString("MMM"),
                tickets = x.tickets,
                resolved = x.resolved
            });

            return Ok(data);
        }

        [HttpGet("agent-performance")]
        public async Task<IActionResult> GetAgentPerformance()
        {
            var data = await _context.Tickets
                .Where(t => t.AssignedAgentId != null)
                .GroupBy(t => t.AssignedAgentId)
                .Select(g => new
                {
                    name = "Agent " + g.Key,
                    resolved = g.Count(t => t.Status == "Resolved" || t.Status == "Closed"),
                    totalAssigned = g.Count()
                })
                .ToListAsync();

            return Ok(data);
        }
    }
}