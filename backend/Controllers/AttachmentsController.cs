using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttachmentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public AttachmentsController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(
            [FromForm] IFormFile file,
            [FromQuery] int ticketId)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file selected.");
            }

            var ticket = await _context.Tickets.FindAsync(ticketId);

            if (ticket == null)
            {
                return NotFound("Ticket not found.");
            }

            var uploadsFolder = Path.Combine(_environment.ContentRootPath, "Uploads");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var storedFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            var fullPath = Path.Combine(uploadsFolder, storedFileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var attachment = new Attachment
            {
                TicketId = ticketId,
                FileName = file.FileName,
                FilePath = storedFileName,
                ContentType = file.ContentType,
                UploadedAt = DateTime.UtcNow
            };

            _context.Attachments.Add(attachment);
            await _context.SaveChangesAsync();

            return Ok(attachment);
        }

        [HttpGet("ticket/{ticketId}")]
        public async Task<IActionResult> GetTicketAttachments(int ticketId)
        {
            var attachments = await _context.Attachments
                .Where(a => a.TicketId == ticketId)
                .OrderByDescending(a => a.UploadedAt)
                .ToListAsync();

            return Ok(attachments);
        }

        [HttpGet("download/{id}")]
        public async Task<IActionResult> DownloadFile(int id)
        {
            var attachment = await _context.Attachments.FindAsync(id);

            if (attachment == null)
            {
                return NotFound("Attachment not found.");
            }

            var uploadsFolder = Path.Combine(_environment.ContentRootPath, "Uploads");
            var fullPath = Path.Combine(uploadsFolder, attachment.FilePath);

            if (!System.IO.File.Exists(fullPath))
            {
                return NotFound("File not found on server.");
            }

            var bytes = await System.IO.File.ReadAllBytesAsync(fullPath);

            return File(bytes, attachment.ContentType, attachment.FileName);
        }
    }
}