using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;

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

        // GET: api/reports/summary
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var totalTickets = await _context.Tickets.CountAsync();

            var openTickets = await _context.Tickets
                .CountAsync(t => t.Status == "Open");

            var assignedTickets = await _context.Tickets
                .CountAsync(t => t.Status == "Assigned");

            var inProgressTickets = await _context.Tickets
                .CountAsync(t => t.Status == "In Progress");

            var resolvedTickets = await _context.Tickets
                .CountAsync(t => t.Status == "Resolved");

            var closedTickets = await _context.Tickets
                .CountAsync(t => t.Status == "Closed");

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

        // GET: api/reports/tickets-by-priority
        [HttpGet("tickets-by-priority")]
        public async Task<IActionResult> GetTicketsByPriority()
        {
            var data = await _context.Tickets
                .GroupBy(t => t.Priority)
                .Select(g => new
                {
                    priority = g.Key,
                    count = g.Count()
                })
                .ToListAsync();

            return Ok(data);
        }

        // GET: api/reports/tickets-by-category
        [HttpGet("tickets-by-category")]
        public async Task<IActionResult> GetTicketsByCategory()
        {
            var data = await _context.Tickets
                .GroupBy(t => t.Category)
                .Select(g => new
                {
                    category = g.Key,
                    count = g.Count()
                })
                .ToListAsync();

            return Ok(data);
        }

        // GET: api/reports/tickets-by-status
        [HttpGet("tickets-by-status")]
        public async Task<IActionResult> GetTicketsByStatus()
        {
            var data = await _context.Tickets
                .GroupBy(t => t.Status)
                .Select(g => new
                {
                    status = g.Key,
                    count = g.Count()
                })
                .ToListAsync();

            return Ok(data);
        }

        // GET: api/reports/monthly-trend
        [HttpGet("monthly-trend")]
        public async Task<IActionResult> GetMonthlyTrend()
        {
            var data = await _context.Tickets
                .GroupBy(t => new
                {
                    t.CreatedAt.Year,
                    t.CreatedAt.Month
                })
                .Select(g => new
                {
                    month = $"{g.Key.Month}/{g.Key.Year}",
                    tickets = g.Count(),
                    resolved = g.Count(x => x.Status == "Resolved" || x.Status == "Closed")
                })
                .OrderBy(x => x.month)
                .ToListAsync();

            return Ok(data);
        }

        // GET: api/reports/agent-performance
        [HttpGet("agent-performance")]
        public async Task<IActionResult> GetAgentPerformance()
        {
            var data = await _context.Tickets
                .Where(t => t.AssignedAgentId != null)
                .GroupBy(t => t.AssignedAgentId)
                .Select(g => new
                {
                    agentId = g.Key,
                    ticketsResolved = g.Count(x =>
                        x.Status == "Resolved" ||
                        x.Status == "Closed")
                })
                .ToListAsync();

            return Ok(data);
        }
    }
}