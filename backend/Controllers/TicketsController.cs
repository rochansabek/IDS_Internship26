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
    public async Task<ActionResult<List<object>>> GetTickets()
    {
        var tickets = await _context.Tickets
            .Include(t => t.Requester)
            .Include(t => t.AssignedAgent)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new
            {
                t.Id,
                t.Title,
                t.Description,
                t.Status,
                t.Priority,
                t.Category,
                t.RequesterId,
                RequesterName = t.Requester != null ? t.Requester.FullName : "Unknown User",
                RequesterEmail = t.Requester != null ? t.Requester.Email : "No email available",
                t.AssignedAgentId,
                AssignedAgentName = t.AssignedAgent != null ? t.AssignedAgent.FullName : null,
                AssignedAgentEmail = t.AssignedAgent != null ? t.AssignedAgent.Email : null,
                t.CreatedAt,
                t.UpdatedAt
            })
            .ToListAsync();

        return Ok(tickets);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<object>> GetTicket(int id)
    {
        var ticket = await _context.Tickets
            .Include(t => t.Requester)
            .Include(t => t.AssignedAgent)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            ticket.Id,
            ticket.Title,
            ticket.Description,
            ticket.Status,
            ticket.Priority,
            ticket.Category,
            ticket.RequesterId,
            RequesterName = ticket.Requester != null ? ticket.Requester.FullName : "Unknown User",
            RequesterEmail = ticket.Requester != null ? ticket.Requester.Email : "No email available",
            ticket.AssignedAgentId,
            AssignedAgentName = ticket.AssignedAgent != null ? ticket.AssignedAgent.FullName : null,
            AssignedAgentEmail = ticket.AssignedAgent != null ? ticket.AssignedAgent.Email : null,
            ticket.CreatedAt,
            ticket.UpdatedAt
        });
    }

    [HttpPost]
    public async Task<ActionResult<Ticket>> CreateTicket(Ticket ticket)
    {
        ticket.Id = 0;
        ticket.Status = "Open";
        ticket.CreatedAt = DateTime.UtcNow;
        ticket.UpdatedAt = DateTime.UtcNow;

        if (ticket.RequesterId == 0)
        {
            ticket.RequesterId = null;
        }

        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();

        _context.TicketActivities.Add(new TicketActivity
        {
            TicketId = ticket.Id,
            UserId = ticket.RequesterId ?? 0,
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
            UserId = updatedTicket.RequesterId ?? 0,
            Action = "Ticket Updated",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        await CreateNotification(ticket.Id, $"Ticket TKT-{ticket.Id} was updated.");

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
            UserId = ticket.RequesterId ?? 0,
            Action = "Ticket Deleted",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        await CreateNotification(ticket.Id, $"Ticket TKT-{ticket.Id} was deleted.");

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
            return NotFound("Ticket not found.");
        }

        AppUser? user = await _context.Users.FindAsync(agentId);

        if (user == null)
        {
            return BadRequest("User/employee ID does not exist.");
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
            NewValue = $"Assigned to {user.FullName}",
            CreatedAt = DateTime.UtcNow
        });

        await _context.SaveChangesAsync();

        await CreateNotification(
            ticket.Id,
            $"Ticket TKT-{ticket.Id} was assigned to {user.FullName}."
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
            UserId = ticket.RequesterId ?? 0,
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

        await CreateNotification(id, $"New comment added on Ticket TKT-{id}.");

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