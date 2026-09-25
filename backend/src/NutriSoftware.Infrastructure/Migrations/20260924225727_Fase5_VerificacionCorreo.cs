using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NutriSoftware.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Fase5_VerificacionCorreo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EmailVerificado",
                table: "Usuarios",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TokenVerificacion",
                table: "Usuarios",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TokenVerificacionExpira",
                table: "Usuarios",
                type: "timestamp with time zone",
                nullable: true);

            // Las cuentas que ya existen se dan por verificadas: a nadie se le
            // envio nunca un correo de confirmacion, asi que dejarlas en false
            // las bloquearia a todas en el siguiente despliegue.
            migrationBuilder.Sql(@"UPDATE ""Usuarios"" SET ""EmailVerificado"" = true;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailVerificado",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "TokenVerificacion",
                table: "Usuarios");

            migrationBuilder.DropColumn(
                name: "TokenVerificacionExpira",
                table: "Usuarios");
        }
    }
}
