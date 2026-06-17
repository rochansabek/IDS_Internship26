using backend.Data;
using backend.Hubs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class TicketsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<NotificationHub> _hub;

    public TicketsController(AppDbContext context, IHubContext<NotificationHub> hub)
    {
        _context = context;
        _hub = hub;
    }

    private async Task CreateNotification(int? ticketId, string message)
    {
        var notification = new Notification
        {
            TicketId = ticketId,
            Message = message,
            IsRead = false,
            IsArchived = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        await _hub.Clients.All.SendAsync("ReceiveNotification", notification);
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

        await CreateNotification(
            ticket.Id,
            $"New ticket created: TKT-{ticket.Id} - {ticket.Title}"
        );

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

        await CreateNotification(
            ticket.Id,
            $"Ticket TKT-{ticket.Id} was updated."
        );

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

        await CreateNotification(
            ticket.Id,
            $"Ticket TKT-{ticket.Id} was deleted."
        );

        _context.Tickets.Remove(ticket);
        await _context.SaveChangesAsync();

        return NoContent();
    }

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

        await CreateNotification(
            ticket.Id,
            $"Ticket TKT-{ticket.Id} was assigned to Agent {agentId}."
        );

        return Ok(ticket);
    }

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

        await CreateNotification(
            ticket.Id,
            $"Ticket TKT-{ticket.Id} status changed from {oldStatus} to {status}."
        );

        return Ok(ticket);
    }

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

        await CreateNotification(
            id,
            $"New comment added on Ticket TKT-{id}."
        );

        return Ok(comment);
    }

    [HttpGet("{id}/comments")]
    public async Task<ActionResult<List<TicketComment>>> GetComments(int id)
    {
        return await _context.TicketComments
            .Where(c => c.TicketId == id)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id}/activities")]
    public async Task<ActionResult<List<TicketActivity>>> GetActivities(int id)
    {
        return await _context.TicketActivities
            .Where(a => a.TicketId == id)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }
}