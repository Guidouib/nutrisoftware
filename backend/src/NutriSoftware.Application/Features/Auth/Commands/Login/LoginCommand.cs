using MediatR;
using NutriSoftware.Application.DTOs.Auth;

namespace NutriSoftware.Application.Features.Auth.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<LoginResponse>;
