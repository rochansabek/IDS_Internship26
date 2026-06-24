using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.Role
                })
                .OrderBy(u => u.FullName)
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.Role,
                    u.Company,
                    u.Location,
                    u.Phone,
                    u.Bio,
                    u.AvatarUrl
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound("User not found.");
            }

            return Ok(user);
        }

        [HttpGet("agents")]
        public async Task<IActionResult> GetAgents()
        {
            var agents = await _context.Users
                .Where(u => u.Role == "Admin")
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Email,
                    u.Role
                })
                .OrderBy(u => u.FullName)
                .ToListAsync();

            return Ok(agents);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser(CreateUserDto request)
        {
            bool emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email);

            if (emailExists)
            {
                return BadRequest("Email already exists.");
            }

            var user = new AppUser
            {
                FullName = request.FullName,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role,
                Company = "IDS",
                Location = "",
                Phone = "",
                Bio = "",
                AvatarUrl = ""
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.Role
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDto request)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            user.FullName = request.FullName;
            user.Email = request.Email;
            user.Role = request.Role;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.Role
            });
        }

        [HttpPut("{id}/profile")]
        public async Task<IActionResult> UpdateProfile(int id, UpdateProfileDto request)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            bool emailExists = await _context.Users
                .AnyAsync(u => u.Email == request.Email && u.Id != id);

            if (emailExists)
            {
                return BadRequest("Email already exists.");
            }

            user.FullName = request.FullName;
            user.Email = request.Email;
            user.Role = request.Role;
            user.Company = request.Company;
            user.Location = request.Location;
            user.Phone = request.Phone;
            user.Bio = request.Bio;
            user.AvatarUrl = request.AvatarUrl;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                user.Id,
                user.FullName,
                user.Email,
                user.Role,
                user.Company,
                user.Location,
                user.Phone,
                user.Bio,
                user.AvatarUrl
            });
        }

        [HttpPut("{id}/change-password")]
        public async Task<IActionResult> ChangePassword(int id, ChangePasswordDto request)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            bool validPassword = BCrypt.Net.BCrypt.Verify(
                request.CurrentPassword,
                user.PasswordHash
            );

            if (!validPassword)
            {
                return BadRequest("Current password is incorrect.");
            }

            if (string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest("New password is required.");
            }

            if (request.NewPassword.Length < 6)
            {
                return BadRequest("Password must be at least 6 characters.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Password changed successfully." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound("User not found.");
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    public class CreateUserDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = "Employee";
    }

    public class UpdateUserDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = "Employee";
    }

    public class UpdateProfileDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = "Employee";
        public string Company { get; set; } = "IDS";
        public string Location { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string AvatarUrl { get; set; } = string.Empty;
    }

    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }
}