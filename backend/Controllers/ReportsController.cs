using backend.Data;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

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
            QuestPDF.Settings.License = LicenseType.Community;
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
                .GroupBy(t => new { t.CreatedAt.Year, t.CreatedAt.Month })
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

        [HttpGet("export/excel")]
        public async Task<IActionResult> ExportExcel()
        {
            var tickets = await _context.Tickets
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Ticket Reports");

            worksheet.Cell(1, 1).Value = "ID";
            worksheet.Cell(1, 2).Value = "Title";
            worksheet.Cell(1, 3).Value = "Status";
            worksheet.Cell(1, 4).Value = "Priority";
            worksheet.Cell(1, 5).Value = "Category";
            worksheet.Cell(1, 6).Value = "Assigned Agent ID";
            worksheet.Cell(1, 7).Value = "Created At";
            worksheet.Cell(1, 8).Value = "Updated At";

            var header = worksheet.Range("A1:H1");
            header.Style.Font.Bold = true;
            header.Style.Fill.BackgroundColor = XLColor.LightGray;

            for (int i = 0; i < tickets.Count; i++)
            {
                var row = i + 2;
                var ticket = tickets[i];

                worksheet.Cell(row, 1).Value = ticket.Id;
                worksheet.Cell(row, 2).Value = ticket.Title;
                worksheet.Cell(row, 3).Value = ticket.Status;
                worksheet.Cell(row, 4).Value = ticket.Priority;
                worksheet.Cell(row, 5).Value = ticket.Category;
                worksheet.Cell(row, 6).Value = ticket.AssignedAgentId?.ToString() ?? "Unassigned";
                worksheet.Cell(row, 7).Value = ticket.CreatedAt.ToString("yyyy-MM-dd HH:mm");
                worksheet.Cell(row, 8).Value = ticket.UpdatedAt.ToString("yyyy-MM-dd HH:mm");
            }

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);

            return File(
                stream.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "ticket-report.xlsx"
            );
        }

        [HttpGet("export/pdf")]
        public async Task<IActionResult> ExportPdf()
        {
            var tickets = await _context.Tickets
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            var pdfBytes = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(30);
                    page.Size(PageSizes.A4);

                    page.Header()
                        .Text("IT Help Desk Ticket Report")
                        .FontSize(20)
                        .Bold();

                    page.Content().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn(1);
                            columns.RelativeColumn(3);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                            columns.RelativeColumn(2);
                        });

                        table.Header(header =>
                        {
                            header.Cell().Text("ID").Bold();
                            header.Cell().Text("Title").Bold();
                            header.Cell().Text("Status").Bold();
                            header.Cell().Text("Priority").Bold();
                            header.Cell().Text("Category").Bold();
                        });

                        foreach (var ticket in tickets)
                        {
                            table.Cell().Text(ticket.Id.ToString());
                            table.Cell().Text(ticket.Title);
                            table.Cell().Text(ticket.Status);
                            table.Cell().Text(ticket.Priority);
                            table.Cell().Text(ticket.Category);
                        }
                    });

                    page.Footer()
                        .AlignCenter()
                        .Text(text =>
                        {
                            text.Span("Generated on ");
                            text.Span(DateTime.Now.ToString("yyyy-MM-dd HH:mm"));
                        });
                });
            }).GeneratePdf();

            return File(pdfBytes, "application/pdf", "ticket-report.pdf");
        }
    }
}