using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    public class FileUploadRequest
    {
        public IFormFile File { get; set; } = null!;
    }

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

        // POST: api/Attachments/upload?ticketId=1
        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadFile(
            [FromForm] FileUploadRequest request,
            [FromQuery] int ticketId)
        {
            var file = request.File;

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

            var storedFileName =
                $"{Guid.NewGuid()}_{file.FileName}";

            var fullPath = Path.Combine(
                uploadsFolder,
                storedFileName
            );

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

        // GET: api/Attachments/ticket/1
        [HttpGet("ticket/{ticketId}")]
        public async Task<IActionResult> GetTicketAttachments(int ticketId)
        {
            var attachments = await _context.Attachments
                .Where(a => a.TicketId == ticketId)
                .OrderByDescending(a => a.UploadedAt)
                .ToListAsync();

            return Ok(attachments);
        }

        // GET: api/Attachments/download/5
        [HttpGet("download/{id}")]
        public async Task<IActionResult> DownloadFile(int id)
        {
            var attachment = await _context.Attachments.FindAsync(id);

            if (attachment == null)
            {
                return NotFound("Attachment not found.");
            }

            var uploadsFolder = Path.Combine(
                _environment.ContentRootPath,
                "Uploads"
            );

            var fullPath = Path.Combine(
                uploadsFolder,
                attachment.FilePath
            );

            if (!System.IO.File.Exists(fullPath))
            {
                return NotFound("File not found on server.");
            }

            var bytes = await System.IO.File.ReadAllBytesAsync(fullPath);

            return File(
                bytes,
                attachment.ContentType,
                attachment.FileName
            );
        }
    }
}