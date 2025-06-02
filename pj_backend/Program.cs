using Microsoft.EntityFrameworkCore;
using pj_backend.Models.Database.Repositories;
using pj_backend.Services;
using pj_backend.Models.Seeders;
using pj_backend.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Microsoft.AspNetCore.Builder;
using pj_backend.WS;
using Microsoft.Extensions.FileProviders;

namespace pj_backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Configuraci�n de servicios
            ConfigureServices(builder);



            // Crear la aplicaci�n web utilizando la configuraci�n del builder
            var app = builder.Build();

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(
                   Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"))
            });

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            //Creacion de la base de datos y el seeder
            SeedDatabase(app.Services);


            app.UseCors("AllowFrontend");
            app.UseHttpsRedirection();

            app.UseAuthorization();

            //Inyeccion del websocket
            app.UseWebSockets();
            app.UseMiddleware<WSMiddleware>();

            app.MapControllers();

            app.Run();
        }

        private static void ConfigureServices(WebApplicationBuilder builder)
        {
            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // Configuraci�n de base de datos y repositorios
            builder.Services.AddScoped<AppDbContext>();
            builder.Services.AddScoped<UnitOfWork>();

            //inyeccion de servicios
            builder.Services.AddScoped<UserService>();
            builder.Services.AddSingleton<WSService>();
            builder.Services.AddScoped<GameRepository>();
            builder.Services.AddScoped<GameService>();
            builder.Services.AddSingleton<MatchmakingService>();


            //inyeccion de websocket
            builder.Services.AddSingleton<WSConnectionManager>();


            // Configuraci�n de autenticaci�n JWT
            string key = Environment.GetEnvironmentVariable("JWT_KEY");
            if (string.IsNullOrEmpty(key))
            {
                throw new InvalidOperationException("JWT_KEY is not configured in environment variables.");
            }
            builder.Services.AddAuthentication()
            .AddJwtBearer(options =>
            {
                options.SaveToken = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

            builder.Services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme
                {
                    BearerFormat = "JWT",
                    Name = "Authorization",
                    Description = "Escribe SOLO tu token JWT",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = JwtBearerDefaults.AuthenticationScheme
                });

                // Establecer los requisitos de seguridad para las operaciones de la API
                options.AddSecurityRequirement(new OpenApiSecurityRequirement
              {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = JwtBearerDefaults.AuthenticationScheme
                            }
                        },
                        new string[] { }
                    }
              });
            });

            // Agregar configuraci�n CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                        policy.WithOrigins("https://pj-arcade.duckdns.org", "http://localhost:3000")  // Aqu� agregas el origen de tu frontend
                            .AllowAnyHeader()
                            .AllowAnyMethod();
                    });
            });
        }

        private static void SeedDatabase(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetService<AppDbContext>();

            if (dbContext.Database.EnsureCreated())
            {
                var seeder = new SeedManager(dbContext);
                seeder.SeedAll();
            }
        }
    }
}
