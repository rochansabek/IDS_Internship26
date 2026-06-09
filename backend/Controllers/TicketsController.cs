using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TicketsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TicketsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<Ticket>>> GetTickets()
    {
        return await _context.Tickets.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Ticket>> GetTicket(int id)
    {
        Ticket? ticket = await _context.Tickets.FindAsync(id);

        if (ticket == null)
        {
            return NotFound();
        }

        return ticket;
    }

    [HttpPost]
    public async Task<ActionResult<Ticket>> CreateTicket(Ticket ticket)
    {
        ticket.Id = 0;
        ticket.Status = "Open";
        ticket.CreatedAt = DateTime.UtcNow;
        ticket.UpdatedAt = DateTime.UtcNow;

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        _context.TicketActivities.Add(new TicketActivity
        {
            TicketId = ticket.Id,
            UserId = 0,
            Action = "Ticket Created",
            NewValue = ticket.Title,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetTicket), new { id = ticket.Id }, ticket);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTicket(int id, Ticket updatedTicket)
    {
        Ticket? ticket = await _context.Tickets.FindAsync(id);

        if (ticket == null)
        {
            return NotFound();
        }

        ticket.Title = updatedTicket.Title;
        ticket.Description = updatedTicket.Description;
        ticket.Priority = updatedTicket.Priority;
        ticket.Category = updatedTicket.Category;
        ticket.Status = updatedTicket.Status;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _context.TicketActivities.Add(new TicketActivity
        {
            TicketId = ticket.Id,
            UserId = 0,
            Action = "Ticket Updated",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTicket(int id)
    {
        Ticket? ticket = await _context.Tickets.FindAsync(id);

        if (ticket == null)
        {
            return NotFound();
        }

        _context.TicketActivities.Add(new TicketActivity
        {
            TicketId = ticket.Id,
            UserId = 0,
            Action = "Ticket Deleted",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        _context.Tickets.Remove(ticket);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // ASSIGN TICKET

    [HttpPut("{id}/assign/{agentId}")]
    public async Task<IActionResult> AssignTicket(int id, int agentId)
    {
        Ticket? ticket = await _context.Tickets.FindAsync(id);

        if (ticket == null)
        {
            return NotFound();
        }

        ticket.AssignedAgentId = agentId;
        ticket.Status = "Assigned";
        ticket.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _context.TicketActivities.Add(new TicketActivity
        {
            TicketId = ticket.Id,
            UserId = agentId,
            Action = "Ticket Assigned",
            NewValue = $"Assigned to Agent {agentId}",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        return Ok(ticket);
    }

    // UPDATE STATUS

    [HttpPut("{id}/status/{status}")]
    public async Task<IActionResult> UpdateStatus(int id, string status)
    {
        Ticket? ticket = await _context.Tickets.FindAsync(id);

        if (ticket == null)
        {
            return NotFound();
        }

        string oldStatus = ticket.Status;

        ticket.Status = status;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _context.TicketActivities.Add(new TicketActivity
        {
            TicketId = ticket.Id,
            UserId = 0,
            Action = "Status Updated",
            OldValue = oldStatus,
            NewValue = status,
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        return Ok(ticket);
    }

    // ADD COMMENT

    [HttpPost("{id}/comments")]
    public async Task<IActionResult> AddComment(int id, TicketComment comment)
    {
        Ticket? ticket = await _context.Tickets.FindAsync(id);

        if (ticket == null)
        {
            return NotFound();
        }

        comment.Id = 0;
        comment.TicketId = id;
        comment.CreatedAt = DateTime.UtcNow;

        _context.TicketComments.Add(comment);

        await _context.SaveChangesAsync();

        _context.TicketActivities.Add(new TicketActivity
        {
            TicketId = id,
            UserId = comment.UserId,
            Action = "Comment Added",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        return Ok(comment);
    }

    // GET COMMENTS

    [HttpGet("{id}/comments")]
    public async Task<ActionResult<List<TicketComment>>> GetComments(int id)
    {
        return await _context.TicketComments
            .Where(c => c.TicketId == id)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();
    }

    // GET ACTIVITY LOG

    [HttpGet("{id}/activities")]
    public async Task<ActionResult<List<TicketActivity>>> GetActivities(int id)
    {
        return await _context.TicketActivities
            .Where(a => a.TicketId == id)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }
}