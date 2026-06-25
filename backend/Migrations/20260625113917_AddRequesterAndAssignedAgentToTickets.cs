using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    public partial class AddRequesterAndAssignedAgentToTickets : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RequesterId",
                table: "Tickets",
                type: "int",
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE Tickets
                SET AssignedAgentId = NULL
                WHERE AssignedAgentId IS NOT NULL
                AND AssignedAgentId NOT IN (SELECT Id FROM Users);
            ");

            migrationBuilder.Sql(@"
                UPDATE Tickets
                SET RequesterId = NULL
                WHERE RequesterId IS NOT NULL
                AND RequesterId NOT IN (SELECT Id FROM Users);
            ");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_AssignedAgentId",
                table: "Tickets",
                column: "AssignedAgentId");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_RequesterId",
                table: "Tickets",
                column: "RequesterId");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Users_AssignedAgentId",
                table: "Tickets",
                column: "AssignedAgentId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Tickets_Users_RequesterId",
                table: "Tickets",
                column: "RequesterId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Users_AssignedAgentId",
                table: "Tickets");

            migrationBuilder.DropForeignKey(
                name: "FK_Tickets_Users_RequesterId",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_AssignedAgentId",
                table: "Tickets");

            migrationBuilder.DropIndex(
                name: "IX_Tickets_RequesterId",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "RequesterId",
                table: "Tickets");
        }
    }
}