using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttachmentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public AttachmentsController(
            AppDbContext context,
            IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(
            IFormFile file,
            int ticketId)
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

            var uploadsFolder = Path.Combine(
                _environment.ContentRootPath,
                "Uploads"
            );

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var uniqueFileName =
                Guid.NewGuid().ToString() + "_" + file.FileName;

            var filePath = Path.Combine(
                uploadsFolder,
                uniqueFileName
            );

            using (var stream = new FileStream(
                filePath,
                FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var attachment = new Attachment
            {
                TicketId = ticketId,
                FileName = file.FileName,
                FilePath = uniqueFileName,
                ContentType = file.ContentType,
                UploadedAt = DateTime.UtcNow
            };

            _context.Attachments.Add(attachment);
            await _context.SaveChangesAsync();

            return Ok(attachment);
        }

        [HttpGet("ticket/{ticketId}")]
        public IActionResult GetTicketAttachments(int ticketId)
        {
            var attachments = _context.Attachments
                .Where(a => a.TicketId == ticketId)
                .OrderByDescending(a => a.UploadedAt)
                .ToList();

            return Ok(attachments);
        }

        [HttpGet("download/{id}")]
        public async Task<IActionResult> DownloadFile(int id)
        {
            var attachment =
                await _context.Attachments.FindAsync(id);

            if (attachment == null)
            {
                return NotFound();
            }

            var uploadsFolder = Path.Combine(
                _environment.ContentRootPath,
                "Uploads"
            );

            var filePath = Path.Combine(
                uploadsFolder,
                attachment.FilePath
            );

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("File not found.");
            }

            var bytes =
                await System.IO.File.ReadAllBytesAsync(filePath);

            return File(
                bytes,
                attachment.ContentType,
                attachment.FileName
            );
        }
    }
}