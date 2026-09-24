using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NutriSoftware.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Fase2_PacienteCitaAlimento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Tipo",
                table: "Citas",
                newName: "TipoConsulta");

            migrationBuilder.AddColumn<string>(
                name: "Direccion",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Dni",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notas",
                table: "Pacientes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DuracionMinutos",
                table: "Citas",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Modalidad",
                table: "Citas",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Direccion",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Dni",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "Notas",
                table: "Pacientes");

            migrationBuilder.DropColumn(
                name: "DuracionMinutos",
                table: "Citas");

            migrationBuilder.DropColumn(
                name: "Modalidad",
                table: "Citas");

            migrationBuilder.RenameColumn(
                name: "TipoConsulta",
                table: "Citas",
                newName: "Tipo");
        }
    }
}
